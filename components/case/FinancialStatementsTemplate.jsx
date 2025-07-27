import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Download, FileSpreadsheet, Info } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

const FinancialStatementsTemplate = ({ caseData, onDownload }) => {
  
  const formatNumber = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercent = (value) => {
    if (!value) return '0.0%';
    return `${(value * 100).toFixed(1)}%`;
  };

  // Generate CSV content for financial statements template
  const generateTemplateCSV = () => {
    const startingPoint = caseData.starting_point || {};
    const assumptions = caseData.assumptions || {};
    const operationalDrivers = assumptions.operational_drivers || {};
    const financialAssumptions = assumptions.financial_assumptions || {};

    const csvContent = [
      // Header
      ['FINANCIAL STATEMENTS TEMPLATE'],
      ['Company:', caseData.name || 'Company Name'],
      ['Industry:', caseData.industry || 'SaaS'],
      [''],
      
      // Starting Point Data
      ['STARTING POINT (Year 0)'],
      ['Current ARR', startingPoint.current_arr || 0],
      ['Current Customers', startingPoint.current_customers || 0],
      ['Current ARPU', startingPoint.current_arpu || 0],
      ['Gross Margin %', formatPercent(startingPoint.gross_margin_percent)],
      ['S&M Expense %', formatPercent(startingPoint.current_opex_sm_percent)],
      ['R&D Expense %', formatPercent(startingPoint.current_opex_rd_percent)],
      ['G&A Expense %', formatPercent(startingPoint.current_opex_ga_percent)],
      ['Cash', startingPoint.current_cash || 0],
      ['PP&E', startingPoint.current_ppe || 0],
      [''],

      // Key Assumptions
      ['KEY ASSUMPTIONS'],
      ['WACC', formatPercent(financialAssumptions.wacc)],
      ['Tax Rate', formatPercent(financialAssumptions.tax_rate)],
      ['Terminal Growth Rate', formatPercent(financialAssumptions.terminal_growth_rate)],
      ['Depreciation Rate', formatPercent(financialAssumptions.depreciation_rate)],
      [''],

      // Growth Assumptions by Year
      ['GROWTH ASSUMPTIONS BY YEAR', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ['New Customers', ...(operationalDrivers.customer_acquisition_growth || [0,0,0,0,0])],
      ['Churn Rate', ...(operationalDrivers.churn_rates || [0,0,0,0,0]).map(formatPercent)],
      ['ARPU Growth', ...(operationalDrivers.arpu_growth_rates || [0,0,0,0,0]).map(formatPercent)],
      ['S&M % of Revenue', ...(operationalDrivers.sm_expense_percent || [0,0,0,0,0]).map(formatPercent)],
      ['R&D % of Revenue', ...(operationalDrivers.rd_expense_percent || [0,0,0,0,0]).map(formatPercent)],
      ['G&A % of Revenue', ...(operationalDrivers.ga_expense_percent || [0,0,0,0,0]).map(formatPercent)],
      ['CapEx % of Revenue', ...(financialAssumptions.capex_percent_revenue || [0,0,0,0,0]).map(formatPercent)],
      [''],

      // Template Structure
      ['BUILD YOUR MODEL BELOW'],
      [''],

      // Revenue Buildup Template
      ['REVENUE BUILDUP', 'Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ['Beginning Customers', startingPoint.current_customers || 0, '', '', '', '', ''],
      ['+ New Customers', '', '', '', '', '', ''],
      ['- Churned Customers', '', '', '', '', '', ''],
      ['= Ending Customers', '', '', '', '', '', ''],
      ['ARPU', startingPoint.current_arpu || 0, '', '', '', '', ''],
      ['= Revenue', startingPoint.current_arr || 0, '', '', '', '', ''],
      [''],

      // Income Statement Template
      ['INCOME STATEMENT', 'Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ['Revenue', startingPoint.current_arr || 0, '', '', '', '', ''],
      ['Cost of Revenue', '', '', '', '', '', ''],
      ['Gross Profit', '', '', '', '', '', ''],
      ['S&M Expense', '', '', '', '', '', ''],
      ['R&D Expense', '', '', '', '', '', ''],
      ['G&A Expense', '', '', '', '', '', ''],
      ['Total OpEx', '', '', '', '', '', ''],
      ['EBITDA', '', '', '', '', '', ''],
      ['Depreciation', '', '', '', '', '', ''],
      ['EBIT', '', '', '', '', '', ''],
      ['Interest Expense', '', '', '', '', '', ''],
      ['EBT', '', '', '', '', '', ''],
      ['Tax Expense', '', '', '', '', '', ''],
      ['Net Income', '', '', '', '', '', ''],
      [''],

      // Balance Sheet Template
      ['BALANCE SHEET', 'Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ['ASSETS'],
      ['Cash', startingPoint.current_cash || 0, '', '', '', '', ''],
      ['PP&E (net)', startingPoint.current_ppe || 0, '', '', '', '', ''],
      ['Total Assets', '', '', '', '', '', ''],
      [''],
      ['LIABILITIES & EQUITY'],
      ['Debt', '', '', '', '', '', ''],
      ['Retained Earnings', '', '', '', '', '', ''],
      ['Total Equity', '', '', '', '', '', ''],
      ['Total Liab & Equity', '', '', '', '', '', ''],
      [''],

      // Cash Flow Statement Template
      ['CASH FLOW STATEMENT', 'Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ['Net Income', '', '', '', '', '', ''],
      ['+ Depreciation', '', '', '', '', '', ''],
      ['- Change in WC', '', '', '', '', '', ''],
      ['= Operating Cash Flow', '', '', '', '', '', ''],
      ['- CapEx', '', '', '', '', '', ''],
      ['= Free Cash Flow', '', '', '', '', '', ''],
      [''],

      // DCF Valuation Template
      ['DCF VALUATION', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Terminal'],
      ['EBIT', '', '', '', '', '', ''],
      ['Tax on EBIT', '', '', '', '', '', ''],
      ['NOPAT', '', '', '', '', '', ''],
      ['+ Depreciation', '', '', '', '', '', ''],
      ['- CapEx', '', '', '', '', '', ''],
      ['- Change in WC', '', '', '', '', '', ''],
      ['= Unlevered FCF', '', '', '', '', '', ''],
      ['PV Factor', '', '', '', '', '', ''],
      ['PV of FCF', '', '', '', '', '', ''],
      [''],

      // Final Calculations
      ['FINAL CALCULATIONS'],
      ['Sum of PV (Years 1-5)', ''],
      ['Terminal Value', ''],
      ['PV of Terminal Value', ''],
      ['Enterprise Value', ''],
      [''],
      ['TARGET OUTPUTS'],
      ['NPV/Enterprise Value', ''],
      ['IRR', ''],
      [''],

      // Instructions
      ['INSTRUCTIONS'],
      ['1. Fill in the yellow cells with your calculations'],
      ['2. Use the assumptions provided above'],
      ['3. Build formulas that link between schedules'],
      ['4. Calculate NPV and IRR in the final section'],
      ['5. Submit your results when complete']
    ];

    // Convert to CSV string
    return csvContent.map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(',')
    ).join('\n');
  };

  const handleDownload = () => {
    const csvContent = generateTemplateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${caseData.name || 'case'}_financial_template.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    if (onDownload) {
      onDownload();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Financial Statements Template
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Download this Excel-compatible template with pre-filled assumptions and blank financial statements. 
            Build your DCF model and submit your NPV/IRR results for comparison.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium">Template Includes:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Starting point metrics (Year 0)</li>
              <li>• 5-year growth assumptions</li>
              <li>• Revenue buildup schedule</li>
              <li>• Income statement template</li>
              <li>• Balance sheet template</li>
              <li>• Cash flow statement template</li>
              <li>• DCF valuation framework</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Key Metrics (Pre-filled):</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Starting ARR: {formatNumber(caseData.starting_point?.current_arr)}</li>
              <li>• Current Customers: {formatNumber(caseData.starting_point?.current_customers)}</li>
              <li>• WACC: {formatPercent(caseData.assumptions?.financial_assumptions?.wacc)}</li>
              <li>• Tax Rate: {formatPercent(caseData.assumptions?.financial_assumptions?.tax_rate)}</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleDownload} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download Template (CSV)
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• CSV format is compatible with Excel, Google Sheets, and other spreadsheet software</p>
          <p>• All assumptions and starting values are pre-filled for your convenience</p>
          <p>• Follow the template structure to ensure accurate modeling</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialStatementsTemplate;
