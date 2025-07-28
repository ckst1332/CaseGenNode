/**
 * Advanced Financial Model Generation Prompts
 * Includes 3-tier validation system (Build → VP Review → MD Validation)
 */

/**
 * Generate comprehensive financial model with 3-tier validation
 * @param {Object} caseData - Case scenario data from initial generation
 * @returns {Object} - Prompt and schema for comprehensive financial model
 */
export const generateFinancialModelPrompt = (caseData) => {
  const operationalDrivers = caseData.assumptions?.operational_drivers || {};
  const financialAssumptions = caseData.assumptions?.financial_assumptions || {};
  const startingPoint = caseData.starting_point || {};
  
  const prompt = `
    You are building a financial model with a rigorous two-tier validation process: VP-level initial review followed by MD-level final approval.
    
    **LLaMA 3.3 ADVANCED MODELING INSTRUCTIONS:**
    - Apply institutional-grade financial modeling standards
    - Use your deep understanding of SaaS unit economics and DCF methodologies
    - Ensure mathematical precision in all calculations and formulas
    - Apply multi-step reasoning to validate outputs across interconnected statements

    **Case Data:**
    - Starting Point: ${JSON.stringify(startingPoint)}
    - Operational Drivers: ${JSON.stringify(operationalDrivers)}
    - Financial Assumptions: ${JSON.stringify(financialAssumptions)}

    **STEP 1: Build the Complete Model**
    Build a full 5-year financial model with:
    - Revenue buildup (customers × ARPU with growth/churn)
    - Complete Income Statement, Balance Sheet, Cash Flow Statement
    - DCF valuation to calculate NPV and IRR
    
    For EVERY calculated line item, include a "formula" field with Excel-like formulas showing the calculation logic. Examples:
    - Revenue: "Previous Revenue * (1 + Revenue Growth Rate)"
    - COGS: "Revenue * (1 - Gross Margin %)"
    - EBIT: "Revenue - COGS - Operating Expenses"
    - Taxes: "EBIT * Tax Rate"
    - Free Cash Flow: "EBIT * (1 - Tax Rate) + Depreciation - CapEx - Change in NWC"

    **STEP 2: VP-Level Review (Internal Check)**
    Review the model as a VP would:
    - Are growth rates sustainable year-over-year?
    - Do margins improve realistically?
    - Are cash flows positive by Year 3-5?
    - Adjust assumptions if any red flags appear.

    **STEP 3: MD-Level Final Validation (Critical)**
    Review as an MD would before client presentation:
    - **IRR Reality Check:** Is the IRR between 15-25% for a SaaS business? Not 35%+?
    - **Valuation Multiple Check:** Calculate EV/EBITDA. Should be 8-15x for mature SaaS, not 25x+
    - **Growth vs. Profitability Trade-off:** High growth should impact margins realistically
    - **Tax Rate Check:** Ensure taxes are calculated as EBIT * Tax_Rate, not excessive amounts
    - **IF METRICS FAIL:** Revise core assumptions (lower growth, higher costs) and recalculate until defensible
    
    **CRITICAL:** Only proceed if both VP and MD would approve these numbers in a real investment scenario.

    Return the complete model with formulas for every calculated line item.
  `;
  
  const schema = {
    type: "object",
    properties: {
      revenue_buildup: { 
        type: "array", 
        items: { 
          type: "object", 
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
      depreciation_schedule: { 
        type: "array", 
        items: { 
          type: "object", 
          properties: { 
            year: { type: "number" }, 
            beginning_ppe: { type: "number" }, 
            capex: { type: "number" }, 
            depreciation: { type: "number" }, 
            ending_ppe: { type: "number" },
            formula: { type: "object", description: "Formulas for each calculated field" }
          } 
        } 
      },
      debt_schedule: { 
        type: "array", 
        items: { 
          type: "object", 
          properties: { 
            year: { type: "number" }, 
            beginning_debt: { type: "number" }, 
            interest_expense: { type: "number" }, 
            ending_debt: { type: "number" },
            formula: { type: "object", description: "Formulas for each calculated field" }
          } 
        } 
      },
      income_statement: { 
        type: "array", 
        items: { 
          type: "object",
          properties: {
            year: { type: "number" },
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
            ebt: { type: "number" },
            taxes: { type: "number" },
            net_income: { type: "number" },
            formula: { 
              type: "object",
              properties: {
                revenue: { type: "string" },
                cogs: { type: "string" },
                gross_profit: { type: "string" },
                sales_marketing: { type: "string" },
                rd: { type: "string" },
                ga: { type: "string" },
                ebitda: { type: "string" },
                ebit: { type: "string" },
                taxes: { type: "string" },
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
          properties: {
            year: { type: "number" },
            cash: { type: "number" },
            accounts_receivable: { type: "number" },
            total_current_assets: { type: "number" },
            ppe_net: { type: "number" },
            total_assets: { type: "number" },
            accounts_payable: { type: "number" },
            total_current_liabilities: { type: "number" },
            long_term_debt: { type: "number" },
            total_liabilities: { type: "number" },
            equity: { type: "number" },
            total_liab_equity: { type: "number" },
            formula: { 
              type: "object",
              properties: {
                cash: { type: "string" },
                accounts_receivable: { type: "string" },
                total_current_assets: { type: "string" },
                ppe_net: { type: "string" },
                total_assets: { type: "string" },
                accounts_payable: { type: "string" },
                total_current_liabilities: { type: "string" },
                long_term_debt: { type: "string" },
                total_liabilities: { type: "string" },
                equity: { type: "string" },
                total_liab_equity: { type: "string" }
              }
            }
          }
        } 
      },
      cash_flow_statement: { 
        type: "array", 
        items: { 
          type: "object",
          properties: {
            year: { type: "number" },
            net_income: { type: "number" },
            depreciation: { type: "number" },
            change_in_nwc: { type: "number" },
            operating_cash_flow: { type: "number" },
            capex: { type: "number" },
            investing_cash_flow: { type: "number" },
            debt_issuance: { type: "number" },
            financing_cash_flow: { type: "number" },
            net_change_in_cash: { type: "number" },
            formula: { 
              type: "object",
              properties: {
                operating_cash_flow: { type: "string" },
                investing_cash_flow: { type: "string" },
                financing_cash_flow: { type: "string" },
                net_change_in_cash: { type: "string" }
              }
            }
          }
        } 
      },
      dcf_valuation: { 
        type: "array", 
        items: { 
          type: "object",
          properties: {
            year: { type: "number" },
            ebit: { type: "number" },
            tax_on_ebit: { type: "number" },
            nopat: { type: "number" },
            depreciation: { type: "number" },
            capex: { type: "number" },
            change_in_nwc: { type: "number" },
            unlevered_fcf: { type: "number" },
            pv_factor: { type: "number" },
            pv_of_fcf: { type: "number" },
            formula: { 
              type: "object",
              properties: {
                tax_on_ebit: { type: "string" },
                nopat: { type: "string" },
                unlevered_fcf: { type: "string" },
                pv_factor: { type: "string" },
                pv_of_fcf: { type: "string" }
              }
            }
          }
        } 
      },
      final_metrics: {
        type: "object",
        properties: { 
          npv: { type: "number", description: "Net Present Value / Enterprise Value" }, 
          irr: { type: "number", description: "Internal Rate of Return as decimal" },
          terminal_value: { type: "number" },
          total_pv: { type: "number" }
        }
      }
    }
  };

  return { prompt, schema };
};

/**
 * Validate financial model output for institutional quality
 * @param {Object} modelData - Generated financial model data
 * @returns {Object} - Validation results with specific recommendations
 */
export const validateFinancialModel = (modelData) => {
  const validationResults = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: []
  };

  // IRR validation
  const irr = modelData.final_metrics?.irr;
  if (irr) {
    if (irr > 0.35) {
      validationResults.warnings.push("IRR above 35% may be unrealistic for SaaS");
      validationResults.recommendations.push("Consider reducing growth assumptions or increasing costs");
    }
    if (irr < 0.10) {
      validationResults.warnings.push("IRR below 10% may not justify investment");
      validationResults.recommendations.push("Review revenue growth and margin assumptions");
    }
  }

  // Revenue growth validation
  const income = modelData.income_statement;
  if (income && income.length >= 2) {
    const year1Revenue = income[0]?.revenue;
    const year5Revenue = income[4]?.revenue;
    
    if (year1Revenue && year5Revenue) {
      const cagr = Math.pow(year5Revenue / year1Revenue, 1/4) - 1;
      if (cagr > 0.50) {
        validationResults.warnings.push(`Revenue CAGR of ${(cagr * 100).toFixed(1)}% may be too aggressive`);
      }
    }
  }

  // Balance sheet validation
  const balanceSheet = modelData.balance_sheet;
  if (balanceSheet && balanceSheet.length > 0) {
    balanceSheet.forEach((year, index) => {
      const assetLiabDiff = Math.abs(year.total_assets - year.total_liab_equity);
      if (assetLiabDiff > 0.01) {
        validationResults.errors.push(`Balance sheet doesn't balance in year ${index + 1}`);
        validationResults.isValid = false;
      }
    });
  }

  return validationResults;
}; 