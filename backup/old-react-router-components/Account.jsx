
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User as UserIcon, 
  CreditCard, 
  Calendar, 
  Settings, 
  ArrowLeft,
  Crown,
  Zap,
  Clock
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Account() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

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
    navigate(createPageUrl("Payments"));
  };

  const getCreditsForPlan = (tier) => {
    const creditLimits = {
      'free': 1,
      'basic': 15,
      'pro': 999
    };
    return creditLimits[tier] || 1;
  };

  const getCurrentPlanName = (tier) => {
    const planNames = {
      'free': 'Free',
      'basic': 'Basic',
      'pro': 'Pro'
    };
    return planNames[tier] || 'Free';
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to={createPageUrl("Dashboard")} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-slate-600">Manage your profile and subscription</p>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{user?.full_name}</h3>
                <p className="text-slate-600">{user?.email}</p>
                <Badge className="mt-1 bg-slate-100 text-slate-700">
                  {user?.role === 'admin' ? 'Administrator' : 'User'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription & Usage */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscription & Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Credits Remaining</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {user?.credits_remaining || 0} / {getCreditsForPlan(user?.subscription_tier)}
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Cases Completed</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {user?.cases_completed || 0}
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Current Plan</span>
                </div>
                <div className="text-lg font-bold text-purple-900">
                  {getCurrentPlanName(user?.subscription_tier)}
                </div>
              </div>
            </div>

            <Separator />

            {/* Subscription Plans */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Plans</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-2 border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-xl">Free</CardTitle>
                    <div className="text-2xl font-bold">$0</div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>• 1 case per month</li>
                      <li>• Complete model download</li>
                      <li className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>All industries (coming soon)</span>
                      </li>
                    </ul>
                    <Badge className="mt-3 bg-slate-100 text-slate-700">
                      {user?.subscription_tier === 'free' ? 'Current Plan' : 'Available'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-600 relative">
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                    Most Popular
                  </Badge>
                  <CardHeader>
                    <CardTitle className="text-xl">Basic</CardTitle>
                    <div className="text-2xl font-bold">$12<span className="text-base text-slate-600">/month</span></div>
                    <p className="text-sm text-slate-600">or $120/year – save 17%</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-slate-600 mb-4">
                      <li>• 15 cases every month</li>
                      <li>• Complete model downloads</li>
                      <li className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>All industries (coming soon)</span>
                      </li>
                    </ul>
                    {user?.subscription_tier === 'basic' ? (
                      <Badge className="bg-green-100 text-green-800">Current Plan</Badge>
                    ) : (
                      <Button onClick={handleUpgrade} className="w-full bg-blue-600 hover:bg-blue-700">
                        Upgrade to Basic
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">
                <strong>Pro plan</strong> (unlimited cases, all industries) — coming soon.
              </p>
              <p className="text-xs text-slate-500">
                Join the waitlist at support@casegen.app for early access.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Download My Data
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                Delete Account
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Need help? Contact us at{" "}
              <a href="mailto:support@casegen.app" className="text-blue-600 hover:underline">
                support@casegen.app
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
