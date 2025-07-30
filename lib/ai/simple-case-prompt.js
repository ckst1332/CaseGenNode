/**
 * Simple Case Generation - Focused on JSON compliance
 * Optimized for reliable JSON output with minimal complexity
 */

export const getSimpleCasePrompt = (industry = "Technology (SaaS)") => {
  const prompt = `You are a financial analyst. Create a simple ${industry} company DCF case study.

IMPORTANT: Respond with ONLY valid JSON. No explanations, no text before or after.

Generate a realistic ${industry} company with 5-year financial projections.

Rules:
- Revenue growth: Start 30-40%, decline to 15-20% by year 5
- Gross margin: 75-85% for SaaS
- Keep all numbers realistic and conservative
- Must be valid JSON only

Format exactly as shown in schema.`;

  const schema = {
    type: "object",
    properties: {
      company_name: { type: "string" },
      company_description: { type: "string" },
      assumptions: {
        type: "object",
        properties: {
          wacc: { type: "number" },
          terminal_growth: { type: "number" },
          tax_rate: { type: "number" }
        }
      },
      projections: {
        type: "array",
        items: {
          type: "object",
          properties: {
            year: { type: "number" },
            revenue: { type: "number" },
            gross_profit: { type: "number" },
            operating_expenses: { type: "number" },
            ebitda: { type: "number" },
            net_income: { type: "number" }
          }
        }
      }
    },
    required: ["company_name", "company_description", "assumptions", "projections"]
  };

  return { prompt, schema };
};
