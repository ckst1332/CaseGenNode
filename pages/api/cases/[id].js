import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// Mock cases database - in production, this would connect to a real database
const cases = new Map();

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.query;
    const userId = session.user.id || session.user.email;
    
    if (req.method === 'GET') {
      const caseData = cases.get(id);
      
      if (!caseData) {
        return res.status(404).json({ error: "Case not found" });
      }
      
      // Check if user owns this case
      if (caseData.user_id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      return res.status(200).json(caseData);
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in /api/cases/[id]:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
