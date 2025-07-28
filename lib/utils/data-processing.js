/**
 * Advanced Data Processing Utilities
 * CSV and XLSX generation with professional formatting
 */

import ExcelJS from 'exceljs';

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
 * Convert financial model data to transposed CSV format (metrics as rows, years as columns)
 * @param {Array} jsonData - Array of objects to convert (yearly data)
 * @param {string} title - Title for the CSV section
 * @param {Object} yearZeroData - Optional Year 0 baseline data
 * @returns {string} - Transposed CSV string with formulas
 */
export const jsonToTransposedCsv = (jsonData, title = null, yearZeroData = null) => {
  if (!jsonData || jsonData.length === 0) return "";

  let csvString = "";
  if (title) {
    csvString += `"${title}"\n`;
  }

  // Get all unique metric keys from all years
  const allMetrics = new Set();
  jsonData.forEach(yearData => {
    Object.keys(yearData).forEach(key => {
      if (key !== 'year' && key !== 'formula') allMetrics.add(key);
    });
  });

  // Add Year 0 metrics if provided
  if (yearZeroData) {
    Object.keys(yearZeroData).forEach(key => {
      if (key !== 'year' && key !== 'formula') allMetrics.add(key);
    });
  }

  // Create header row with Year 0 (if provided), years, and formula column
  const years = jsonData.map(item => item.year || `Year ${jsonData.indexOf(item) + 1}`);
  const headers = ['($ in thousands)'];
  if (yearZeroData) headers.push('Year 0');
  headers.push(...years, 'Terminal', 'Formula');
  csvString += headers.map(h => `"${h}"`).join(',') + '\n';

  // Create rows for each metric
  Array.from(allMetrics).forEach(metric => {
    const row = [formatMetricName(metric)];
    
    // Add Year 0 value if provided
    if (yearZeroData) {
      const year0Value = yearZeroData[metric];
      row.push(formatCsvValue(year0Value, metric));
    }
    
    // Add values for each year
    jsonData.forEach(yearData => {
      const value = yearData[metric];
      row.push(formatCsvValue(value, metric));
    });
    
    // Add terminal value (using last year's value or growth calculation)
    const lastValue = jsonData[jsonData.length - 1][metric];
    const terminalValue = calculateTerminalValue(metric, lastValue, jsonData);
    row.push(formatCsvValue(terminalValue, metric));
    
    // Add formula
    row.push(getFormulaForMetric(metric));
    
    csvString += row.map(v => `"${v}"`).join(',') + '\n';
  });

  return csvString + '\n';
};

/**
 * Format metric names for display
 */
