import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  RotateCcw
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentCases({ cases, isLoading, onRefresh }) {
  const getStatusConfig = (status) => {
    const configs = {
      generating: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Clock className="w-3 h-3" />,
        text: "Generating"
      },
      awaiting_results: {
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: <AlertCircle className="w-3 h-3" />,
        text: "Awaiting Results"
      },
      completed: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="w-3 h-3" />,
        text: "Completed"
      }
    };
    return configs[status] || configs.generating;
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Recent Cases
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="text-slate-500 hover:text-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No cases yet</p>
            <Link to={createPageUrl("Generate")}>
              <Button className="mt-3 bg-blue-600 hover:bg-blue-700">
                Generate Your First Case
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.slice(0, 5).map((case_item) => {
              const statusConfig = getStatusConfig(case_item.status);
              
              return (
                <div
                  key={case_item.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">
                        {case_item.name}
                      </h4>
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                        {case_item.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {case_item.industry} • {format(new Date(case_item.created_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${statusConfig.color} border flex items-center gap-1`}>
                      {statusConfig.icon}
                      {statusConfig.text}
                    </Badge>
                    <Link to={createPageUrl(`Case?id=${case_item.id}`)}>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}