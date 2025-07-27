import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { supabaseStorage } from "../../../lib/supabase";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id || session.user.email;
    
    if (req.method === 'GET') {
      // List user's cases
      try {
        let userCasesList = await supabaseStorage.getUserCases(userId);
        
        // Sort by created_date if order parameter is provided
        const order = req.query.order;
        if (order === '-created_date') {
          userCasesList.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            // Return 0 if either date is invalid
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
            return dateB - dateA;
          });
        }
        
        return res.status(200).json(userCasesList);
      } catch (error) {
        console.error('Error getting user cases:', error);
        return res.status(500).json({ error: "Failed to get cases" });
      }
    }
    
    if (req.method === 'POST') {
      // Create new case
      try {
        const caseData = req.body;
        const caseId = `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newCase = {
          id: caseId,
          user_id: userId,
          title: caseData.name,
          industry: caseData.industry || 'Technology',
          content: caseData,
          scenario: caseData.scenario || null,
          calculations: caseData.calculations || null,
          assumptions: caseData.assumptions || null,
          answer_key: caseData.answer_key || null,
          answer_key_excel: caseData.answer_key_excel || null,
          created_at: new Date().toISOString()
        };
        
        const savedCase = await supabaseStorage.saveCase(caseId, newCase);
        console.log('Case created successfully:', caseId);
        
        return res.status(201).json(savedCase);
      } catch (error) {
        console.error('Error creating case:', error);
        return res.status(500).json({ error: "Failed to create case", details: error.message });
      }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in /api/cases:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
