import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, AlertCircle, Cpu, Loader2, Building, Clock } from "lucide-react";
import Layout from "../src/pages/Layout";
import GenerationProgress from "../src/components/generate/GenerationProgress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import API functions
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
  create: (data) => apiClient.request('/cases', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

const User = {
  me: () => apiClient.request('/users/me'),
  updateMyUserData: (data) => apiClient.request('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
};

const InvokeLLM = (payload) => apiClient.request('/integrations/invoke-llm', {
  method: 'POST',
  body: JSON.stringify(payload)
});

// Case generation prompts and schemas (simplified version)
const getCasePrompt = (industry) => {
  const basePrompt = `
    You are a world-class financial modeling instructor creating a realistic SaaS DCF case study. Your output MUST be financially plausible and represent a typical growing SaaS business.

    **Critical Reality Constraints:**
    - Target IRR should be 15-25% (realistic for SaaS growth companies)
    - Revenue growth should start high but moderate over time
    - Gross margins should be 75-85% (typical for SaaS)
    - Operating margins should improve over time but remain realistic

    **Required Output Structure:**
    1. **Company Narrative:** Create a compelling SaaS company story
    2. **Starting Point (Year 0 Baseline):** Provide current state metrics
    3. **Growth Assumptions:** Explicit growth rates and operational assumptions
    4. **Financial Parameters:** WACC, tax rate, terminal growth rate

    Create a realistic ${industry} company scenario with all necessary financial parameters.
  `;

  const schema = {
    type: "object",
    properties: {
      company_name: { type: "string" },
      company_description: { type: "string" },
      starting_point: {
        type: "object",
        properties: {
          current_arr: { type: "number" },
          current_customers: { type: "number" },
          current_arpu: { type: "number" },
          gross_margin_percent: { type: "number" }
        }
      },
      assumptions: {
        type: "object",
        properties: {
          growth_rate_year_1: { type: "number" },
          growth_rate_year_2: { type: "number" },
          growth_rate_year_3: { type: "number" },
          churn_rate: { type: "number" },
          wacc: { type: "number" }
        }
      }
    }
  };

  return { prompt: basePrompt, schema };
};

const generateFinancialModelPrompt = (caseData) => {
  const prompt = `
    Based on the following company data, generate a complete 5-year DCF financial model:
    
    Company: ${caseData.name}
    Description: ${caseData.company_description}
    Starting ARR: ${caseData.starting_point?.current_arr}
    
    Calculate projected financials for 5 years including:
    - Revenue projections
    - Operating expenses
    - EBITDA
    - Free cash flows
    - Terminal value
    - Enterprise value
    - Equity value
  `;

  const schema = {
    type: "object",
    properties: {
      projections: {
        type: "array",
        items: {
          type: "object",
          properties: {
            year: { type: "number" },
            revenue: { type: "number" },
            operating_expenses: { type: "number" },
            ebitda: { type: "number" },
            free_cash_flow: { type: "number" }
          }
        }
      },
      terminal_value: { type: "number" },
      enterprise_value: { type: "number" },
      equity_value: { type: "number" }
    }
  };

  return { prompt, schema };
};

export default function Generate() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [error, setError] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("");

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (session) {
      loadUser();
    }
  }, [session, status, router]);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleGenerateClick = () => {
    if (!selectedIndustry) {
      setError("Please select an industry before generating a case study.");
      return;
    }
    
    if (!user?.credits_remaining || user.credits_remaining <= 0) {
      setShowUpgradeModal(true);
      return;
    }
    generateCase();
  };

  const generateCase = async () => {
    setIsGenerating(true);
    setError(null);
    const industry = selectedIndustry;

    try {
      // Step 1: Generate company scenario
      setGenerationStep(1);
      const caseGen = getCasePrompt(industry);
      const scenarioResult = await InvokeLLM({
        prompt: caseGen.prompt,
        response_json_schema: caseGen.schema,
      });

      // Step 2: Build financial model
      setGenerationStep(2);
      const caseName = `${scenarioResult.company_name} DCF Analysis`;
      
      const tempCaseData = { 
        name: caseName, 
        company_description: scenarioResult.company_description,
        starting_point: scenarioResult.starting_point,
        assumptions: scenarioResult.assumptions
      };
      
      const answerKeyGen = generateFinancialModelPrompt(tempCaseData);
      const calculationResult = await InvokeLLM({
        prompt: answerKeyGen.prompt,
        response_json_schema: answerKeyGen.schema,
      });

      // Step 3: Create case
      setGenerationStep(3);
      const newCase = await Case.create({
        name: caseName,
        type: "DCF",
        status: "completed", // Mark as completed since we have the full model
        industry: industry,
        company_description: scenarioResult.company_description,
        starting_point: scenarioResult.starting_point,
        assumptions: scenarioResult.assumptions,
        answer_key: calculationResult,
        answer_key_excel: null,
      });

      // Decrement user credits
      await User.updateMyUserData({ credits_remaining: (user.credits_remaining || 0) - 1 });

      // Step 4: Navigate to case
      setGenerationStep(4); 
      setTimeout(() => {
        router.push(`/case?id=${newCase.id}`);
      }, 2000); // Increased timeout to ensure user sees completion

    } catch (err) {
      console.error("Error generating case:", err);
      let errorMessage = "Failed to generate case. Please try again.";
      if (err.response?.data?.detail) {
        errorMessage = `An error occurred: ${err.response.data.detail}`;
      } else if (err.message) {
        errorMessage = `An error occurred: ${err.message}`;
      }
      setError(errorMessage);
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  if (status === 'loading') {
    return (
      <Layout currentPageName="Generate">
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  if (isGenerating) {
    return (
      <Layout currentPageName="Generate">
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <GenerationProgress step={generationStep} caseType="DCF" />
        </div>
      </Layout>
    );
  }

  const industries = [
    { 
      id: "technology", 
      name: "Technology (SaaS)", 
      enabled: true,
      description: "Software-as-a-Service companies with recurring revenue models"
    },
    { 
      id: "infrastructure", 
      name: "Infrastructure & Utilities", 
      enabled: false,
      description: "Coming soon - Infrastructure and utility companies"
    },
    { 
      id: "industrials", 
      name: "Industrials & Manufacturing", 
      enabled: false,
      description: "Coming soon - Industrial and manufacturing businesses"
    }
  ];

  return (
    <Layout currentPageName="Generate">
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="bg-white p-10 rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
              <Cpu className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
            Generate New Case Study
          </h1>
          <p className="text-slate-600 text-lg mb-8">
            Create a realistic DCF modeling challenge with AI-generated scenarios and calculations.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-6 text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Industry Selection */}
          <Card className="mb-6 text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Select Industry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {industries.map((industry) => (
                <div key={industry.id} className="relative">
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      industry.enabled 
                        ? selectedIndustry === industry.name
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-slate-300'
                        : 'border-slate-100 bg-slate-50 cursor-not-allowed'
                    }`}
                    onClick={() => industry.enabled && setSelectedIndustry(industry.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-medium ${industry.enabled ? 'text-slate-900' : 'text-slate-400'}`}>
                          {industry.name}
                        </h4>
                        <p className={`text-sm ${industry.enabled ? 'text-slate-600' : 'text-slate-400'}`}>
                          {industry.description}
                        </p>
                      </div>
                      {!industry.enabled && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">Coming Soon</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {user && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-600">
                Credits remaining: <span className="font-semibold text-slate-900">{user.credits_remaining || 0}</span>
              </p>
            </div>
          )}

          <Button
            onClick={handleGenerateClick}
            disabled={isGenerating || !selectedIndustry}
            className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Generate Case Study
              </>
            )}
          </Button>
        </div>
      </div>

      <AlertDialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No Credits Remaining</AlertDialogTitle>
            <AlertDialogDescription>
              You've used all your credits for this billing period. Upgrade your plan to generate more cases.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/account")}>
              Upgrade Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
