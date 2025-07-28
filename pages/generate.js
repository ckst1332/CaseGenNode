import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, AlertCircle, Cpu, Loader2, Download } from "lucide-react";
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

// Import advanced AI logic
import { getCasePrompt, validateCaseRealism } from '../lib/ai/case-prompts';
import { generateFinancialModelPrompt, validateFinancialModel } from '../lib/ai/financial-model-prompts';
import { generateFullModelCsv, downloadCsv } from '../lib/utils/data-processing';

// Import standardized API client
import { Case, User, InvokeLLM, withRetry } from '../lib/api/client';

export default function GenerateEnhanced() {
  const router = useRouter();
  const { data: session } = useSession();
  
  // Enhanced state management
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Advanced features
  const [modelData, setModelData] = useState(null);
  const [downloadReady, setDownloadReady] = useState(false);
  const [validationResults, setValidationResults] = useState(null);

  // Enhanced user data fetching with error handling
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("Attempting to fetch user data...", session?.user);
        const userData = await withRetry(() => User.me(), 3, 1000);
        console.log("User data loaded successfully:", userData);
        setUser(userData);
        setError(null); // Clear any previous errors
      } catch (e) {
        console.error("Failed to load user:", e);
        
        // Provide more specific error messages based on the error type
        let errorMessage = "Failed to load user data. Please refresh the page.";
        
        if (e.message?.includes('401') || e.status === 401) {
          errorMessage = "Please log in to access this page.";
          // Redirect to login if unauthorized
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else if (e.message?.includes('500') || e.status >= 500) {
          errorMessage = "Server error. Please try again in a moment.";
        } else if (e.message?.includes('network') || !navigator.onLine) {
          errorMessage = "Network error. Please check your internet connection.";
        }
        
        setError(errorMessage);
      }
    };
    
    if (session?.user) {
      fetchUser();
    } else if (session === null) {
      // Session is explicitly null (not loading), user needs to log in
      setError("Please log in to generate cases.");
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
    // If session is undefined, we're still loading, so don't show error yet
  }, [session, router]);

  const handleGenerateClick = async () => {
    if (!user) {
      setError("Please log in to generate a case.");
      return;
    }
    if ((user.credits_remaining || 0) <= 0) {
      setShowUpgradeModal(true);
      return;
    }
    generateCase();
  };

  const generateCase = async () => {
    setIsGenerating(true);
    setError(null);
    setValidationResults(null);
    const industry = "Technology (SaaS)";

    try {
      // Step 1: Generate company scenario using advanced prompt
      setGenerationStep(1);
      const caseGen = getCasePrompt(industry);
      const scenarioResult = await withRetry(() => InvokeLLM({
        prompt: caseGen.prompt,
        response_json_schema: caseGen.schema,
      }), 2, 2000);

      // Validate case realism
      const caseValidation = validateCaseRealism(scenarioResult);
      if (!caseValidation.isRealistic) {
        console.warn("Case generation warnings:", caseValidation.warnings);
      }

      // Step 2: Build comprehensive financial model
      setGenerationStep(2);
      const caseName = `${scenarioResult.company_name} DCF Analysis`;
      
      const tempCaseData = { 
        name: caseName, 
        company_description: scenarioResult.company_description,
        starting_point: scenarioResult.starting_point,
        assumptions: scenarioResult.assumptions
      };
      
      // Use advanced financial model generation
      const answerKeyGen = generateFinancialModelPrompt(tempCaseData);
      const calculationResult = await withRetry(() => InvokeLLM({
        prompt: answerKeyGen.prompt,
        response_json_schema: answerKeyGen.schema,
      }), 2, 2000);

      // Validate financial model
      const modelValidation = validateFinancialModel(calculationResult);
      setValidationResults(modelValidation);
      
      if (!modelValidation.isValid) {
        console.error("Model validation errors:", modelValidation.errors);
        setError(`Model validation failed: ${modelValidation.errors.join(', ')}`);
        setIsGenerating(false);
        setGenerationStep(0);
        return;
      }

      // Step 3: Create case with comprehensive data
      setGenerationStep(3);
      const newCase = await withRetry(() => Case.create({
        name: caseName,
        type: "DCF",
        status: "awaiting_results",
        industry: industry,
        company_description: scenarioResult.company_description,
        starting_point: scenarioResult.starting_point,
        assumptions: scenarioResult.assumptions,
        answer_key: calculationResult,
        answer_key_excel: null,
      }), 2, 1000);

      // Store model data for CSV download
      const completeModelData = {
        ...tempCaseData,
        answer_key: calculationResult
      };
      setModelData(completeModelData);
      setDownloadReady(true);

      // Update user credits with retry
      await withRetry(() => User.updateMyUserData({ 
        credits_remaining: (user.credits_remaining || 0) - 1 
      }), 3, 1000);

      // Update local user state
      setUser(prev => ({
        ...prev,
        credits_remaining: (prev.credits_remaining || 0) - 1
      }));

      // Step 4: Navigate to case
      setGenerationStep(4);
      setTimeout(() => {
        router.push(`/case?id=${newCase.id}`);
      }, 1000);

    } catch (err) {
      console.error("Error generating case:", err);
      let errorMessage = "Failed to generate case. The AI may have returned an invalid format or encountered an issue. Please try again.";
      
      if (err.message.includes('API Error')) {
        errorMessage = `API Error: ${err.message}`;
      } else if (err.response && err.response.data && err.response.data.detail) {
        errorMessage = `An error occurred: ${err.response.data.detail}`;
      } else if (err.message) {
        errorMessage = `An error occurred: ${err.message}`;
      }
      
      setError(errorMessage);
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  const handleDownloadModel = () => {
    if (!modelData) {
      setError("No model data available for download.");
      return;
    }
    
    try {
      const csvContent = generateFullModelCsv(modelData);
      const filename = `${modelData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_complete_model.csv`;
      downloadCsv(csvContent, filename);
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to generate CSV download. Please try again.");
    }
  };

  // Enhanced loading state with progress
  if (isGenerating) {
    return (
      <Layout currentPageName="Generate">
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <GenerationProgress step={generationStep} caseType="DCF" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPageName="Generate">
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="bg-white p-10 rounded-2xl shadow-2xl border border-slate-200 max-w-lg">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
              <Cpu className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
            Generate New Case
          </h1>
          <p className="text-slate-600 text-lg mb-8">
            Create a new, realistic DCF modeling challenge for a SaaS company with advanced AI validation.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-6 text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {validationResults && validationResults.warnings.length > 0 && (
            <Alert className="mb-6 text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Model generated with warnings: {validationResults.warnings.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleGenerateClick}
              disabled={isGenerating || !user}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-base font-bold py-7"
            >
              {isGenerating ? (
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              ) : (
                <Zap className="w-6 h-6 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Case Study'}
            </Button>

            {downloadReady && (
              <Button
                onClick={handleDownloadModel}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Complete Model (CSV)
              </Button>
            )}
          </div>

          <p className="text-sm text-slate-500 mt-4">
            Credits remaining: {user ? (user.credits_remaining || 0) : '...'}
          </p>
          
          {user && user.credits_remaining <= 3 && user.credits_remaining > 0 && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ Running low on credits
            </p>
          )}
        </div>
      </div>

      <AlertDialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Out of Credits?</AlertDialogTitle>
            <AlertDialogDescription>
              Upgrade to the Basic plan for 15 fresh cases every month and unlock full model downloads with advanced AI validation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Maybe Later</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/account")}>
              Go Basic – $12/mo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
} 