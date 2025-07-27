import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { format, subMonths, startOfMonth } from 'date-fns';

export default function ProgressChart({ cases, isLoading }) {
  // Generate progress data based on case creation dates
  const generateProgressData = () => {
    if (!cases || cases.length === 0) return [];

    const months = [];
    const currentDate = new Date();
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i);
      months.push({
        name: format(monthDate, 'MMM'),
        month: startOfMonth(monthDate),
        totalCases: 0,
        completedCases: 0
      });
    }

    // Count cases for each month
    cases.forEach(caseItem => {
      const caseDate = new Date(caseItem.created_date);
      const caseMonth = startOfMonth(caseDate);
      
      const monthData = months.find(m => m.month.getTime() === caseMonth.getTime());
      if (monthData) {
        monthData.totalCases++;
        if (caseItem.status === 'completed') {
          monthData.completedCases++;
        }
      }
    });

    // Convert to cumulative data
    let totalAccumulated = 0;
    let completedAccumulated = 0;
    
    return months.map(month => {
      totalAccumulated += month.totalCases;
      completedAccumulated += month.completedCases;
      
      return {
        name: month.name,
        'Total Cases': totalAccumulated,
        'Completed Cases': completedAccumulated
      };
    });
  };

  const progressData = generateProgressData();

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Your Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <Line 
                type="monotone" 
                dataKey="Total Cases" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="Completed Cases" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}