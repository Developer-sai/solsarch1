import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProviderPreferences {
  storage?: string;
  database?: string;
  compute?: string;
  cdn?: string;
  cache?: string;
  queue?: string;
  networking?: string;
  gpu?: string;
  maps?: string;
  search?: string;
  analytics?: string;
}

interface ExistingService {
  name: string;
  provider: string;
  serviceType: string;
  description?: string;
  monthlyCost?: number;
}

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
  // Hybrid multi-cloud support
  hybridMode?: boolean;
  providerPreferences?: ProviderPreferences;
  existingServices?: ExistingService[];
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

    // Build hybrid mode context
    let hybridContext = '';
    if (requirements.hybridMode) {
      hybridContext = `
HYBRID MULTI-CLOUD MODE ENABLED:
The user wants a hybrid architecture using multiple cloud providers for different services.

Provider Preferences:
${Object.entries(requirements.providerPreferences || {})
  .filter(([_, v]) => v && v !== 'best')
  .map(([k, v]) => `- ${k}: Must use ${v}`)
  .join('\n') || '- No specific preferences, optimize for best cost per service'}

Existing Services to Include:
${(requirements.existingServices || [])
  .map(s => `- ${s.name} (${s.provider}): ${s.serviceType}${s.monthlyCost ? ` - $${s.monthlyCost}/mo` : ''}`)
  .join('\n') || '- None specified'}

IMPORTANT FOR HYBRID MODE:
1. For each component, set "selectedProvider" to the optimal or preferred provider
2. Include existing services as components with "isExternal": true
3. Generate a 4th variant called "hybrid-optimized" that picks the best provider per component
4. Calculate "hybridTotalCost" as the sum of selected provider costs
5. Include "hybridBreakdown" showing cost per provider used
`;
    }

    const systemPrompt = `You are an expert cloud solutions architect with deep knowledge of AWS, Azure, GCP, and OCI. 
    
Generate architecture variants for the given requirements. Return a valid JSON object with this exact structure:

{
  "architectures": [
    {
      "variant": "cost-optimized",
      "name": "Cost-Optimized Architecture",
      "description": "Brief description focusing on cost efficiency",
      "components": [
        {
          "name": "Component Name",
          "serviceType": "compute|database|storage|networking|cache|queue|cdn|gpu|maps|search|analytics",
          "providers": {
            "aws": { "service": "EC2", "sku": "t3.medium", "monthlyCost": 30 },
            "azure": { "service": "Virtual Machines", "sku": "B2s", "monthlyCost": 28 },
            "gcp": { "service": "Compute Engine", "sku": "e2-medium", "monthlyCost": 25 },
            "oci": { "service": "Compute", "sku": "VM.Standard.E4.Flex", "monthlyCost": 20 }
          },
          "selectedProvider": "oci",
          "isExternal": false
        }
      ],
      "assumptions": ["Assumption 1", "Assumption 2"],
      "tradeOffs": ["Trade-off 1", "Trade-off 2"],
      "totalCosts": { "aws": 500, "azure": 480, "gcp": 450, "oci": 400 },
      "hybridTotalCost": 380,
      "hybridBreakdown": [
        { "provider": "aws", "components": ["Storage"], "cost": 50 },
        { "provider": "azure", "components": ["Database"], "cost": 120 },
        { "provider": "gcp", "components": ["Compute", "CDN"], "cost": 210 }
      ]
    },
    {
      "variant": "balanced",
      "name": "Balanced Architecture",
      "description": "Balance between cost and performance",
      "components": [...],
      "assumptions": [...],
      "tradeOffs": [...],
      "totalCosts": {...},
      "hybridTotalCost": 500,
      "hybridBreakdown": [...]
    },
    {
      "variant": "performance-optimized", 
      "name": "Performance-Optimized Architecture",
      "description": "Maximum performance and reliability",
      "components": [...],
      "assumptions": [...],
      "tradeOffs": [...],
      "totalCosts": {...},
      "hybridTotalCost": 800,
      "hybridBreakdown": [...]
    }${requirements.hybridMode ? `,
    {
      "variant": "hybrid-optimized",
      "name": "Hybrid Multi-Cloud Architecture",
      "description": "Optimized selection of best provider per service type",
      "components": [...],
      "assumptions": ["Uses multiple cloud providers for optimal cost/performance", "Requires multi-cloud networking setup"],
      "tradeOffs": ["Increased operational complexity", "Need expertise in multiple clouds"],
      "totalCosts": {...},
      "hybridTotalCost": 350,
      "hybridBreakdown": [...]
    }` : ''}
  ],
  "mermaidDiagram": "graph TD\\n    LB[Load Balancer] --> WS[Web Server]\\n    WS --> API[API Gateway]\\n    API --> APP[App Server]\\n    APP --> CACHE[(Redis)]\\n    APP --> DB[(Database)]\\n    APP --> QUEUE[Queue]\\n    QUEUE --> WORKER[Workers]\\n    CDN[CDN] --> LB",
  "recommendations": [
    {
      "type": "cost-saving|performance|security|reliability",
      "title": "Use Reserved Instances",
      "description": "Save up to 40% with 1-year commitment",
      "impactPercentage": 40,
      "priority": "high"
    }
  ]${requirements.hybridMode ? `,
  "hybridArchitecture": {
    "variant": "hybrid-optimized",
    "name": "Recommended Hybrid Configuration",
    "description": "Best-of-breed selection across providers respecting user preferences",
    "components": [...],
    "assumptions": [...],
    "tradeOffs": [...],
    "totalCosts": {...},
    "hybridTotalCost": 350,
    "hybridBreakdown": [...]
  }` : ''}
}

${hybridContext}

CRITICAL RULES:
1. For mermaidDiagram: Use simple node IDs (letters and numbers only), use --> for arrows, [...] for rectangles, [(...)] for databases
2. Be realistic with pricing based on current 2024-2025 cloud pricing
3. Include GPU instances if the app type involves AI/ML
4. For hybrid mode: ALWAYS set selectedProvider on each component and calculate hybridTotalCost
5. Include external/third-party services (like Google Maps, Twilio, Stripe) when mentioned
6. For external services, set isExternal: true and include externalService object with provider, service, and monthlyCost`;

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
${requirements.hybridMode ? `
- HYBRID MODE: ENABLED
- Provider Preferences: ${JSON.stringify(requirements.providerPreferences || {})}
- Existing Services: ${JSON.stringify(requirements.existingServices || [])}
` : ''}

