import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet, Calculator, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const FinancialStatementsTemplate = ({ caseData, onDownload }) => {
  
  const formatNumber = (value) => {
    if (value === null || value === undefined) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    return num.toLocaleString();
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined) return '0.0%';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0.0%';
    return `${(num * 100).toFixed(1)}%`;
  };

  const generateTemplateCSV = () => {
    const csvContent = [];
    
    // Header
    csvContent.push(['FINANCIAL MODEL TEMPLATE']);
    csvContent.push(['Company:', caseData.name]);
    csvContent.push(['Download Date:', new Date().toLocaleDateString()]);
    csvContent.push(['']);
    
    // Instructions
    csvContent.push(['INSTRUCTIONS']);
    csvContent.push(['1. Use the provided starting point data and assumptions']);
    csvContent.push(['2. Build a complete 5-year financial model']);
    csvContent.push(['3. Include Income Statement, Balance Sheet, Cash Flow Statement']);
    csvContent.push(['4. Calculate DCF valuation with NPV and IRR']);
    csvContent.push(['5. Submit your final NPV and IRR results']);
    csvContent.push(['']);
    
    // Company Description
    csvContent.push(['COMPANY DESCRIPTION']);
    csvContent.push([caseData.company_description || 'No description available']);
    csvContent.push(['']);
    
    // Starting Point
    csvContent.push(['STARTING POINT (Year 0)']);
    if (caseData.starting_point) {
      Object.entries(caseData.starting_point).forEach(([key, value]) => {
        csvContent.push([key.replace(/_/g, ' ').toUpperCase(), value]);
      });
    }
    csvContent.push(['']);
    
    // Assumptions
    csvContent.push(['GROWTH ASSUMPTIONS']);
    if (caseData.assumptions) {
      // Operational Drivers
      if (caseData.assumptions.operational_drivers) {
        csvContent.push(['OPERATIONAL DRIVERS']);
        Object.entries(caseData.assumptions.operational_drivers).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            csvContent.push([key.replace(/_/g, ' ').toUpperCase(), 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']);
            csvContent.push(['', ...value]);
          }
        });
        csvContent.push(['']);
      }
      
      // Financial Assumptions
      if (caseData.assumptions.financial_assumptions) {
        csvContent.push(['FINANCIAL ASSUMPTIONS']);
        Object.entries(caseData.assumptions.financial_assumptions).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            csvContent.push([key.replace(/_/g, ' ').toUpperCase(), 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']);
            csvContent.push(['', ...value]);
          } else {
            csvContent.push([key.replace(/_/g, ' ').toUpperCase(), value]);
          }
        });
        csvContent.push(['']);
      }
    }
    
    // Template Sections
    csvContent.push(['TEMPLATE SECTIONS TO BUILD']);
    csvContent.push(['']);
    
    csvContent.push(['1. REVENUE BUILDUP SCHEDULE']);
    csvContent.push(['Year', 'Beginning Customers', 'New Customers', 'Churned Customers', 'Ending Customers', 'ARPU', 'Revenue']);
    csvContent.push(['0', caseData.starting_point?.current_customers || 0, '', '', '', caseData.starting_point?.current_arpu || 0, caseData.starting_point?.current_arr || 0]);
    for (let i = 1; i <= 5; i++) {
      csvContent.push([i, '', '', '', '', '', '']);
    }
    csvContent.push(['']);
    
    csvContent.push(['2. DEPRECIATION SCHEDULE']);
    csvContent.push(['Year', 'Beginning PP&E', 'CapEx', 'Depreciation', 'Ending PP&E']);
    csvContent.push(['0', caseData.starting_point?.current_ppe || 0, '', '', '']);
    for (let i = 1; i <= 5; i++) {
      csvContent.push([i, '', '', '', '']);
    }
    csvContent.push(['']);
    
    csvContent.push(['3. INCOME STATEMENT']);
    csvContent.push(['Year', 'Revenue', 'Cost of Revenue', 'Gross Profit', 'S&M Expense', 'R&D Expense', 'G&A Expense', 'Total OpEx', 'EBITDA', 'Depreciation', 'EBIT', 'Interest Expense', 'EBT', 'Tax Expense', 'Net Income']);
    for (let i = 1; i <= 5; i++) {
      csvContent.push([i, '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    }
    csvContent.push(['']);
    
    csvContent.push(['4. BALANCE SHEET']);
    csvContent.push(['Year', 'Cash', 'PP&E (Net)', 'Total Assets', 'Debt', 'Retained Earnings', 'Total Equity', 'Total Liab & Equity']);
    for (let i = 1; i <= 5; i++) {
      csvContent.push([i, '', '', '', '', '', '', '']);
    }
    csvContent.push(['']);
    
    csvContent.push(['5. CASH FLOW STATEMENT']);
    csvContent.push(['Year', 'Net Income', 'Depreciation', 'Change in WC', 'Operating Cash Flow', 'CapEx', 'Free Cash Flow']);
    for (let i = 1; i <= 5; i++) {
      csvContent.push([i, '', '', '', '', '', '']);
    }
    csvContent.push(['']);
    
    csvContent.push(['6. DCF VALUATION']);
    csvContent.push(['Year', 'EBIT', 'Tax on EBIT', 'NOPAT', 'Depreciation', 'CapEx', 'Change in WC', 'Unlevered FCF', 'PV Factor', 'PV of FCF']);
    for (let i = 1; i <= 5; i++) {
      csvContent.push([i, '', '', '', '', '', '', '', '', '']);
    }
    csvContent.push(['']);
    
    csvContent.push(['FINAL VALUATION']);
    csvContent.push(['Sum of PV of FCF (Years 1-5)', '']);
    csvContent.push(['Terminal Value', '']);
    csvContent.push(['PV of Terminal Value', '']);
    csvContent.push(['Enterprise Value (NPV)', '']);
    csvContent.push(['Internal Rate of Return (IRR)', '']);
    csvContent.push(['']);
    
    csvContent.push(['KEY FORMULAS TO REMEMBER']);
    csvContent.push(['Revenue = Customers × ARPU']);
    csvContent.push(['Gross Profit = Revenue × Gross Margin %']);
    csvContent.push(['EBITDA = Gross Profit - Operating Expenses']);
    csvContent.push(['EBIT = EBITDA - Depreciation']);
    csvContent.push(['Tax Expense = EBIT × Tax Rate']);
    csvContent.push(['Free Cash Flow = NOPAT + Depreciation - CapEx - Change in WC']);
    csvContent.push(['Terminal Value = Year 5 FCF × (1 + Terminal Growth) / (WACC - Terminal Growth)']);
    csvContent.push(['PV Factor = 1 / (1 + WACC)^Year']);
    
    // Convert to CSV string
    return csvContent.map(row => 
      row.map(cell => {
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    ).join('\n');
  };

  const handleDownload = () => {
    const csvContent = generateTemplateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${caseData.name || 'case'}_financial_model_template.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // Notify parent component that download completed
    if (onDownload) {
      onDownload();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-blue-500" />
          Download Financial Model Template
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">📊 Your Mission:</h4>
          <p className="text-sm text-blue-700 mb-3">
            Build a complete 5-year DCF financial model for <strong>{caseData.name}</strong> using the provided assumptions.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-blue-800 text-sm mb-1">What's Included:</h5>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Company description & context</li>
                <li>• Year 0 starting point data</li>
                <li>• 5-year growth assumptions</li>
                <li>• Template structure for all statements</li>
                <li>• Key formula reminders</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 text-sm mb-1">Your Task:</h5>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Build revenue buildup schedule</li>
                <li>• Create 3-statement model (IS, BS, CFS)</li>
                <li>• Calculate DCF valuation</li>
                <li>• Determine NPV and IRR</li>
                <li>• Submit final results</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-600">Starting ARR</div>
            <div className="font-semibold text-lg">
              ${formatNumber(caseData.starting_point?.current_arr)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">WACC</div>
            <div className="font-semibold text-lg">
              {formatPercent(caseData.assumptions?.financial_assumptions?.wacc)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Target IRR Range</div>
            <div className="font-semibold text-lg">15-25%</div>
          </div>
        </div>

        <Button 
          onClick={handleDownload} 
          className="w-full"
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Template (CSV)
        </Button>

        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <Target className="w-4 h-4 text-amber-600" />
          <p className="text-sm text-amber-700">
            <strong>Next Step:</strong> Once you download the template and build your model, 
            return here to submit your calculated NPV and IRR results.
          </p>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Template includes all necessary sections and formulas</p>
          <p>• Build your model in Excel, Google Sheets, or your preferred tool</p>
          <p>• Focus on accuracy - small changes can significantly impact valuation</p>
          <p>• Take your time to double-check calculations</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialStatementsTemplate;
