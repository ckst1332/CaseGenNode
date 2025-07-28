import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { supabaseStorage } from "../../../../lib/supabase";
import { generateFullModelXlsx } from "../../../../lib/utils/data-processing";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.query;
    const { format = 'xlsx' } = req.query; // Default to XLSX, allow CSV for backward compatibility
    
    if (req.method === 'GET') {
      // Get case data from database
      const caseData = await supabaseStorage.getCase(id);
      
      if (!caseData) {
        return res.status(404).json({ error: "Case not found" });
      }

      // Verify user owns this case
      if (caseData.user_id !== session.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Create template version (remove answer_key, keep only scenario)
      const templateData = {
        ...caseData,
        answer_key: null, // Remove solutions for template
        // Keep scenario data for template context
        company_name: caseData.company_name,
        company_description: caseData.company_description,
        year_0_baseline: caseData.year_0_baseline,
        assumptions: caseData.assumptions
      };

      if (format === 'xlsx') {
        // Generate professional XLSX template
        const workbook = await generateTemplateXlsx(templateData);
        
        if (!workbook) {
          return res.status(400).json({ error: "Unable to generate Excel template" });
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const filename = `${caseData.company_name || `case_${id}`}_template.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        
        return res.status(200).send(buffer);
      } else {
        // Fallback to CSV format
        const { generateTemplateCSV } = await import("../../../../lib/utils/data-processing");
        const csvContent = generateTemplateCSV(templateData);
        const filename = `${caseData.company_name || `case_${id}`}_template.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        return res.status(200).send(csvContent);
      }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in download-template:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Generate Excel template with case scenario and empty model structure
 */
async function generateTemplateXlsx(caseData) {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  
  // Set workbook properties
  workbook.creator = 'CaseGen AI';
  workbook.title = `${caseData.company_name} - Template`;

  // Create case scenario worksheet
  const scenarioSheet = workbook.addWorksheet('Case Scenario', {
    properties: { tabColor: { argb: 'FF0078D4' } }
  });

  // Create empty model worksheets
  const incomeSheet = workbook.addWorksheet('Income Statement', {
    properties: { tabColor: { argb: 'FF00BCF2' } }
  });
  
  const balanceSheet = workbook.addWorksheet('Balance Sheet', {
    properties: { tabColor: { argb: 'FF40E0D0' } }
  });
  
  const cashFlowSheet = workbook.addWorksheet('Cash Flow', {
    properties: { tabColor: { argb: 'FF90EE90' } }
  });

  // Generate scenario sheet
  await generateScenarioSheet(scenarioSheet, caseData);
  
  // Generate empty template structures
  await generateEmptyModelSheet(incomeSheet, 'Income Statement');
  await generateEmptyModelSheet(balanceSheet, 'Balance Sheet');
  await generateEmptyModelSheet(cashFlowSheet, 'Cash Flow Statement');

  return workbook;
}

/**
 * Generate case scenario worksheet
 */
async function generateScenarioSheet(worksheet, caseData) {
  // Company header
  worksheet.mergeCells('A1:F1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `${caseData.company_name} - Case Scenario`;
  titleCell.style = {
    font: { bold: true, size: 18, color: { argb: 'FF0078D4' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } }
  };

  // Company description
  worksheet.mergeCells('A3:F5');
  const descCell = worksheet.getCell('A3');
  descCell.value = caseData.company_description;
  descCell.style = {
    font: { size: 11 },
    alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  // Add assumptions if available
  let currentRow = 7;
  if (caseData.assumptions) {
    worksheet.getCell(`A${currentRow}`).value = 'Key Assumptions:';
    worksheet.getCell(`A${currentRow}`).style = {
      font: { bold: true, size: 12 }
    };
    currentRow += 2;

    // Add operational assumptions
    if (caseData.assumptions.operational_drivers) {
      Object.entries(caseData.assumptions.operational_drivers).forEach(([key, value]) => {
        worksheet.getCell(`A${currentRow}`).value = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        worksheet.getCell(`B${currentRow}`).value = Array.isArray(value) ? value.join(', ') : value;
        currentRow++;
      });
    }
  }

  // Set column widths
  worksheet.getColumn(1).width = 30;
  worksheet.getColumn(2).width = 20;
}

/**
 * Generate empty model sheet template
 */
async function generateEmptyModelSheet(worksheet, title) {
  // Title
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `${title} - Template`;
  titleCell.style = {
    font: { bold: true, size: 16, color: { argb: 'FF0078D4' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } }
  };

  // Headers
  const headers = ['Metric', 'Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Formula'];
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(3, index + 1);
    cell.value = header;
    cell.style = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0078D4' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
  });

  // Add placeholder rows
  const metrics = ['Revenue', 'Gross Profit', 'Operating Expenses', 'EBITDA', 'Net Income'];
  metrics.forEach((metric, index) => {
    const row = 4 + index;
    worksheet.getCell(row, 1).value = metric;
    worksheet.getCell(row, 1).style = {
      font: { bold: true },
      alignment: { horizontal: 'left', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
  });

  // Set column widths
  worksheet.getColumn(1).width = 25;
  headers.slice(1).forEach((_, index) => {
    worksheet.getColumn(index + 2).width = 15;
  });
}
