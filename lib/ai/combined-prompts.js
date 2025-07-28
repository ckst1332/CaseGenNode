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
    You are a sophisticated financial modeling expert and investment banker creating a comprehensive DCF case study with institutional-grade complexity. Generate BOTH an intricate business scenario AND a complete 3-statement financial model that maximizes analytical depth.

    **MAXIMUM COMPLEXITY REQUIREMENTS:**
    - Create a nuanced, multi-layered business scenario with realistic market dynamics
    - Build sophisticated revenue drivers with customer segmentation and cohort analysis
    - Include detailed operating leverage and scaling effects
    - Provide comprehensive balance sheet with working capital dynamics
    - Generate complex cash flow with detailed reinvestment requirements
    - Apply advanced valuation methodologies with sensitivity analysis insights

    **ADVANCED BUSINESS SCENARIO:**
    - Complex market positioning with competitive dynamics
    - Multi-product/service revenue streams with different growth trajectories
    - Detailed customer acquisition cost (CAC) and lifetime value (LTV) economics
    - Sophisticated pricing strategy with market penetration phases
    - International expansion considerations and market-specific dynamics
    - Technology platform scalability and infrastructure investment requirements

    **COMPREHENSIVE FINANCIAL PROJECTIONS (Years 1-5):**

    **Revenue Architecture:**
    - Customer acquisition by segment (SMB, Mid-Market, Enterprise)
    - Cohort-based churn analysis with improving retention over time
    - ARPU expansion through upselling and cross-selling
    - New product introductions and revenue diversification
    - Geographic expansion and currency considerations
    - Seasonal and cyclical revenue patterns

    **Advanced Cost Structure:**
    - Variable costs with economies of scale
    - Fixed cost absorption and operating leverage
    - Technology infrastructure scaling (cloud costs, dev tools)
    - Go-to-market efficiency improvements
    - R&D investment in AI/ML capabilities and platform development
    - International operations and compliance costs

    **Sophisticated Balance Sheet:**
    - Working capital requirements with DSO/DPO optimization
    - Technology and infrastructure CapEx with depreciation schedules
    - Intangible asset development and amortization
    - Deferred revenue liability management
    - Cash management and optimal capital structure
    - Acquisition financing and integration costs

    **Advanced Cash Flow Analysis:**
    - Operating cash flow with detailed working capital impact
    - Strategic CapEx for market expansion and technology advancement
    - Tax optimization strategies and timing differences
    - Free cash flow generation and reinvestment requirements
    - Dividend policy and shareholder return considerations

    **Institutional-Grade DCF Valuation:**
    - Risk-adjusted discount rates by business segment
    - Terminal value with multiple methodologies (exit multiple and perpetuity growth)
    - Sensitivity analysis on key value drivers
    - Monte Carlo scenario modeling insights
    - Comparable company analysis integration
    - Strategic value assessment for potential acquirers

    **Financial Sophistication Targets:**
    - IRR: 18-30% (reflecting complexity and growth potential)
    - Revenue CAGR: 35-50% early years, moderating to 15-25%
    - Gross margins: 80-88% with improvement over time
    - Rule of 40 compliance by Year 3 (Growth + Profitability > 40%)
    - LTV/CAC ratio: 4-8x with improving efficiency
    - Free cash flow margin: 15-25% by Year 5

    **Reality Constraints with Sophistication:**
    - Align with institutional SaaS benchmarks and best practices
    - Include realistic market penetration curves and competition effects
    - Model economic downturns and recovery scenarios
    - Consider regulatory compliance and data privacy costs
    - Factor in talent acquisition and retention challenges
    - Include ESG considerations and sustainability investments

    **Value Creation Analysis:**
    - Identify key value drivers and sensitivity ranges
    - Model strategic optionality and expansion potential
    - Assess competitive positioning and defensibility
    - Evaluate platform effects and network value
    - Consider exit strategy implications (IPO vs M&A)

    Target Industry: ${industry}
    
    **OUTPUT REQUIREMENTS:**
    Create a case study worthy of top-tier consulting firms with financial complexity that justifies using premium API credits. Every assumption should be defensible and every projection should reflect sophisticated business insight.
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
