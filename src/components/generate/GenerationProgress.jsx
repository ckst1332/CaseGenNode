import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";

export default function GenerationProgress({ step, caseType }) {
  const steps = [
    "Generating company scenario...",
    "Building & validating financial model...",
    "Creating case study...",
    "Finalizing and saving...",
    "Redirecting..."
  ];

  return (
    <Card className="w-full max-w-md text-center shadow-2xl">
      <CardHeader>
        <CardTitle>Generating {caseType} Case</CardTitle>
        <p className="text-slate-500">Our AI is building a comprehensive financial model with validation checks.</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((text, index) => (
            <div key={index} className="flex items-center gap-3">
              {step > index + 1 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : step === index + 1 ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
              )}
              <span className={`transition-colors ${step >= index + 1 ? 'text-slate-800' : 'text-slate-500'}`}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}