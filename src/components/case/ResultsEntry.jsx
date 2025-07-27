
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, Save, AlertCircle, Loader2 } from "lucide-react";

export default function ResultsEntry({ userResults, onResultsChange, onSubmit, isSubmitting, error, caseType }) {
  const handleInputChange = (metric, value) => {
    onResultsChange(prev => ({ ...prev, [metric]: value }));
  };

  const fields = [
    { key: 'npv', label: 'NPV' },
    { key: 'irr', label: 'Internal Rate of Return (IRR)' },
  ];

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          Enter Your Final Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid md:grid-cols-2 gap-6">
          {fields.map(field => (
             <div className="space-y-2" key={field.key}>
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type="number"
                  step="0.01"
                  value={userResults[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.key === 'npv' ? 'e.g., 125,000,000' : 'e.g., 14.2'}
                  className="text-base"
                />
                <p className="text-xs text-slate-500">
                  {field.key === 'npv' ? 'Enter in full dollar amount (e.g., 125000000 for $125M)' : 'Enter as a percentage (e.g., 14.2 for 14.2%)'}
                </p>
              </div>
          ))}
        </div>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="mt-6 w-full md:w-auto bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save &amp; Reveal Results
        </Button>
      </CardContent>
    </Card>
  );
}
