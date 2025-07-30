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
 * Enhanced validation that preserves financial complexity while maintaining realism
 * @param {Object} caseData - Generated case data to validate
 * @returns {Object} - Validation results and recommendations
 */
export const validateCaseRealism = (caseData) => {
  const validations = [];
  const warnings = [];
  const errors = [];
  
  // ENHANCED VP-Level Financial Validation (Balanced Approach)
  
  // 1. Line Item Completeness Check (CRITICAL)
  const income = caseData.income_statement;
  if (income && income.length > 0) {
    const latestYear = income[income.length - 1];
    
    // Check for zero values in critical line items
    const criticalFields = ['cogs', 'sales_marketing', 'rd', 'ga', 'depreciation'];
    const zeroFields = criticalFields.filter(field => 
      !latestYear[field] || latestYear[field] === 0
    );
    
    if (zeroFields.length > 0) {
      warnings.push(`Line items showing zero: ${zeroFields.join(', ')} - This reduces model complexity and realism`);
    }
    
    // Validate reasonable cost structure percentages
    if (latestYear.revenue && latestYear.revenue > 0) {
      const cogsPercent = (latestYear.cogs || 0) / latestYear.revenue;
      const salesMarketingPercent = (latestYear.sales_marketing || 0) / latestYear.revenue;
      const rdPercent = (latestYear.rd || 0) / latestYear.revenue;
      const gaPercent = (latestYear.ga || 0) / latestYear.revenue;
      
      // Allow ranges but warn if completely missing
      if (cogsPercent === 0) warnings.push("COGS is zero - SaaS companies typically have 10-25% COGS");
      if (salesMarketingPercent === 0) warnings.push("Sales & Marketing is zero - SaaS companies typically spend 25-50% on S&M");
      if (rdPercent === 0) warnings.push("R&D is zero - SaaS companies typically spend 15-25% on R&D");
      if (gaPercent === 0) warnings.push("G&A is zero - SaaS companies typically spend 8-15% on G&A");
      
      // Reasonable bounds (more lenient)
      if (cogsPercent > 0.40) warnings.push(`COGS at ${(cogsPercent * 100).toFixed(1)}% is high for SaaS - typical range is 10-25%`);
      if (salesMarketingPercent > 0.60) warnings.push(`S&M at ${(salesMarketingPercent * 100).toFixed(1)}% is very high - consider efficiency`);
      if (rdPercent > 0.35) warnings.push(`R&D at ${(rdPercent * 100).toFixed(1)}% is very high for SaaS`);
    }
  }
  
  // 2. IRR Reality Check (VP Level) - More Lenient
  const irr = caseData.final_metrics?.irr;
  if (irr) {
    if (irr > 0.50) {
      errors.push(`IRR of ${(irr * 100).toFixed(1)}% is extremely unrealistic - maximum credible IRR is ~50%`);
    } else if (irr > 0.35) {
      warnings.push(`IRR of ${(irr * 100).toFixed(1)}% is very aggressive but possible for exceptional SaaS companies`);
    } else if (irr < 0.12) {
      warnings.push(`IRR of ${(irr * 100).toFixed(1)}% is below typical venture returns - consider growth acceleration`);
    }
  }
  
  // 2. NPV vs Revenue Sanity Check (Critical VP Check)
  const npv = caseData.final_metrics?.npv;
  const startingArr = caseData.starting_point?.current_arr;
  if (npv && startingArr && npv < startingArr * 0.5) {
    errors.push(`NPV (${npv.toLocaleString()}) is unrealistically low vs starting ARR (${startingArr.toLocaleString()}) - check discount rate and cash flows`);
  }
  
  // 3. Revenue Growth Reality (VP Level) - More Permissive
  const projectedRevenue = caseData.income_statement?.[4]?.revenue; // Year 5
  let cagr = null;
  if (projectedRevenue && startingArr) {
    const revenueMultiple = projectedRevenue / startingArr;
    cagr = Math.pow(revenueMultiple, 1/5) - 1;
    
    if (cagr > 0.80) {
      errors.push(`Revenue CAGR of ${(cagr * 100).toFixed(1)}% is extremely unrealistic - maximum sustainable growth is ~80%`);
    } else if (cagr > 0.60) {
      warnings.push(`Revenue CAGR of ${(cagr * 100).toFixed(1)}% is very aggressive but possible for exceptional early-stage SaaS`);
    } else if (cagr < 0.10) {
      warnings.push(`Revenue CAGR of ${(cagr * 100).toFixed(1)}% is slow for SaaS - consider acceleration strategies`);
    }
  }
  
  // 4. Gross Margin Reality Check
  const year5Income = caseData.income_statement?.[4];
  if (year5Income?.revenue && year5Income?.gross_profit) {
    const grossMargin = year5Income.gross_profit / year5Income.revenue;
    if (grossMargin > 0.95) {
      warnings.push(`Gross margin of ${(grossMargin * 100).toFixed(1)}% is extremely high - validate cost structure`);
    } else if (grossMargin < 0.70) {
      warnings.push(`Gross margin of ${(grossMargin * 100).toFixed(1)}% is low for SaaS - typical range is 75-85%`);
    }
  }
  
  // 5. Rule of 40 Validation (VP Favorite)
  if (year5Income?.revenue && year5Income?.ebitda && cagr !== null) {
    const ebitdaMargin = year5Income.ebitda / year5Income.revenue;
    const ruleOf40 = cagr + ebitdaMargin;
    if (ruleOf40 < 0.40) {
      warnings.push(`Rule of 40 score of ${(ruleOf40 * 100).toFixed(1)}% is below benchmark - growth + profitability concern`);
    }
  }
  
  // 6. Enterprise Value Multiple Check
  const evRevenue = caseData.final_metrics?.ev_revenue_multiple;
  if (evRevenue) {
    if (evRevenue > 15) {
      warnings.push(`EV/Revenue multiple of ${evRevenue.toFixed(1)}x is very high - validate with comps`);
    } else if (evRevenue < 2) {
      warnings.push(`EV/Revenue multiple of ${evRevenue.toFixed(1)}x is very low - may indicate value trap`);
    }
  }
  
  return {
    isRealistic: errors.length === 0, // Only truly unrealistic cases fail
    passed: warnings.length <= 5, // Allow more warnings to pass
    errors,
    warnings,
    validations,
    summary: `Enhanced VP/MD Review: ${errors.length} critical issues, ${warnings.length} advisory warnings. ${errors.length === 0 ? 'APPROVED FOR COMPLEXITY' : 'REQUIRES REVISION'}`
  };
}; 