/**
 * Combined Prompts for Free Tier Rate Limiting
 * Combines case generation and financial modeling into single requests
 */

/**
 * Combined case generation and financial modeling for rate limit optimization
 * @param {string} industry - Target industry for case study
 * @returns {Object} - Combined prompt and schema for single LLM call
 */
export const getCombinedCaseAndModelPrompt = (industry = "Technology (SaaS)") => {
  const prompt = `
    You are a financial modeling expert creating a streamlined SaaS DCF case study. Generate BOTH the case scenario AND a core financial model optimized for free tier limits.
    
    **FREE TIER OPTIMIZATION:**
    - Focus on essential financial metrics and core business logic
    - Provide realistic but simplified 5-year projections
    - Include key formulas but keep explanations concise

    **Reality Constraints:**
    - Target IRR: 15-25% (realistic for SaaS)
    - Revenue growth: High initially, moderating over time
    - Gross margins: 75-85% (typical SaaS)
    - Positive cash flow by Year 3-4

    **COMPANY SCENARIO:**
    - Company name and brief description
    - Starting metrics (ARR, customers, ARPU)
    - Growth assumptions (customer growth, churn, pricing)
    - Financial assumptions (WACC, tax rate, terminal growth)

    **FINANCIAL MODEL (Years 1-5):**
    
    **Revenue & Growth:**
    - Customer buildup with growth and churn
    - ARPU progression
    - Total revenue calculation

    **Income Statement (Core Items):**
    - Revenue, COGS, Gross Profit
    - Sales & Marketing, R&D, G&A expenses
    - EBITDA, Depreciation, EBIT
    - Interest, Taxes, Net Income

    **Cash Flow Statement:**
    - Operating Cash Flow (Net Income + Depreciation - Working Capital)
    - CapEx (Investing)
    - Free Cash Flow calculation

    **DCF Valuation:**
    - Discount factors using WACC
    - Present value of free cash flows
    - Terminal value calculation
    - Enterprise and equity value
    - NPV and IRR

    **Keep It Simple:**
    - Focus on core metrics that drive valuation
    - Include essential formulas only
    - Ensure mathematical consistency

    Industry Focus: ${industry}
  `;

  const schema = {
    type: "object",
    required: [
      "company_name", 
      "company_description", 
      "starting_point", 
      "assumptions",
      "revenue_buildup",
      "income_statement", 
      "cash_flow_statement",
      "dcf_valuation",
      "final_metrics"
    ],
    properties: {
      // Case scenario data
      company_name: {
        type: "string",
        description: "Name of the SaaS company"
      },
      company_description: {
        type: "string",
        description: "Detailed company background and business model"
      },
      starting_point: {
        type: "object",
        required: ["current_arr", "current_customers", "current_arpu", "current_gross_margin"],
        properties: {
          current_arr: { type: "number" },
          current_customers: { type: "number" },
          current_arpu: { type: "number" },
          current_gross_margin: { type: "number" },
          current_sales_marketing: { type: "number" },
          current_rd: { type: "number" },
          current_ga: { type: "number" },
          opening_cash: { type: "number" },
          opening_ppe: { type: "number" }
        }
      },
      assumptions: {
        type: "object",
        required: ["operational_drivers", "financial_assumptions"],
        properties: {
          operational_drivers: {
            type: "object",
            properties: {
              customer_acquisition_growth: { 
                type: "array", 
                items: { type: "number" },
                description: "Net new customers per year for 5 years"
              },
              annual_churn_rate: { type: "number" },
              arpu_growth_rate: { type: "number" },
              sales_marketing_as_percent_revenue: { type: "number" },
              rd_as_percent_revenue: { type: "number" },
              ga_as_percent_revenue: { type: "number" }
            }
          },
          financial_assumptions: {
            type: "object",
            properties: {
              wacc: { type: "number" },
              terminal_growth_rate: { type: "number" },
              tax_rate: { type: "number" },
              projection_years: { type: "number" }
            }
          }
        }
      },
      
      // Financial model data
      revenue_buildup: {
        type: "array",
        items: {
          type: "object",
          required: ["year", "customers", "arpu", "revenue", "formula"],
          properties: {
            year: { type: "number" },
            customers: { type: "number" },
            arpu: { type: "number" },
            revenue: { type: "number" },
            formula: {
              type: "object",
              properties: {
                customers: { type: "string" },
                arpu: { type: "string" },
                revenue: { type: "string" }
              }
            }
          }
        }
      },
      income_statement: {
        type: "array",
        items: {
          type: "object",
          required: ["year", "revenue", "cogs", "gross_profit", "ebitda", "ebit", "taxes", "net_income", "formula"],
          properties: {
            year: { type: "number" },
            revenue: { type: "number" },
            cogs: { type: "number" },
            gross_profit: { type: "number" },
            sales_marketing: { type: "number" },
            rd: { type: "number" },
            ga: { type: "number" },
            ebitda: { type: "number" },
            ebit: { type: "number" },
            taxes: { type: "number" },
            net_income: { type: "number" },
            formula: {
              type: "object",
              properties: {
                cogs: { type: "string" },
                gross_profit: { type: "string" },
                ebitda: { type: "string" },
                taxes: { type: "string" }
              }
            }
          }
        }
      },
      cash_flow_statement: {
        type: "array",
        items: {
          type: "object",
          required: ["year", "net_income", "depreciation", "working_capital_change", "capex", "free_cash_flow", "formula"],
          properties: {
            year: { type: "number" },
            net_income: { type: "number" },
            depreciation: { type: "number" },
            working_capital_change: { type: "number" },
            capex: { type: "number" },
            free_cash_flow: { type: "number" },
            formula: {
              type: "object",
              properties: {
                free_cash_flow: { type: "string" }
              }
            }
          }
        }
      },
      dcf_valuation: {
        type: "object",
        required: ["discount_factors", "present_values", "terminal_value", "terminal_pv", "enterprise_value", "equity_value", "formula"],
        properties: {
          discount_factors: { 
            type: "array", 
            items: { type: "number" }
          },
          present_values: { 
            type: "array", 
            items: { type: "number" }
          },
          terminal_value: { type: "number" },
          terminal_pv: { type: "number" },
          enterprise_value: { type: "number" },
          equity_value: { type: "number" },
          formula: {
            type: "object",
            properties: {
              discount_factor: { type: "string" },
              present_value: { type: "string" },
              terminal_value: { type: "string" },
              enterprise_value: { type: "string" }
            }
          }
        }
      },
      final_metrics: {
        type: "object",
        required: ["npv", "irr", "payback_period", "enterprise_value", "equity_value"],
        properties: {
          npv: { type: "number" },
          irr: { type: "number" },
          payback_period: { type: "number" },
          enterprise_value: { type: "number" },
          equity_value: { type: "number" },
          ev_revenue_multiple: { type: "number" },
          ev_ebitda_multiple: { type: "number" }
        }
      }
    }
  };

  return { prompt, schema };
};

export default {
  getCombinedCaseAndModelPrompt
};
