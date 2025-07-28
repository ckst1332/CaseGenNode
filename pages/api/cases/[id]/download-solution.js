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

      if (format === 'xlsx') {
        // Generate professional XLSX file
        const workbook = await generateFullModelXlsx(caseData);
        
        if (!workbook) {
          return res.status(400).json({ error: "Unable to generate Excel file" });
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const filename = `${caseData.company_name || `case_${id}`}_solution.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        
        return res.status(200).send(buffer);
      } else {
        // Fallback to CSV format
        const { generateFullModelCsv } = await import("../../../../lib/utils/data-processing");
        const csvContent = generateFullModelCsv(caseData);
        const filename = `${caseData.company_name || `case_${id}`}_solution.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        return res.status(200).send(csvContent);
      }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in download-solution:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
