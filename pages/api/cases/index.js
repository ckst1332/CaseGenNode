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
    console.log('Cases API - User ID:', userId, 'Email:', session.user.email);
    
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
        // First verify the user exists in the database to prevent foreign key constraint violation
        let existingUser = await supabaseStorage.getUser(userId);
        
        // If not found by userId, try by email (for users who might be stored by email as ID)
        if (!existingUser && session.user.email) {
          console.log('User not found by ID, trying by email:', session.user.email);
          existingUser = await supabaseStorage.getUser(session.user.email);
          if (existingUser) {
            console.log('Found user by email instead of ID:', existingUser.id);
            // Update userId to match what's in database to prevent foreign key issues
            userId = existingUser.id;
          }
        }
        
        if (!existingUser) {
          console.error('User not found in database by ID or email:', userId, session.user.email);
          return res.status(400).json({ 
            error: "User not found", 
            details: `User ${userId} (${session.user.email}) does not exist in database. Please refresh and try again.` 
          });
        }
        
        console.log('User verified for case creation:', existingUser.id, existingUser.email);
        
        const caseData = req.body;
        const caseId = `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newCase = {
          id: caseId,
          user_id: userId,
          // New schema fields
          name: caseData.name,
          type: caseData.type || 'DCF',
          status: caseData.status || 'template',
          industry: caseData.industry || 'Technology',
          company_description: caseData.company_description || null,
          starting_point: caseData.starting_point || null,
          assumptions: caseData.assumptions || null,
          answer_key: caseData.answer_key || null,
          user_results: caseData.user_results || null,
          answer_key_excel: caseData.answer_key_excel || null,
          // Old schema fields for backwards compatibility - provide safe defaults
          title: caseData.name,
          content: {
            name: caseData.name,
            type: caseData.type || 'DCF',
            status: caseData.status || 'template',
            company_description: caseData.company_description,
            starting_point: caseData.starting_point,
            assumptions: caseData.assumptions,
            answer_key: caseData.answer_key,
            user_results: caseData.user_results,
            ...caseData
          },
          scenario: caseData.starting_point || {},
          calculations: caseData.answer_key || {},
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
