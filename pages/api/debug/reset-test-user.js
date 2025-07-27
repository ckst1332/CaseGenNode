import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { supabaseStorage } from "../../../lib/supabase";

const TEST_USER_EMAIL = "jeff.sit13@gmail.com";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userEmail = session.user.email;
    const userId = session.user.id || session.user.email;
    
    console.log('Reset test user request from:', userEmail);
    
    // Only allow the test user to reset themselves
    if (userEmail !== TEST_USER_EMAIL) {
      return res.status(403).json({ error: "Only test user can reset" });
    }
    
    if (req.method === 'POST') {
      try {
        console.log('Resetting test user with ID:', userId);
        
        // Force create/update test user with unlimited credits
        const now = new Date();
        const testUser = {
          id: userId,
          email: userEmail,
          full_name: session.user.name || 'Jeff Sit',
          subscription_tier: 'test',
          credits_remaining: 999999,
          credits_used_this_month: 0,
          total_cases_generated: 0,
          created_at: now.toISOString(),
          last_case_date: null,
          last_credit_reset: now.toISOString(),
          is_test_user: true,
          updated_at: now.toISOString()
        };
        
        const savedUser = await supabaseStorage.saveUser(userId, testUser);
        
        console.log('✅ Test user reset successfully:', savedUser);
        
        return res.status(200).json({
          message: "Test user reset successfully",
          user: savedUser
        });
        
      } catch (error) {
        console.error('Error resetting test user:', error);
        return res.status(500).json({ 
          error: "Failed to reset test user", 
          details: error.message 
        });
      }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in reset-test-user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
