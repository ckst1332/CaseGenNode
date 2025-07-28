import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { safeDate } from '../lib/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User as UserIcon, 
  CreditCard, 
  Calendar, 
  Settings, 
  ArrowLeft,
  Crown,
  Zap,
  Clock,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import Layout from "../components/layout/Layout";

// Import centralized API client
import { User } from "@/api/entities";

export default function Account() {
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

  const handleUpgrade = () => {
    router.push("/payments");
  };

  // Check for upgrade success message
  const { upgraded, demo } = router.query;
  const showUpgradeSuccess = upgraded && demo;

  const getCreditsForPlan = (tier) => {
    const creditLimits = {
      'free': 3,
      'basic': 50,
      'pro': 999
    };
    return creditLimits[tier] || 3;
  };

  const getTierDisplayName = (tier) => {
    const displayNames = {
      'free': 'Free',
      'basic': 'Basic',
      'pro': 'Professional'
    };
    return displayNames[tier] || 'Free';
  };

  const getTierIcon = (tier) => {
    if (tier === 'pro') return Crown;
    if (tier === 'basic') return Zap;
    return UserIcon;
  };

  const getTierColor = (tier) => {
    if (tier === 'pro') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (tier === 'basic') return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  if (status === 'loading' || isLoading) {
    return (
      <Layout currentPageName="Account">
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  const TierIcon = getTierIcon(user?.subscription_tier);

  return (
    <Layout currentPageName="Account">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Account Settings</h1>
          <p className="text-slate-600">Manage your account preferences and subscription.</p>
          
          {showUpgradeSuccess && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                🎉 Successfully upgraded to {upgraded} plan! (Demo mode - no actual payment processed)
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Full Name</label>
                <p className="text-slate-900 font-medium">{user?.full_name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Email</label>
                <p className="text-slate-900 font-medium">{user?.email || session?.user?.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Member Since</label>
                <p className="text-slate-900 font-medium">
                  {safeDate(user?.created_at || user?.created_date, 'Recently')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Current Plan</span>
                <Badge className={`${getTierColor(user?.subscription_tier)} border`}>
                  <TierIcon className="w-3 h-3 mr-1" />
                  {getTierDisplayName(user?.subscription_tier)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Credits Remaining</span>
                <span className="font-semibold text-slate-900">
                  {user?.credits_remaining || 0} / {getCreditsForPlan(user?.subscription_tier)}
                </span>
              </div>

              {user?.subscription_tier === 'free' && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-600 mb-3">
                    Upgrade to generate more cases and access premium features.
                  </p>
                  <Button onClick={handleUpgrade} className="w-full">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Total Cases Generated</span>
                <span className="font-semibold text-slate-900">
                  {user?.total_cases_generated || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Credits Used This Month</span>
                <span className="font-semibold text-slate-900">
                  {user?.credits_used_this_month || 0} / {getCreditsForPlan(user?.subscription_tier)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Credits Remaining</span>
                <span className={`font-semibold ${
                  (user?.credits_remaining || 0) > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {user?.credits_remaining || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Last Case Generated</span>
                <span className="font-semibold text-slate-900">
                  {safeDate(user?.last_case_date, 'Never')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Credits Reset</span>
                <span className="font-semibold text-slate-900">
                  {safeDate(user?.last_credit_reset, 'N/A')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user?.subscription_tier !== 'pro' && (
                <Button onClick={handleUpgrade} className="w-full" variant="outline">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Subscription
                </Button>
              )}
              
              <Button 
                onClick={() => router.push('/payments')} 
                className="w-full" 
                variant="outline"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Billing & Payments
              </Button>

              <Separator className="my-4" />
              
              <Button 
                onClick={() => {/* Add logout functionality */}} 
                variant="destructive" 
                className="w-full"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
