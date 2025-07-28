import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import Layout from "../src/pages/Layout";
import CasesTable from "../src/components/cases/CasesTable";
import CasesGrid from "../src/components/cases/CasesGrid";
import CaseFilters from "../src/components/cases/CaseFilters";

// Import centralized API client
import { Case } from '../lib/api/client';

export default function Cases() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (session) {
      loadCases();
    }
  }, [session, status, router]);

  useEffect(() => {
    filterCases();
  }, [cases, searchTerm, statusFilter]);

  const loadCases = async () => {
    setIsLoading(true);
    try {
      const data = await Case.list("-created_date");
      setCases(data || []);
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

    setFilteredCases(filtered);
  };

  if (status === 'loading') {
    return (
      <Layout currentPageName="Cases">
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Layout currentPageName="Cases">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Cases</h1>
            <p className="text-slate-600">
              Manage and review your generated case studies.
            </p>
          </div>
          
          <Link href="/generate">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Generate New Case
            </Button>
          </Link>
        </div>

        {cases.length === 0 && !isLoading ? (
          <Card className="border-dashed border-2 border-slate-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No cases yet</h3>
              <p className="text-slate-600 text-center mb-6 max-w-sm">
                Get started by generating your first financial modeling case study.
              </p>
              <Link href="/generate">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Your First Case
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <CaseFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              viewMode={viewMode}
              setViewMode={setViewMode}
              totalCases={cases.length}
              filteredCount={filteredCases.length}
            />

            {viewMode === "grid" ? (
              <CasesGrid cases={filteredCases} isLoading={isLoading} />
            ) : (
              <CasesTable cases={filteredCases} isLoading={isLoading} />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
