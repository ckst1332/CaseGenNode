import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet, Calculator, Target, TrendingUp, Building2 } from 'lucide-react';
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

  const handleDownload = async () => {
    try {
      // Use the XLSX template download endpoint
      const response = await fetch(`/api/cases/${caseData.id}/download-template?format=xlsx`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${caseData.company_name || caseData.name || 'case'}_template.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      // Notify parent component that download completed
      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading template. Please try again.');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-blue-500" />
          Professional Financial Model Template
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Your Mission: Build a Complete DCF Model
          </h4>
          <p className="text-sm text-blue-700 mb-4">
            Create an institutional-grade 3-statement financial model for <strong>{caseData.company_name || caseData.name}</strong> using the comprehensive assumptions provided.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-blue-800 text-sm mb-2">📋 Excel Template Includes:</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Multi-worksheet structure with scenario tab</li>
                <li>• Year 0 baseline reference data</li>
                <li>• Comprehensive growth assumptions</li>
                <li>• Empty model structure for all statements</li>
                <li>• Professional formatting & formulas</li>
                <li>• Key calculation reminders</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 text-sm mb-2">🎯 Your Deliverables:</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Revenue buildup schedule</li>
                <li>• Income Statement (P&L)</li>
                <li>• Balance Sheet (Assets = Liab + Equity)</li>
                <li>• Cash Flow Statement (Ops/Inv/Fin)</li>
                <li>• DCF valuation with terminal value</li>
                <li>• Final NPV and IRR calculations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Enhanced Assumptions Display */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Comprehensive Model Assumptions
          </h4>
          
          {/* Key Metrics Grid */}
          <div className="grid md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
            <div className="text-center p-3 bg-white rounded border">
              <div className="text-xs text-gray-600 mb-1">Starting ARR</div>
              <div className="font-bold text-lg text-green-600">
                ${formatNumber(caseData.starting_point?.current_arr || caseData.year_0_baseline?.operational_metrics?.current_arr)}
              </div>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <div className="text-xs text-gray-600 mb-1">Discount Rate (WACC)</div>
              <div className="font-bold text-lg text-blue-600">
                {formatPercent(caseData.assumptions?.financial_assumptions?.wacc)}
              </div>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <div className="text-xs text-gray-600 mb-1">Terminal Growth</div>
              <div className="font-bold text-lg text-purple-600">
                {formatPercent(caseData.assumptions?.financial_assumptions?.terminal_growth_rate || 0.03)}
              </div>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <div className="text-xs text-gray-600 mb-1">Target IRR Range</div>
              <div className="font-bold text-lg text-orange-600">15-25%</div>
            </div>
          </div>

          {/* Detailed Assumptions */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Operational Assumptions */}
            {caseData.assumptions?.operational_drivers && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-800 mb-3">🚀 Operational Drivers</h5>
                <div className="space-y-2">
                  {Object.entries(caseData.assumptions.operational_drivers).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-white rounded border border-green-100">
                      <span className="text-sm font-medium text-green-700 capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-semibold text-green-800">
                        {Array.isArray(value) ? value.join(', ') : 
                         (typeof value === 'number' && key.includes('rate') ? formatPercent(value) : value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Assumptions */}
            {caseData.assumptions?.financial_assumptions && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-800 mb-3">💰 Financial Assumptions</h5>
                <div className="space-y-2">
                  {Object.entries(caseData.assumptions.financial_assumptions).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-white rounded border border-blue-100">
                      <span className="text-sm font-medium text-blue-700 capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-semibold text-blue-800">
                        {typeof value === 'number' && (key.includes('rate') || key.includes('wacc')) ? 
                         formatPercent(value) : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Year 0 Baseline */}
          {(caseData.starting_point || caseData.year_0_baseline) && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h5 className="font-medium text-purple-800 mb-3">📊 Year 0 Baseline Data</h5>
              <div className="grid md:grid-cols-3 gap-3">
                {Object.entries(caseData.starting_point || caseData.year_0_baseline?.operational_metrics || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-white rounded border border-purple-100">
                    <span className="text-xs font-medium text-purple-700 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-semibold text-purple-800">
                      {typeof value === 'number' ? 
                        (key.includes('margin') || key.includes('rate') ? formatPercent(value) : formatNumber(value)) : 
                        value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={handleDownload} 
          className="w-full h-12 text-lg font-semibold"
          size="lg"
        >
          <Download className="w-5 h-5 mr-3" />
          Download Professional Excel Template (XLSX)
        </Button>

        <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <Target className="w-5 h-5 text-amber-600" />
          <div className="text-sm text-amber-700">
            <p className="font-medium mb-1">Next Steps:</p>
            <p>1. Download the professional Excel template with all assumptions</p>
            <p>2. Build your comprehensive 3-statement financial model</p>
            <p>3. Calculate NPV and IRR using DCF methodology</p>
            <p>4. Return here to submit your results and compare with the solution</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-800 mb-2">💡 Modeling Tips</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Start with revenue buildup using customer and ARPU assumptions</li>
              <li>• Ensure balance sheet balances (Assets = Liabilities + Equity)</li>
              <li>• Link statements properly (Net Income flows to BS and CF)</li>
              <li>• Double-check working capital calculations</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-800 mb-2">🎯 Success Criteria</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• IRR should fall within 15-25% range for realistic models</li>
              <li>• Cash balances should remain positive throughout</li>
              <li>• Revenue growth should follow provided assumptions</li>
              <li>• All formulas should be clearly documented</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialStatementsTemplate;
