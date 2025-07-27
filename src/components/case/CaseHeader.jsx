import React from 'react';
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function CaseHeader({ caseData }) {
  const getStatusConfig = (status) => {
    const configs = {
      generating: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Clock className="w-4 h-4" />,
        text: "Generating"
      },
      awaiting_results: {
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: <AlertCircle className="w-4 h-4" />,
        text: "Awaiting Results"
      },
      completed: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="w-4 h-4" />,
        text: "Completed"
      }
    };
    return configs[status] || configs.generating;
  };
  
  const statusConfig = getStatusConfig(caseData.status);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{caseData.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
            <span>{caseData.industry}</span>
            <span className="text-slate-300">|</span>
            <span>Created on {format(new Date(caseData.created_date), "MMMM d, yyyy")}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="text-base px-3 py-1">{caseData.type}</Badge>
          <Badge className={`${statusConfig.color} border text-base px-3 py-1 flex items-center gap-2`}>
            {statusConfig.icon}
            {statusConfig.text}
          </Badge>
        </div>
      </div>
    </div>
  );
}