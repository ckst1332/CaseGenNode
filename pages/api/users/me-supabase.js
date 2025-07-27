import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { supabaseStorage } from "../../../lib/supabase";

// Default credit allocation based on subscription tier
const DEFAULT_CREDITS = {
  free: 3,
  basic: 50,
  pro: 999,
  test: 999999
};

// Test user with unlimited credits
const TEST_USER_EMAIL = "jeff.sit13@gmail.com";

// Helper function to check if user is test user
const isTestUser = (email) => {
  return email === TEST_USER_EMAIL;
};

// Helper function to check if we're in a new month
const isNewMonth = (lastResetDate) => {
  if (!lastResetDate) return true;
  
  const now = new Date();
  const lastReset = new Date(lastResetDate);
  
  return now.getMonth() !== lastReset.getMonth() || 
         now.getFullYear() !== lastReset.getFullYear();
};

// Helper function to reset monthly credits
const resetMonthlyCredits = (user) => {
  const now = new Date();
  // Test users don't get monthly resets - they keep unlimited credits
  if (user.subscription_tier === 'test' || user.is_test_user) {
    return {
      ...user,
      last_credit_reset: now.toISOString()
    };
  }
  
  return {
    ...user,
    credits_remaining: DEFAULT_CREDITS[user.subscription_tier] || DEFAULT_CREDITS.free,
    credits_used_this_month: 0,
    last_credit_reset: now.toISOString()
  };
};

export default async function handler(req, res) {
  try {
    console.log('Supabase API called:', req.method);
    
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      console.log('No session found');
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id || session.user.email;
    const userEmail = session.user.email;
    
    console.log('User ID:', userId, 'Email:', userEmail);
    
    if (req.method === 'GET') {
      // Always check if test user first - return unlimited credits immediately
      if (isTestUser(userEmail)) {
        const now = new Date();
        const user = {
          id: userId,
          email: userEmail,
          full_name: session.user.name,
          subscription_tier: 'test',
          credits_remaining: DEFAULT_CREDITS.test,
          credits_used_this_month: 0,
          total_cases_generated: 0,
          created_at: now.toISOString(),
          last_case_date: null,
          last_credit_reset: now.toISOString(),
          is_test_user: true
        };
        
        console.log('🎯 TEST USER DETECTED (bypassing DB):', userEmail, 'Credits:', user.credits_remaining);
        return res.status(200).json(user);
      }
      
      // Regular user - get from Supabase
      try {
        let user = await supabaseStorage.getUser(userId);
        
        if (!user) {
          // Create new user
          const now = new Date();
          const newUser = {
            id: userId,
            email: userEmail,
            full_name: session.user.name,
            subscription_tier: 'free',
            credits_remaining: DEFAULT_CREDITS.free,
            credits_used_this_month: 0,
            total_cases_generated: 0,
            created_at: now.toISOString(),
            last_case_date: null,
            last_credit_reset: now.toISOString(),
            is_test_user: false
          };
          
          user = await supabaseStorage.saveUser(userId, newUser);
          console.log('Created new user in Supabase:', userEmail);
        } else {
          // Check if we need to reset monthly credits
          if (isNewMonth(user.last_credit_reset)) {
            const resetUser = resetMonthlyCredits(user);
            user = await supabaseStorage.saveUser(userId, resetUser);
            console.log('Reset monthly credits for user:', userEmail);
          }
        }
        
        return res.status(200).json(user);
      } catch (dbError) {
        console.error('Supabase error, falling back to memory:', dbError);
        
        // Fallback to in-memory for this request
        const now = new Date();
        const fallbackUser = {
          id: userId,
          email: userEmail,
          full_name: session.user.name,
          subscription_tier: 'free',
          credits_remaining: DEFAULT_CREDITS.free,
          credits_used_this_month: 0,
          total_cases_generated: 0,
          created_at: now.toISOString(),
          last_case_date: null,
          last_credit_reset: now.toISOString(),
          is_test_user: false
        };
        
        return res.status(200).json(fallbackUser);
      }
    }
    
    if (req.method === 'PATCH') {
      // Always return test user unlimited credits (bypass DB)
      if (isTestUser(userEmail)) {
        const now = new Date();
        const user = {
          id: userId,
          email: userEmail,
          full_name: session.user.name,
          subscription_tier: 'test',
          credits_remaining: DEFAULT_CREDITS.test,
          credits_used_this_month: 0,
          total_cases_generated: 0,
          created_at: now.toISOString(),
          last_case_date: null,
          last_credit_reset: now.toISOString(),
          is_test_user: true
        };
        
        console.log('🎯 TEST USER PATCH (bypassing DB):', userEmail, 'Unlimited credits maintained');
        return res.status(200).json(user);
      }
      
      // Regular user update via Supabase
      try {
        let user = await supabaseStorage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
        const updates = req.body;
        console.log('PATCH updates:', updates);
        
        // Special handling for credit deduction
        if (updates.credits_remaining !== undefined) {
          const creditDifference = user.credits_remaining - updates.credits_remaining;
          console.log(`Credit update: ${user.credits_remaining} -> ${updates.credits_remaining} (difference: ${creditDifference})`);
          
          if (creditDifference > 0) {
            // Credits were used
            updates.credits_used_this_month = (user.credits_used_this_month || 0) + creditDifference;
            updates.total_cases_generated = (user.total_cases_generated || 0) + creditDifference;
            updates.last_case_date = new Date().toISOString();
          }
        }
        
        // Special handling for subscription tier changes
        if (updates.subscription_tier && updates.subscription_tier !== user.subscription_tier) {
          console.log(`Subscription change: ${user.subscription_tier} -> ${updates.subscription_tier}`);
          updates.credits_remaining = DEFAULT_CREDITS[updates.subscription_tier] || DEFAULT_CREDITS.free;
          updates.credits_used_this_month = 0;
          updates.last_credit_reset = new Date().toISOString();
        }
        
        const updatedUser = await supabaseStorage.saveUser(userId, { ...user, ...updates });
        
        console.log('Updated user in Supabase:', userEmail, 'Credits:', updatedUser.credits_remaining);
        return res.status(200).json(updatedUser);
        
      } catch (dbError) {
        console.error('Supabase PATCH error:', dbError);
        return res.status(500).json({ error: "Database error", details: dbError.message });
      }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in /api/users/me:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: error.message
    });
  }
}
