import React, { useState, useEffect } from "react";
import { Case } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import CasesTable from "../components/cases/CasesTable";
import CasesGrid from "../components/cases/CasesGrid";
import CaseFilters from "../components/cases/CaseFilters";

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [cases, searchTerm, statusFilter]);

  const loadCases = async () => {
    setIsLoading(true);
    try {
      const data = await Case.list("-created_date");
      setCases(data);
    } catch (error) {
      console.error("Error loading cases:", error);
    }
    setIsLoading(false);
  };

  const filterCases = () => {
    let filtered = cases;

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.industry?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    // Only DCF cases exist now, so no type filter needed.

    setFilteredCases(filtered);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
            My Cases
          </h1>
          <p className="text-slate-600 text-lg">
            Track your financial modeling progress and results
          </p>
        </div>
        <Link to={createPageUrl("Generate")}>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="w-5 h-5 mr-2" />
            Generate New Case
          </Button>
        </Link>
      </div>

      <CaseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCases={filteredCases.length}
      />

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-slate-200 rounded" />
            </Card>
          ))}
        </div>
      ) : filteredCases.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {cases.length === 0 ? "No cases yet" : "No cases match your filters"}
            </h3>
            <p className="text-slate-600 mb-6">
              {cases.length === 0 
                ? "Get started by generating your first financial modeling case"
                : "Try adjusting your search or filter criteria"
              }
            </p>
            {cases.length === 0 && (
              <Link to={createPageUrl("Generate")}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate First Case
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <CasesGrid cases={filteredCases} />
      ) : (
        <CasesTable cases={filteredCases} />
      )}
    </div>
  );
}