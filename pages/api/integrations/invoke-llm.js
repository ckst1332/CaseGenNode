import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { LLAMA_MODEL_CONFIG, LLAMA_PROMPT_GUIDELINES } from "../../../lib/ai/llama-config.js";

// Together AI configuration
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const TOGETHER_BASE_URL = "https://api.together.xyz/v1";

// Production rate limiting for Together AI (60 RPM limit)
const RATE_LIMIT = {
  maxRequestsPerMinute: 50,   // Use 50 out of 60 RPM to leave buffer
  minDelayBetweenRequests: 2000, // 2 seconds between requests (allows 30 RPM)
  maxRetries: 2,             // Allow more retries with higher limits
  retryDelayBase: 3000       // 3 second retry delay
};

// Request tracking for rate limiting (persistent across API calls)
let lastRequestTime = 0;
let requestCount = 0;
let requestTimes = [];
let totalRequestsToday = 0;
let lastResetDate = new Date().toDateString();

// Circuit breaker for persistent 429 errors
let consecutiveErrors = 0;
let lastErrorTime = 0;
const MAX_CONSECUTIVE_ERRORS = 3;
const CIRCUIT_BREAKER_TIMEOUT = 300000; // 5 minutes

// Fallback to mock for development if no API key
const USE_MOCK = !TOGETHER_API_KEY;

