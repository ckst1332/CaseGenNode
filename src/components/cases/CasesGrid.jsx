import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

const getStatusConfig = (status) => {
    const configs = {
        generating: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: <Clock className="w-3 h-3" />, text: "Generating" },
        awaiting_results: { color: "bg-amber-100 text-amber-800 border-amber-200", icon: <AlertCircle className="w-3 h-3" />, text: "Awaiting Results" },
        completed: { color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle className="w-3 h-3" />, text: "Completed" }
    };
    return configs[status] || configs.generating;
};

export default function CasesGrid({ cases }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cases.map((case_item) => {
        const statusConfig = getStatusConfig(case_item.status);
        return (
          <Card key={case_item.id} className="shadow-lg border-0 flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg">{case_item.name}</CardTitle>
                  <Badge className="text-xs shrink-0">{case_item.type}</Badge>
              </div>
              <p className="text-sm text-slate-500">{case_item.industry}</p>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                    {case_item.company_description}
                </p>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                    <Badge className={`${statusConfig.color} border flex items-center gap-1`}>
                        {statusConfig.icon}
                        {statusConfig.text}
                    </Badge>
                    <span className="text-xs text-slate-500">
                        {format(new Date(case_item.created_date), "MMM d, yyyy")}
                    </span>
                </div>
                <Link to={createPageUrl(`Case?id=${case_item.id}`)}>
                  <Button className="w-full">
                    View Case <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}