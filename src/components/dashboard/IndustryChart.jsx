import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = {
  'Technology (SaaS)': '#3b82f6',
  'Financial Services': '#8b5cf6', 
  'Healthcare': '#10b981',
  'Renewable Energy': '#f59e0b',
  'Retail': '#ef4444',
  'Manufacturing': '#06b6d4'
};

export default function IndustryChart({ cases, isLoading }) {
  // Generate industry distribution data
  const generateIndustryData = () => {
    if (!cases || cases.length === 0) return [];

    const industryCount = {};
    const totalCases = cases.length;

    cases.forEach(caseItem => {
      const industry = caseItem.industry || 'Other';
      industryCount[industry] = (industryCount[industry] || 0) + 1;
    });

    return Object.entries(industryCount).map(([industry, count]) => ({
      name: industry,
      value: count,
      percentage: ((count / totalCases) * 100).toFixed(1)
    }));
  };

  const industryData = generateIndustryData();

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percentage }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="600"
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Industry Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : industryData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500">
            No cases to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={industryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {industryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name] || '#64748b'} 
                  />
                ))}
              </Pie>
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => `${value}: ${entry.payload.percentage}%`}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}