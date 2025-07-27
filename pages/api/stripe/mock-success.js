import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// Mock success page for demo payments
export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const { plan } = req.query;
    
    if (!session || !session.user) {
      return res.redirect('/login');
    }
    
    // In a real implementation, this would:
    // 1. Verify the payment with Stripe
    // 2. Update the user's subscription in the database
    // 3. Allocate new credits
    
    // For demo purposes, redirect to success page with a message
    const planName = plan === 'basic' ? 'Basic' : plan === 'pro' ? 'Professional' : 'Unknown';
    
    return res.redirect(`/account?upgraded=${planName}&demo=true`);
    
  } catch (error) {
    console.error('Error in mock success handler:', error);
    return res.redirect('/account?error=payment_failed');
  }
}