// Rate limiting helper functions
const waitForRateLimit = async () => {
  const now = Date.now();
  const today = new Date().toDateString();
  
  // Check circuit breaker
  if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
    const timeSinceLastError = now - lastErrorTime;
    if (timeSinceLastError < CIRCUIT_BREAKER_TIMEOUT) {
      const waitTime = CIRCUIT_BREAKER_TIMEOUT - timeSinceLastError;
      console.log(`🚨 Circuit breaker active. Too many 429 errors. Wait ${Math.round(waitTime/1000/60)} minutes.`);
      throw new Error(`Circuit breaker active. Too many rate limit errors. Please wait ${Math.round(waitTime/1000/60)} minutes before trying again.`);
    } else {
      // Reset circuit breaker
      consecutiveErrors = 0;
      console.log('Circuit breaker reset');
    }
  }
  
  // Reset daily counter
  if (today !== lastResetDate) {
    totalRequestsToday = 0;
    lastResetDate = today;
    console.log('Daily request counter reset');
  }
  
  // Check daily limit (reasonable for 60 RPM tier)
  if (totalRequestsToday >= 200) {
    console.log('⚠️  Daily request limit reached (200). Please try again tomorrow.');
    throw new Error('Daily request limit reached (200 requests max). Please try again tomorrow.');
  }
  
  const timeSinceLastRequest = now - lastRequestTime;
  
  // Clean old request times (older than 1 minute)
  requestTimes = requestTimes.filter(time => now - time < 60000);
  
  // Check if we need to wait due to rate limiting
  if (timeSinceLastRequest < RATE_LIMIT.minDelayBetweenRequests) {
    const waitTime = RATE_LIMIT.minDelayBetweenRequests - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // Check requests per minute limit
  if (requestTimes.length >= RATE_LIMIT.maxRequestsPerMinute) {
    const oldestRequest = requestTimes[0];
    const waitTime = 60000 - (now - oldestRequest) + 5000; // Add 5 second buffer
    if (waitTime > 0) {
      console.log(`Rate limiting: waiting ${waitTime}ms due to requests per minute limit`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  // Update tracking
  lastRequestTime = Date.now();
  requestTimes.push(lastRequestTime);
  totalRequestsToday++;
  console.log(`Request ${totalRequestsToday}/200 for today (PRODUCTION)`);
};

const makeRequestWithRetry = async (requestFn, retryCount = 0) => {
  try {
    await waitForRateLimit();
    const result = await requestFn();
    // Reset consecutive errors on success
    consecutiveErrors = 0;
    return result;
  } catch (error) {
    // Handle 429 rate limit errors specifically
    if (error.message?.includes('429')) {
      consecutiveErrors++;
      lastErrorTime = Date.now();
      console.log(`❌ 429 Error #${consecutiveErrors}. No retries to avoid further rate limiting.`);
      throw new Error(`Rate limit exceeded. Request denied to avoid further 429 errors. Please wait at least 1 minute before trying again.`);
    }
    throw error;
  }
};

// Real LLM implementation using Together AI's free Llama 3.3 70B
const invokeRealLLM = async ({ prompt, response_json_schema, task_type = 'CASE_GENERATION' }) => {
  try {
    // Enhanced prompt for JSON schema compliance
    const enhancedPrompt = `
${prompt}

CRITICAL INSTRUCTIONS:
- You MUST respond with valid JSON that exactly matches the provided schema
- Do NOT include any text outside the JSON object
- Ensure all required fields are present
- Use realistic, professional financial data

Required JSON Schema:
${JSON.stringify(response_json_schema, null, 2)}

Respond with JSON only:
`;

    const requestBody = {
      model: LLAMA_MODEL_CONFIG.MODEL_NAME,
      messages: [
        {
          role: "system",
          content: LLAMA_PROMPT_GUIDELINES.SYSTEM_ROLE.financial_expert
        },
        {
          role: "user",
          content: enhancedPrompt
        }
      ],
      temperature: LLAMA_MODEL_CONFIG[task_type].temperature,
      max_tokens: LLAMA_MODEL_CONFIG[task_type].max_tokens,
      top_p: LLAMA_MODEL_CONFIG[task_type].top_p,
      frequency_penalty: LLAMA_MODEL_CONFIG[task_type].frequency_penalty,
      presence_penalty: LLAMA_MODEL_CONFIG[task_type].presence_penalty
    };

    console.log(`🔧 Making Together AI request for ${task_type}`);
    console.log(`🤖 Model: ${requestBody.model}`);
    console.log(`📊 Max tokens: ${requestBody.max_tokens}`);
    console.log(`🌡️ Temperature: ${requestBody.temperature}`);

    const response = await makeRequestWithRetry(async () => {
      return fetch(`${TOGETHER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOGETHER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🚨 Together AI API error details:`, {
        status: response.status,
        statusText: response.statusText,
        model: LLAMA_MODEL_CONFIG.MODEL_NAME,
        body: errorText,
        requestBodyKeys: Object.keys(requestBody)
      });
      
      // Specific handling for 422 errors (token limit issues)
      if (response.status === 422) {
        console.error(`422 Error likely due to token limits:`, {
          modelName: requestBody.model,
          maxTokens: requestBody.max_tokens,
          hasMessages: !!requestBody.messages,
          messageCount: requestBody.messages?.length || 0,
          errorBody: errorText
        });
        
        // Check if it's a token limit error and suggest fix
        if (errorText.includes('tokens + `max_new_tokens` must be <=')) {
          throw new Error(`Token limit exceeded. The model has a maximum context of 8193 tokens. Try reducing prompt complexity or use a shorter case description.`);
        }
      }
      
      throw new Error(`Together AI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content received from Together AI");
    }

    // Enhanced JSON extraction for LLaMA 3.3 outputs with extensive cleaning
    let jsonContent = content.trim();
    
    console.log(`Raw LLaMA response length: ${content.length}`);
    console.log(`First 500 chars: ${content.substring(0, 500)}`);
    console.log(`Last 500 chars: ${content.substring(content.length - 500)}`);
    
    // Remove common LLaMA response prefixes and suffixes
    const responsePrefixes = [
      'Here is the',
      'Here\'s the',
      'I\'ll create',
      'I\'ll generate',
      'I\'ll build',
      'Based on',
      'Here are the',
      'The following',
      'Below is',
      'I\'ll provide'
    ];
    
    // Remove explanatory text before JSON
    for (const prefix of responsePrefixes) {
      const prefixIndex = jsonContent.toLowerCase().indexOf(prefix.toLowerCase());
      if (prefixIndex !== -1) {
        const jsonStart = jsonContent.indexOf('{', prefixIndex);
        if (jsonStart !== -1) {
          jsonContent = jsonContent.substring(jsonStart);
          break;
        }
      }
    }
    
    // Remove markdown code blocks
    if (jsonContent.includes('```json')) {
      jsonContent = jsonContent.replace(/^.*```json\s*/, '').replace(/\s*```.*$/, '');
    } else if (jsonContent.includes('```')) {
      jsonContent = jsonContent.replace(/^.*```\s*/, '').replace(/\s*```.*$/, '');
    }
    
    // Remove common trailing text patterns
    const trailingPatterns = [
      /\n\nThis.*$/s,
      /\n\nNote:.*$/s,
      /\n\nI've.*$/s,
      /\n\nThe model.*$/s,
      /\n\nPlease.*$/s
    ];
    
    for (const pattern of trailingPatterns) {
      jsonContent = jsonContent.replace(pattern, '');
    }
    
    // Try multiple extraction methods with enhanced error reporting
    let parsedJson = null;
    const extractionMethods = [
      // Method 1: Direct parsing after cleaning
      () => {
        const cleaned = jsonContent.trim();
        return JSON.parse(cleaned);
      },
      
      // Method 2: Find first complete JSON object
      () => {
        const jsonMatch = jsonContent.match(/\{[\s\S]*?\}(?=\s*$|\s*\n[^{]|\s*```|\s*\*\*)/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return null;
      },
      
      // Method 3: Brace counting with better logic
      () => {
        let braceCount = 0;
        let startIndex = -1;
        let endIndex = -1;
        
        for (let i = 0; i < jsonContent.length; i++) {
          const char = jsonContent[i];
          if (char === '{') {
            if (startIndex === -1) startIndex = i;
            braceCount++;
          } else if (char === '}') {
            braceCount--;
            if (braceCount === 0 && startIndex !== -1) {
              endIndex = i;
              break;
            }
          }
        }
        
        if (startIndex !== -1 && endIndex !== -1) {
          return JSON.parse(jsonContent.substring(startIndex, endIndex + 1));
        }
        return null;
      },
      
      // Method 4: Look for largest JSON object
      () => {
        const matches = [...jsonContent.matchAll(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g)];
        if (matches.length > 0) {
          // Find the longest match (most likely to be complete)
          const longestMatch = matches.reduce((longest, current) => 
            current[0].length > longest[0].length ? current : longest
          );
          return JSON.parse(longestMatch[0]);
        }
        return null;
      },
      
      // Method 5: Extract everything between first { and last }
      () => {
        const firstBrace = jsonContent.indexOf('{');
        const lastBrace = jsonContent.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          return JSON.parse(jsonContent.substring(firstBrace, lastBrace + 1));
        }
        return null;
      }
    ];
    
    for (let i = 0; i < extractionMethods.length; i++) {
      try {
        parsedJson = extractionMethods[i]();
        if (parsedJson && typeof parsedJson === 'object') {
          console.log(`✅ Mistral AI JSON parsed successfully using method ${i + 1}`);
          console.log(`Parsed object keys: ${Object.keys(parsedJson).join(', ')}`);
          return parsedJson;
        }
      } catch (error) {
        console.warn(`❌ JSON extraction method ${i + 1} failed:`, error.message);
        if (i === 0) {
          // For first method, show what we're trying to parse
          console.log(`Attempted to parse: ${jsonContent.substring(0, 200)}...`);
        }
      }
    }
    
    // If all methods fail, provide comprehensive debugging info
    console.error("🚨 All JSON parsing methods failed for Mistral AI response");
    console.error("📝 Cleaned content preview:", jsonContent.substring(0, 1000));
    console.error("📊 Content analysis:");
    console.error(`  - Total length: ${content.length}`);
    console.error(`  - Cleaned length: ${jsonContent.length}`);
    console.error(`  - Contains '{': ${jsonContent.includes('{')}`);
    console.error(`  - Contains '}': ${jsonContent.includes('}')}`);
    console.error(`  - First '{' at: ${jsonContent.indexOf('{')}`);
    console.error(`  - Last '}' at: ${jsonContent.lastIndexOf('}')}`);
    console.error(`  - Brace count: ${(jsonContent.match(/\{/g) || []).length} opening, ${(jsonContent.match(/\}/g) || []).length} closing`);
    
    // Save problematic response for debugging
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      const fs = require('fs');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      try {
        fs.writeFileSync(`/tmp/mistral-debug-${timestamp}.txt`, content);
        console.log(`💾 Saved problematic response to /tmp/mistral-debug-${timestamp}.txt`);
      } catch (fsError) {
        console.warn('Could not save debug file:', fsError.message);
      }
    }
    
    throw new Error(`Unable to extract valid JSON from Mistral AI response. Content length: ${content.length} characters. Check server logs for debugging details.`);
    

  } catch (error) {
    console.error("Together AI API error:", error);
    throw error;
  }
};

// Task type detection based on prompt content and schema
const detectTaskType = (prompt, response_json_schema) => {
  const promptLower = prompt.toLowerCase();
  const schemaStr = JSON.stringify(response_json_schema).toLowerCase();
  
  // Check for financial modeling indicators
  if (promptLower.includes('financial model') || 
      promptLower.includes('revenue buildup') ||
      promptLower.includes('dcf valuation') ||
      schemaStr.includes('income_statement') ||
      schemaStr.includes('cash_flow') ||
      schemaStr.includes('revenue_buildup')) {
    return 'FINANCIAL_MODELING';
  }
  
  // Check for template generation indicators
  if (promptLower.includes('template') ||
      promptLower.includes('excel') ||
      promptLower.includes('model structure') ||
      schemaStr.includes('template')) {
    return 'TEMPLATE_GENERATION';
  }
  
  // Default to case generation
  return 'CASE_GENERATION';
};

// Enhanced mock responses for development
const getMockResponse = ({ prompt, response_json_schema }) => {
  // Handle simple test schema
  if (response_json_schema?.properties?.test_status) {
    return {
      company_name: "MockSaaS Inc",
      company_description: "A test SaaS company generated by mock API to verify the system works without external API calls",
      revenue: 2500000,
      test_status: "Mock API Connection Successful - No 429 Errors"
    };
  }
  
  if (response_json_schema?.properties?.company_name) {
    // Company scenario generation
    return {
      company_name: "DataFlow Analytics",
      company_description: "DataFlow Analytics is a rapidly growing SaaS platform specializing in real-time business intelligence and predictive analytics for mid-market companies. The company has developed a unique AI-powered dashboard that integrates with multiple data sources, providing actionable insights for decision-makers. Founded 4 years ago, DataFlow has established strong product-market fit in the competitive analytics space.",
      starting_point: {
        current_arr: 8500000,
        current_customers: 3200,
        current_arpu: 2656.25,
        current_gross_margin: 0.83,
        current_sales_marketing: 2125000,
        current_rd: 1700000,
        current_ga: 850000,
        opening_cash: 5200000,
        opening_ppe: 450000
      },
      assumptions: {
        operational_drivers: {
          customer_acquisition_growth: [1280, 1152, 1036, 933, 840],
          annual_churn_rate: 0.12,
          arpu_growth_rate: 0.08,
          sales_marketing_as_percent_revenue: 0.25,
          rd_as_percent_revenue: 0.20,
          ga_as_percent_revenue: 0.10
        },
        financial_assumptions: {
          wacc: 0.125,
          terminal_growth_rate: 0.025,
          tax_rate: 0.25,
          projection_years: 5
        }
      }
    };
  } else if (response_json_schema?.properties?.revenue_buildup) {
    // Financial model generation - enhanced realistic projections
    return {
      revenue_buildup: [
        { 
          year: 1, 
          customers: 4480, 
          arpu: 2869, 
          revenue: 12853120,
          formula: {
            customers: "Previous_Customers + Net_New_Customers - (Previous_Customers * Churn_Rate)",
            arpu: "Previous_ARPU * (1 + ARPU_Growth_Rate)",
            revenue: "Customers * ARPU"
          }
        },
        { 
          year: 2, 
          customers: 5632, 
          arpu: 3098, 
          revenue: 17450336,
          formula: {
            customers: "4480 + 1152 - (4480 * 0.12)",
            arpu: "2869 * 1.08",
            revenue: "5632 * 3098"
          }
        },
        { 
          year: 3, 
          customers: 6668, 
          arpu: 3346, 
          revenue: 22318928,
          formula: {
            customers: "5632 + 1036 - (5632 * 0.12)",
            arpu: "3098 * 1.08", 
            revenue: "6668 * 3346"
          }
        },
        { 
          year: 4, 
          customers: 7601, 
          arpu: 3614, 
          revenue: 27480314,
          formula: {
            customers: "6668 + 933 - (6668 * 0.12)",
            arpu: "3346 * 1.08",
            revenue: "7601 * 3614"
          }
        },
        { 
          year: 5, 
          customers: 8441, 
          arpu: 3903, 
          revenue: 32947923,
          formula: {
            customers: "7601 + 840 - (7601 * 0.12)",
            arpu: "3614 * 1.08",
            revenue: "8441 * 3903"
          }
        }
      ],
      income_statement: [
        { 
          year: 1, 
          revenue: 12853120, 
          cogs: 2185030, 
          gross_profit: 10668090, 
          sales_marketing: 3213280, 
          rd: 2570624, 
          ga: 1285312, 
          ebitda: 3598874, 
          depreciation: 50000,
          ebit: 3548874, 
          taxes: 887219, 
          net_income: 2661655,
          formula: {
            cogs: "Revenue * (1 - Gross_Margin)",
            gross_profit: "Revenue - COGS",
            sales_marketing: "Revenue * 0.25",
            rd: "Revenue * 0.20",
            ga: "Revenue * 0.10",
            ebitda: "Gross_Profit - Sales_Marketing - R&D - G&A",
            ebit: "EBITDA - Depreciation",
            taxes: "EBIT * Tax_Rate",
            net_income: "EBIT - Taxes"
          }
        },
        { 
          year: 2, 
          revenue: 17450336, 
          cogs: 2966557, 
          gross_profit: 14483779, 
          sales_marketing: 4362584, 
          rd: 3490067, 
          ga: 1745034, 
          ebitda: 4886094, 
          depreciation: 75000,
          ebit: 4811094, 
          taxes: 1202774, 
          net_income: 3608320,
          formula: {
            cogs: "Revenue * (1 - Gross_Margin)",
            gross_profit: "Revenue - COGS",
            sales_marketing: "Revenue * 0.25",
            rd: "Revenue * 0.20",
            ga: "Revenue * 0.10",
            ebitda: "Gross_Profit - Sales_Marketing - R&D - G&A",
            ebit: "EBITDA - Depreciation",
            taxes: "EBIT * Tax_Rate",
            net_income: "EBIT - Taxes"
          }
        },
        { 
          year: 3, 
          revenue: 22318928, 
          cogs: 3794218, 
          gross_profit: 18524710, 
          sales_marketing: 5579732, 
          rd: 4463786, 
          ga: 2231893, 
          ebitda: 6249299, 
          depreciation: 100000,
          ebit: 6149299, 
          taxes: 1537325, 
          net_income: 4649474,
          formula: {
            cogs: "22318928 * 0.17",
            ebitda: "18524710 - 5579732 - 4463786 - 2231893"
          }
        },
        { 
          year: 4, 
          revenue: 27480314, 
          cogs: 4671653, 
          gross_profit: 22808661, 
          sales_marketing: 6870079, 
          rd: 5496063, 
          ga: 2748031, 
          ebitda: 7694488, 
          ebit: 7644488, 
          taxes: 1911122, 
          net_income: 5733366,
          formula: {
            cogs: "27480314 * 0.17",
            ebitda: "22808661 - 6870079 - 5496063 - 2748031"
          }
        },
        { 
          year: 5, 
          revenue: 32947923, 
          cogs: 5601147, 
          gross_profit: 27346776, 
          sales_marketing: 8236981, 
          rd: 6589585, 
          ga: 3294792, 
          ebitda: 9225418, 
          ebit: 9175418, 
          taxes: 2293855, 
          net_income: 6881563,
          formula: {
            cogs: "32947923 * 0.17",
            ebitda: "27346776 - 8236981 - 6589585 - 3294792"
          }
        }
      ],
      cash_flow_statement: [
        { 
          year: 1, 
          net_income: 2661655, 
          depreciation: 50000, 
          working_capital_change: -257062, 
          capex: -128531, 
          free_cash_flow: 2326062,
          formula: {
            free_cash_flow: "Net_Income + Depreciation - Working_Capital_Change - CapEx"
          }
        },
        { 
          year: 2, 
          net_income: 3627070, 
          depreciation: 52500, 
          working_capital_change: -349007, 
          capex: -174503, 
          free_cash_flow: 3156060,
          formula: {
            free_cash_flow: "3627070 + 52500 - (-349007) - 174503"
          }
        },
        { 
          year: 3, 
          net_income: 4649474, 
          depreciation: 55125, 
          working_capital_change: -446379, 
          capex: -223189, 
          free_cash_flow: 4035031,
          formula: {
            free_cash_flow: "4649474 + 55125 - (-446379) - 223189"
          }
        },
        { 
          year: 4, 
          net_income: 5733366, 
          depreciation: 57881, 
          working_capital_change: -549606, 
          capex: -274803, 
          free_cash_flow: 4966838,
          formula: {
            free_cash_flow: "5733366 + 57881 - (-549606) - 274803"
          }
        },
        { 
          year: 5, 
          net_income: 6881563, 
          depreciation: 60775, 
          working_capital_change: -658958, 
          capex: -329479, 
          free_cash_flow: 5953901,
          formula: {
            free_cash_flow: "6881563 + 60775 - (-658958) - 329479"
          }
        }
      ],
      dcf_valuation: {
        discount_factors: [0.889, 0.790, 0.702, 0.624, 0.555],
        present_values: [2066921, 2493207, 2832632, 3099211, 3305142],
        terminal_value: 153072525,
        terminal_pv: 85040692,
        enterprise_value: 98838005,
        equity_value: 104038005,
        formula: {
          discount_factor: "1 / (1 + WACC)^Year",
          present_value: "Free_Cash_Flow * Discount_Factor", 
          terminal_value: "Year_5_FCF * (1 + Terminal_Growth) / (WACC - Terminal_Growth)",
          enterprise_value: "Sum_of_PV_FCF + Terminal_PV"
        }
      },
      final_metrics: {
        npv: 95538005,
        irr: 0.189,
        payback_period: 3.2,
        enterprise_value: 98838005,
        equity_value: 104038005,
        ev_revenue_multiple: 3.0,
        ev_ebitda_multiple: 10.7
      }
    };
  } else {
    // Default response
    return {
      success: true,
      message: "LLM processing completed successfully"
    };
  }
};

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { prompt, response_json_schema, task_type } = req.body;
    
    if (!prompt || !response_json_schema) {
      return res.status(400).json({ 
        error: "Missing required parameters: prompt and response_json_schema" 
      });
    }

    // Auto-detect task type if not provided
    const detectedTaskType = task_type || detectTaskType(prompt, response_json_schema);
    
    let response;
    
    // Debug API key availability
    console.log(`API Key Status: ${TOGETHER_API_KEY ? 'PRESENT' : 'MISSING'}`);
    console.log(`API Key Length: ${TOGETHER_API_KEY ? TOGETHER_API_KEY.length : 0}`);
    console.log(`API Key Prefix: ${TOGETHER_API_KEY ? TOGETHER_API_KEY.substring(0, 10) + '...' : 'NONE'}`);
    console.log(`USE_MOCK: ${USE_MOCK}`);
    
    // ✅ PRODUCTION: Use real Mistral API calls
    const FORCE_MOCK_FOR_TESTING = false;
    const EMERGENCY_MOCK_MODE = false;
    console.log(`🚀 PRODUCTION MODE - Using real Mistral AI via Together API`);
    console.log(`🧪 FORCE_MOCK_FOR_TESTING: ${FORCE_MOCK_FOR_TESTING}`);
    
    if (USE_MOCK || FORCE_MOCK_FOR_TESTING || EMERGENCY_MOCK_MODE) {
      console.log(`🎭 EMERGENCY: Using mock LLM for user: ${session.user.id || session.user.email}`);
      console.log(`🚨 THIS SHOULD NOT CALL TOGETHER AI API AT ALL`);
      // Add realistic delay for mock
      await new Promise(resolve => setTimeout(resolve, 1500));
      response = getMockResponse({ prompt, response_json_schema });
    } else {
      if (!TOGETHER_API_KEY) {
        console.error("❌ TOGETHER_API_KEY is missing in production environment!");
        throw new Error("AI service configuration error. Please contact support.");
      }
      console.log(`🚀 Using Mistral AI via Together API (${detectedTaskType}) for user: ${session.user.id || session.user.email}`);
      response = await invokeRealLLM({ prompt, response_json_schema, task_type: detectedTaskType });
    }
    
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in /api/integrations/invoke-llm:", error);
    
    // Return appropriate error response
    const errorMessage = error.message || "Internal server error";
    const statusCode = error.message?.includes('API error') ? 502 : 500;
    
    return res.status(statusCode).json({ 
      error: errorMessage,
      details: USE_MOCK ? "Mock LLM failed" : "Together AI API failed"
    });
  }
}
