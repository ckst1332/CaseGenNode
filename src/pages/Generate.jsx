
import React, { useState, useEffect } from "react";
import { Case } from "@/api/entities";
import { User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, AlertCircle, Cpu, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import GenerationProgress from "../components/generate/GenerationProgress";
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

const getCasePrompt = (industry) => {
  const basePrompt = `
    You are a world-class financial modeling instructor creating a realistic SaaS DCF case study. Your output MUST be financially plausible and represent a typical growing SaaS business.

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

const generateFinancialModelPrompt = (caseData) => {
  const operationalDrivers = caseData.assumptions?.operational_drivers || {};
  const financialAssumptions = caseData.assumptions?.financial_assumptions || {};
  const startingPoint = caseData.starting_point || {};
  
  const prompt = `
    You are building a financial model with a rigorous two-tier validation process: VP-level initial review followed by MD-level final approval.

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

// Helper to convert JSON data to CSV string for a single table
const jsonToCsv = (jsonData, title = null) => {
  if (!jsonData || jsonData.length === 0) return "";

  let csvString = "";
  if (title) {
    csvString += `"${title}"\n`; // Add a title row if provided
  }

  const headers = Object.keys(jsonData[0]);
  // Format headers for readability (e.g., "income_statement" -> "Income Statement")
  csvString += headers.map(header => `"${header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}"`).join(',') + '\n';

  jsonData.forEach(row => {
    const values = headers.map(header => {
      let value = row[header];
      if (typeof value === 'object' && value !== null) {
        // If it's an object (like the formula object), stringify it
        value = JSON.stringify(value);
      }
      // Ensure values are quoted if they contain commas or double quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        // Escape double quotes within the string by replacing them with two double quotes
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvString += values.join(',') + '\n';
  });

  return csvString;
};

// Helper to combine all model parts into a single CSV, enhanced for readability
const generateFullModelCsv = (caseData) => {
  const answerKey = caseData.answer_key;
  if (!answerKey) return "";

  let fullCsv = "";

  // Add a clear title for the whole file
  fullCsv += `"${caseData.name} - AI Model Cheat Sheet"\n\n`;

  // Company Description
  fullCsv += "Company Description\n";
  fullCsv += `"${caseData.company_description}"\n\n`;

  // Starting Point
  fullCsv += "Starting Point\n";
  fullCsv += "Metric,Value\n";
  if (caseData.starting_point) {
      for (const [key, value] of Object.entries(caseData.starting_point)) {
          let displayValue = value;
          if (typeof value === 'number') {
              if (key.includes('margin') || key.includes('rate')) { // For percentages like gross_margin
                  displayValue = `${(value * 100).toFixed(2)}%`;
              } else if (key.includes('arr') || key.includes('marketing') || key.includes('rd') || key.includes('ga') || key.includes('cash') || key.includes('ppe')) { // For currency in millions
                  displayValue = `$${value}M`;
              } else if (key.includes('customers')) { // For integer counts
                  displayValue = value.toLocaleString();
              } else { // Default number display
                  displayValue = value;
              }
          }
          fullCsv += `"${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}","${displayValue}"\n`;
      }
  }
  fullCsv += "\n\n";

  // Assumptions
  fullCsv += "Assumptions\n";
  fullCsv += "Category,Metric,Value\n";
  if (caseData.assumptions?.operational_drivers) {
    for (const [key, value] of Object.entries(caseData.assumptions.operational_drivers)) {
      let displayValue = value;
      if (Array.isArray(value)) {
          displayValue = value.join(', '); // Join array elements
      } else if (typeof value === 'number') {
           if (key.includes('rate') || key.includes('percent')) { // For percentages like churn_rate, sales_marketing_as_percent_revenue
              displayValue = `${(value * 100).toFixed(2)}%`;
           }
      }
      fullCsv += `Operational,"${key.replace(/_/g, ' ')}","${displayValue}"\n`;
    }
  }
  if (caseData.assumptions?.financial_assumptions) {
    for (const [key, value] of Object.entries(caseData.assumptions.financial_assumptions)) {
      let displayValue = value;
      if (typeof value === 'number' && (key.includes('wacc') || key.includes('rate'))) { // WACC, tax_rate, terminal_growth_rate are percentages
          displayValue = `${(value * 100).toFixed(2)}%`;
      }
      fullCsv += `Financial,"${key.replace(/_/g, ' ')}","${displayValue}"\n`;
    }
  }
  fullCsv += "\n\n";

  // Add all schedules and statements using the robust jsonToCsv helper
  fullCsv += jsonToCsv(answerKey.revenue_buildup, "Revenue Build-Up");
  fullCsv += jsonToCsv(answerKey.depreciation_schedule, "Depreciation Schedule");
  fullCsv += jsonToCsv(answerKey.debt_schedule, "Debt Schedule");
  fullCsv += jsonToCsv(answerKey.income_statement, "Income Statement");
  fullCsv += jsonToCsv(answerKey.balance_sheet, "Balance Sheet");
  fullCsv += jsonToCsv(answerKey.cash_flow_statement, "Cash Flow Statement");
  fullCsv += jsonToCsv(answerKey.dcf_valuation, "DCF Valuation");

  // Final Metrics
  fullCsv += "Final Metrics\n";
  fullCsv += "Metric,Value\n";
  if (answerKey.final_metrics) {
    fullCsv += `NPV,"${answerKey.final_metrics.npv}"\n`;
    fullCsv += `IRR,"${answerKey.final_metrics.irr}"\n`;
    if (answerKey.final_metrics.terminal_value !== undefined) {
      fullCsv += `Terminal Value,"${answerKey.final_metrics.terminal_value}"\n`;
    }
    if (answerKey.final_metrics.total_pv !== undefined) {
      fullCsv += `Total Present Value,"${answerKey.final_metrics.total_pv}"\n`;
    }
  }
  
  return fullCsv;
};


export default function Generate() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (e) {
        console.error("Failed to load user", e);
      }
    };
    fetchUser();
  }, []);

  const handleGenerateClick = async () => {
    if (!user) {
      setError("Please log in to generate a case.");
      return;
    }
    if ((user.credits_remaining || 0) <= 0) {
      setShowUpgradeModal(true);
      return;
    }
    generateCase();
  };

  const generateCase = async () => {
    setIsGenerating(true);
    setError(null);
    const industry = "Technology (SaaS)";

    try {
      // Step 1: Generate company scenario and operational assumptions
      setGenerationStep(1);
      const caseGen = getCasePrompt(industry);
      const scenarioResult = await InvokeLLM({
        prompt: caseGen.prompt,
        response_json_schema: caseGen.schema,
      });

      // Step 2: Build the full financial model and get the answer key
      setGenerationStep(2);
      // Case name is now derived directly from the AI-generated company name
      const caseName = `${scenarioResult.company_name} DCF Analysis`;
      
      // Create properly structured case data with assumptions
      const tempCaseData = { 
        name: caseName, 
        company_description: scenarioResult.company_description,
        starting_point: scenarioResult.starting_point,
        assumptions: scenarioResult.assumptions
      };
      
      const answerKeyGen = generateFinancialModelPrompt(tempCaseData);
      const calculationResult = await InvokeLLM({
        prompt: answerKeyGen.prompt,
        response_json_schema: answerKeyGen.schema,
      });

      // Step 3: Create the Case object and store the full answer key
      setGenerationStep(3);
      const newCase = await Case.create({
        name: caseName,
        type: "DCF",
        status: "awaiting_results", // Final status, as model is generated in this step
        industry: industry,
        company_description: scenarioResult.company_description,
        starting_point: scenarioResult.starting_point,
        assumptions: scenarioResult.assumptions,
        answer_key: calculationResult, // Store the full calculation result JSON directly
        answer_key_excel: null, // No longer pre-uploading a file
      });

      // Decrement user credits
      await User.updateMyUserData({ credits_remaining: (user.credits_remaining || 0) - 1 });

      // Step 4: Navigate to the newly created case
      setGenerationStep(4); 
      setTimeout(() => {
        navigate(createPageUrl(`Case?id=${newCase.id}`));
      }, 1000);

    } catch (err) {
      console.error("Error generating case:", err);
      let errorMessage = "Failed to generate case. The AI may have returned an invalid format or encountered an issue. Please try again.";
      if (err.response && err.response.data && err.response.data.detail) {
        errorMessage = `An error occurred: ${err.response.data.detail}`;
      } else if (err.message) {
        errorMessage = `An error occurred: ${err.message}`;
      }
      setError(errorMessage);
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <GenerationProgress step={generationStep} caseType="DCF" />
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="bg-white p-10 rounded-2xl shadow-2xl border border-slate-200 max-w-lg">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
              <Cpu className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
            Generate New Case
          </h1>
          <p className="text-slate-600 text-lg mb-8">
            Create a new, realistic DCF modeling challenge for a SaaS company in seconds.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-6 text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleGenerateClick}
            disabled={isGenerating || !user}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-base font-bold py-7"
          >
            {isGenerating ? (
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
            ) : (
              <Zap className="w-6 h-6 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Case Study'}
          </Button>
          <p className="text-sm text-slate-500 mt-4">
            Credits remaining: {user ? (user.credits_remaining || 0) : '...'}
          </p>
        </div>
      </div>
      <AlertDialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Out of Credits?</AlertDialogTitle>
            <AlertDialogDescription>
              Upgrade to the Basic plan for 15 fresh cases every month and unlock full model downloads.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Maybe Later</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate(createPageUrl("Account"))}>
              Go Basic – $12/mo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
