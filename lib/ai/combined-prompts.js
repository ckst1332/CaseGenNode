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
    You are a world-class financial modeling expert creating a complete SaaS DCF case study. Generate BOTH the case scenario AND the full financial model in a single response.
    
    **LLaMA 3.3 OPTIMIZATION FOR FREE TIER:**
    - Generate comprehensive case with complete financial model in one response
    - Apply institutional-grade modeling standards
    - Ensure all calculations are mathematically sound

    **Critical Reality Constraints:**
    - Target IRR should be 15-25% (realistic for SaaS growth companies)
    - Revenue growth should start high but moderate over time
    - Gross margins should be 75-85% (typical for SaaS)
    - Operating margins should improve over time but remain realistic

    **PART 1: COMPANY SCENARIO**
    Create a compelling SaaS company story with:
    - Company name and description
    - Starting point metrics (ARR, customers, ARPU, margins, costs, cash, PP&E)
    - Growth assumptions (customer acquisition, churn, ARPU growth, OpEx ratios)
    - Financial parameters (WACC, tax rate, terminal growth)

    **PART 2: COMPLETE FINANCIAL MODEL**
    Build a full 5-year model with formulas:
    - Revenue buildup (customers × ARPU with growth/churn)
    - Income Statement (Revenue, COGS, OpEx, EBITDA, taxes, net income)
    - Cash Flow Statement (FCF calculations with working capital and CapEx)
    - DCF Valuation (discount factors, PVs, terminal value, enterprise value)
    - Final metrics (NPV, IRR, payback period, valuation multiples)

    **CRITICAL:** Include Excel-like formulas for every calculation to show methodology.

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
