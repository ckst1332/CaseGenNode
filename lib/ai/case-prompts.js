/**
 * Advanced Case Generation Prompts
 * Advanced AI prompts for case generation
 */

/**
 * Generate sophisticated SaaS DCF case study prompt with reality constraints
 * @param {string} industry - Target industry for case study
 * @returns {Object} - Prompt and schema for LLM generation
 */
export const getCasePrompt = (industry = "Technology (SaaS)") => {
  const basePrompt = `
    You are a world-class financial modeling instructor creating a realistic SaaS DCF case study for institutional use. Your output MUST be financially plausible and represent a typical growing SaaS business that could be presented to investment committees.
    
    **LLaMA 3.3 OPTIMIZATION INSTRUCTIONS:**
    - Use your advanced reasoning capabilities to ensure financial coherence
    - Apply your knowledge of real SaaS companies (Salesforce, HubSpot, Zoom patterns)
    - Leverage your understanding of valuation methodologies

    **Critical Reality Constraints:**
    - Target IRR should be 15-25% (realistic for SaaS growth companies, not 40%+)
    - Revenue growth should start high but moderate over time (e.g., Year 1: 40%, declining to 15-20% by Year 5)
    - Gross margins should be 75-85% (typical for SaaS)
    - Operating margins should improve over time but remain realistic

    **Required Output Structure:**
    1. **Company Narrative:** Create a compelling SaaS company story that justifies the metrics
    2. **Starting Point (Year 0 Baseline):** Provide current state metrics that users can project from
    3. **Growth Assumptions:** Explicit growth rates and operational assumptions for projection
    4. **Financial Parameters:** WACC, tax rate, terminal growth rate

    **Starting Point Data Must Include:**
    - Current ARR (Annual Recurring Revenue)
    - Current customer count
    - Current ARPU (Average Revenue Per User)
    - Current gross margin %
    - Current OpEx levels
    - Opening Cash
    - Opening PP&E

    **Growth Assumptions Must Include:**
    - Customer acquisition rate per year (net new customers)
    - Annual churn rate (% of customers lost)
    - ARPU growth rate per year
    - OpEx growth assumptions (Sales & Marketing, R&D, G&A as % of revenue)

    **CRITICAL SANITY CHECK:** Before finalizing, ensure:
    - Year 5 revenue is 3-5x Year 0 revenue (not 10x+)
    - Operating margins reach 15-25% by Year 5 (not 50%+)
    - Customer growth is sustainable (not 100%+ annually)
    
    Industry Focus: ${industry}
  `;

  const schema = {
    type: "object",
    properties: {
      company_name: { type: "string" },
      company_description: { type: "string" },
      starting_point: {
        type: "object",
        properties: {
          current_arr: { type: "number", description: "Current Annual Recurring Revenue in millions" },
          current_customers: { type: "number", description: "Current number of customers" },
          current_arpu: { type: "number", description: "Current Average Revenue Per User (annual)" },
          current_gross_margin: { type: "number", description: "Current gross margin as decimal (e.g., 0.80 for 80%)" },
          current_sales_marketing: { type: "number", description: "Current Sales & Marketing expense in millions" },
          current_rd: { type: "number", description: "Current R&D expense in millions" },
          current_ga: { type: "number", description: "Current G&A expense in millions" },
          opening_cash: { type: "number", description: "Year 0 starting cash balance" },
          opening_ppe: { type: "number", description: "Year 0 starting Property, Plant & Equipment balance" }
        }
      },
      assumptions: {
        type: "object",
        properties: {
          operational_drivers: {
            type: "object",
            properties: {
              customer_acquisition_growth: { type: "array", items: { type: "number" }, description: "Net new customers per year for 5 years" },
              annual_churn_rate: { type: "number", description: "Annual customer churn rate as decimal" },
              arpu_growth_rate: { type: "number", description: "Annual ARPU growth rate as decimal" },
              sales_marketing_as_percent_revenue: { type: "number", description: "S&M as % of revenue target" },
              rd_as_percent_revenue: { type: "number", description: "R&D as % of revenue target" },
              ga_as_percent_revenue: { type: "number", description: "G&A as % of revenue target" }
            }
          },
          financial_assumptions: {
            type: "object",
            properties: {
              wacc: { type: "number", description: "Weighted Average Cost of Capital (10-15% for SaaS)" },
              terminal_growth_rate: { type: "number", description: "Terminal growth rate (2-3%)" },
              tax_rate: { type: "number", description: "Corporate tax rate" },
              projection_years: { type: "number", default: 5 }
            }
          }
        }
      }
    }
  };

  return { prompt: basePrompt, schema };
};

/**
 * Validate case generation parameters for financial realism
 * @param {Object} caseData - Generated case data to validate
 * @returns {Object} - Validation results and recommendations
 */
export const validateCaseRealism = (caseData) => {
  const validations = [];
  const warnings = [];
  
  // IRR reality check
  if (caseData.final_metrics?.irr > 0.35) {
    warnings.push("IRR above 35% may be unrealistic for SaaS businesses");
  }
  
  // Revenue growth validation
  const startingRevenue = caseData.starting_point?.current_arr;
  const projectedRevenue = caseData.income_statement?.[4]?.revenue; // Year 5
  
  if (projectedRevenue && startingRevenue) {
    const revenueMultiple = projectedRevenue / startingRevenue;
    if (revenueMultiple > 10) {
      warnings.push(`Revenue growth of ${revenueMultiple.toFixed(1)}x may be too aggressive`);
    }
  }
  
  return {
    isRealistic: warnings.length === 0,
    warnings,
    validations
  };
}; 