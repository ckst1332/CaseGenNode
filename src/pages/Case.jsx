
import React, { useState, useEffect } from "react";
import { Case as CaseEntity } from "@/api/entities";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Download,
  Calculator,
  CheckCircle,
  AlertCircle,
  FileText,
  Building2,
  BarChart3,
} from "lucide-react";

import ProgressSteps from "../components/case/ProgressSteps";
import CaseHeader from "../components/case/CaseHeader";
import CollapsibleSection from "../components/case/CollapsibleSection";
import FinancialStatementsTemplate from "../components/case/FinancialStatementsTemplate";
import ResultsEntry from "../components/case/ResultsEntry";
import ResultsComparison from "../components/case/ResultsComparison";
import DetailedModelDownload from "../components/case/DetailedModelDownload";

export default function CasePage() {
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userResults, setUserResults] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserAndCase = async () => {
      setIsLoading(true);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const caseId = urlParams.get('id');
        if (!caseId) {
          setError("Case ID is required");
          setIsLoading(false);
          return;
        }

        const cases = await CaseEntity.filter({ id: caseId });
        if (cases.length === 0) {
          setError("Case not found");
          setIsLoading(false);
          return;
        }

        const case_data = cases[0];
        setCaseData(case_data);

        const initialResults = { npv: "", irr: "" };
        if (case_data.user_results) {
          initialResults.npv = case_data.user_results.npv?.toString() || "";
          // If IRR was stored as a decimal (0.XX), convert back to percentage for display (XX.X)
          initialResults.irr = case_data.user_results.irr ? (case_data.user_results.irr * 100).toFixed(1) : "";
        }
        setUserResults(initialResults);

        const user = await User.me();
        setCurrentUser(user);

      } catch (e) {
        console.error("Error loading case or user:", e);
        setError("Failed to load case data or user information.");
      }
      setIsLoading(false);
    };
    fetchUserAndCase();
  }, []);

  const submitResults = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const hasInputs = userResults.npv && userResults.irr;
      const resultsToSave = {
        npv: parseFloat(userResults.npv) || null,
        irr: parseFloat(userResults.irr) / 100 || null, // Convert percentage to decimal for saving
        submitted_at: new Date().toISOString()
      };

      const updatedCase = await CaseEntity.update(caseData.id, {
        status: "completed",
        user_results: resultsToSave
      });

      if (hasInputs) {
        const user = await User.me();
        await User.updateMyUserData({ cases_completed: (user.cases_completed || 0) + 1 });
      }
      setCaseData(updatedCase);
    } catch (e) {
      console.error("Error submitting results:", e);
      setError("Failed to submit results. Please try again.");
    }
    setIsSubmitting(false);
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8"><Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert></div>;
  if (!caseData) return null;

  const getCurrentStep = () => {
    if (caseData.status === "completed") return 5;
    if (caseData.status === "awaiting_results") return 3;
    return 2;
  };

  const showAnswerKeyContent = caseData.status === "completed";

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate(createPageUrl("Cases"))} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cases
        </Button>
        <ProgressSteps currentStep={getCurrentStep()} />
        <CaseHeader caseData={caseData} />
      </div>

      <div className="space-y-6">
        <CollapsibleSection title="Case Brief" icon={Building2} defaultOpen={true}
          helpText="Understand the company background and the core business problem."
        >
          <div className="prose max-w-none prose-slate p-4">
            <p className="lead">{caseData.company_description || 'No company description available.'}</p>
            
            {caseData.starting_point && (
              <div className="mt-6">
                <h4 className="font-semibold text-slate-900 mb-3">Year 0 Financial Baseline:</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 bg-blue-50 p-4 rounded-lg">
                  <div>
                    <p><strong>Current ARR:</strong> ${(caseData.starting_point.current_arr || 0).toFixed(1)}M</p>
                    <p><strong>Current Customers:</strong> {(caseData.starting_point.current_customers || 0).toLocaleString()}</p>
                    <p><strong>Current ARPU:</strong> ${(caseData.starting_point.current_arpu || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p><strong>Gross Margin:</strong> {((caseData.starting_point.current_gross_margin || 0) * 100).toFixed(1)}%</p>
                    <p><strong>S&M Expense:</strong> ${(caseData.starting_point.current_sales_marketing || 0).toFixed(1)}M</p>
                    <p><strong>R&D Expense:</strong> ${(caseData.starting_point.current_rd || 0).toFixed(1)}M</p>
                  </div>
                   <div>
                    <p><strong>Opening Cash:</strong> ${(caseData.starting_point.opening_cash || 0).toFixed(1)}M</p>
                    <p><strong>Opening PP&E:</strong> ${(caseData.starting_point.opening_ppe || 0).toFixed(1)}M</p>
                  </div>
                </div>
              </div>
            )}

            {caseData.assumptions?.operational_drivers && (
              <div className="mt-6">
                <h4 className="font-semibold text-slate-900 mb-3">Growth Assumptions for Your Model:</h4>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p><strong>Annual Churn Rate:</strong> {((caseData.assumptions.operational_drivers.annual_churn_rate || 0) * 100).toFixed(1)}%</p>
                      <p><strong>ARPU Growth Rate:</strong> {((caseData.assumptions.operational_drivers.arpu_growth_rate || 0) * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p><strong>S&M % of Revenue:</strong> {((caseData.assumptions.operational_drivers.sales_marketing_as_percent_revenue || 0) * 100).toFixed(1)}%</p>
                      <p><strong>R&D % of Revenue:</strong> {((caseData.assumptions.operational_drivers.rd_as_percent_revenue || 0) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  {caseData.assumptions.operational_drivers.customer_acquisition_growth && (
                    <div className="mt-3">
                      <p><strong>Net New Customers by Year:</strong> {caseData.assumptions.operational_drivers.customer_acquisition_growth.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Simplified Build Model Section */}
        <div className="space-y-6">
           {caseData.assumptions && (
            <FinancialStatementsTemplate caseData={caseData} />
          )}
          <ResultsEntry
            userResults={userResults}
            onResultsChange={setUserResults}
            onSubmit={submitResults}
            isSubmitting={isSubmitting}
            error={error}
            caseType={caseData.type}
          />
        </div>

        {showAnswerKeyContent && (
          <CollapsibleSection
            title="Your Solution"
            icon={BarChart3}
            defaultOpen={true}
            helpText="Review the AI-generated solution and download the detailed model."
          >
            <div className="p-4 space-y-6 bg-slate-50 rounded-b-lg">
              <ResultsComparison
                caseData={caseData}
                userResults={caseData.user_results || {}}
                answerKey={caseData.answer_key?.final_metrics || {}}
              />
              <DetailedModelDownload caseData={caseData} />
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}
