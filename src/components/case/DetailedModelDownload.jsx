import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Award, Lock, FileSpreadsheet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const DetailedModelDownload = ({ caseData, userResults, isUnlocked = false }) => {
  
  const formatNumber = (value) => {
    if (value === null || value === undefined) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    return num.toLocaleString();
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined) return '0.0%';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0.0%';
    return `${(num * 100).toFixed(1)}%`;
  };

  const generateFullModelCSV = () => {
    if (!caseData.answer_key) {
      console.error('No answer key available for detailed model download');
      return '';
    }

    const answerKey = caseData.answer_key;
    const csvContent = [];

    // Header
    csvContent.push(['COMPLETE FINANCIAL MODEL - ANSWER KEY']);
    csvContent.push(['Company:', caseData.name]);
    csvContent.push(['Generated:', new Date().toLocaleDateString()]);
    csvContent.push(['']);

    // Company Description
    csvContent.push(['COMPANY DESCRIPTION']);
    csvContent.push([caseData.company_description || 'No description available']);
    csvContent.push(['']);

    // Starting Point
    csvContent.push(['STARTING POINT (Year 0)']);
    if (caseData.starting_point) {
      Object.entries(caseData.starting_point).forEach(([key, value]) => {
        csvContent.push([key.replace(/_/g, ' ').toUpperCase(), value]);
      });
    }
    csvContent.push(['']);

    // Assumptions
    csvContent.push(['ASSUMPTIONS']);
    if (caseData.assumptions) {
      // Operational Drivers
      if (caseData.assumptions.operational_drivers) {
        csvContent.push(['OPERATIONAL DRIVERS']);
        Object.entries(caseData.assumptions.operational_drivers).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            csvContent.push([key.replace(/_/g, ' ').toUpperCase(), ...value]);
          }
        });
        csvContent.push(['']);
      }

      // Financial Assumptions
      if (caseData.assumptions.financial_assumptions) {
        csvContent.push(['FINANCIAL ASSUMPTIONS']);
        Object.entries(caseData.assumptions.financial_assumptions).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            csvContent.push([key.replace(/_/g, ' ').toUpperCase(), ...value]);
          } else {
            csvContent.push([key.replace(/_/g, ' ').toUpperCase(), value]);
          }
        });
        csvContent.push(['']);
      }
    }

    // Helper function to add schedule with formulas
    const addScheduleWithFormulas = (title, schedule, formulaKey = 'formula') => {
      if (!schedule || !Array.isArray(schedule) || schedule.length === 0) return;

      csvContent.push([title]);
      
      // Get headers from first item
      const firstItem = schedule[0];
      const headers = Object.keys(firstItem).filter(key => key !== formulaKey);
      csvContent.push(['', ...headers]);

      // Add data rows
      schedule.forEach((row, index) => {
        const dataRow = ['', ...headers.map(header => {
          const value = row[header];
          return typeof value === 'number' ? value : (value || '');
        })];
        csvContent.push(dataRow);
      });

      // Add formulas section
      csvContent.push(['']);
      csvContent.push(['FORMULAS:']);
      schedule.forEach((row, index) => {
        if (row[formulaKey]) {
          csvContent.push([`Year ${row.year || index + 1} Formulas:`]);
          Object.entries(row[formulaKey]).forEach(([key, formula]) => {
            csvContent.push(['', key.replace(/_/g, ' '), formula]);
          });
          csvContent.push(['']);
        }
      });
      csvContent.push(['']);
    };

    // Revenue Buildup
    addScheduleWithFormulas('REVENUE BUILDUP SCHEDULE', answerKey.revenue_buildup);

    // Depreciation Schedule
    addScheduleWithFormulas('DEPRECIATION SCHEDULE', answerKey.depreciation_schedule);

    // Debt Schedule
    if (answerKey.debt_schedule && answerKey.debt_schedule.length > 0) {
      addScheduleWithFormulas('DEBT SCHEDULE', answerKey.debt_schedule);
    }

    // Income Statement
    addScheduleWithFormulas('INCOME STATEMENT', answerKey.income_statement);

    // Balance Sheet
    addScheduleWithFormulas('BALANCE SHEET', answerKey.balance_sheet);

    // Cash Flow Statement
    addScheduleWithFormulas('CASH FLOW STATEMENT', answerKey.cash_flow_statement);

    // DCF Valuation
    addScheduleWithFormulas('DCF VALUATION', answerKey.dcf_valuation);

    // Final Metrics
    if (answerKey.final_metrics) {
      csvContent.push(['FINAL VALUATION METRICS']);
      Object.entries(answerKey.final_metrics).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Handle validation_status object
          if (key === 'validation_status') {
            csvContent.push(['VALIDATION STATUS']);
            Object.entries(value).forEach(([subKey, subValue]) => {
              csvContent.push(['', subKey.replace(/_/g, ' ').toUpperCase(), subValue]);
            });
          }
        } else {
          csvContent.push([key.replace(/_/g, ' ').toUpperCase(), value]);
        }
      });
      csvContent.push(['']);
    }

    // User Results Comparison (if available)
    if (userResults) {
      csvContent.push(['YOUR RESULTS COMPARISON']);
      csvContent.push(['Metric', 'Your Result', 'Correct Answer', 'Variance']);
      
      const correctNPV = answerKey.final_metrics?.npv || 0;
      const correctIRR = answerKey.final_metrics?.irr || 0;
      
      const npvVariance = correctNPV !== 0 ? ((userResults.npv - correctNPV) / Math.abs(correctNPV) * 100) : 0;
      const irrVariance = correctIRR !== 0 ? ((userResults.irr - correctIRR) / Math.abs(correctIRR) * 100) : 0;
      
      csvContent.push(['NPV', userResults.npv, correctNPV, `${npvVariance.toFixed(1)}%`]);
      csvContent.push(['IRR', `${(userResults.irr * 100).toFixed(1)}%`, `${(correctIRR * 100).toFixed(1)}%`, `${irrVariance.toFixed(1)}%`]);
      csvContent.push(['']);
    }

    // Learning Notes
    csvContent.push(['LEARNING NOTES']);
    csvContent.push(['1. Review the formulas to understand the calculation methodology']);
    csvContent.push(['2. Compare your model structure with this answer key']);
    csvContent.push(['3. Pay attention to the validation checks that ensure realistic results']);
    csvContent.push(['4. Notice how operational assumptions flow through to financial statements']);
    csvContent.push(['5. Use this as a reference for building future DCF models']);

    // Convert to CSV string
    return csvContent.map(row => 
      row.map(cell => {
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    ).join('\n');
  };

  const handleDownload = () => {
    if (!isUnlocked) {
      alert('Please submit your results first to unlock the detailed model download.');
      return;
    }

    const csvContent = generateFullModelCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${caseData.name || 'case'}_detailed_model_answer_key.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFinalMetrics = () => {
    const metrics = caseData.answer_key?.final_metrics;
    if (!metrics) return null;

    return {
      npv: formatNumber(metrics.npv),
      irr: formatPercent(metrics.irr),
      terminalValue: formatNumber(metrics.terminal_value),
      validation: metrics.validation_status?.overall_validation || 'Unknown'
    };
  };

  const finalMetrics = getFinalMetrics();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isUnlocked ? (
            <Award className="w-5 h-5 text-yellow-500" />
          ) : (
            <Lock className="w-5 h-5 text-gray-400" />
          )}
          Detailed Financial Model - Answer Key
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {isUnlocked 
                ? 'Complete model with formulas and validation checks'
                : 'Submit your results to unlock the detailed answer key'
              }
            </p>
          </div>
          <Badge className={isUnlocked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
            {isUnlocked ? 'Unlocked' : 'Locked'}
          </Badge>
        </div>

        {finalMetrics && (
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Answer Key Metrics:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">NPV:</span>
                  <span className="font-medium">${finalMetrics.npv}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IRR:</span>
                  <span className="font-medium">{finalMetrics.irr}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Model Includes:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Complete 3-statement model</li>
                <li>• Revenue buildup schedule</li>
                <li>• DCF valuation with formulas</li>
                <li>• Step-by-step calculations</li>
                <li>• Validation methodology</li>
              </ul>
            </div>
          </div>
        )}

        <Button 
          onClick={handleDownload} 
          disabled={!isUnlocked}
          className="w-full"
        >
          {isUnlocked ? (
            <>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Download Complete Model (CSV)
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Submit Results to Unlock
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• This download contains the complete answer key with all formulas</p>
          <p>• Use it to understand exactly how the model was constructed</p>
          <p>• Compare your approach with the validated methodology</p>
          {userResults && <p>• Includes comparison with your submitted results</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailedModelDownload;
