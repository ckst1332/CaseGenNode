import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Award, Lock, FileSpreadsheet, TrendingUp, Calculator } from 'lucide-react';
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

  const handleDownload = async () => {
    if (!isUnlocked) {
      alert('Please submit your results first to unlock the detailed model download.');
      return;
    }

    try {
      // Use the XLSX download endpoint
      const response = await fetch(`/api/cases/${caseData.id}/download-solution?format=xlsx`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${caseData.company_name || caseData.name || 'case'}_solution.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file. Please try again.');
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
          Professional Financial Model - Complete Answer Key
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {isUnlocked 
                ? 'Institutional-grade 3-statement model with formulas and validation'
                : 'Submit your results to unlock the comprehensive answer key'
              }
            </p>
          </div>
          <Badge className={isUnlocked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
            {isUnlocked ? 'Unlocked' : 'Locked'}
          </Badge>
        </div>

        {finalMetrics && (
          <div className="grid md:grid-cols-2 gap-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Answer Key Metrics
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-white rounded border">
                  <span className="text-gray-600">NPV:</span>
                  <span className="font-bold text-lg text-green-600">${finalMetrics.npv}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded border">
                  <span className="text-gray-600">IRR:</span>
                  <span className="font-bold text-lg text-blue-600">{finalMetrics.irr}</span>
                </div>
                {finalMetrics.terminalValue && (
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-gray-600">Terminal Value:</span>
                    <span className="font-medium">${finalMetrics.terminalValue}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Excel Workbook Includes
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Executive Summary with key metrics
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Complete 3-statement model (P&L, BS, CF)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Year 0 baseline with 5-year projections
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  DCF valuation with terminal value
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Formula explanations for each metric
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Professional formatting & styling
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Enhanced Model Details */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="font-medium text-blue-800 mb-2">📊 Multiple Worksheets</h5>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Executive Summary</li>
              <li>• Income Statement</li>
              <li>• Balance Sheet</li>
              <li>• Cash Flow Statement</li>
              <li>• DCF Valuation</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h5 className="font-medium text-green-800 mb-2">🎨 Professional Format</h5>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Color-coded tabs</li>
              <li>• Currency formatting</li>
              <li>• Percentage formats</li>
              <li>• Borders & styling</li>
              <li>• Optimized columns</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h5 className="font-medium text-purple-800 mb-2">🔧 Advanced Features</h5>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Statement interconnections</li>
              <li>• Working capital flow</li>
              <li>• Balance sheet balancing</li>
              <li>• Terminal growth calc</li>
              <li>• Validation checks</li>
            </ul>
          </div>
        </div>

        <Button 
          onClick={handleDownload} 
          disabled={!isUnlocked}
          className="w-full h-12 text-lg font-semibold"
          size="lg"
        >
          {isUnlocked ? (
            <>
              <FileSpreadsheet className="w-5 h-5 mr-3" />
              Download Professional Excel Model (XLSX)
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 mr-3" />
              Submit Results to Unlock Professional Model
            </>
          )}
        </Button>

        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h5 className="font-medium text-yellow-800 mb-2">💡 How to Use This Model</h5>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• <strong>Study the formulas:</strong> Understand the calculation methodology used</p>
            <p>• <strong>Compare your approach:</strong> See how your model differs from the validated solution</p>
            <p>• <strong>Learn best practices:</strong> Notice the professional formatting and structure</p>
            <p>• <strong>Use as reference:</strong> Apply these techniques to future financial models</p>
            {userResults && <p>• <strong>Review variances:</strong> Understand why your results differed</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailedModelDownload;
