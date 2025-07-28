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
    You are a world-class financial modeling expert creating a complete 3-statement integrated financial model for a SaaS DCF case study. Generate BOTH the case scenario AND the comprehensive 3-statement model including Year 0 baseline.
    
    **LLaMA 3.3 OPTIMIZATION FOR FREE TIER:**
    - Generate comprehensive case with complete 3-statement model in one response
    - Apply institutional-grade modeling standards with proper statement interconnections
    - Ensure all calculations flow correctly between P&L, Balance Sheet, and Cash Flow

    **Critical Reality Constraints:**
    - Target IRR should be 15-25% (realistic for SaaS growth companies)
    - Revenue growth should start high but moderate over time
    - Gross margins should be 75-85% (typical for SaaS)
    - Operating margins should improve over time but remain realistic
    - Balance sheet must balance every year (Assets = Liabilities + Equity)

    **PART 1: COMPANY SCENARIO**
    Create a compelling SaaS company story with:
    - Company name and description
    - Year 0 baseline metrics (starting point for all statements)
    - Growth assumptions (customer acquisition, churn, ARPU growth, OpEx ratios)
    - Financial parameters (WACC, tax rate, terminal growth)

    **PART 2: COMPREHENSIVE 3-STATEMENT MODEL (Years 0-5)**
    
    **INCOME STATEMENT (P&L):**
    - Revenue buildup (customers × ARPU with growth/churn)
    - Cost of Goods Sold (hosting, support, etc.)
    - Gross Profit and Margin
    - Operating Expenses (Sales & Marketing, R&D, G&A)
    - EBITDA and EBITDA Margin
    - Depreciation & Amortization
    - EBIT (Operating Income)
    - Interest Expense (on debt)
    - Pre-tax Income
    - Income Tax Expense
    - Net Income

    **BALANCE SHEET:**
    - **Assets:** Cash, Accounts Receivable, PP&E (net), Intangible Assets, Total Assets
    - **Liabilities:** Accounts Payable, Accrued Expenses, Debt (short/long-term), Total Liabilities
    - **Equity:** Retained Earnings, Additional Paid-in Capital, Total Equity
    - **MUST BALANCE:** Total Assets = Total Liabilities + Total Equity

    **CASH FLOW STATEMENT:**
    - **Operating Activities:** Net Income, Depreciation, Working Capital Changes, Operating Cash Flow
    - **Investing Activities:** CapEx, Asset Purchases, Investing Cash Flow
    - **Financing Activities:** Debt Issuance/Repayment, Equity Transactions, Financing Cash Flow
    - **Net Change in Cash:** Sum of all activities
    - **Ending Cash Balance:** Beginning Cash + Net Change

    **STATEMENT INTERCONNECTIONS:**
    - Net Income flows from P&L to Balance Sheet (Retained Earnings) and Cash Flow
    - Depreciation reduces PP&E on Balance Sheet and is added back in Cash Flow
    - Working Capital changes calculated from Balance Sheet changes
    - Cash on Balance Sheet equals ending cash from Cash Flow Statement
    - Interest Expense on P&L calculated from average debt balance on Balance Sheet

    **DCF VALUATION:**
    - Free Cash Flow calculations from the 3 statements
    - WACC discount factors for each year
    - Terminal Value calculation
    - Present Value of cash flows and terminal value
    - Enterprise Value and Equity Value

    **CRITICAL REQUIREMENTS:**
    1. Include Year 0 as baseline for all three statements
    2. All statements must interconnect properly
    3. Balance Sheet must balance every year
    4. Include Excel-like formulas showing methodology
    5. Working Capital = AR + Other Current Assets - AP - Accrued Liabilities
    6. Free Cash Flow = Net Income + Depreciation - CapEx - Change in Working Capital

    Industry Focus: ${industry}
  `;

  const schema = {
    type: "object",
    required: [
      "company_name", 
      "company_description", 
      "year_0_baseline", 
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
        description: "Detailed company background and business model"
      },
      year_0_baseline: {
        type: "object",
        required: ["income_statement", "balance_sheet", "cash_flow_statement", "operational_metrics"],
        properties: {
          operational_metrics: {
            type: "object",
            properties: {
              current_arr: { type: "number" },
              current_customers: { type: "number" },
              current_arpu: { type: "number" }
            }
          },
          income_statement: {
            type: "object",
            properties: {
              revenue: { type: "number" },
              cogs: { type: "number" },
              gross_profit: { type: "number" },
              sales_marketing: { type: "number" },
              rd: { type: "number" },
              ga: { type: "number" },
              ebitda: { type: "number" },
              depreciation: { type: "number" },
              ebit: { type: "number" },
              interest_expense: { type: "number" },
              pre_tax_income: { type: "number" },
              tax_expense: { type: "number" },
              net_income: { type: "number" }
            }
          },
          balance_sheet: {
            type: "object",
            properties: {
              cash: { type: "number" },
              accounts_receivable: { type: "number" },
              ppe_net: { type: "number" },
              intangible_assets: { type: "number" },
              total_assets: { type: "number" },
              accounts_payable: { type: "number" },
              accrued_expenses: { type: "number" },
              debt: { type: "number" },
              total_liabilities: { type: "number" },
              retained_earnings: { type: "number" },
              additional_paid_in_capital: { type: "number" },
              total_equity: { type: "number" }
            }
          },
          cash_flow_statement: {
            type: "object",
            properties: {
              net_income: { type: "number" },
              depreciation: { type: "number" },
              working_capital_change: { type: "number" },
              operating_cash_flow: { type: "number" },
              capex: { type: "number" },
              investing_cash_flow: { type: "number" },
              financing_cash_flow: { type: "number" },
              net_change_in_cash: { type: "number" },
              beginning_cash: { type: "number" },
              ending_cash: { type: "number" }
            }
          }
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
          required: ["year", "revenue", "cogs", "gross_profit", "ebitda", "ebit", "pre_tax_income", "tax_expense", "net_income", "formula"],
          properties: {
            year: { type: "number" },
            revenue: { type: "number" },
            cogs: { type: "number" },
            gross_profit: { type: "number" },
            gross_margin: { type: "number" },
            sales_marketing: { type: "number" },
            rd: { type: "number" },
            ga: { type: "number" },
            total_operating_expenses: { type: "number" },
            ebitda: { type: "number" },
            ebitda_margin: { type: "number" },
            depreciation: { type: "number" },
            ebit: { type: "number" },
            interest_expense: { type: "number" },
            pre_tax_income: { type: "number" },
            tax_expense: { type: "number" },
            net_income: { type: "number" },
            formula: {
              type: "object",
              properties: {
                cogs: { type: "string" },
                gross_profit: { type: "string" },
                ebitda: { type: "string" },
                ebit: { type: "string" },
                pre_tax_income: { type: "string" },
                tax_expense: { type: "string" },
                net_income: { type: "string" }
              }
            }
          }
        }
      },
      balance_sheet: {
        type: "array",
        items: {
          type: "object",
          required: ["year", "total_assets", "total_liabilities", "total_equity", "formula"],
          properties: {
            year: { type: "number" },
            cash: { type: "number" },
            accounts_receivable: { type: "number" },
            ppe_net: { type: "number" },
            intangible_assets: { type: "number" },
            total_assets: { type: "number" },
            accounts_payable: { type: "number" },
            accrued_expenses: { type: "number" },
            debt: { type: "number" },
            total_liabilities: { type: "number" },
            retained_earnings: { type: "number" },
            additional_paid_in_capital: { type: "number" },
            total_equity: { type: "number" },
            formula: {
              type: "object",
              properties: {
                total_assets: { type: "string" },
                total_liabilities: { type: "string" },
                total_equity: { type: "string" },
                retained_earnings: { type: "string" }
              }
            }
          }
        }
      },
      cash_flow_statement: {
        type: "array",
        items: {
          type: "object",
          required: ["year", "net_income", "operating_cash_flow", "investing_cash_flow", "financing_cash_flow", "net_change_in_cash", "ending_cash", "formula"],
          properties: {
            year: { type: "number" },
            net_income: { type: "number" },
            depreciation: { type: "number" },
            working_capital_change: { type: "number" },
            operating_cash_flow: { type: "number" },
            capex: { type: "number" },
            investing_cash_flow: { type: "number" },
            debt_issuance: { type: "number" },
            debt_repayment: { type: "number" },
            financing_cash_flow: { type: "number" },
            net_change_in_cash: { type: "number" },
            beginning_cash: { type: "number" },
            ending_cash: { type: "number" },
            free_cash_flow: { type: "number" },
            formula: {
              type: "object",
              properties: {
                operating_cash_flow: { type: "string" },
                investing_cash_flow: { type: "string" },
                financing_cash_flow: { type: "string" },
                net_change_in_cash: { type: "string" },
                ending_cash: { type: "string" },
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
