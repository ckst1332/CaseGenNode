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
    
    // Get user data
    const user = storage.getUser(userId);
    
    // Debug info
    const debugInfo = {
      session: {
        user: session.user,
        userId: userId
      },
      storedUser: user,
      isTestUserEmail: session.user.email === 'jeff.sit13@gmail.com',
      storageTest: {
        canRead: true,
        allUsers: Object.keys(storage.getUsers()),
        userFound: !!user
      }
    };
    
    return res.status(200).json(debugInfo);
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
}
