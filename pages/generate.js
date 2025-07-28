import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, AlertCircle, Cpu, Loader2, Building, Clock } from "lucide-react";
import Layout from "../src/pages/Layout";
import GenerationProgress from "../src/components/generate/GenerationProgress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import API functions
const apiClient = {
  request: async (path, options = {}) => {
    try {
      const response = await fetch(`/api${path}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        ...options
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API Error ${response.status}: ${text || response.statusText}`);
      }
      
      if (response.status === 204) return null;
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
};

const Case = {
  create: (data) => apiClient.request('/cases', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

const User = {
  me: () => apiClient.request('/users/me'),
  updateMyUserData: (data) => apiClient.request('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
};

const InvokeLLM = (payload) => apiClient.request('/integrations/invoke-llm', {
  method: 'POST',
  body: JSON.stringify(payload)
});

// Case generation prompts and schemas (simplified version)
const getCasePrompt = (industry) => {
  const basePrompt = `
    You are a world-class financial modeling instructor creating a realistic SaaS DCF case study. Your output MUST be financially plausible and represent a typical growing SaaS business.

    **CRITICAL REALITY CONSTRAINTS:**
    - Target IRR should be 15-25% (realistic for SaaS growth companies, NOT 35%+)
    - Revenue Growth: Start high but moderate over time (e.g., 40% Year 1, down to 15-20% by Year 5)
    - Gross Margins: 75-85% (typical for SaaS)
    - Operating Margins: Improve over time but remain realistic (15-25% by Year 5, NOT 50%+)
    - Customer Growth: Sustainable (NOT 100%+ annually)
    - WACC: Typically 8-12% for SaaS companies
    - Terminal Growth Rate: 2-4% (long-term GDP growth)

    **REQUIRED OUTPUT SECTIONS:**

    1. **Company Narrative:** 
       - Create a compelling ${industry} SaaS company story that justifies the metrics
       - Include competitive advantages, market position, and growth strategy
       - Should explain why the financial projections are realistic

    2. **Starting Point (Year 0 Baseline):**
       - Current ARR (Annual Recurring Revenue)
       - Current customer count
       - Current ARPU (Average Revenue Per User)
       - Current gross margin %
       - Current operating expense levels (S&M, R&D, G&A as % of revenue)
       - Current cash position
       - Current PP&E (Property, Plant & Equipment) value

    3. **Growth Assumptions (5-Year Operational Drivers):**
       - Customer acquisition growth rates for each year
       - Annual churn rates
       - ARPU growth rates
       - Sales & Marketing expense as % of revenue by year
       - R&D expense as % of revenue by year
       - General & Administrative expense as % of revenue by year

    4. **Financial Parameters:**
       - WACC (Weighted Average Cost of Capital)
       - Tax rate
       - Terminal growth rate
       - CapEx as % of revenue by year
       - Depreciation rate

    **CRITICAL SANITY CHECK - Before finalizing your response, verify:**
    ✓ Year 5 revenue is 3-5x Year 0 (NOT 10x+)
    ✓ Operating margins reach 15-25% by Year 5 (NOT 50%+)
    ✓ Customer growth is sustainable (decreasing growth rates over time)
    ✓ IRR will likely be 15-25% based on these assumptions
    ✓ All percentages are expressed as decimals (e.g., 15% = 0.15)

    If any metric fails these checks, ADJUST your assumptions and recalculate until realistic.

    Industry Focus: ${industry}
  `;

  const schema = {
    type: "object",
    properties: {
      company_name: { 
        type: "string",
        description: "Realistic company name for the industry"
      },
      company_description: { 
        type: "string",
        description: "Detailed company narrative explaining the business model, competitive advantages, and growth strategy"
      },
      starting_point: {
        type: "object",
        description: "Year 0 baseline financial and operational metrics",
        properties: {
          current_arr: { 
            type: "number", 
            description: "Current Annual Recurring Revenue in dollars" 
          },
          current_customers: { 
            type: "number", 
            description: "Current number of paying customers" 
          },
          current_arpu: { 
            type: "number", 
            description: "Current Average Revenue Per User (annual)" 
          },
          gross_margin_percent: { 
            type: "number", 
            description: "Current gross margin as decimal (e.g., 0.80 for 80%)" 
          },
          current_opex_sm_percent: { 
            type: "number", 
            description: "Sales & Marketing expenses as % of revenue (decimal)" 
          },
          current_opex_rd_percent: { 
            type: "number", 
            description: "R&D expenses as % of revenue (decimal)" 
          },
          current_opex_ga_percent: { 
            type: "number", 
            description: "General & Administrative expenses as % of revenue (decimal)" 
          },
          current_cash: { 
            type: "number", 
            description: "Current cash balance" 
          },
          current_ppe: { 
            type: "number", 
            description: "Current Property, Plant & Equipment value" 
          }
        }
      },
      assumptions: {
        type: "object",
        description: "5-year growth assumptions and financial parameters",
        properties: {
          operational_drivers: {
            type: "object",
            properties: {
              customer_acquisition_growth: {
                type: "array",
                items: { type: "number" },
                description: "Net new customers per year for 5 years (absolute numbers)"
              },
              churn_rates: {
                type: "array",
                items: { type: "number" },
                description: "Annual customer churn rates for 5 years (as decimals)"
              },
              arpu_growth_rates: {
                type: "array",
                items: { type: "number" },
                description: "ARPU growth rates for 5 years (as decimals)"
              },
              sm_expense_percent: {
                type: "array",
                items: { type: "number" },
                description: "Sales & Marketing as % of revenue for 5 years (as decimals)"
              },
              rd_expense_percent: {
                type: "array",
                items: { type: "number" },
                description: "R&D as % of revenue for 5 years (as decimals)"
              },
              ga_expense_percent: {
                type: "array",
                items: { type: "number" },
                description: "G&A as % of revenue for 5 years (as decimals)"
              }
            }
          },
          financial_assumptions: {
            type: "object",
            properties: {
              wacc: { 
                type: "number", 
                description: "Weighted Average Cost of Capital (as decimal, e.g., 0.10 for 10%)" 
              },
              terminal_growth_rate: { 
                type: "number", 
                description: "Long-term growth rate for terminal value (as decimal)" 
              },
              tax_rate: { 
                type: "number", 
                description: "Corporate tax rate (as decimal)" 
              },
              capex_percent_revenue: {
                type: "array",
                items: { type: "number" },
                description: "CapEx as % of revenue for 5 years (as decimals)"
              },
              depreciation_rate: { 
                type: "number", 
                description: "Annual depreciation rate (as decimal)" 
              },
              projection_years: { 
                type: "number", 
                default: 5,
                description: "Number of projection years" 
              }
            }
          }
        }
      }
    }
  };

  return { prompt: basePrompt, schema };
};

const generateFinancialModelPrompt = (caseData) => {
  const prompt = `
    You are a world-class investment banking MD who builds bullet-proof financial models with institutional-grade validation.
    
    **CASE DATA TO USE:**
    ${JSON.stringify(caseData, null, 2)}
    
    Build a complete 5-year financial model using EXACTLY the data above with rigorous multi-tier validation.

    **STEP 1: BUILD COMPLETE FINANCIAL MODEL**

    1. **Revenue Buildup** (5 years):
       - Start with exact customer count from starting_point
       - Apply customer acquisition and churn rates from assumptions
       - Calculate ending customers: Beginning + New - Churned
       - Apply ARPU growth from assumptions
       - Revenue = Ending Customers × ARPU
       - Include Excel-style formula for EVERY field

    2. **Year 0 Starting Point** (Use exact data from case):
       - Current ARR: ${caseData.starting_point?.current_arr || 'TBD'}
       - Current Customers: ${caseData.starting_point?.current_customers || 'TBD'}
       - Current ARPU: Calculate from ARR/customers
       - Current Gross Margin: ${(caseData.starting_point?.current_gross_margin * 100 || 'TBD')}%
       - Current OpEx: ${caseData.starting_point?.current_total_opex || 'TBD'}

    3. **Complete 3-Statement Model**:
       - **Income Statement**: Revenue → COGS → Gross Profit → OpEx (S&M, R&D, G&A) → EBITDA → D&A → EBIT → Interest → EBT → Tax → Net Income
       - **Balance Sheet**: Assets (Cash, PP&E, Other) | Liabilities (Debt, Other) | Equity (Retained Earnings progression)
       - **Cash Flow Statement**: Net Income + D&A - ΔWC - CapEx = Free Cash Flow

    4. **DCF Valuation**:
       - Unlevered FCF calculation: EBIT × (1-Tax) + D&A - CapEx - ΔWC
       - Present Value factors using WACC: ${(caseData.assumptions?.financial_assumptions?.wacc * 100 || 'TBD')}%
       - Terminal Value: FCF_Year5 × (1 + Terminal Growth) / (WACC - Terminal Growth)
       - Enterprise Value = Sum of PV_FCFs + PV_Terminal_Value

    **STEP 2: VP-LEVEL REVIEW (Internal Consistency Check)**
    
    Act as a VP reviewing this model. Check for red flags and adjust if needed:
    
    ✓ **Revenue Growth Sustainability**: Does growth rate decrease over time? (Year 1: ~40%, Year 5: ~15%)
    ✓ **SaaS Margin Consistency**: Gross margins stable at 75-85%?
    ✓ **Operating Leverage**: Do operating margins improve but stay realistic? (Start negative, reach 15-25% by Year 5)
    ✓ **Cash Flow Progression**: Free cash flow positive by Year 3-4?
    ✓ **Customer Unit Economics**: Is LTV/CAC ratio > 3x?
    ✓ **Churn Rate Reality**: Annual churn 5-15% for enterprise SaaS?
    
    **IF ANY VP-LEVEL CHECK FAILS**: Revise operational assumptions and recalculate before proceeding.

    **STEP 3: MD-LEVEL FINAL VALIDATION (CRITICAL)**
    
    Act as an MD doing final review before client presentation. Apply rigorous reality checks:
    
    🔍 **IRR Reality Check**: 
    - Is IRR between 15-25% for SaaS business? 
    - NOT 35%+ (unrealistic) or <12% (too low)
    - If IRR fails: Lower growth assumptions or increase costs until realistic
    
    🔍 **Valuation Multiple Check**:
    - Calculate EV/Year 5 EBITDA multiple
    - Should be 8-15x for mature SaaS, NOT 25x+
    - If multiple too high: Reduce terminal growth or increase WACC
    
    🔍 **Growth vs. Profitability Trade-off**:
    - High growth (>30%) should come with lower margins initially
    - Mature growth (<20%) should show higher margins (>20%)
    - Check this progression is realistic
    
    🔍 **Financial Mechanics Check**:
    - Tax rate correctly applied? (EBIT × Tax Rate, not EBT × Tax)
    - WACC reasonable for SaaS risk profile? (8-12%)
    - Terminal growth rate conservative? (2-4%, not 5%+)
    - Working capital assumptions realistic? (Days Sales Outstanding, etc.)
    
    🔍 **Business Logic Validation**:
    - Customer acquisition cost sustainable vs. revenue per customer?
    - Market penetration realistic vs. TAM assumptions?
    - Competitive positioning reflected in margin assumptions?
    
    **CRITICAL SELF-CORRECTION MECHANISM**:
    
    IF ANY MD-LEVEL CHECK FAILS:
    1. Identify which metric(s) failed validation
    2. Determine root cause (too aggressive growth, unrealistic margins, etc.)
    3. Revise core assumptions (lower growth rates, increase cost structure, adjust WACC)
    4. Recalculate ENTIRE model with revised assumptions
    5. Re-run ALL validation checks until model passes MD review
    6. Document what was adjusted and why in validation_status
    
    **FORMULA REQUIREMENTS (CRITICAL FOR EDUCATION)**:
    
    Every calculated field MUST include Excel-style formula showing logic:
    - Revenue: "=C5*D5" (Customers × ARPU)
    - Gross Profit: "=B10-B11" (Revenue - COGS)
    - EBITDA: "=B12-B13-B14-B15" (Gross Profit - S&M - R&D - G&A)
    - FCF: "=B20+B21-B22-B23" (Net Income + D&A - CapEx - ΔWC)
    - PV Factor: "=1/(1+$B$2)^A10" (1/(1+WACC)^Year)
    - PV of FCF: "=B25*C25" (FCF × PV Factor)
    
    Use cell reference style (B10, C15, etc.) and explain the business logic.

    **FINAL OUTPUT REQUIREMENTS**:
    
    Only output a model that would pass both VP and MD review in a real investment scenario:
    - NPV/Enterprise Value with realistic IRR (15-25%)
    - EV/EBITDA multiple in reasonable range (8-15x)
    - All financial statements with formula transparency
    - Validation status documenting all checks passed
    - Conservative terminal value and growth assumptions
    
    Remember: This model will be used as the "answer key" for a case study. It must be both educational (with clear formulas) and realistic (passing institutional validation standards).
  `;

  const schema = {
    type: "object",
    properties: {
      revenue_buildup: {
        type: "array",
        description: "5-year revenue buildup schedule",
        items: {
          type: "object",
          properties: {
            year: { type: "number" },
            beginning_customers: { type: "number" },
            new_customers: { type: "number" },
            churned_customers: { type: "number" },
            ending_customers: { type: "number" },
            arpu: { type: "number" },
            revenue: { type: "number" },
            formula: {
              type: "object",
              description: "Excel-like formulas for each calculated field",
              properties: {
                new_customers_formula: { type: "string" },
                churned_customers_formula: { type: "string" },
                ending_customers_formula: { type: "string" },
                arpu_formula: { type: "string" },
                revenue_formula: { type: "string" }
              }
            }
          }
        }
      },
      depreciation_schedule: {
        type: "array",
        description: "5-year depreciation schedule",
        items: {
          type: "object",
          properties: {
            year: { type: "number" },
            beginning_ppe: { type: "number" },
            capex: { type: "number" },
            depreciation: { type: "number" },
            ending_ppe: { type: "number" },
            formula: {
              type: "object",
              description: "Excel-like formulas for each calculated field",
              properties: {
                capex_formula: { type: "string" },
                depreciation_formula: { type: "string" },
                ending_ppe_formula: { type: "string" }
              }
            }
          }
        }
      },
      debt_schedule: {
        type: "array",
        description: "5-year debt schedule (if applicable)",
        items: {
          type: "object",
          properties: {
            year: { type: "number" },
            beginning_debt: { type: "number" },
            principal_payment: { type: "number" },
            interest_expense: { type: "number" },
            ending_debt: { type: "number" },
            formula: {
              type: "object",
              properties: {
                interest_expense_formula: { type: "string" },
                ending_debt_formula: { type: "string" }
              }
            }
          }
        }
      },
      income_statement: {
        type: "array",
        description: "5-year income statement",
        items: {
          type: "object",
          properties: {
            year: { type: "number" },
            revenue: { type: "number" },
            cost_of_revenue: { type: "number" },
            gross_profit: { type: "number" },
            sm_expense: { type: "number" },
            rd_expense: { type: "number" },
            ga_expense: { type: "number" },
            total_opex: { type: "number" },
            ebitda: { type: "number" },
            depreciation: { type: "number" },
            ebit: { type: "number" },
            interest_expense: { type: "number" },
            ebt: { type: "number" },
            tax_expense: { type: "number" },
            net_income: { type: "number" },
            formula: {
              type: "object",
              description: "Excel-like formulas for each calculated field",
              properties: {
                cost_of_revenue_formula: { type: "string" },
                gross_profit_formula: { type: "string" },
                sm_expense_formula: { type: "string" },
                rd_expense_formula: { type: "string" },
                ga_expense_formula: { type: "string" },
                total_opex_formula: { type: "string" },
                ebitda_formula: { type: "string" },
                ebit_formula: { type: "string" },
                ebt_formula: { type: "string" },
                tax_expense_formula: { type: "string" },
                net_income_formula: { type: "string" }
              }
            }
          }
        }
      },
      balance_sheet: {
        type: "array",
        description: "5-year balance sheet",
        items: {
          type: "object",
          properties: {
            year: { type: "number" },
            cash: { type: "number" },
            ppe_net: { type: "number" },
            total_assets: { type: "number" },
            debt: { type: "number" },
            retained_earnings: { type: "number" },
            total_equity: { type: "number" },
            total_liab_equity: { type: "number" },
            formula: {
              type: "object",
              properties: {
                cash_formula: { type: "string" },
                total_assets_formula: { type: "string" },
                retained_earnings_formula: { type: "string" },
                total_equity_formula: { type: "string" }
              }
            }
          }
        }
      },
      cash_flow_statement: {
        type: "array",
        description: "5-year cash flow statement",
        items: {
          type: "object",
          properties: {
            year: { type: "number" },
            net_income: { type: "number" },
            depreciation: { type: "number" },
            change_in_wc: { type: "number" },
            operating_cash_flow: { type: "number" },
            capex: { type: "number" },
            free_cash_flow: { type: "number" },
            formula: {
              type: "object",
              properties: {
                operating_cash_flow_formula: { type: "string" },
                free_cash_flow_formula: { type: "string" }
              }
            }
          }
        }
      },
      dcf_valuation: {
        type: "array",
        description: "DCF valuation calculation",
        items: {
          type: "object",
          properties: {
            year: { type: "number" },
            ebit: { type: "number" },
            tax_on_ebit: { type: "number" },
            nopat: { type: "number" },
            depreciation: { type: "number" },
            capex: { type: "number" },
            change_in_wc: { type: "number" },
            unlevered_fcf: { type: "number" },
            pv_factor: { type: "number" },
            pv_of_fcf: { type: "number" },
            formula: {
              type: "object",
              description: "Excel-like formulas for each calculated field",
              properties: {
                tax_on_ebit_formula: { type: "string" },
                nopat_formula: { type: "string" },
                unlevered_fcf_formula: { type: "string" },
                pv_factor_formula: { type: "string" },
                pv_of_fcf_formula: { type: "string" }
              }
            }
          }
        }
      },
      final_metrics: {
        type: "object",
        description: "Final valuation metrics and validation results",
        properties: {
          npv: { 
            type: "number", 
            description: "Net Present Value / Enterprise Value" 
          },
          irr: { 
            type: "number", 
            description: "Internal Rate of Return as decimal (e.g., 0.18 for 18%)" 
          },
          terminal_value: { 
            type: "number",
            description: "Terminal value calculation"
          },
          pv_of_terminal: {
            type: "number",
            description: "Present value of terminal value"
          },
          total_pv: { 
            type: "number",
            description: "Total present value of cash flows"
          },
          year_5_revenue: {
            type: "number",
            description: "Year 5 revenue for sanity check"
          },
          year_5_ebitda_margin: {
            type: "number",
            description: "Year 5 EBITDA margin for validation"
          },
          validation_status: {
            type: "object",
            description: "Results of comprehensive VP and MD-level validation checks",
            properties: {
              vp_level_checks: {
                type: "object",
                properties: {
                  revenue_growth_sustainable: { type: "boolean" },
                  saas_margins_consistent: { type: "boolean" },
                  operating_leverage_realistic: { type: "boolean" },
                  cash_flow_positive_by_year4: { type: "boolean" },
                  customer_unit_economics_sound: { type: "boolean" },
                  churn_rate_realistic: { type: "boolean" }
                }
              },
              md_level_checks: {
                type: "object", 
                properties: {
                  irr_within_range: { type: "boolean" },
                  ev_ebitda_multiple_reasonable: { type: "boolean" },
                  growth_profitability_balanced: { type: "boolean" },
                  tax_calculation_correct: { type: "boolean" },
                  wacc_appropriate: { type: "boolean" },
                  terminal_growth_conservative: { type: "boolean" }
                }
              },
              adjustments_made: {
                type: "array",
                items: { type: "string" },
                description: "List of adjustments made during validation process"
              },
              final_irr: { type: "number" },
              final_ev_ebitda_multiple: { type: "number" },
              overall_validation_status: { 
                type: "string",
                enum: ["PASSED", "FAILED", "CONDITIONAL"]
              },
              md_approval_notes: { type: "string" }
            }
          }
        }
      }
    }
  };

  return { prompt, schema };
};

export default function Generate() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [error, setError] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("");

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (session) {
      loadUser();
    }
  }, [session, status, router]);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      console.log('User data loaded:', userData);
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleRefreshCredits = async () => {
    await loadUser();
  };

  const handleGenerateClick = () => {
    if (!selectedIndustry) {
      setError("Please select an industry before generating a case study.");
      return;
    }
    
    if (!user?.credits_remaining || user.credits_remaining <= 0) {
      setShowUpgradeModal(true);
      return;
    }
    generateCase();
  };

  const generateCase = async () => {
    setIsGenerating(true);
    setError(null);
    const industry = selectedIndustry;

    try {
      // Step 0: Ensure user exists in database (critical for foreign key constraint)
      console.log('Ensuring user exists in database...');
      
      let userData;
      try {
        userData = await User.me();
        console.log('User API response:', userData);
      } catch (userError) {
        console.error('Failed to create/get user:', userError);
        throw new Error(`User creation failed: ${userError.message}`);
      }
      
      // Validate user response
      if (!userData || !userData.id) {
        console.error('Invalid user data received:', userData);
        throw new Error('User validation failed - invalid user data received');
      }
      
      // Validate user has proper credits before proceeding (skip for test users)
      if (userData.credits_remaining <= 0 && !userData.is_test_user) {
        throw new Error('Insufficient credits remaining');
      }
      
      console.log('User verified in database:', userData.id, userData.email, 'Credits:', userData.credits_remaining);
      setUser(userData); // Update user state with confirmed database user
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 1: Generate company scenario
      setGenerationStep(1);
      const caseGen = getCasePrompt(industry);
      const scenarioResult = await InvokeLLM({
        prompt: caseGen.prompt,
        response_json_schema: caseGen.schema,
      });

      // Step 2: Build financial model
      setGenerationStep(2);
      const caseName = `${scenarioResult.company_name} DCF Analysis`;
      
      const tempCaseData = { 
        name: caseName, 
        company_description: scenarioResult.company_description,
        starting_point: scenarioResult.starting_point,
        assumptions: scenarioResult.assumptions
      };
      
      // Enhanced financial model generation with institutional validation
      const answerKeyGen = generateFinancialModelPrompt(tempCaseData);
      console.log('Generating financial model with institutional-grade validation...');
      
      // Enhanced error handling for AI model generation
      let calculationResult;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`Financial model generation attempt ${attempts}/${maxAttempts}...`);
          
          calculationResult = await InvokeLLM({
            prompt: answerKeyGen.prompt,
            response_json_schema: answerKeyGen.schema,
          });
          
          // Validate institutional-grade requirements
          if (!calculationResult.final_metrics?.irr || !calculationResult.final_metrics?.npv) {
            throw new Error('Missing required IRR/NPV metrics');
          }
          
          // Validate IRR is within realistic range (12-30%, allowing some flexibility)
          const irr = calculationResult.final_metrics.irr;
          if (irr < 0.10 || irr > 0.35) {
            console.warn(`IRR ${(irr * 100).toFixed(1)}% outside realistic range, retrying...`);
            throw new Error(`IRR ${(irr * 100).toFixed(1)}% outside acceptable range (10-35%)`);
          }
          
          console.log('✅ Financial model passed validation checks');
          console.log(`Final metrics: IRR ${(irr * 100).toFixed(1)}%, NPV $${(calculationResult.final_metrics.npv / 1000000).toFixed(1)}M`);
          
          // Log validation results for debugging
          if (calculationResult.final_metrics?.validation_status) {
            console.log('🔍 Model validation results:', calculationResult.final_metrics.validation_status);
          }
          
          break;
          
        } catch (modelError) {
          console.error(`Financial model generation attempt ${attempts} failed:`, modelError);
          
          if (attempts === maxAttempts) {
            throw new Error(`Financial model generation failed after ${maxAttempts} attempts: ${modelError.message}`);
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      console.log('💎 Answer key generated with institutional validation');

      // Step 3: Create case
      setGenerationStep(3);
      console.log('Creating case with data:', {
        name: caseName,
        type: "DCF",
        status: "template",
        industry: industry,
        user: userData.id
      });
      
      const newCase = await Case.create({
        name: caseName,
        type: "DCF",
        status: "template", // Start with template status for now
        industry: industry,
        company_description: scenarioResult.company_description,
        starting_point: scenarioResult.starting_point,
        assumptions: scenarioResult.assumptions,
        answer_key: calculationResult,
        answer_key_excel: null,
      });
      
      console.log('Case created successfully:', newCase.id);
      console.log('Full case object:', newCase);

      // Decrement user credits and refresh user data
      const updatedUserData = await User.updateMyUserData({ 
        credits_remaining: (user.credits_remaining || 0) - 1 
      });
      console.log('Credits updated:', updatedUserData);
      
      // Update local user state with new credit count
      setUser(updatedUserData);

      // Step 4: Navigate to case
      setGenerationStep(4); 
      console.log('Navigating to case with ID:', newCase.id);
      console.log('Navigation URL will be:', `/case?id=${newCase.id}`);
      
      setTimeout(() => {
        router.push(`/case?id=${newCase.id}`);
      }, 3000); // Increased timeout to ensure database commit

    } catch (err) {
      console.error("Error generating case:", err);
      
      // Enhanced error messaging based on failure type
      let errorMessage = "Failed to generate case. Please try again.";
      
      if (err.message?.includes('IRR')) {
        errorMessage = 'Financial model validation failed: IRR outside realistic range. Our AI is learning - please try again for a more realistic model.';
      } else if (err.message?.includes('Missing required')) {
        errorMessage = 'Financial model incomplete: Missing critical metrics. Please try again.';
      } else if (err.message?.includes('after 3 attempts')) {
        errorMessage = 'AI model generation failed after multiple attempts. Our system is being refined - please try again in a few moments.';
      } else if (err.message?.includes('User')) {
        errorMessage = 'User validation failed. Please refresh the page and try again.';
      } else if (err.message?.includes('Insufficient credits')) {
        errorMessage = 'Insufficient credits remaining. Please upgrade your plan to continue.';
        setShowUpgradeModal(true);
      } else if (err.response?.data?.detail) {
        errorMessage = `Generation failed: ${err.response.data.detail}`;
      } else if (err.message) {
        errorMessage = `Generation failed: ${err.message}`;
      }
      
      setError(errorMessage);
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  if (status === 'loading') {
    return (
      <Layout currentPageName="Generate">
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  if (isGenerating) {
    return (
      <Layout currentPageName="Generate">
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <GenerationProgress step={generationStep} caseType="DCF" />
        </div>
      </Layout>
    );
  }

  const industries = [
    { 
      id: "technology", 
      name: "Technology (SaaS)", 
      enabled: true,
      description: "Software-as-a-Service companies with recurring revenue models"
    },
    { 
      id: "infrastructure", 
      name: "Infrastructure & Utilities", 
      enabled: false,
      description: "Coming soon - Infrastructure and utility companies"
    },
    { 
      id: "industrials", 
      name: "Industrials & Manufacturing", 
      enabled: false,
      description: "Coming soon - Industrial and manufacturing businesses"
    }
  ];

  return (
    <Layout currentPageName="Generate">
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="bg-white p-10 rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
              <Cpu className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
            Generate New Case Study
          </h1>
          <p className="text-slate-600 text-lg mb-8">
            Create a realistic DCF modeling challenge with AI-generated scenarios and calculations.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-6 text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Industry Selection */}
          <Card className="mb-6 text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Select Industry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {industries.map((industry) => (
                <div key={industry.id} className="relative">
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      industry.enabled 
                        ? selectedIndustry === industry.name
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-slate-300'
                        : 'border-slate-100 bg-slate-50 cursor-not-allowed'
                    }`}
                    onClick={() => industry.enabled && setSelectedIndustry(industry.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-medium ${industry.enabled ? 'text-slate-900' : 'text-slate-400'}`}>
                          {industry.name}
                        </h4>
                        <p className={`text-sm ${industry.enabled ? 'text-slate-600' : 'text-slate-400'}`}>
                          {industry.description}
                        </p>
                      </div>
                      {!industry.enabled && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">Coming Soon</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {user && (
            <div className={`rounded-xl p-4 mb-6 ${
              (user.credits_remaining || 0) > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Credits remaining: <span className={`font-bold ${
                      (user.credits_remaining || 0) > 0 ? 'text-green-700' : 'text-red-700'
                    }`}>{user.credits_remaining || 0}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Used this month: {user.credits_used_this_month || 0} | Plan: {user.subscription_tier || 'free'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleRefreshCredits}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    ↻ Refresh
                  </Button>
                  {(user.credits_remaining || 0) === 0 && (
                    <Button 
                      onClick={() => router.push('/payments')} 
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Upgrade Plan
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleGenerateClick}
            disabled={isGenerating || !selectedIndustry}
            className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Generate Case Study
              </>
            )}
          </Button>
        </div>
      </div>

      <AlertDialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No Credits Remaining</AlertDialogTitle>
            <AlertDialogDescription>
              You've used all your credits for this billing period. Upgrade your plan to generate more cases.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/account")}>
              Upgrade Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
