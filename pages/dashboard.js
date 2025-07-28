import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from 'next/router';
import { Plus, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "../components/layout/Layout";
import DashboardHeader from "../src/components/dashboard/DashboardHeader";
import DashboardStats from "../src/components/dashboard/DashboardStats";
import RecentCasesTable from "../src/components/dashboard/RecentCasesTable";

// Lazy load heavy components
const ProgressChart = React.lazy(() => import("../src/components/dashboard/ProgressChart"));
const IndustryChart = React.lazy(() => import("../src/components/dashboard/IndustryChart"));

// Import centralized API client
import { Case, User } from "@/api/entities";

export default function Dashboard() {
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [casesData, userData] = await Promise.all([
        Case.list("-created_date").catch(() => []), // Fallback to empty array
        User.me().catch(() => null) // Fallback to null
      ]);
      
      setCases(casesData || []);
      setUser(userData);
      
      if (!userData?.subscription_tier) {
        router.push("/signup");
        return;
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data");
      // Don't redirect on error, show error state instead
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize expensive computations
  const { completedCases, inProgressCases } = React.useMemo(() => {
    const completed = cases.filter(c => c.status === 'completed');
    const inProgress = cases.filter(c => c.status === 'awaiting_results' || c.status === 'generating');
    return { completedCases: completed, inProgressCases: inProgress };
  }, [cases]);

  if (error) {
    return (
      <Layout currentPageName="Dashboard">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="text-red-600 text-center">
                <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
                <p className="text-sm">{error}</p>
                <Button 
                  onClick={loadDashboardData} 
                  className="mt-4"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPageName="Dashboard">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <DashboardHeader user={user} />
        
        <DashboardStats 
          totalCases={cases.length}
          completedCases={completedCases.length}
          inProgressCases={inProgressCases.length}
          isLoading={isLoading}
        />

        <div className="grid lg:grid-cols-2 gap-6">
          <Suspense fallback={<div className="h-64 bg-slate-100 animate-pulse rounded-lg"></div>}>
            <ProgressChart cases={cases} isLoading={isLoading} />
          </Suspense>
          <Suspense fallback={<div className="h-64 bg-slate-100 animate-pulse rounded-lg"></div>}>
            <IndustryChart cases={cases} isLoading={isLoading} />
          </Suspense>
        </div>

        <RecentCasesTable cases={cases.slice(0, 5)} isLoading={isLoading} />
      </div>
    </Layout>
  );
}
