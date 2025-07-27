import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// Mock LLM response for testing
export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { prompt, response_json_schema } = req.body;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response based on the schema structure
    let mockResponse;
    
    if (response_json_schema?.properties?.company_name) {
      // This is a company scenario generation request
      mockResponse = {
        company_name: "TechFlow Solutions",
        company_description: "TechFlow Solutions is a rapidly growing SaaS platform that provides workflow automation tools for mid-market companies. The company has gained strong traction in the project management and team collaboration space, with a focus on integration capabilities and user-friendly design. Founded 3 years ago, TechFlow has established a solid customer base and is looking to scale operations significantly.",
        starting_point: {
          current_arr: 5000000,
          current_customers: 2500,
          current_arpu: 2000,
          gross_margin_percent: 82
        },
        assumptions: {
          growth_rate_year_1: 0.45,
          growth_rate_year_2: 0.35,
          growth_rate_year_3: 0.25,
          churn_rate: 0.08,
          wacc: 0.12
        }
      };
    } else if (response_json_schema?.properties?.projections) {
      // This is a financial model calculation request
      mockResponse = {
        projections: [
          { year: 1, revenue: 7250000, operating_expenses: 5075000, ebitda: 2175000, free_cash_flow: 1950000 },
          { year: 2, revenue: 9787500, operating_expenses: 6406875, ebitda: 3380625, free_cash_flow: 3042562 },
          { year: 3, revenue: 12234375, operating_expenses: 7792969, ebitda: 4441406, free_cash_flow: 3997266 },
          { year: 4, revenue: 14681250, operating_expenses: 9215625, ebitda: 5465625, free_cash_flow: 4919062 },
          { year: 5, revenue: 17617500, operating_expenses: 10758750, ebitda: 6858750, free_cash_flow: 6172875 }
        ],
        terminal_value: 82345000,
        enterprise_value: 95678000,
        equity_value: 89456000
      };
    } else {
      // Default response
      mockResponse = {
        success: true,
        message: "LLM processing completed"
      };
    }
    
    console.log(`LLM invocation completed for user: ${session.user.id || session.user.email}`);
    return res.status(200).json(mockResponse);
  } catch (error) {
    console.error("Error in /api/integrations/invoke-llm:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
