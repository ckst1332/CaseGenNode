import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

export default function CasesTable({ cases }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Case Name</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created On</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((case_item) => {
             const statusConfig = getStatusConfig(case_item.status);
             return (
              <TableRow key={case_item.id}>
                <TableCell className="font-medium">{case_item.name}</TableCell>
                <TableCell>{case_item.industry}</TableCell>
                <TableCell>
                  <Badge>{case_item.type}</Badge>
                </TableCell>
                <TableCell>
                   <Badge className={`${statusConfig.color} border flex items-center gap-1 w-fit`}>
                        {statusConfig.icon}
                        {statusConfig.text}
                    </Badge>
                </TableCell>
                <TableCell>{format(new Date(case_item.created_date), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <Link to={createPageUrl(`Case?id=${case_item.id}`)}>
                    <Button variant="outline" size="sm">
                        View <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
             )
          })}
        </TableBody>
      </Table>
    </div>
  );
}