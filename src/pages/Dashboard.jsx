import React, { useState, useEffect } from "react";
import { Case } from "@/api/entities";
import { User } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStats from "../components/dashboard/DashboardStats";
import ProgressChart from "../components/dashboard/ProgressChart";
import IndustryChart from "../components/dashboard/IndustryChart";
import RecentCasesTable from "../components/dashboard/RecentCasesTable";

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

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
        window.location.href = "/signup";
        return;
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      window.location.href = "/login";
      return;
    }
    setIsLoading(false);
  };

  const completedCases = cases.filter(c => c.status === 'completed');
  const inProgressCases = cases.filter(c => c.status === 'awaiting_results' || c.status === 'generating');

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <DashboardHeader user={user} />
      
      <DashboardStats 
        totalCases={cases.length}
        completedCases={completedCases.length}
        inProgressCases={inProgressCases.length}
        isLoading={isLoading}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <ProgressChart cases={cases} isLoading={isLoading} />
        <IndustryChart cases={cases} isLoading={isLoading} />
      </div>

      <RecentCasesTable cases={cases.slice(0, 5)} isLoading={isLoading} />
    </div>
  );
}