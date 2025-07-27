import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DashboardHeader({ user }) {
  const firstName = user?.full_name ? user.full_name.split(' ')[0] : '';

  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Welcome back{firstName ? `, ${firstName}` : ''}!
        </h1>
        <p className="text-slate-600">
          Continue your financial modeling journey or create a new case.
        </p>
      </div>
      
      <div className="flex gap-3">
        <Link to={createPageUrl("Generate")}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Generate New Case
          </Button>
        </Link>
        <Link to={createPageUrl("Cases")}>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Browse Cases
          </Button>
        </Link>
      </div>
    </div>
  );
}