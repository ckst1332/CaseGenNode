import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { storage } from "../../../lib/storage";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id || session.user.email;
    
    if (req.method === 'GET') {
      // Debug: Show current user data from storage
      const user = storage.getUser(userId);
      const allUsers = storage.getUsers();
      
      return res.status(200).json({
        userId,
        user,
        allUserIds: Object.keys(allUsers),
        sessionUser: session.user
      });
    }
    
    if (req.method === 'POST') {
      // Debug: Manually set credits for testing
      const { credits } = req.body;
      const user = storage.getUser(userId);
      
      if (user) {
        const updatedUser = {
          ...user,
          credits_remaining: parseInt(credits || 3),
          credits_used_this_month: 0,
          last_credit_reset: new Date().toISOString()
        };
        storage.saveUser(userId, updatedUser);
        
        return res.status(200).json({
          message: 'Credits updated',
          user: updatedUser
        });
      }
      
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
