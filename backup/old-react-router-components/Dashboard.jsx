import React, { useState, useEffect, Suspense } from "react";
import { Case } from "@/api/entities";
import { User } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStats from "../components/dashboard/DashboardStats";
const ProgressChart = React.lazy(() => import("../components/dashboard/ProgressChart"));
const IndustryChart = React.lazy(() => import("../components/dashboard/IndustryChart"));
import RecentCasesTable from "../components/dashboard/RecentCasesTable";

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate('/login');
    } else if (status === 'authenticated') {
      loadDashboardData();
    }
  }, [status]);

    const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [casesData, userData] = await Promise.all([
        Case.list("-created_date"),
        User.me()
      ]);
      setCases(casesData);
      setUser(userData);
      if (!userData?.subscription_tier) {
        navigate('/signup');
        return;
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      navigate('/login');
      return;
    }
    setIsLoading(false);
  };

  const completedCases = cases.filter(c => c.status === 'completed');
  const inProgressCases = cases.filter(c => c.status === 'awaiting_results' || c.status === 'generating');

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div>
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome, {session.user.name || session.user.email}
          </span>
          <button
            onClick={() => signOut()}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Sign Out
          </button>
        </div>
      </div>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <DashboardHeader user={user} />
      
      <DashboardStats 
        totalCases={cases.length}
        completedCases={completedCases.length}
        inProgressCases={inProgressCases.length}
        isLoading={isLoading}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <Suspense fallback={<div>Loading...</div>}>
          <ProgressChart cases={cases} isLoading={isLoading} />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <IndustryChart cases={cases} isLoading={isLoading} />
        </Suspense>
      </div>

        <RecentCasesTable cases={cases.slice(0, 5)} isLoading={isLoading} />
      </div>
    </div>
  );
}