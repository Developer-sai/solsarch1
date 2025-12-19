import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequirementsInput {
  appType: string;
  expectedUsers: number;
  requestsPerSecond: number;
  dataSizeGB: number;
  latencyTargetMs: number;
  availabilitySLA: number;
  regions: string[];
  compliance: string[];
  budgetMin: number;
  budgetMax: number;
  additionalNotes: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requirements } = await req.json() as { requirements: RequirementsInput };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert cloud solutions architect with deep knowledge of AWS, Azure, GCP, and OCI. 
    
Generate exactly 3 architecture variants for the given requirements. Return a valid JSON object with this exact structure:

{
  "architectures": [
    {
      "variant": "cost-optimized",
      "name": "Cost-Optimized Architecture",
      "description": "Brief description focusing on cost efficiency",
      "components": [
        {
          "name": "Component Name",
          "serviceType": "compute|database|storage|networking|cache|queue|cdn|gpu",
          "providers": {
            "aws": { "service": "EC2", "sku": "t3.medium", "monthlyCost": 30 },
            "azure": { "service": "Virtual Machines", "sku": "B2s", "monthlyCost": 28 },
            "gcp": { "service": "Compute Engine", "sku": "e2-medium", "monthlyCost": 25 },
            "oci": { "service": "Compute", "sku": "VM.Standard.E4.Flex", "monthlyCost": 20 }
          }
        }
      ],
      "assumptions": ["Assumption 1", "Assumption 2"],
      "tradeOffs": ["Trade-off 1", "Trade-off 2"],
      "totalCosts": { "aws": 500, "azure": 480, "gcp": 450, "oci": 400 }
    },
    {
      "variant": "balanced",
      "name": "Balanced Architecture",
      "description": "Balance between cost and performance",
      "components": [...],
      "assumptions": [...],
      "tradeOffs": [...],
      "totalCosts": {...}
    },
    {
      "variant": "performance-optimized", 
      "name": "Performance-Optimized Architecture",
      "description": "Maximum performance and reliability",
      "components": [...],
      "assumptions": [...],
      "tradeOffs": [...],
      "totalCosts": {...}
    }
  ],
  "mermaidDiagram": "graph TD\\n    A[Load Balancer] --> B[App Server 1]\\n    A --> C[App Server 2]\\n    B --> D[(Database)]\\n    C --> D",
  "recommendations": [
    {
      "type": "cost-saving",
      "title": "Use Reserved Instances",
      "description": "Save up to 40% with 1-year commitment",
      "impactPercentage": 40,
      "priority": "high"
    }
  ]
}

Be realistic with pricing based on current 2024 cloud pricing. Include GPU instances if the app type involves AI/ML.`;

    const userPrompt = `Design cloud architectures for:
- App Type: ${requirements.appType}
- Expected Users: ${requirements.expectedUsers.toLocaleString()}
- Requests/Second: ${requirements.requestsPerSecond}
- Data Size: ${requirements.dataSizeGB} GB
- Latency Target: ${requirements.latencyTargetMs}ms
- Availability SLA: ${requirements.availabilitySLA}%
- Regions: ${requirements.regions.join(', ')}
- Compliance: ${requirements.compliance.join(', ') || 'None specified'}
- Monthly Budget: $${requirements.budgetMin} - $${requirements.budgetMax}
- Additional Notes: ${requirements.additionalNotes || 'None'}

Return ONLY valid JSON, no markdown formatting.`;

    console.log("Calling Lovable AI Gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI Response received, parsing...");

    // Clean and parse the JSON response
    let cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let architectureResult;
    try {
      architectureResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.log("Raw content:", cleanedContent.substring(0, 500));
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(JSON.stringify(architectureResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-architecture function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
