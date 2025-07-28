/**
 * Advanced Data Processing Utilities
 * Extracted from React Router implementation for CSV generation and formatting
 */

/**
 * Convert JSON data to CSV string for a single table with advanced formatting
 * @param {Array} jsonData - Array of objects to convert
 * @param {string} title - Optional title for the CSV section
 * @returns {string} - Formatted CSV string
 */
export const jsonToCsv = (jsonData, title = null) => {
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

/**
 * Generate complete financial model CSV with professional formatting
 * @param {Object} caseData - Complete case data including answer key
 * @returns {string} - Comprehensive CSV with all model components
 */
export const generateFullModelCsv = (caseData) => {
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

/**
 * Format financial numbers for display with appropriate units
 * @param {number} value - Numerical value to format
 * @param {string} type - Type of value (currency, percentage, count)
 * @returns {string} - Formatted display value
 */
export const formatFinancialValue = (value, type = 'currency') => {
  if (typeof value !== 'number') return value;

  switch (type) {
    case 'currency':
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`;
      }
      return `$${value.toFixed(2)}`;
      
    case 'percentage':
      return `${(value * 100).toFixed(2)}%`;
      
    case 'count':
      return value.toLocaleString();
      
    case 'decimal':
      return value.toFixed(4);
      
    default:
      return value.toString();
  }
};

/**
 * Download CSV file in browser
 * @param {string} csvContent - CSV content to download
 * @param {string} filename - Filename for download
 */
export const downloadCsv = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Validate CSV data structure before processing
 * @param {Array} data - Data array to validate
 * @returns {Object} - Validation results
 */
export const validateCsvData = (data) => {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!Array.isArray(data)) {
    validation.isValid = false;
    validation.errors.push("Data must be an array");
    return validation;
  }

  if (data.length === 0) {
    validation.warnings.push("Data array is empty");
    return validation;
  }

  const firstRowKeys = Object.keys(data[0]);
  data.forEach((row, index) => {
    const rowKeys = Object.keys(row);
    if (rowKeys.length !== firstRowKeys.length) {
      validation.warnings.push(`Row ${index + 1} has different number of columns`);
    }
  });

  return validation;
}; 