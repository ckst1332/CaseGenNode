/**
 * Meta LLaMA 3.3 70B Instruct Turbo Configuration
 * Optimized settings for DCF financial modeling and case generation
 */

// LLaMA 3.3 model configuration for different tasks
export const LLAMA_MODEL_CONFIG = {
  // Model identifier - LLaMA 3.3 70B (the better model)
  MODEL_NAME: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
  
  // Provider configuration  
  PROVIDER: "Together AI",
  API_BASE_URL: "https://api.together.xyz/v1",
  
  // Task-specific configurations (MAXIMUM SOPHISTICATION)
  CASE_GENERATION: {
    temperature: 0.4,        // Higher creativity for complex scenarios
    max_tokens: 8000,        // Maximum output for institutional complexity
    top_p: 0.95,            // High diversity for sophisticated analysis
    frequency_penalty: 0.2,  // Strong penalty for unique content
    presence_penalty: 0.15,  // Encourage comprehensive coverage
    description: "Maximum sophistication settings for institutional-grade case generation"
  },
  
  FINANCIAL_MODELING: {
    temperature: 0.3,        // Balanced for complex numerical reasoning
    max_tokens: 8000,        // Full token allowance for comprehensive models
    top_p: 0.95,            // High diversity for sophisticated modeling
    frequency_penalty: 0.1,  // Light penalty for consistency
    presence_penalty: 0.05,  // Slight penalty for focused output
    description: "Maximum complexity settings for institutional financial modeling"
  },
  
  TEMPLATE_GENERATION: {
    temperature: 0.4,        // Higher for sophisticated template variety
    max_tokens: 6000,        // Increased for detailed institutional templates
    top_p: 0.95,            // Maximum diversity for creative templates
    frequency_penalty: 0.15, // Strong penalty for unique templates
    presence_penalty: 0.1,   // Moderate penalty for comprehensive output
    description: "Maximum sophistication for institutional template generation"
  }
};

// LLaMA 3.3 specific prompt engineering guidelines
export const LLAMA_PROMPT_GUIDELINES = {
  SYSTEM_ROLE: {
    financial_expert: `You are a world-class financial modeling expert with deep expertise in DCF valuation, SaaS metrics, and institutional-quality financial analysis. You have experience building models for top-tier investment banks and private equity firms.

Key capabilities:
- Advanced DCF modeling with realistic assumptions
- SaaS business model expertise (ARR, churn, ARPU dynamics)  
- Multi-tier validation (VP and MD-level review standards)
- JSON schema compliance for structured outputs

Always respond with valid JSON that matches the requested schema exactly. Ensure all financial calculations are realistic and defensible.`,
    
    case_instructor: `You are a world-class financial modeling instructor creating realistic SaaS DCF case studies for institutional use. Your output MUST be financially plausible and represent typical growing SaaS businesses that could be presented to investment committees.

LLaMA 3.3 Optimization Instructions:
- Use your advanced reasoning capabilities to ensure financial coherence
- Apply your knowledge of real SaaS companies (Salesforce, HubSpot, Zoom patterns)
- Leverage your understanding of valuation methodologies`
  },
  
  JSON_INSTRUCTIONS: `
🔥 CRITICAL JSON OUTPUT INSTRUCTIONS FOR LLaMA 3.3:

OUTPUT FORMAT REQUIREMENTS:
- Start your response immediately with "{" (opening brace)
- End your response with "}" (closing brace)  
- NO explanatory text before or after the JSON
- NO markdown code blocks (no \`\`\`json)
- NO comments or additional content
- ONLY valid JSON that matches the schema exactly

DATA REQUIREMENTS:
- All required schema fields must be present
- Use correct data types (numbers as numbers, not strings)
- Ensure arrays contain the specified number of elements
- Include realistic financial data with proper business logic
- All formulas should be clear and implementable

VALIDATION CHECKLIST:
✓ JSON starts with { and ends with }
✓ All required fields present
✓ Numeric values are numbers, not strings
✓ Arrays have correct length (5 years for projections)
✓ Financial logic is sound and realistic

Required JSON Schema:
{schema_placeholder}

OUTPUT ONLY THE JSON OBJECT:`,

  VALIDATION_PROMPTS: {
    vp_review: "Review this model as a VP would: Are growth rates sustainable? Do margins improve realistically? Are cash flows positive by Year 3-5?",
    md_validation: "Review as an MD would before client presentation: Is the IRR between 15-25%? Are valuation multiples reasonable? Does the growth vs profitability trade-off make sense?"
  }
};

// Performance monitoring for LLaMA responses
export const LLAMA_PERFORMANCE_METRICS = {
  EXPECTED_RESPONSE_TIME: {
    case_generation: 8000,     // 8 seconds for case scenarios
    financial_modeling: 12000, // 12 seconds for complete models  
    template_generation: 6000  // 6 seconds for templates
  },
  
  QUALITY_THRESHOLDS: {
    json_parse_success_rate: 0.95,  // 95% successful JSON parsing
    financial_logic_score: 0.90,    // 90% financial coherence
    schema_compliance_rate: 0.98     // 98% schema adherence
  }
};

// Error handling specific to LLaMA outputs
export const LLAMA_ERROR_PATTERNS = {
  COMMON_ISSUES: [
    "JSON wrapped in markdown code blocks",
    "Explanatory text before/after JSON",
    "Incomplete JSON due to token limits",
    "Numeric values as strings",
    "Missing required schema fields"
  ],
  
  RECOVERY_STRATEGIES: [
    "Strip markdown formatting",
    "Extract JSON using brace counting",
    "Request shorter response with higher token limit",
    "Type conversion for numeric fields",
    "Schema field validation and completion"
  ]
};

export default {
  LLAMA_MODEL_CONFIG,
  LLAMA_PROMPT_GUIDELINES,
  LLAMA_PERFORMANCE_METRICS,
  LLAMA_ERROR_PATTERNS
};
