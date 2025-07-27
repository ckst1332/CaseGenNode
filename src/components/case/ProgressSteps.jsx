import React from 'react';
import { CheckCircle, Circle } from "lucide-react";

export default function ProgressSteps({ currentStep }) {
  const steps = [
    { id: 1, name: "Generate Case", status: currentStep >= 1 ? 'completed' : 'upcoming' },
    { id: 2, name: "Review Assumptions", status: currentStep >= 2 ? 'completed' : currentStep === 2 ? 'current' : 'upcoming' },
    { id: 3, name: "Build Model", status: currentStep >= 3 ? 'completed' : currentStep === 3 ? 'current' : 'upcoming' },
    { id: 4, name: "Compare & Score", status: currentStep >= 4 ? 'completed' : currentStep === 4 ? 'current' : 'upcoming' },
    { id: 5, name: "Debrief & Download", status: currentStep >= 5 ? 'completed' : currentStep === 5 ? 'current' : 'upcoming' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200 mb-6">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step.status === 'completed' 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : step.status === 'current'
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-white border-gray-300 text-gray-500'
              }`}>
                {step.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>
              <span className={`ml-3 text-sm font-medium hidden md:block ${
                step.status === 'current' ? 'text-blue-600' : step.status === 'completed' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 mx-4 h-0.5 ${
                step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}