import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { storage } from "../../../lib/storage";

// Default credit allocation based on subscription tier
const DEFAULT_CREDITS = {
  free: 3, // 3 cases per month for free users
  basic: 50, // 50 cases per month for basic plan
  pro: 999 // Unlimited (999) cases for pro plan
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
  return {
    ...user,
    credits_remaining: DEFAULT_CREDITS[user.subscription_tier] || DEFAULT_CREDITS.free,
    credits_used_this_month: 0,
    last_credit_reset: now.toISOString()
  };
};

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id || session.user.email;
    
    if (req.method === 'GET') {
      // Get or create user
      let user = storage.getUser(userId);
      if (!user) {
        // Create new user with default credits and proper tracking
        const now = new Date();
        user = {
          id: userId,
          email: session.user.email,
          full_name: session.user.name,
          subscription_tier: 'free',
          credits_remaining: DEFAULT_CREDITS.free,
          credits_used_this_month: 0,
          total_cases_generated: 0,
          created_date: now.toISOString(),
          last_case_date: null,
          last_credit_reset: now.toISOString()
        };
        storage.saveUser(userId, user);
        console.log(`Created new user: ${userId} with ${DEFAULT_CREDITS.free} credits`);
      } else {
        // Check if we need to reset monthly credits
        if (isNewMonth(user.last_credit_reset)) {
          user = resetMonthlyCredits(user);
          storage.saveUser(userId, user);
          console.log(`Reset monthly credits for user: ${userId}`);
        }
      }
      
      console.log(`GET /api/users/me - User: ${userId}, Credits: ${user.credits_remaining}, Tier: ${user.subscription_tier}`);
      return res.status(200).json(user);
    }
    
    if (req.method === 'PATCH') {
      // Update user data
      let user = storage.getUser(userId);
      if (!user) {
        console.log(`User not found for PATCH: ${userId}`);
        return res.status(404).json({ error: "User not found" });
      }
      
      const updates = req.body;
      console.log(`PATCH request for user ${userId}:`, {
        currentCredits: user.credits_remaining,
        updates: updates,
        userTier: user.subscription_tier
      });
      
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
        // Reset credits when subscription changes
        updates.credits_remaining = DEFAULT_CREDITS[updates.subscription_tier] || DEFAULT_CREDITS.free;
        updates.credits_used_this_month = 0;
        updates.last_credit_reset = new Date().toISOString();
      }
      
      // Update user with new data
      const updatedUser = { ...user, ...updates };
      storage.saveUser(userId, updatedUser);
      
      console.log(`Updated user:`, {
        credits_remaining: updatedUser.credits_remaining,
        credits_used_this_month: updatedUser.credits_used_this_month,
        subscription_tier: updatedUser.subscription_tier
      });
      
      return res.status(200).json(updatedUser);
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in /api/users/me:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
