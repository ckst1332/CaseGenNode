import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { supabaseStorage } from "../../../lib/supabase";

// Mock success page for demo payments
export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const { plan } = req.query;
    
    if (!session || !session.user) {
      return res.redirect('/login');
    }
    
    const userId = session.user.id || session.user.email;
    
    // Skip test users - they always have unlimited credits
    if (session.user.email === 'jeff.sit13@gmail.com') {
      return res.redirect(`/account?message=test_user_unlimited`);
    }
    
    // In a real implementation, this would:
    // 1. Verify the payment with Stripe
    // 2. Update the user's subscription in the database
    // 3. Allocate new credits
    
    // For demo purposes, actually update the user's subscription
    if (plan === 'basic' || plan === 'pro') {
      try {
        const user = await supabaseStorage.getUser(userId);
        if (user) {
          const updatedUser = {
            ...user,
            subscription_tier: plan,
            credits_remaining: plan === 'basic' ? 50 : 999,
            credits_used_this_month: 0,
            last_credit_reset: new Date().toISOString(),
            subscription_updated_date: new Date().toISOString()
          };
          await supabaseStorage.saveUser(userId, updatedUser);
        }
      } catch (error) {
        console.error('Error updating subscription in Supabase:', error);
        return res.redirect('/account?error=database_error');
      }
    }
    
    const planName = plan === 'basic' ? 'Basic' : plan === 'pro' ? 'Professional' : 'Unknown';
    
    return res.redirect(`/account?upgraded=${planName}&demo=true`);
    
  } catch (error) {
    console.error('Error in mock success handler:', error);
    return res.redirect('/account?error=payment_failed');
  }
}
