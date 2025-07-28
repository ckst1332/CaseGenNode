import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Crown,
  Zap,
  Check,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import Layout from "../src/pages/Layout";

// Import centralized API client
import { User } from '../lib/api/client';

const pricingPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month',
    credits: 3,
    features: [
      '3 case generations per month',
      'Technology (SaaS) industry only',
      'Basic DCF templates',
      'Standard support'
    ],
    icon: Zap,
    popular: false
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 19,
    period: 'month',
    credits: 50,
    features: [
      '50 case generations per month',
      'All available industries',
      'Advanced DCF templates',
      'Email support',
      'Solution downloads'
    ],
    icon: Zap,
    popular: true
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 49,
    period: 'month',
    credits: 999,
    features: [
      'Unlimited case generations',
      'All industries + early access',
      'All template types',
      'Priority support',
      'Custom scenarios',
      'Team collaboration features'
    ],
    icon: Crown,
    popular: false
  }
];

export default function Payments() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (session) {
      loadUser();
    }
  }, [session, status, router]);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setIsLoading(false);
  };

  const handleUpgrade = async (planId) => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: planId,
          planName: pricingPlans.find(p => p.id === planId)?.name
        }),
      });

      const data = await response.json();
      
      if (data.checkoutUrl) {
        // Redirect to Stripe checkout (or mock checkout for demo)
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <Layout currentPageName="Payments">
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Layout currentPageName="Payments">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <Link href="/account" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Account
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Choose Your Plan</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Upgrade your plan to generate more cases and access premium features for your financial modeling practice.
          </p>
        </div>

        {user && (
          <div className="mb-8 text-center">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Current Plan</h3>
                <Badge className={`${
                  user.subscription_tier === 'pro' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  user.subscription_tier === 'basic' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-slate-100 text-slate-800 border-slate-200'
                } border text-lg px-3 py-1`}>
                  {user.subscription_tier === 'pro' ? 'Professional' :
                   user.subscription_tier === 'basic' ? 'Basic' : 'Free'}
                </Badge>
                <p className="text-sm text-slate-600 mt-2">
                  {user.credits_remaining || 0} credits remaining this month
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {pricingPlans.map((plan) => {
            const PlanIcon = plan.icon;
            const isCurrentPlan = user?.subscription_tier === plan.id;
            
            return (
              <Card key={plan.id} className={`relative ${
                isCurrentPlan 
                  ? 'border-green-500 bg-green-50' 
                  : plan.popular 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-slate-200'
              }`}>
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white px-3 py-1">Current Plan</Badge>
                  </div>
                )}
                
                {plan.popular && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-3 py-1">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    isCurrentPlan
                      ? 'bg-green-100'
                      : plan.id === 'pro' 
                        ? 'bg-yellow-100' 
                        : plan.id === 'basic' 
                          ? 'bg-blue-100' 
                          : 'bg-slate-100'
                  }`}>
                    <PlanIcon className={`w-6 h-6 ${
                      isCurrentPlan
                        ? 'text-green-600'
                        : plan.id === 'pro' 
                          ? 'text-yellow-600' 
                          : plan.id === 'basic' 
                            ? 'text-blue-600' 
                            : 'text-slate-600'
                    }`} />
                  </div>
                  
                  <CardTitle className={`text-xl ${isCurrentPlan ? 'text-green-800' : ''}`}>
                    {plan.name}
                  </CardTitle>
                  
                  <div className="mt-4">
                    <span className={`text-3xl font-bold ${isCurrentPlan ? 'text-green-800' : 'text-slate-900'}`}>
                      ${plan.price}
                    </span>
                    <span className={`${isCurrentPlan ? 'text-green-600' : 'text-slate-600'}`}>
                      /{plan.period}
                    </span>
                  </div>
                  
                  <p className={`text-sm mt-2 ${isCurrentPlan ? 'text-green-600' : 'text-slate-600'}`}>
                    {plan.credits === 999 ? 'Unlimited' : plan.credits} case{plan.credits !== 1 ? 's' : ''} per month
                  </p>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${isCurrentPlan ? 'text-green-700' : 'text-slate-700'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  {isCurrentPlan ? (
                    <Button disabled className="w-full bg-green-100 text-green-800 border-green-300" variant="outline">
                      ✓ Current Plan
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleUpgrade(plan.id)}
                      className={`w-full ${
                        plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.price === 0 ? 'Downgrade to Free' : 'Upgrade to ' + plan.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-6 text-center">
            <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Need a Custom Plan?</h3>
            <p className="text-slate-600 mb-4">
              For teams, educational institutions, or enterprise needs, contact us for custom pricing.
            </p>
            <Button variant="outline">
              Contact Sales
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
