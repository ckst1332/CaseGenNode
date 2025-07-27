import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

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

// In-memory storage for demo (will reset on each deployment)
const users = {};

export default async function handler(req, res) {
  try {
    console.log('API called:', req.method);
    
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      console.log('No session found');
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id || session.user.email;
    const userEmail = session.user.email;
    
    console.log('User ID:', userId, 'Email:', userEmail);
    
    if (req.method === 'GET') {
      // Always check if test user first
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
          created_date: now.toISOString(),
          last_case_date: null,
          last_credit_reset: now.toISOString(),
          is_test_user: true
        };
        
        console.log('🎯 TEST USER DETECTED:', userEmail, 'Credits:', user.credits_remaining);
        return res.status(200).json(user);
      }
      
      // Regular user - create or get from memory
      let user = users[userId];
      if (!user) {
        const now = new Date();
        user = {
          id: userId,
          email: userEmail,
          full_name: session.user.name,
          subscription_tier: 'free',
          credits_remaining: DEFAULT_CREDITS.free,
          credits_used_this_month: 0,
          total_cases_generated: 0,
          created_date: now.toISOString(),
          last_case_date: null,
          last_credit_reset: now.toISOString(),
          is_test_user: false
        };
        users[userId] = user;
        console.log('Created regular user:', userEmail);
      }
      
      return res.status(200).json(user);
    }
    
    if (req.method === 'PATCH') {
      // Always return test user unlimited credits
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
          created_date: now.toISOString(),
          last_case_date: null,
          last_credit_reset: now.toISOString(),
          is_test_user: true
        };
        
        console.log('🎯 TEST USER PATCH:', userEmail, 'Unlimited credits maintained');
        return res.status(200).json(user);
      }
      
      // Regular user update
      let user = users[userId];
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const updates = req.body;
      const updatedUser = { ...user, ...updates };
      users[userId] = updatedUser;
      
      console.log('Updated regular user:', userEmail, 'Credits:', updatedUser.credits_remaining);
      return res.status(200).json(updatedUser);
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
