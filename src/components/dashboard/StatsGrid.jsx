import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  TrendingUp,
  Target,
  Zap
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsGrid({ user, cases, averageAccuracy, isLoading }) {
  const completedCases = cases.filter(c => c.status === 'completed');
  const awaitingResults = cases.filter(c => c.status === 'awaiting_results');
  const generating = cases.filter(c => c.status === 'generating');
  const creditsRemaining = user?.credits_remaining || 0;

  // Debug logging to understand the data
  console.log('Dashboard Stats Debug:', {
    totalCases: cases.length,
    completed: completedCases.length,
    awaiting: awaitingResults.length,
    generating: generating.length,
    statuses: cases.map(c => ({ name: c.name, status: c.status }))
  });

  const stats = [
    {
      title: "Total Cases",
      value: cases.length,
      subtitle: `${awaitingResults.length} awaiting, ${generating.length} generating`,
      icon: FileText,
      color: "from-blue-50 to-blue-100",
      textColor: "text-blue-900",
      iconColor: "text-blue-600"
    },
    {
      title: "Completed",
      value: completedCases.length,
      subtitle: completedCases.length > 0 ? `${((completedCases.length / cases.length) * 100).toFixed(0)}% completion rate` : "Start your first case",
      icon: Target,
      color: "from-green-50 to-green-100",
      textColor: "text-green-900",
      iconColor: "text-green-600"
    },
    {
      title: "Average Accuracy",
      value: completedCases.length > 0 ? `${(averageAccuracy * 100).toFixed(1)}%` : "N/A",
      subtitle: completedCases.length > 0 ? "Based on completed cases" : "Complete cases to see accuracy",
      icon: TrendingUp,
      color: "from-purple-50 to-purple-100",
      textColor: "text-purple-900",
      iconColor: "text-purple-600"
    },
    {
      title: "Credits Left",
      value: creditsRemaining,
      subtitle: creditsRemaining <= 3 ? "Running low" : "Available to use",
      icon: Zap,
      color: "from-amber-50 to-amber-100",
      textColor: "text-amber-900",
      iconColor: "text-amber-600"
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={stat.title} className={`shadow-lg border-0 bg-gradient-to-br ${stat.color}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`flex items-center gap-2 ${stat.textColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div>
                <div className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </div>
                {stat.subtitle && (
                  <div className={`text-xs font-medium ${stat.textColor} opacity-70 mt-1`}>
                    {stat.subtitle}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}