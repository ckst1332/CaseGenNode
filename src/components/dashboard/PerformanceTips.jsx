import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, RefreshCcw, Lightbulb } from "lucide-react";
import { InvokeLLM } from "@/api/integrations";

const prompt = `
Generate 3 unique and actionable tips for a financial analyst looking to improve their DCF valuation skills. 
The tips should be concise (one sentence each) and focus on practical, non-obvious advice. 
Avoid generic tips like "double-check your work."

Example of good tips:
- Stress-test your terminal growth rate and WACC to understand valuation sensitivity to key assumptions.
- Normalize non-recurring expenses from your historical data to get a cleaner, more accurate free cash flow projection.
- Justify your choice of a terminal multiple by comparing it against the implied exit multiple from the perpetuity growth method.
`;

const schema = {
  type: "object",
  properties: {
    tips: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["tips"]
};

export default function PerformanceTips() {
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTips = async () => {
    setIsLoading(true);
    try {
      const result = await InvokeLLM({
        prompt: prompt,
        response_json_schema: schema,
      });
      if (result && result.tips) {
        setTips(result.tips);
      }
    } catch (error) {
      console.error("Error fetching performance tips:", error);
      setTips([
        "Take time to understand the company's business model before diving into calculations.",
        "Pay close attention to growth assumptions and market conditions.",
        "Double-check your discount rate calculations for DCF models."
      ]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTips();
  }, []);

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Lightbulb className="w-5 h-5" />
            AI Performance Tips
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchTips}
            disabled={isLoading}
            className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}