import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// Mock user database - in production, this would connect to a real database
const users = new Map();

// Default credit allocation based on subscription tier
const DEFAULT_CREDITS = {
  free: 3, // 3 cases per month for free users
  basic: 50, // 50 cases per month for basic plan
  pro: 999 // Unlimited (999) cases for pro plan
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
      if (!users.has(userId)) {
        // Create new user with default credits
        const newUser = {
          id: userId,
          email: session.user.email,
          full_name: session.user.name,
          subscription_tier: 'free',
          credits_remaining: DEFAULT_CREDITS.free,
          total_cases_generated: 0,
          created_date: new Date().toISOString(),
          last_case_date: null
        };
        users.set(userId, newUser);
      }
      
      const user = users.get(userId);
      return res.status(200).json(user);
    }
    
    if (req.method === 'PATCH') {
      // Update user data
      if (!users.has(userId)) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const user = users.get(userId);
      const updates = req.body;
      
      // Update user with new data
      const updatedUser = { ...user, ...updates };
      users.set(userId, updatedUser);
      
      return res.status(200).json(updatedUser);
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in /api/users/me:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
