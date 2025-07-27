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
      // Debug: Show current user data from Supabase
      try {
        const user = await supabaseStorage.getUser(userId);
        
        return res.status(200).json({
          userId,
          user,
          sessionUser: session.user,
          message: user ? "User found in Supabase" : "User NOT found in Supabase",
          isTestUser: session.user.email === 'jeff.sit13@gmail.com'
        });
      } catch (error) {
        return res.status(500).json({
          error: "Supabase error",
          details: error.message,
          userId,
          sessionUser: session.user
        });
      }
    }
    
    if (req.method === 'POST') {
      // Debug: Manually set credits for testing (but skip for test users)
      if (session.user.email === 'jeff.sit13@gmail.com') {
        return res.status(200).json({
          message: 'Test user detected - credits are always unlimited',
          credits: 999999
        });
      }
      
      try {
        const { credits } = req.body;
        const user = await supabaseStorage.getUser(userId);
        
        if (user) {
          const updatedUser = {
            ...user,
            credits_remaining: parseInt(credits || 3),
            credits_used_this_month: 0,
            last_credit_reset: new Date().toISOString()
          };
          const savedUser = await supabaseStorage.saveUser(userId, updatedUser);
          
          return res.status(200).json({
            message: 'Credits updated in Supabase',
            user: savedUser
          });
        }
        
        return res.status(404).json({ error: 'User not found in Supabase' });
      } catch (error) {
        return res.status(500).json({ 
          error: 'Error updating credits in Supabase', 
          details: error.message 
        });
      }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
