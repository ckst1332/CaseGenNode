import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { supabaseStorage } from "../../../lib/supabase";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.query;
    let userId = session.user.id || session.user.email;
    
    // Check if user exists by this ID, if not try email (same logic as case creation)
    let existingUser = await supabaseStorage.getUser(userId);
    if (!existingUser && session.user.email) {
      console.log('User not found by ID for retrieval, trying by email:', session.user.email);
      existingUser = await supabaseStorage.getUser(session.user.email);
      if (existingUser) {
        console.log('Found user by email for retrieval, updating userId:', existingUser.id);
        userId = existingUser.id;
      }
    }
    
    if (req.method === 'GET') {
      try {
        console.log('=== CASE RETRIEVAL DEBUG ===');
        console.log('Requested case ID:', id);
        console.log('User ID:', userId);
        console.log('User email:', session.user.email);
        
        const caseData = await supabaseStorage.getCase(id);
        console.log('Case found in DB:', !!caseData);
        
        if (!caseData) {
          console.log('❌ Case not found in database for ID:', id);
          return res.status(404).json({ error: "Case not found" });
        }
        
        console.log('Case owner user_id:', caseData.user_id);
        console.log('Current user_id:', userId);
        console.log('User IDs match:', caseData.user_id === userId);
        
        // Check if user owns this case
        if (caseData.user_id !== userId) {
          console.log('❌ Access denied - user ID mismatch');
          return res.status(403).json({ error: "Access denied" });
        }
        
        console.log('✅ Case retrieved successfully');
        return res.status(200).json(caseData);
      } catch (error) {
        console.error('Error getting case from Supabase:', error);
        return res.status(500).json({ error: "Failed to get case" });
      }
    }

    if (req.method === 'PATCH') {
      try {
        // First, get the existing case to check ownership
        const existingCase = await supabaseStorage.getCase(id);
        
        if (!existingCase) {
          return res.status(404).json({ error: "Case not found" });
        }
        
        // Check if user owns this case
        if (existingCase.user_id !== userId) {
          return res.status(403).json({ error: "Access denied" });
        }
        
        // Update the case with the provided data
        const updateData = req.body;
        const updatedCase = await supabaseStorage.saveCase(id, {
          ...existingCase,
          ...updateData,
          updated_at: new Date().toISOString()
        });
        
        console.log('Case updated successfully:', { id, updateData: Object.keys(updateData) });
        return res.status(200).json(updatedCase);
      } catch (error) {
        console.error('Error updating case in Supabase:', error);
        return res.status(500).json({ error: "Failed to update case" });
      }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in /api/cases/[id]:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
