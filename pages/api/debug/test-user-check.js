import { supabaseStorage } from "../../../lib/supabase";

const TEST_USER_EMAIL = "jeff.sit13@gmail.com";
const TEST_USER_ID = "102230834234240439250";

export default async function handler(req, res) {
  try {
    console.log('🔍 Checking test user in database...');
    
    if (req.method === 'GET') {
      try {
        // Try to get test user by ID
        let user = await supabaseStorage.getUser(TEST_USER_ID);
        
        if (!user) {
          console.log('❌ Test user not found by ID, trying by email...');
          
          // Create test user if not found
          const now = new Date();
          const testUser = {
            id: TEST_USER_ID,
            email: TEST_USER_EMAIL,
            full_name: 'Jeff Sit',
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
          
          user = await supabaseStorage.saveUser(TEST_USER_ID, testUser);
          console.log('✅ Created test user:', user);
          
          return res.status(200).json({
            message: "Test user created",
            user: user,
            action: "created"
          });
        } else {
          console.log('✅ Test user found:', user);
          
          // Ensure test user has correct values
          user.credits_remaining = 999999;
          user.subscription_tier = 'test';
          user.is_test_user = true;
          user.credits_used_this_month = 0;
          user.updated_at = new Date().toISOString();
          
          const updatedUser = await supabaseStorage.saveUser(TEST_USER_ID, user);
          
          return res.status(200).json({
            message: "Test user verified and updated",
            user: updatedUser,
            action: "updated"
          });
        }
        
      } catch (dbError) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({ 
          error: "Database error", 
          details: dbError.message 
        });
      }
    }
    
    if (req.method === 'POST') {
      // Force reset test user
      try {
        const now = new Date();
        const testUser = {
          id: TEST_USER_ID,
          email: TEST_USER_EMAIL,
          full_name: 'Jeff Sit',
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
        
        const savedUser = await supabaseStorage.saveUser(TEST_USER_ID, testUser);
        
        console.log('🔄 Force reset test user:', savedUser);
        
        return res.status(200).json({
          message: "Test user force reset",
          user: savedUser,
          action: "force_reset"
        });
        
      } catch (dbError) {
        console.error('❌ Force reset error:', dbError);
        return res.status(500).json({ 
          error: "Force reset failed", 
          details: dbError.message 
        });
      }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in test-user-check:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
