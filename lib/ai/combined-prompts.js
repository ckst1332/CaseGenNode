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
    You are an institutional financial modeling expert creating a sophisticated ${industry} DCF case study. Generate BOTH a complex business scenario AND complete 3-statement financial model.

    **INSTITUTIONAL REQUIREMENTS:**
    - Multi-layered business with customer segmentation & cohort analysis
    - Advanced revenue drivers: CAC/LTV economics, ARPU expansion, churn optimization
    - Sophisticated cost structure with operating leverage & economies of scale
    - Complete balance sheet with working capital dynamics & infrastructure investment
    - Complex cash flows with strategic reinvestment & tax optimization
    - Advanced DCF with risk-adjusted rates & multiple terminal value methods

    **FINANCIAL TARGETS:**
    - IRR: 20-30%, Revenue CAGR: 40%+ early years → 20%
    - Gross margins: 80-88% improving, Rule of 40 by Y3
    - LTV/CAC: 5-8x, FCF margin: 20%+ by Y5
    - Include international expansion, competitive dynamics, ESG factors

    **OUTPUT STRUCTURE:**
    1. Company scenario: market positioning, competitive moats, growth strategy
    2. Revenue buildup: customer segments, pricing, expansion timeline
    3. Income statement: sophisticated cost structure with scaling effects
    4. Balance sheet: working capital, CapEx, deferred revenue, debt structure
    5. Cash flow: operating CF, strategic investments, tax optimization
    6. DCF valuation: segment-adjusted WACC, terminal value, sensitivity analysis
    7. Investment metrics: NPV, IRR, multiples, strategic value drivers

    Industry: ${industry}

    Create institutional-grade complexity with defensible assumptions and sophisticated business insights.
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
      "balance_sheet",
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
        description: "Comprehensive company background, competitive positioning, market dynamics, and sophisticated business model with multiple value drivers"
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
          opening_ppe: { type: "number" },
          current_cac: { type: "number", description: "Customer Acquisition Cost" },
          current_ltv: { type: "number", description: "Customer Lifetime Value" },
          current_ndr: { type: "number", description: "Net Dollar Retention" },
          market_size: { type: "number", description: "Total Addressable Market" },
          market_penetration: { type: "number", description: "Current market penetration %" }
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
              ga_as_percent_revenue: { type: "number" },
              cac_improvement_rate: { type: "number", description: "Annual CAC reduction %" },
              ltv_expansion_rate: { type: "number", description: "Annual LTV growth %" },
              ndr_improvement_target: { type: "number", description: "Target NDR by Year 5" },
              gross_margin_expansion: { type: "number", description: "Annual gross margin improvement" },
              international_expansion_year: { type: "number", description: "Year of international launch" },
              new_product_revenue_mix: { type: "number", description: "% revenue from new products by Year 5" }
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
      balance_sheet: {
        type: "array",
        items: {
          type: "object",
          required: ["year", "cash", "accounts_receivable", "ppe", "total_assets", "deferred_revenue", "total_liabilities", "equity", "formula"],
          properties: {
            year: { type: "number" },
            cash: { type: "number" },
            accounts_receivable: { type: "number" },
            ppe: { type: "number" },
            intangible_assets: { type: "number" },
            total_assets: { type: "number" },
            accounts_payable: { type: "number" },
            deferred_revenue: { type: "number" },
            debt: { type: "number" },
            total_liabilities: { type: "number" },
            equity: { type: "number" },
            formula: {
              type: "object",
              properties: {
                accounts_receivable: { type: "string" },
                deferred_revenue: { type: "string" },
                total_assets: { type: "string" },
                equity: { type: "string" }
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
          ev_ebitda_multiple: { type: "number" },
          revenue_cagr: { type: "number", description: "5-year revenue CAGR" },
          ebitda_margin_y5: { type: "number", description: "EBITDA margin in Year 5" },
          fcf_margin_y5: { type: "number", description: "Free cash flow margin in Year 5" },
          ltv_cac_ratio_y5: { type: "number", description: "LTV/CAC ratio in Year 5" },
          rule_of_40_y3: { type: "number", description: "Rule of 40 score in Year 3" },
          market_share_y5: { type: "number", description: "Market share by Year 5" },
          customer_concentration_risk: { type: "string", description: "Assessment of customer concentration" },
          competitive_moat_strength: { type: "string", description: "Competitive positioning assessment" },
          scalability_score: { type: "number", description: "Business scalability rating 1-10" }
        }
      }
    }
  };

  return { prompt, schema };
};

export default {
  getCombinedCaseAndModelPrompt
};
