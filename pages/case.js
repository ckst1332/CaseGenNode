import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { safeDate } from '../lib/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Download,
  Building,
  TrendingUp,
  Calculator,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  Award,
  Target
} from "lucide-react";
import Link from "next/link";
import Layout from "../src/pages/Layout";

// Import new components
import FinancialStatementsTemplate from "../components/case/FinancialStatementsTemplate";
import ResultsEntry from "../components/case/ResultsEntry";
import ResultsComparison from "../components/case/ResultsComparison";
import DetailedModelDownload from "../components/case/DetailedModelDownload";

// API Client
const apiClient = {
  request: async (path, options = {}) => {
    try {
      const response = await fetch(`/api${path}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        ...options
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API Error ${response.status}: ${text || response.statusText}`);
      }
      
      if (response.status === 204) return null;
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
};

const Case = {
  get: (id) => apiClient.request(`/cases/${id}`),
  downloadTemplate: (id) => apiClient.request(`/cases/${id}/download-template`),
  downloadSolution: (id) => apiClient.request(`/cases/${id}/download-solution`),
};

const getStatusConfig = (status) => {
  const configs = {
    generating: { 
      text: "Generating", 
      className: "bg-blue-100 text-blue-800",
      icon: Clock
    },
    awaiting_results: { 
      text: "Ready to Work", 
      className: "bg-amber-100 text-amber-800",
      icon: Calculator
    },
    completed: { 
      text: "Completed", 
      className: "bg-green-100 text-green-800",
      icon: CheckCircle
    },
  };
  return configs[status] || configs.generating;
};

export default function CaseDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [caseData, setCaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [downloadingSolution, setDownloadingSolution] = useState(false);
  const [submittingResults, setSubmittingResults] = useState(false);
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState('template');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (session && id) {
      loadCase();
    }
  }, [session, status, router, id]);

  // No aggressive auto-refresh - only load when component mounts or id changes

  const loadCase = async () => {
    setIsLoading(true);
    try {
      const data = await Case.get(id);
      setCaseData(data);
    } catch (error) {
      console.error("Error loading case:", error);
    }
    setIsLoading(false);
  };

  // Determine current workflow step based on case data
  useEffect(() => {
    if (caseData) {
      if (caseData.user_results) {
        setCurrentWorkflowStep('completed');
      } else if (caseData.answer_key) {
        setCurrentWorkflowStep('submit_results');
      } else {
        setCurrentWorkflowStep('template');
      }
    }
  }, [caseData]);

  const handleResultsSubmit = async (userResults) => {
    setSubmittingResults(true);
    try {
      // Update case with user results via API
      const response = await apiClient.request(`/cases/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          user_results: userResults,
          status: 'completed'
        })
      });
      
      setCaseData(response);
      setCurrentWorkflowStep('completed');
      
    } catch (error) {
      console.error("Error submitting results:", error);
      alert("Error submitting results. Please try again.");
    }
    setSubmittingResults(false);
  };

  const handleTemplateDownload = async () => {
    setDownloadingTemplate(true);
    try {
      // Download template using FinancialStatementsTemplate component logic
      setCurrentWorkflowStep('submit_results');
    } catch (error) {
      console.error("Error downloading template:", error);
    }
    setDownloadingTemplate(false);
  };

  const handleDownloadSolution = async () => {
    setDownloadingSolution(true);
    try {
      // This would be handled by DetailedModelDownload component
      console.log("Solution download handled by DetailedModelDownload component");
    } catch (error) {
      console.error("Error downloading solution:", error);
    }
    setDownloadingSolution(false);
  };

  if (status === 'loading' || isLoading) {
    return (
      <Layout currentPageName="Case">
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!session || !caseData) {
    return (
      <Layout currentPageName="Case">
        <div className="min-h-screen flex items-center justify-center">
          <div>Case not found</div>
        </div>
      </Layout>
    );
  }

  const statusConfig = getStatusConfig(caseData.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Layout currentPageName="Case">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <Link href="/cases" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Cases
        </Link>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{caseData.name}</h1>
              <div className="flex items-center gap-4">
                <Badge className={statusConfig.className}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig.text}
                </Badge>
                <span className="text-slate-600">{caseData.industry}</span>
                <span className="text-slate-600">
                  Created {safeDate(caseData.created_at || caseData.created_date, 'Recently')}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleDownloadTemplate}
                disabled={downloadingTemplate}
                variant="outline"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                {downloadingTemplate ? 'Downloading...' : 'Download Template'}
              </Button>
              
              {caseData.status === 'completed' && (
                <Button 
                  onClick={handleDownloadSolution}
                  disabled={downloadingSolution}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloadingSolution ? 'Downloading...' : 'Download Solution'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Workflow-based Content */}
        <div className="space-y-6">
          {/* Company Information - Always Visible */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed mb-4">
                {caseData.company_description || 'No description available.'}
              </p>
              
              {/* Quick Facts Grid */}
              <div className="grid md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-slate-600">Starting ARR</div>
                  <div className="font-semibold text-lg">
                    ${(caseData.starting_point?.current_arr || 0).toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-600">WACC</div>
                  <div className="font-semibold text-lg">
                    {((caseData.assumptions?.financial_assumptions?.wacc || 0) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-600">Industry</div>
                  <div className="font-semibold text-lg">{caseData.industry}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Template Phase */}
          {currentWorkflowStep === 'template' && (
            <FinancialStatementsTemplate 
              caseData={caseData} 
              onDownload={handleTemplateDownload}
            />
          )}

          {/* Step 2: Results Entry Phase */}
          {currentWorkflowStep === 'submit_results' && (
            <ResultsEntry 
              caseData={caseData}
              onResultsSubmit={handleResultsSubmit}
              isSubmitting={submittingResults}
            />
          )}

          {/* Step 3: Completed Phase */}
          {currentWorkflowStep === 'completed' && caseData.user_results && caseData.answer_key && (
            <div className="space-y-6">
              <ResultsComparison 
                userResults={caseData.user_results}
                answerKey={caseData.answer_key}
                caseData={caseData}
              />
              
              <DetailedModelDownload 
                caseData={caseData}
                userResults={caseData.user_results}
                isUnlocked={true}
              />
            </div>
          )}
        </div>

        {/* Sidebar with Case Details and Quick Actions */}
        <div className="grid lg:grid-cols-4 gap-6 mt-8">
          <div className="lg:col-span-3">
            {/* Starting Point Details */}
            {caseData.starting_point && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Starting Point (Year 0)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(caseData.starting_point).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-600 capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {typeof value === 'number' ? 
                            (key.includes('percent') ? `${(value * 100).toFixed(1)}%` : value.toLocaleString()) : 
                            value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Case Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleDownloadTemplate}
                  disabled={downloadingTemplate}
                  className="w-full"
                  variant="outline"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                
                {caseData.status === 'completed' && (
                  <Button 
                    onClick={handleDownloadSolution}
                    disabled={downloadingSolution}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Solution
                  </Button>
                )}

                <Separator className="my-4" />
                
                <p className="text-sm text-slate-600">
                  Use the template to build your financial model, then compare with the solution.
                </p>
              </CardContent>
            </Card>

            {/* Case Details */}
            <Card>
              <CardHeader>
                <CardTitle>Case Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Type</span>
                  <span className="font-semibold text-slate-900">{caseData.type || 'DCF'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Industry</span>
                  <span className="font-semibold text-slate-900">{caseData.industry}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Created</span>
                  <span className="font-semibold text-slate-900">
                    {safeDate(caseData.created_at || caseData.created_date, 'Recently')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Status</span>
                  <Badge className={statusConfig.className}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.text}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
