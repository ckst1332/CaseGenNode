import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

const getStatusConfig = (status) => {
  const configs = {
    generating: { text: "Generating", className: "bg-blue-100 text-blue-800" },
    awaiting_results: { text: "In Progress", className: "bg-amber-100 text-amber-800" },
    completed: { text: "Completed", className: "bg-green-100 text-green-800" }
  };
  return configs[status] || configs.generating;
};

export default function RecentCasesTable({ cases, isLoading }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Recent Cases</CardTitle>
          <Link to={createPageUrl("Cases")}>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No cases yet. Create your first case to get started!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((caseItem) => {
                const statusConfig = getStatusConfig(caseItem.status);
                return (
                  <TableRow key={caseItem.id}>
                    <TableCell className="font-medium">
                      {caseItem.name}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {caseItem.industry}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {format(new Date(caseItem.created_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig.className}>
                        {statusConfig.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to={createPageUrl(`Case?id=${caseItem.id}`)}>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                          {caseItem.status === 'completed' ? 'View' : 'Continue'}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}