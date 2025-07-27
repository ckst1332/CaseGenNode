import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.query;
    
    if (req.method === 'GET') {
      // In a real implementation, this would generate an Excel file
      // For now, return a mock CSV response
      const csvContent = `Year,Revenue,Operating Expenses,EBITDA,Free Cash Flow
0,1000000,800000,200000,150000
1,1400000,1000000,400000,350000
2,1960000,1300000,660000,590000
3,2744000,1600000,1144000,1050000
4,3841600,1950000,1891600,1750000
5,5377240,2340000,3037240,2800000`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="case_${id}_template.csv"`);
      return res.status(200).send(csvContent);
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in download-template:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