Return ONLY valid JSON, no markdown formatting.`;

    console.log("Calling Lovable AI Gateway...");
    console.log("Hybrid mode:", requirements.hybridMode);

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

    // Post-process for hybrid mode - ensure all required fields exist
    if (requirements.hybridMode && architectureResult.architectures) {
      architectureResult.architectures = architectureResult.architectures.map((arch: any) => {
        // Calculate hybrid costs if not provided
        if (!arch.hybridTotalCost && arch.components) {
          let hybridTotal = 0;
          const breakdown: Record<string, { cost: number; components: string[] }> = {};
          
          arch.components.forEach((comp: any) => {
            if (comp.isExternal && comp.externalService) {
              const provider = comp.externalService.provider;
              if (!breakdown[provider]) breakdown[provider] = { cost: 0, components: [] };
              breakdown[provider].cost += comp.externalService.monthlyCost || 0;
              breakdown[provider].components.push(comp.name);
              hybridTotal += comp.externalService.monthlyCost || 0;
            } else {
              const provider = comp.selectedProvider || 'aws';
              const cost = comp.providers?.[provider]?.monthlyCost || 0;
              if (!breakdown[provider]) breakdown[provider] = { cost: 0, components: [] };
              breakdown[provider].cost += cost;
              breakdown[provider].components.push(comp.name);
              hybridTotal += cost;
            }
          });
          
          arch.hybridTotalCost = hybridTotal;
          arch.hybridBreakdown = Object.entries(breakdown).map(([provider, data]) => ({
            provider,
            components: data.components,
            cost: data.cost,
          }));
        }
        return arch;
      });
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
