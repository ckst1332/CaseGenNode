import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Award, AlertTriangle } from 'lucide-react';

const ResultsComparison = ({ userResults, answerKey, caseData }) => {
  // Format numbers consistently
  const formatNumber = (value, type = 'currency') => {
    if (value === null || value === undefined) return 'N/A';
    
    // Convert string to number if needed
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'N/A';
    
    if (type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(num);
    } else if (type === 'percentage') {
      return `${(num * 100).toFixed(1)}%`;
    }
    
    return num.toLocaleString();
  };

  // Calculate delta and determine if result is "good"
  const getDeltaCell = (userValue, correctValue, type = 'currency') => {
    const userNum = typeof userValue === 'string' ? parseFloat(userValue) : userValue;
    const correctNum = typeof correctValue === 'string' ? parseFloat(correctValue) : correctValue;
    
    if (isNaN(userNum) || isNaN(correctNum) || correctNum === 0) {
      return {
        delta: 0,
        isGood: false,
        color: 'text-gray-500',
        icon: null,
        text: 'Unable to calculate'
      };
    }

    const delta = (userNum - correctNum) / Math.abs(correctNum);
    const isGood = Math.abs(delta) <= 0.1; // Within 10% is considered good
    
    const color = isGood ? 'text-green-600' : 'text-red-600';
    const icon = delta > 0 ? TrendingUp : TrendingDown;
    const text = `${delta > 0 ? '+' : ''}${(delta * 100).toFixed(1)}%`;
    
    return { delta, isGood, color, icon: icon, text };
  };

  // Get final metrics from answer key
  const correctNPV = answerKey?.final_metrics?.npv || 0;
  const correctIRR = answerKey?.final_metrics?.irr || 0;
  
  // Calculate comparison metrics
  const npvComparison = getDeltaCell(userResults.npv, correctNPV, 'currency');
  const irrComparison = getDeltaCell(userResults.irr, correctIRR, 'percentage');
  
  // Overall performance assessment
  const getOverallAssessment = () => {
    const goodResults = [npvComparison.isGood, irrComparison.isGood].filter(Boolean).length;
    const totalResults = 2;
    const accuracy = goodResults / totalResults;
    
    if (accuracy >= 0.8) {
      return {
        level: 'Excellent',
        color: 'bg-green-100 text-green-800',
        icon: Award,
        message: 'Outstanding work! Your model is highly accurate.'
      };
    } else if (accuracy >= 0.5) {
      return {
        level: 'Good',
        color: 'bg-blue-100 text-blue-800',
        icon: Target,
        message: 'Good effort! Review the detailed model to improve accuracy.'
      };
    } else {
      return {
        level: 'Needs Improvement',
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertTriangle,
        message: 'Review the detailed answer key to understand the differences.'
      };
    }
  };

  const assessment = getOverallAssessment();
  const AssessmentIcon = assessment.icon;

  return (
    <div className="space-y-6">
      {/* Overall Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AssessmentIcon className="w-5 h-5" />
            Results Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Performance Assessment</h3>
              <p className="text-sm text-gray-600">{assessment.message}</p>
            </div>
            <Badge className={assessment.color}>
              {assessment.level}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* NPV Comparison */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Net Present Value (Enterprise Value)</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="text-gray-600">Your Result</label>
                  <p className="font-semibold text-lg">{formatNumber(userResults.npv)}</p>
                </div>
                <div>
                  <label className="text-gray-600">Correct Answer</label>
                  <p className="font-semibold text-lg">{formatNumber(correctNPV)}</p>
                </div>
                <div>
                  <label className="text-gray-600">Variance</label>
                  <div className={`flex items-center gap-1 ${npvComparison.color}`}>
                    {npvComparison.icon && <npvComparison.icon className="w-4 h-4" />}
                    <span className="font-semibold">{npvComparison.text}</span>
                  </div>
                  {npvComparison.isGood && (
                    <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                      Within Target Range
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* IRR Comparison */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Internal Rate of Return</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="text-gray-600">Your Result</label>
                  <p className="font-semibold text-lg">{formatNumber(userResults.irr, 'percentage')}</p>
                </div>
                <div>
                  <label className="text-gray-600">Correct Answer</label>
                  <p className="font-semibold text-lg">{formatNumber(correctIRR, 'percentage')}</p>
                </div>
                <div>
                  <label className="text-gray-600">Variance</label>
                  <div className={`flex items-center gap-1 ${irrComparison.color}`}>
                    {irrComparison.icon && <irrComparison.icon className="w-4 h-4" />}
                    <span className="font-semibold">{irrComparison.text}</span>
                  </div>
                  {irrComparison.isGood && (
                    <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                      Within Target Range
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Context */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Model Context</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Company:</span>
                <span className="ml-2 font-medium">{caseData.name}</span>
              </div>
              <div>
                <span className="text-gray-600">WACC Used:</span>
                <span className="ml-2 font-medium">
                  {formatNumber(caseData.assumptions?.financial_assumptions?.wacc, 'percentage')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Starting ARR:</span>
                <span className="ml-2 font-medium">
                  {formatNumber(caseData.starting_point?.current_arr)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Terminal Growth:</span>
                <span className="ml-2 font-medium">
                  {formatNumber(caseData.assumptions?.financial_assumptions?.terminal_growth_rate, 'percentage')}
                </span>
              </div>
            </div>
          </div>

          {/* Learning Notes */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2 text-blue-800">💡 Learning Notes</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• NPV variance within ±10% is considered excellent for DCF models</li>
              <li>• IRR differences often stem from terminal value assumptions</li>
              <li>• Download the detailed model to trace formula differences</li>
              <li>• Small input changes can significantly impact final valuations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsComparison;
