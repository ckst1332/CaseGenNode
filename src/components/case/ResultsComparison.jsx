
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function ResultsComparison({ userResults, answerKey }) {
  const formatNumber = (num, type = 'currency') => {
    let numericValue = num;
    if (typeof numericValue === 'string') {
      numericValue = parseFloat(numericValue.replace(/,/g, ''));
    }

    if (numericValue === null || numericValue === undefined || typeof numericValue !== 'number' || isNaN(numericValue)) {
      return '-';
    }
    
    if (type === 'percentage') {
      return `${(numericValue * 100).toFixed(1)}%`;
    }
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(numericValue);
  };
  
  const metrics = [
    { key: 'npv', name: 'NPV', type: 'currency' },
    { key: 'irr', name: 'IRR', type: 'percentage' },
  ];

  const getDeltaCell = (user, correct) => {
    let correctNum = correct;
    if (typeof correctNum === 'string') {
      correctNum = parseFloat(correctNum.replace(/,/g, ''));
    }

    if (user === null || user === undefined || correctNum === null || correctNum === undefined || 
        typeof user !== 'number' || typeof correctNum !== 'number' || 
        isNaN(user) || isNaN(correctNum) || correctNum === 0) {
      return (
        <div className="flex items-center gap-1 text-slate-500">
          <Minus className="w-4 h-4" />
          <span>N/A</span>
        </div>
      );
    }
    
    const delta = (user - correctNum) / Math.abs(correctNum);
    const isGood = Math.abs(delta) <= 0.1; // within 10% is good
    
    const color = isGood ? 'text-green-600' : 'text-red-600';
    const Icon = delta >= 0 ? TrendingUp : TrendingDown;
    
    return (
      <div className={`flex items-center gap-1 font-semibold ${color}`}>
        <Icon className="w-4 h-4" />
        <span>{(delta * 100).toFixed(1)}%</span>
      </div>
    );
  };

  if (!userResults || !answerKey) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="p-6 text-center text-slate-500">
          Comparison data is unavailable.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Performance Comparison
        </CardTitle>
        {userResults.submitted_at && (
          <p className="text-sm text-slate-600">
            Submitted on {format(new Date(userResults.submitted_at), "MMMM d, yyyy 'at' hh:mm a")}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-3 text-slate-600">Metric</th>
                <th className="p-3 text-slate-600">Your Result</th>
                <th className="p-3 text-slate-600">Correct Answer</th>
                <th className="p-3 text-slate-600">Variance</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map(metric => (
                <tr key={metric.key} className="border-b border-slate-100">
                  <td className="p-3 font-semibold">{metric.name}</td>
                  <td className="p-3">{formatNumber(userResults[metric.key], metric.type)}</td>
                  <td className="p-3">{formatNumber(answerKey[metric.key], metric.type)}</td>
                  <td className="p-3">{getDeltaCell(userResults[metric.key], answerKey[metric.key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
