import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, FileText, AlertCircle } from "lucide-react";

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
  fullCsv += `"${caseData.name} - Complete Financial Model"\n\n`;

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
  if (answerKey.revenue_buildup) {
    fullCsv += jsonToCsv(answerKey.revenue_buildup, "Revenue Build-Up");
    fullCsv += "\n";
  }
  if (answerKey.depreciation_schedule) {
    fullCsv += jsonToCsv(answerKey.depreciation_schedule, "Depreciation Schedule");
    fullCsv += "\n";
  }
  if (answerKey.debt_schedule) {
    fullCsv += jsonToCsv(answerKey.debt_schedule, "Debt Schedule");
    fullCsv += "\n";
  }
  if (answerKey.income_statement) {
    fullCsv += jsonToCsv(answerKey.income_statement, "Income Statement");
    fullCsv += "\n";
  }
  if (answerKey.balance_sheet) {
    fullCsv += jsonToCsv(answerKey.balance_sheet, "Balance Sheet");
    fullCsv += "\n";
  }
  if (answerKey.cash_flow_statement) {
    fullCsv += jsonToCsv(answerKey.cash_flow_statement, "Cash Flow Statement");
    fullCsv += "\n";
  }
  if (answerKey.dcf_valuation) {
    fullCsv += jsonToCsv(answerKey.dcf_valuation, "DCF Valuation");
    fullCsv += "\n";
  }

  // Final Metrics
  fullCsv += "Final Metrics\n";
  fullCsv += "Metric,Value\n";
  if (answerKey.final_metrics) {
    if (answerKey.final_metrics.npv !== undefined) {
      fullCsv += `NPV,"$${(answerKey.final_metrics.npv / 1000000).toFixed(2)}M"\n`;
    }
    if (answerKey.final_metrics.irr !== undefined) {
      fullCsv += `IRR,"${(answerKey.final_metrics.irr * 100).toFixed(2)}%"\n`;
    }
    if (answerKey.final_metrics.terminal_value !== undefined) {
      fullCsv += `Terminal Value,"$${(answerKey.final_metrics.terminal_value / 1000000).toFixed(2)}M"\n`;
    }
    if (answerKey.final_metrics.total_pv !== undefined) {
      fullCsv += `Total Present Value,"$${(answerKey.final_metrics.total_pv / 1000000).toFixed(2)}M"\n`;
    }
  }
  
  return fullCsv;
};

export default function DetailedModelDownload({ caseData }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!caseData.answer_key) {
      return;
    }

    setIsDownloading(true);
    
    try {
      // Generate the CSV content
      const csvContent = generateFullModelCsv(caseData);
      
      if (!csvContent) {
        throw new Error("No model data available for download");
      }

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${caseData.name} - Complete Model.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error downloading model:", error);
    }
    
    setIsDownloading(false);
  };

  // All users (including free) can download the complete model
  const canDownload = caseData.answer_key && caseData.status === 'completed';

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Complete Financial Model
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-600 text-sm">
          Download the complete three-statement financial model with all calculations, 
          formulas, and assumptions used in this case study.
        </p>

        {canDownload ? (
          <Button 
            onClick={handleDownload} 
            disabled={isDownloading}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? 'Generating Download...' : 'Download Complete Model (CSV)'}
          </Button>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Complete the case by submitting your results to unlock the model download.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}