import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fake_key_for_testing', {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { priceId, planName } = req.body;
    
    // For demo purposes, we'll create mock checkout sessions
    // In production, this would create real Stripe checkout sessions
    
    const prices = {
      'basic': {
        amount: 1900, // $19.00
        currency: 'usd',
        interval: 'month'
      },
      'pro': {
        amount: 4900, // $49.00
        currency: 'usd', 
        interval: 'month'
      }
    };
    
    const price = prices[priceId];
    if (!price) {
      return res.status(400).json({ error: 'Invalid price ID' });
    }

    // For demo purposes, return a mock checkout URL
    // In production, this would be the real Stripe checkout session URL
    const mockCheckoutSession = {
      id: `cs_mock_${Date.now()}`,
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/stripe/mock-success?plan=${priceId}`,
      payment_status: 'unpaid'
    };

    return res.status(200).json({ 
      checkoutUrl: mockCheckoutSession.url,
      sessionId: mockCheckoutSession.id
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
