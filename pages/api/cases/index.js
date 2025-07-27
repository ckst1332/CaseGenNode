import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// Mock cases database - in production, this would connect to a real database
const cases = new Map();
const userCases = new Map(); // Maps user IDs to their case IDs

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id || session.user.email;
    
    if (req.method === 'GET') {
      // List user's cases
      const userCaseIds = userCases.get(userId) || [];
      const userCasesList = userCaseIds.map(id => cases.get(id)).filter(Boolean);
      
      // Sort by created_date if order parameter is provided
      const order = req.query.order;
      if (order === '-created_date') {
        userCasesList.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      }
      
      return res.status(200).json(userCasesList);
    }
    
    if (req.method === 'POST') {
      // Create new case
      const caseData = req.body;
      const caseId = Date.now().toString(); // Simple ID generation
      
      const newCase = {
        id: caseId,
        user_id: userId,
        created_date: new Date().toISOString(),
        ...caseData
      };
      
      // Store case
      cases.set(caseId, newCase);
      
      // Add to user's cases
      const currentUserCases = userCases.get(userId) || [];
      currentUserCases.push(caseId);
      userCases.set(userId, currentUserCases);
      
      return res.status(201).json(newCase);
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in /api/cases:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
