
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import CollapsibleSection from "./CollapsibleSection";

const downloadCsv = (content, fileName) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if(link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const generateCsvContent = (caseData) => {
    let csv = `"${caseData.name} - Model Template"\n\n`;

    csv += `ASSUMPTIONS\n`;
    csv += `Category,Metric,Value\n`;
    
    // Year 0 Starting Point
    if (caseData.starting_point) {
        for (const [key, value] of Object.entries(caseData.starting_point)) {
            let formattedValue = value;
            if (typeof value === 'number') {
                if (key.includes('margin')) {
                    formattedValue = `${(value * 100).toFixed(1)}%`;
                } else if (key.includes('arr') || key.includes('marketing') || key.includes('rd') || key.includes('ga')) {
                    formattedValue = `$${value}M`;
                } else if (key.includes('arpu')) {
                    formattedValue = `$${value.toLocaleString()}`;
                } else if (key.includes('customers')) {
                    formattedValue = value.toLocaleString();
                }
            }
            csv += `"Year 0 Baseline","${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}","${formattedValue}"\n`;
        }
    }
    
    if (caseData.assumptions?.operational_drivers) {
        for (const [key, value] of Object.entries(caseData.assumptions.operational_drivers)) {
            let formattedValue = value;
            if (Array.isArray(value)) {
                formattedValue = value.join(', ');
            } else if (typeof value === 'number' && (key.includes('rate') || key.includes('percent'))) {
                formattedValue = `${(value * 100).toFixed(1)}%`;
            }
            csv += `"Operational","${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}","${formattedValue}"\n`;
        }
    }
    if (caseData.assumptions?.financial_assumptions) {
        for (const [key, value] of Object.entries(caseData.assumptions.financial_assumptions)) {
            let formattedValue = value;
            if (typeof value === 'number' && (key.includes('wacc') || key.includes('rate'))) {
                formattedValue = `${(value * 100).toFixed(1)}%`;
            }
            csv += `"Financial","${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}","${formattedValue}"\n`;
        }
    }

    csv += `\n\n3-STATEMENT MODEL TEMPLATE\n`;
    csv += `(All figures in millions unless otherwise stated)\n\n`;

    const years = ['Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
    const headers = ['Metric', ...years].join(','); // Removed Formula column for template
    
    // Helper function to get Year 0 baseline values with proper mapping
    const getYear0Value = (metricKey) => {
        const startingPoint = caseData.starting_point || {};
        
        const mappings = {
            'Revenue': (startingPoint.current_arr || 0),
            'Gross Profit': (startingPoint.current_arr || 0) * (startingPoint.current_gross_margin || 0.8),
            'Sales & Marketing': (startingPoint.current_sales_marketing || 0),
            'R&D': (startingPoint.current_rd || 0),
            'G&A': (startingPoint.current_ga || 0),
            'EBITDA': '',
            'Depreciation & Amortization': '',
            'EBIT': '',
            'Taxes': '',
            'Net Income': '',
            'Cash & Cash Equivalents': (startingPoint.opening_cash || 0),
            'Accounts Receivable': '',
            'Inventory': '',
            'Total Current Assets': '',
            'Property, Plant & Equipment (PP&E)': (startingPoint.opening_ppe || 0),
            'Goodwill': '',
            'Total Assets': '',
            'Accounts Payable': '',
            'Accrued Liabilities': '',
            'Total Current Liabilities': '',
            'Long-Term Debt': '',
            'Total Liabilities': '',
            'Common Stock & APIC': '',
            'Retained Earnings': '',
            "Total Shareholder's Equity": '',
            'Total Liabilities & Equity': ''
        };
        
        const value = mappings[metricKey];
        return typeof value === 'number' ? value.toFixed(2) : value;
    };

    const addTemplateSection = (title, metrics) => {
        let section = `\n${title}\n`;
        section += headers + '\n';
        
        metrics.forEach(metric => {
            const year0Value = getYear0Value(metric);
            section += `"${metric}","${year0Value}",,,,,\n`; // No formula column, just metric + years
        });
        
        return section;
    };

    const dcfValuationMetrics = [
        'EBIT', 'Taxes on EBIT', 'NOPAT', 'Depreciation & Amortization', 'Capital Expenditures (CapEx)', 'Change in NWC', 'Unlevered Free Cash Flow (UFCF)'
    ];

    const incomeStatementMetrics = [
        'Revenue', 'Gross Profit', 'Sales & Marketing', 'R&D', 'G&A', 'EBITDA', 'Depreciation & Amortization', 'EBIT', 'Taxes', 'Net Income'
    ];

    const balanceSheetMetrics = [
        'Cash & Cash Equivalents', 'Accounts Receivable', 'Inventory', 'Total Current Assets',
        'Property, Plant & Equipment (PP&E)', 'Goodwill', 'Total Assets',
        'Accounts Payable', 'Accrued Liabilities', 'Total Current Liabilities',
        'Long-Term Debt', 'Total Liabilities',
        'Common Stock & APIC', 'Retained Earnings', "Total Shareholder's Equity",
        'Total Liabilities & Equity'
    ];

    const cashFlowStatementMetrics = [
        'Net Income', 'Depreciation & Amortization', 'Changes in NWC', 'Net Cash from Operations',
        'Capital Expenditures (CapEx)', 'Net Cash from Investing',
        'Debt Issued / (Paid Down)', 'Net Cash from Financing',
        'Net Change in Cash', 'Beginning Cash Balance', 'Ending Cash Balance'
    ];

    csv += addTemplateSection('DCF VALUATION', dcfValuationMetrics);
    csv += addTemplateSection('INCOME STATEMENT', incomeStatementMetrics);
    csv += addTemplateSection('BALANCE SHEET', balanceSheetMetrics);
    csv += addTemplateSection('CASH FLOW STATEMENT', cashFlowStatementMetrics);

    return csv;
};

export default function FinancialStatementsTemplate({ caseData, isDownloadOnly = false }) {
  
  const handleDownload = () => {
    const csvContent = generateCsvContent(caseData);
    downloadCsv(csvContent, `${caseData.name}_Model_Template.csv`);
  };
  
  if (isDownloadOnly) {
      return (
          <Button onClick={handleDownload} variant="outline" className="w-full justify-start gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Download Model Template (Excel)
          </Button>
      );
  }

  return (
    <CollapsibleSection
      title="Financial Model Template"
      icon={FileSpreadsheet}
      helpText="Download a pre-built 3-statement model skeleton with your case assumptions to get started quickly"
    >
      <div className="space-y-4 p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Kickstart Your Model</h4>
          <p className="text-sm text-blue-800">
            Download this CSV template containing all the operational and financial drivers for this case. It includes a standard 3-statement model structure for you to build out.
          </p>
        </div>
        <Button
          onClick={handleDownload}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Model Template (Excel)
        </Button>
      </div>
    </CollapsibleSection>
  );
}