const formatMetricName = (metric) => {
  return metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Format values for CSV display based on metric type
 */
const formatCsvValue = (value, metric) => {
  if (value === null || value === undefined) return '-';
  
  if (typeof value === 'number') {
    if (metric.includes('margin') || metric.includes('rate') || metric.includes('growth')) {
      return `${(value * 100).toFixed(1)}%`;
    } else if (metric.includes('revenue') || metric.includes('cost') || metric.includes('profit') || 
               metric.includes('ebitda') || metric.includes('cash')) {
      return value.toLocaleString();
    }
  }
  
  return value;
};

/**
 * Calculate terminal value for a metric
 */
const calculateTerminalValue = (metric, lastValue, allData) => {
  if (!lastValue || typeof lastValue !== 'number') return '-';
  
  if (metric.includes('growth') || metric.includes('margin') || metric.includes('rate')) {
    // For rates/percentages, use a steady state assumption
    if (metric.includes('growth')) return '3%';
    return lastValue;
  }
  
  // For absolute values, apply terminal growth rate
  const terminalGrowthRate = 0.03; // 3% terminal growth
  return Math.round(lastValue * (1 + terminalGrowthRate));
};

/**
 * Get formula description for each metric
 */
const getFormulaForMetric = (metric) => {
  const formulas = {
    'revenue': 'Prior Year × (1 + Growth Rate)',
    'revenue_growth': '(Current Year - Prior Year) / Prior Year',
    'gross_profit': 'Revenue × Gross Margin',
    'gross_margin': 'Assumed constant',
    'ebitda': 'Revenue × EBITDA Margin',
    'ebitda_margin': 'Improving due to operating leverage',
    'net_income': 'EBITDA - D&A - Interest - Taxes',
    'free_cash_flow': 'Net Income + D&A - CapEx - Change in NWC',
    'marketing_expenses': 'Revenue × Marketing % Assumption',
    'rd_expenses': 'Revenue × R&D % Assumption',
    'ga_expenses': 'Revenue × G&A % Assumption',
    'total_operating_expenses': 'Sum of all operating expense categories',
    'depreciation': 'Based on depreciation schedule',
    'interest_expense': 'Average debt balance × Interest rate',
    'tax_expense': 'Pre-tax income × Tax rate',
    'capex': 'Revenue × CapEx % assumption',
    'change_in_nwc': '(Revenue growth × NWC % assumption)',
    'cash_balance': 'Prior cash + Free cash flow'
  };

  return formulas[metric] || 'Per model assumptions';
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
  fullCsv += `"${caseData.name || caseData.company_name} - AI Model Cheat Sheet"\n\n`;

  // Company Description
  fullCsv += "Company Description\n";
  fullCsv += `"${caseData.company_description}"\n\n`;

  // Year 0 Baseline (if using new 3-statement format)
  if (caseData.year_0_baseline) {
    fullCsv += "Year 0 Baseline\n";
    fullCsv += "Statement,Metric,Value\n";
    
    // Operational metrics
    if (caseData.year_0_baseline.operational_metrics) {
      for (const [key, value] of Object.entries(caseData.year_0_baseline.operational_metrics)) {
        fullCsv += `Operational,"${formatMetricName(key)}","${formatCsvValue(value, key)}"\n`;
      }
    }
    
    fullCsv += "\n\n";
  }
  // Legacy starting point format (for backward compatibility)
  else if (caseData.starting_point) {
    fullCsv += "Starting Point\n";
    fullCsv += "Metric,Value\n";
    for (const [key, value] of Object.entries(caseData.starting_point)) {
        let displayValue = value;
        if (typeof value === 'number') {
            if (key.includes('margin') || key.includes('rate')) {
                displayValue = `${(value * 100).toFixed(2)}%`;
            } else if (key.includes('arr') || key.includes('marketing') || key.includes('rd') || key.includes('ga') || key.includes('cash') || key.includes('ppe')) {
                displayValue = `$${value}M`;
            } else if (key.includes('customers')) {
                displayValue = value.toLocaleString();
            } else {
                displayValue = value;
            }
        }
        fullCsv += `"${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}","${displayValue}"\n`;
    }
    fullCsv += "\n\n";
  }

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

  // Extract Year 0 data for each statement
  const year0Income = caseData.year_0_baseline?.income_statement;
  const year0Balance = caseData.year_0_baseline?.balance_sheet;
  const year0CashFlow = caseData.year_0_baseline?.cash_flow_statement;

  // Add all schedules and statements using the transposed format for main financial statements
  fullCsv += jsonToTransposedCsv(answerKey.revenue_buildup, "Revenue Build-Up with Formulas");
  fullCsv += jsonToTransposedCsv(answerKey.income_statement, "Income Statement with Formulas", year0Income);
  fullCsv += jsonToTransposedCsv(answerKey.balance_sheet, "Balance Sheet with Formulas", year0Balance);
  fullCsv += jsonToTransposedCsv(answerKey.cash_flow_statement, "Cash Flow Statement with Formulas", year0CashFlow);
  
  // Keep traditional format for schedules that are less suitable for transposing
  if (answerKey.depreciation_schedule) {
    fullCsv += jsonToCsv(answerKey.depreciation_schedule, "Depreciation Schedule");
  }
  if (answerKey.debt_schedule) {
    fullCsv += jsonToCsv(answerKey.debt_schedule, "Debt Schedule");
  }
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
 * Generate template CSV with scenario but no solutions
 * @param {Object} caseData - Case data without answer key
 * @returns {string} - Template CSV content
 */
export const generateTemplateCSV = (caseData) => {
  let csvContent = "";

  // Company header
  csvContent += `"${caseData.company_name} - Case Template"\n\n`;

  // Company description
  csvContent += "Company Description\n";
  csvContent += `"${caseData.company_description}"\n\n`;

  // Year 0 baseline if available
  if (caseData.year_0_baseline) {
    csvContent += "Year 0 Baseline\n";
    csvContent += "Metric,Value\n";
    
    if (caseData.year_0_baseline.operational_metrics) {
      Object.entries(caseData.year_0_baseline.operational_metrics).forEach(([key, value]) => {
        csvContent += `"${formatMetricName(key)}","${value}"\n`;
      });
    }
    csvContent += "\n";
  }

  // Assumptions
  if (caseData.assumptions) {
    csvContent += "Assumptions\n";
    csvContent += "Category,Metric,Value\n";
    
    if (caseData.assumptions.operational_drivers) {
      Object.entries(caseData.assumptions.operational_drivers).forEach(([key, value]) => {
        const displayValue = Array.isArray(value) ? value.join(', ') : value;
        csvContent += `Operational,"${formatMetricName(key)}","${displayValue}"\n`;
      });
    }
    
    if (caseData.assumptions.financial_assumptions) {
      Object.entries(caseData.assumptions.financial_assumptions).forEach(([key, value]) => {
        csvContent += `Financial,"${formatMetricName(key)}","${value}"\n`;
      });
    }
    csvContent += "\n";
  }

  // Empty template structure
  csvContent += "Financial Model Template\n";
  csvContent += "($ in thousands),Year 0,Year 1,Year 2,Year 3,Year 4,Year 5,Formula\n";
  
  const templateMetrics = [
    'Revenue',
    'Gross Profit', 
    'Operating Expenses',
    'EBITDA',
    'Net Income',
    'Free Cash Flow'
  ];

  templateMetrics.forEach(metric => {
    csvContent += `"${metric}",,,,,,,\n`;
  });

  return csvContent;
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

// =====================================
// PROFESSIONAL XLSX GENERATION
// =====================================

/**
 * Generate professional XLSX file with comprehensive 3-statement model
 * @param {Object} caseData - Complete case data including answer key
 * @returns {Buffer} - Excel workbook buffer
 */
export const generateFullModelXlsx = async (caseData) => {
  const workbook = new ExcelJS.Workbook();
  
  // Set workbook properties
  workbook.creator = 'CaseGen AI - Institutional Financial Modeling';
  workbook.lastModifiedBy = 'CaseGen AI';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.title = `${caseData.name || caseData.company_name} - Comprehensive Financial Model`;

  const answerKey = caseData.answer_key;
  if (!answerKey) return null;

  // Create single comprehensive worksheet
  const modelSheet = workbook.addWorksheet('Comprehensive Financial Model', {
    properties: { tabColor: { argb: 'FF0078D4' } }
  });

  // Generate sophisticated single-sheet model
  await generateComprehensiveModelSheet(modelSheet, caseData);

  return workbook;
};

/**
 * Generate comprehensive single-sheet financial model
 */
const generateComprehensiveModelSheet = async (worksheet, caseData) => {
  let currentRow = 1;
  const answerKey = caseData.answer_key;
  
  // =====================================
  // SECTION 1: EXECUTIVE SUMMARY
  // =====================================
  
  // Main title
  worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
  const titleCell = worksheet.getCell(`A${currentRow}`);
  titleCell.value = `${caseData.company_name || caseData.name} - Institutional Financial Model`;
  titleCell.style = {
    font: { bold: true, size: 20, color: { argb: 'FF0078D4' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } },
    border: getAllBorders()
  };
  worksheet.getRow(currentRow).height = 35;
  currentRow += 2;

  // Company description
  worksheet.mergeCells(`A${currentRow}:L${currentRow + 2}`);
  const descCell = worksheet.getCell(`A${currentRow}`);
  descCell.value = caseData.company_description;
  descCell.style = {
    font: { size: 11 },
    alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
    border: getAllBorders()
  };
  worksheet.getRow(currentRow).height = 80;
  currentRow += 4;

  // Key metrics header
  worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
  const metricsHeader = worksheet.getCell(`A${currentRow}`);
  metricsHeader.value = 'KEY FINANCIAL METRICS & INVESTMENT THESIS';
  metricsHeader.style = getSectionHeaderStyle();
  currentRow += 2;

  // Metrics in columns
  if (answerKey?.final_metrics) {
    const metricsData = [
      ['Enterprise Value', formatCurrency(answerKey.final_metrics.enterprise_value), 'NPV', formatCurrency(answerKey.final_metrics.npv)],
      ['Equity Value', formatCurrency(answerKey.final_metrics.equity_value), 'IRR', formatPercentage(answerKey.final_metrics.irr)],
      ['Revenue CAGR', formatPercentage(answerKey.final_metrics.revenue_cagr), 'Rule of 40 (Y3)', answerKey.final_metrics.rule_of_40_y3?.toFixed(1)],
      ['EV/Revenue Multiple', `${answerKey.final_metrics.ev_revenue_multiple?.toFixed(1)}x`, 'LTV/CAC Ratio (Y5)', `${answerKey.final_metrics.ltv_cac_ratio_y5?.toFixed(1)}x`],
      ['Free Cash Flow Margin (Y5)', formatPercentage(answerKey.final_metrics.fcf_margin_y5), 'Scalability Score', `${answerKey.final_metrics.scalability_score}/10`]
    ];

    metricsData.forEach(([metric1, value1, metric2, value2]) => {
      worksheet.getCell(`A${currentRow}`).value = metric1;
      worksheet.getCell(`B${currentRow}`).value = value1;
      worksheet.getCell(`A${currentRow}`).style = getMetricLabelStyle();
      worksheet.getCell(`B${currentRow}`).style = getMetricValueStyle();
      
      worksheet.getCell(`D${currentRow}`).value = metric2;
      worksheet.getCell(`E${currentRow}`).value = value2;
      worksheet.getCell(`D${currentRow}`).style = getMetricLabelStyle();
      worksheet.getCell(`E${currentRow}`).style = getMetricValueStyle();
      currentRow++;
    });
  }
  currentRow += 2;

  // =====================================
  // SECTION 2: REVENUE BUILDUP & DRIVERS
  // =====================================
  
  worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
  const revenueHeader = worksheet.getCell(`A${currentRow}`);
  revenueHeader.value = 'REVENUE BUILDUP & CUSTOMER DYNAMICS';
  revenueHeader.style = getSectionHeaderStyle();
  currentRow += 2;

  if (answerKey?.revenue_buildup) {
    // Headers
    const revenueHeaders = ['Year', 'Customers', 'ARPU', 'Revenue', 'Growth %', 'Formula'];
    revenueHeaders.forEach((header, index) => {
      const cell = worksheet.getCell(currentRow, index + 1);
      cell.value = header;
      cell.style = getTableHeaderStyle();
    });
    currentRow++;

    // Data rows
    answerKey.revenue_buildup.forEach((item, index) => {
      const prevRevenue = index > 0 ? answerKey.revenue_buildup[index - 1].revenue : caseData.starting_point?.current_arr || 0;
      const growthRate = prevRevenue > 0 ? ((item.revenue - prevRevenue) / prevRevenue) : 0;
      
      worksheet.getCell(currentRow, 1).value = `Year ${item.year}`;
      worksheet.getCell(currentRow, 2).value = item.customers;
      worksheet.getCell(currentRow, 3).value = formatCurrency(item.arpu);
      worksheet.getCell(currentRow, 4).value = formatCurrency(item.revenue);
      worksheet.getCell(currentRow, 5).value = formatPercentage(growthRate);
      worksheet.getCell(currentRow, 6).value = item.formula?.revenue || 'Customers × ARPU';
      
      // Apply row styling
      for (let col = 1; col <= 6; col++) {
        worksheet.getCell(currentRow, col).style = getTableDataStyle();
      }
      currentRow++;
    });
  }
  currentRow += 2;

  // =====================================
  // SECTION 3: INCOME STATEMENT
  // =====================================
  
  worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
  const incomeHeader = worksheet.getCell(`A${currentRow}`);
  incomeHeader.value = 'INCOME STATEMENT (5-Year Projections)';
  incomeHeader.style = getSectionHeaderStyle();
  currentRow += 2;

  if (answerKey?.income_statement) {
    await generateStatementSection(worksheet, answerKey.income_statement, 'Income Statement', currentRow);
    currentRow += answerKey.income_statement.length + 4;
  }

  // =====================================
  // SECTION 4: BALANCE SHEET
  // =====================================
  
  if (answerKey?.balance_sheet) {
    worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
    const balanceHeader = worksheet.getCell(`A${currentRow}`);
    balanceHeader.value = 'BALANCE SHEET (5-Year Projections)';
    balanceHeader.style = getSectionHeaderStyle();
    currentRow += 2;

    await generateStatementSection(worksheet, answerKey.balance_sheet, 'Balance Sheet', currentRow);
    currentRow += answerKey.balance_sheet.length + 4;
  }

  // =====================================
  // SECTION 5: CASH FLOW STATEMENT
  // =====================================
  
  if (answerKey?.cash_flow_statement) {
    worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
    const cashFlowHeader = worksheet.getCell(`A${currentRow}`);
    cashFlowHeader.value = 'CASH FLOW STATEMENT (5-Year Projections)';
    cashFlowHeader.style = getSectionHeaderStyle();
    currentRow += 2;

    await generateStatementSection(worksheet, answerKey.cash_flow_statement, 'Cash Flow Statement', currentRow);
    currentRow += answerKey.cash_flow_statement.length + 4;
  }

  // =====================================
  // SECTION 6: DCF VALUATION
  // =====================================
  
  if (answerKey?.dcf_valuation) {
    worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
    const dcfHeader = worksheet.getCell(`A${currentRow}`);
    dcfHeader.value = 'DCF VALUATION & INVESTMENT ANALYSIS';
    dcfHeader.style = getSectionHeaderStyle();
    currentRow += 2;

    await generateDCFSection(worksheet, answerKey.dcf_valuation, answerKey.final_metrics, currentRow);
  }

  // Set column widths for professional appearance
  const columnWidths = [18, 15, 15, 15, 15, 20, 15, 15, 15, 15, 15, 25];
  columnWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width;
  });
};

/**
 * Generate Executive Summary worksheet
 */
const generateSummarySheet = async (worksheet, caseData) => {
  // Company header
  worksheet.mergeCells('A1:G1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `${caseData.company_name || caseData.name} - Executive Summary`;
  titleCell.style = {
    font: { bold: true, size: 18, color: { argb: 'FF0078D4' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } }
  };
  worksheet.getRow(1).height = 30;

  // Company description
  worksheet.mergeCells('A3:G5');
  const descCell = worksheet.getCell('A3');
  descCell.value = caseData.company_description;
  descCell.style = {
    font: { size: 11 },
    alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
    border: getAllBorders()
  };

  // Key metrics section
  let currentRow = 7;
  
  // Section header
  worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
  const metricsHeader = worksheet.getCell(`A${currentRow}`);
  metricsHeader.value = 'Key Financial Metrics';
  metricsHeader.style = getSectionHeaderStyle();
  currentRow += 2;

  // Add key metrics
  if (caseData.answer_key?.final_metrics) {
    const metrics = [
      ['Enterprise Value', formatCurrency(caseData.answer_key.final_metrics.enterprise_value)],
      ['Equity Value', formatCurrency(caseData.answer_key.final_metrics.equity_value)],
      ['NPV', formatCurrency(caseData.answer_key.final_metrics.npv)],
      ['IRR', formatPercentage(caseData.answer_key.final_metrics.irr)],
      ['EV/Revenue Multiple', `${caseData.answer_key.final_metrics.ev_revenue_multiple?.toFixed(1)}x`],
      ['EV/EBITDA Multiple', `${caseData.answer_key.final_metrics.ev_ebitda_multiple?.toFixed(1)}x`]
    ];

    metrics.forEach(([label, value]) => {
      worksheet.getCell(`A${currentRow}`).value = label;
      worksheet.getCell(`B${currentRow}`).value = value;
      
      worksheet.getCell(`A${currentRow}`).style = getMetricLabelStyle();
      worksheet.getCell(`B${currentRow}`).style = getMetricValueStyle();
      currentRow++;
    });
  }

  // Set column widths
  worksheet.getColumn(1).width = 25;
  worksheet.getColumn(2).width = 20;
  worksheet.columns.slice(2).forEach(col => col.width = 15);
};

/**
 * Generate financial statement worksheets with professional formatting
 */
const generateFinancialStatementSheet = async (worksheet, statementData, title, year0Data = null) => {
  if (!statementData || statementData.length === 0) return;

  // Title
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = title;
  titleCell.style = {
    font: { bold: true, size: 16, color: { argb: 'FF0078D4' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } }
  };
  worksheet.getRow(1).height = 25;

  // Subtitle
  worksheet.mergeCells('A2:H2');
  const subtitleCell = worksheet.getCell('A2');
  subtitleCell.value = '($ in thousands)';
  subtitleCell.style = {
    font: { italic: true, size: 10 },
    alignment: { horizontal: 'center' }
  };

  // Get all unique metrics
  const allMetrics = new Set();
  statementData.forEach(yearData => {
    Object.keys(yearData).forEach(key => {
      if (key !== 'year' && key !== 'formula') allMetrics.add(key);
    });
  });

  if (year0Data) {
    Object.keys(year0Data).forEach(key => {
      if (key !== 'year' && key !== 'formula') allMetrics.add(key);
    });
  }

  // Create headers
  const headerRow = 4;
  const years = statementData.map(item => item.year || `Year ${statementData.indexOf(item) + 1}`);
  
  let colIndex = 1;
  worksheet.getCell(headerRow, colIndex++).value = 'Metric';
  if (year0Data) worksheet.getCell(headerRow, colIndex++).value = 'Year 0';
  years.forEach(year => {
    worksheet.getCell(headerRow, colIndex++).value = year;
  });
  worksheet.getCell(headerRow, colIndex++).value = 'Terminal';
  worksheet.getCell(headerRow, colIndex++).value = 'Formula';

  // Style headers
  for (let i = 1; i < colIndex; i++) {
    worksheet.getCell(headerRow, i).style = getHeaderStyle();
  }

  // Add data rows
  let rowIndex = headerRow + 1;
  Array.from(allMetrics).forEach(metric => {
    let colIndex = 1;
    
    // Metric name
    worksheet.getCell(rowIndex, colIndex++).value = formatMetricName(metric);
    worksheet.getCell(rowIndex, 1).style = getMetricLabelStyle();
    
    // Year 0 value
    if (year0Data) {
      const year0Value = year0Data[metric];
      worksheet.getCell(rowIndex, colIndex++).value = formatExcelValue(year0Value, metric);
      worksheet.getCell(rowIndex, colIndex - 1).style = getDataCellStyle(metric);
    }
    
    // Year values
    statementData.forEach(yearData => {
      const value = yearData[metric];
      worksheet.getCell(rowIndex, colIndex++).value = formatExcelValue(value, metric);
      worksheet.getCell(rowIndex, colIndex - 1).style = getDataCellStyle(metric);
    });
    
    // Terminal value
    const lastValue = statementData[statementData.length - 1][metric];
    const terminalValue = calculateTerminalValue(metric, lastValue, statementData);
    worksheet.getCell(rowIndex, colIndex++).value = formatExcelValue(terminalValue, metric);
    worksheet.getCell(rowIndex, colIndex - 1).style = getDataCellStyle(metric);
    
    // Formula
    worksheet.getCell(rowIndex, colIndex++).value = getFormulaForMetric(metric);
    worksheet.getCell(rowIndex, colIndex - 1).style = getFormulaCellStyle();
    
    rowIndex++;
  });

  // Set column widths
  worksheet.getColumn(1).width = 25; // Metric names
  for (let i = 2; i < colIndex - 1; i++) {
    worksheet.getColumn(i).width = 15; // Year data
  }
  worksheet.getColumn(colIndex - 1).width = 40; // Formula column
};

/**
 * Generate DCF valuation worksheet
 */
const generateDCFSheet = async (worksheet, dcfData, finalMetrics) => {
  // Title
  worksheet.mergeCells('A1:F1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'DCF Valuation';
  titleCell.style = {
    font: { bold: true, size: 16, color: { argb: 'FF0078D4' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } }
  };

  let currentRow = 3;

  // Valuation summary
  const summaryData = [
    ['Enterprise Value', formatCurrency(finalMetrics?.enterprise_value)],
    ['Equity Value', formatCurrency(finalMetrics?.equity_value)],
    ['NPV', formatCurrency(finalMetrics?.npv)],
    ['IRR', formatPercentage(finalMetrics?.irr)]
  ];

  summaryData.forEach(([label, value]) => {
    worksheet.getCell(currentRow, 1).value = label;
    worksheet.getCell(currentRow, 2).value = value;
    worksheet.getCell(currentRow, 1).style = getMetricLabelStyle();
    worksheet.getCell(currentRow, 2).style = getMetricValueStyle();
    currentRow++;
  });

  // Set column widths
  worksheet.getColumn(1).width = 25;
  worksheet.getColumn(2).width = 20;
};

// =====================================
// STATEMENT SECTION GENERATORS
// =====================================

/**
 * Generate a financial statement section with Line Item, Formula, and Year columns (matching user's image)
 */
const generateStatementSection = async (worksheet, statementData, statementType, startRow) => {
  if (!statementData || statementData.length === 0) return startRow;

  // Determine fields with formulas based on statement type
  let fields = [];
  if (statementType === 'Income Statement') {
    fields = [
      { 
        key: 'revenue', 
        label: 'Revenue', 
        formula: 'Previous Year Revenue × (1 + Growth Rate)' 
      },
      { 
        key: 'cogs', 
        label: 'Cost of Goods Sold', 
        formula: 'Revenue × (1 - Gross Margin)' 
      },
      { 
        key: 'gross_profit', 
        label: 'Gross Profit', 
        formula: 'Revenue - Cost of Goods Sold' 
      },
      { 
        key: 'sales_marketing', 
        label: 'Sales & Marketing', 
        formula: 'Revenue × S&M %' 
      },
      { 
        key: 'rd', 
        label: 'Research & Development', 
        formula: 'Revenue × R&D %' 
      },
      { 
        key: 'ga', 
        label: 'General & Administrative', 
        formula: 'Revenue × G&A %' 
      },
      { 
        key: 'ebitda', 
        label: 'EBITDA', 
        formula: 'Gross Profit - S&M - R&D - G&A' 
      },
      { 
        key: 'ebit', 
        label: 'EBIT', 
        formula: 'EBITDA - Depreciation' 
      },
      { 
        key: 'taxes', 
        label: 'Taxes', 
        formula: 'EBIT × Tax Rate' 
      },
      { 
        key: 'net_income', 
        label: 'Net Income', 
        formula: 'EBIT - Taxes' 
      }
    ];
  } else if (statementType === 'Balance Sheet') {
    fields = [
      { key: 'cash', label: 'Cash & Cash Equivalents', formula: 'Previous Cash + Free Cash Flow' },
      { key: 'accounts_receivable', label: 'Accounts Receivable', formula: 'Revenue × DSO / 365' },
      { key: 'ppe', label: 'Property, Plant & Equipment', formula: 'Previous PPE + CapEx - Depreciation' },
      { key: 'intangible_assets', label: 'Intangible Assets', formula: 'Previous Intangibles + R&D Investment - Amortization' },
      { key: 'total_assets', label: 'Total Assets', formula: 'Cash + AR + PPE + Intangibles' },
      { key: 'accounts_payable', label: 'Accounts Payable', formula: 'COGS × DPO / 365' },
      { key: 'deferred_revenue', label: 'Deferred Revenue', formula: 'Revenue × Deferred Revenue %' },
      { key: 'debt', label: 'Debt', formula: 'Previous Debt + New Borrowings - Repayments' },
      { key: 'total_liabilities', label: 'Total Liabilities', formula: 'AP + Deferred Revenue + Debt' },
      { key: 'equity', label: 'Shareholders Equity', formula: 'Previous Equity + Net Income - Dividends' }
    ];
  } else if (statementType === 'Cash Flow Statement') {
    fields = [
      { key: 'net_income', label: 'Net Income', formula: 'From Income Statement' },
      { key: 'depreciation', label: 'Depreciation & Amortization', formula: 'PPE × Depreciation Rate' },
      { key: 'working_capital_change', label: 'Working Capital Change', formula: '(AR + Inventory) - (AP + Accruals)' },
      { key: 'capex', label: 'Capital Expenditures', formula: 'Revenue × CapEx %' },
      { key: 'free_cash_flow', label: 'Free Cash Flow', formula: 'Net Income + D&A - WC Change - CapEx' }
    ];
  }

  // Create header row (Line Item | Formula | Year 1 | Year 2 | ... | Year 7)
  let currentRow = startRow;
  const headers = ['Line Item', 'Formula', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7'];
  headers.forEach((header, index) => {
    worksheet.getCell(currentRow, index + 1).value = header;
    worksheet.getCell(currentRow, index + 1).style = getTableHeaderStyle();
  });
  currentRow++;

  // Create data rows
  fields.forEach(field => {
    // Line Item column
    worksheet.getCell(currentRow, 1).value = field.label;
    worksheet.getCell(currentRow, 1).style = getTableDataStyle();
    
    // Formula column
    worksheet.getCell(currentRow, 2).value = field.formula;
    worksheet.getCell(currentRow, 2).style = getFormulaCellStyle();
    
    // Year columns (extend to Year 7 with projections)
    statementData.forEach((item, index) => {
      const value = item[field.key];
      worksheet.getCell(currentRow, index + 3).value = typeof value === 'number' ? value : 0;
      worksheet.getCell(currentRow, index + 3).style = getTableDataStyle();
      worksheet.getCell(currentRow, index + 3).numFmt = '$#,##0';
    });
    
    // Add projected years 6-7 if not present (simple growth extension)
    if (statementData.length === 5) {
      const year5Value = statementData[4][field.key] || 0;
      const year4Value = statementData[3][field.key] || 0;
      const growthRate = year4Value > 0 ? (year5Value / year4Value - 1) * 0.7 : 0.05; // Moderate growth
      
      // Year 6
      const year6Value = year5Value * (1 + growthRate);
      worksheet.getCell(currentRow, 8).value = year6Value;
      worksheet.getCell(currentRow, 8).style = getTableDataStyle();
      worksheet.getCell(currentRow, 8).numFmt = '$#,##0';
      
      // Year 7  
      const year7Value = year6Value * (1 + growthRate * 0.8);
      worksheet.getCell(currentRow, 9).value = year7Value;
      worksheet.getCell(currentRow, 9).style = getTableDataStyle();
      worksheet.getCell(currentRow, 9).numFmt = '$#,##0';
    }
    
    currentRow++;
  });

  return currentRow + 1;
};

/**
 * Generate DCF section in the comprehensive sheet
 */
const generateDCFSection = async (worksheet, dcfData, finalMetrics, startRow) => {
  if (!dcfData) return startRow;

  let currentRow = startRow;

  // DCF calculations table
  const dcfHeaders = ['Year', 'Free Cash Flow', 'Discount Factor', 'Present Value'];
  dcfHeaders.forEach((header, index) => {
    worksheet.getCell(currentRow, index + 1).value = header;
    worksheet.getCell(currentRow, index + 1).style = getTableHeaderStyle();
  });
  currentRow++;

  // DCF data rows
  if (dcfData.present_values && dcfData.discount_factors) {
    dcfData.present_values.forEach((pv, index) => {
      worksheet.getCell(currentRow, 1).value = `Year ${index + 1}`;
      worksheet.getCell(currentRow, 2).value = '-'; // FCF would need to be provided
      worksheet.getCell(currentRow, 3).value = dcfData.discount_factors[index]?.toFixed(3) || '-';
      worksheet.getCell(currentRow, 4).value = formatCurrency(pv);
      
      for (let col = 1; col <= 4; col++) {
        worksheet.getCell(currentRow, col).style = getTableDataStyle();
      }
      currentRow++;
    });
  }

  // Terminal value row
  currentRow++;
  worksheet.getCell(currentRow, 1).value = 'Terminal Value';
  worksheet.getCell(currentRow, 4).value = formatCurrency(dcfData.terminal_pv);
  worksheet.getCell(currentRow, 1).style = getTableDataStyle();
  worksheet.getCell(currentRow, 4).style = getTableDataStyle();
  currentRow++;

  // Enterprise value row
  worksheet.getCell(currentRow, 1).value = 'Enterprise Value';
  worksheet.getCell(currentRow, 4).value = formatCurrency(dcfData.enterprise_value);
  worksheet.getCell(currentRow, 1).style = { ...getTableDataStyle(), font: { bold: true } };
  worksheet.getCell(currentRow, 4).style = { ...getTableDataStyle(), font: { bold: true } };

  return currentRow + 2;
};

// =====================================
// STYLING FUNCTIONS
// =====================================

const getHeaderStyle = () => ({
  font: { bold: true, color: { argb: 'FFFFFFFF' } },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0078D4' } },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: getAllBorders()
});

const getSectionHeaderStyle = () => ({
  font: { bold: true, size: 12, color: { argb: 'FF0078D4' } },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE1F5FE' } },
  alignment: { horizontal: 'left', vertical: 'middle' },
  border: getAllBorders()
});

const getMetricLabelStyle = () => ({
  font: { bold: true },
  alignment: { horizontal: 'left', vertical: 'middle' },
  border: getAllBorders()
});

const getMetricValueStyle = () => ({
  font: { bold: true },
  alignment: { horizontal: 'right', vertical: 'middle' },
  border: getAllBorders(),
  numFmt: '$#,##0'
});

const getDataCellStyle = (metric) => {
  const baseStyle = {
    alignment: { horizontal: 'right', vertical: 'middle' },
    border: getAllBorders()
  };

  if (metric.includes('margin') || metric.includes('rate') || metric.includes('growth')) {
    baseStyle.numFmt = '0.0%';
  } else if (metric.includes('revenue') || metric.includes('cost') || metric.includes('profit') || 
             metric.includes('ebitda') || metric.includes('cash')) {
    baseStyle.numFmt = '$#,##0';
  } else {
    baseStyle.numFmt = '#,##0';
  }

  return baseStyle;
};

const getFormulaCellStyle = () => ({
  font: { italic: true, size: 9 },
  alignment: { horizontal: 'left', vertical: 'middle', wrapText: true },
  border: getAllBorders()
});

const getTableHeaderStyle = () => ({
  font: { bold: true, color: { argb: 'FFFFFFFF' } },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0078D4' } },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: getAllBorders()
});

const getTableDataStyle = () => ({
  alignment: { horizontal: 'right', vertical: 'middle' },
  border: getAllBorders()
});

const getAllBorders = () => ({
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
});

// =====================================
// FORMATTING HELPERS
// =====================================

const formatExcelValue = (value, metric) => {
  if (value === null || value === undefined) return null;
  
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string' && value.includes('%')) {
    const numValue = parseFloat(value.replace('%', ''));
    return numValue / 100;
  }
  
  return value;
};

const formatCurrency = (value) => {
  if (!value || typeof value !== 'number') return '-';
  return value;
};

const formatPercentage = (value) => {
  if (!value || typeof value !== 'number') return '-';
  return value;
};

/**
 * Download XLSX file in browser
 * @param {ExcelJS.Workbook} workbook - Excel workbook to download
 * @param {string} filename - Filename for download
 */
export const downloadXlsx = async (workbook, filename) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}; 