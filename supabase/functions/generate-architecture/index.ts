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
  deploymentStrategy?: 'single-cloud' | 'multi-cloud' | 'hybrid';
  existingInfrastructure?: string;
}

const ENHANCED_SYSTEM_PROMPT = `You are SolsArch AI, an elite cloud solutions architect with 15+ years of experience designing production systems for Fortune 500 companies.

## YOUR EXPERTISE
- Multi-cloud and hybrid cloud architectures
- Cloud migration strategies (on-premise to cloud, cloud-to-cloud)
- Enterprise-scale systems handling millions of requests
- GPU cluster optimization for AI/ML workloads
- Compliance implementations (SOC2, HIPAA, PCI-DSS, GDPR, DPDP, ISO 27001)
- Cost optimization that has saved clients $10M+ annually

## CRITICAL TASK
Generate exactly 3 architecture variants. Each variant must be production-ready and realistic.

## MULTI-CLOUD SUPPORT
When designing architectures, consider:
1. **Single-Cloud**: All components on one provider (cost-optimized, balanced, performance variants)
2. **Multi-Cloud**: Workloads distributed across providers for optimal cost/performance
   - Example: Frontend on AWS CloudFront, Backend on GCP Kubernetes, Database on Azure
3. **Hybrid**: Mix of on-premise and cloud, or primary + DR on different clouds

## OUTPUT FORMAT
Return ONLY valid JSON (no markdown) with this structure:

{
  "architectures": [
    {
      "variant": "cost-optimized",
      "name": "Cost-Optimized Architecture",
      "description": "2-3 sentences explaining HOW costs are minimized while meeting requirements",
      "deploymentModel": "single-cloud" | "multi-cloud" | "hybrid",
      "components": [
        {
          "name": "Descriptive Component Name",
          "serviceType": "compute|database|storage|networking|cache|queue|cdn|gpu|security|monitoring",
          "primaryProvider": "aws|azure|gcp|oci",
          "providers": {
            "aws": { "service": "Service Name", "sku": "Specific SKU", "monthlyCost": <number> },
            "azure": { "service": "Service Name", "sku": "Specific SKU", "monthlyCost": <number> },
            "gcp": { "service": "Service Name", "sku": "Specific SKU", "monthlyCost": <number> },
            "oci": { "service": "Service Name", "sku": "Specific SKU", "monthlyCost": <number> }
          }
        }
      ],
      "assumptions": ["Specific assumption about usage", "Assumption about data growth"],
      "tradeOffs": ["What you sacrifice for cost savings", "Impact on performance/reliability"],
      "totalCosts": { "aws": <number>, "azure": <number>, "gcp": <number>, "oci": <number> },
      "providerDistribution": {
        "aws": { "percentage": 40, "workloads": ["Frontend CDN", "API Gateway"] },
        "gcp": { "percentage": 60, "workloads": ["Kubernetes Backend", "BigQuery Analytics"] }
      }
    }
  ],
  "mermaidDiagram": "graph TD\\n    USER[Users] --> CDN[CDN]\\n    CDN --> LB[Load Balancer]\\n    LB --> API[API Gateway]\\n    API --> APP[App Servers]\\n    APP --> CACHE[(Cache)]\\n    APP --> DB[(Primary DB)]\\n    DB --> REPLICA[(Read Replica)]",
  "recommendations": [
    {
      "type": "cost-saving|performance|reliability|security|compliance",
      "title": "Actionable Recommendation",
      "description": "Specific action with expected outcome",
      "impactPercentage": <realistic_number>,
      "priority": "high|medium|low"
    }
  ],
  "migrationStrategy": {
    "applicable": true|false,
    "phases": [
      {
        "phase": 1,
        "name": "Phase Name",
        "duration": "2-4 weeks",
        "description": "What happens in this phase",
        "risks": ["Risk 1", "Risk 2"]
      }
    ],
    "estimatedDowntime": "< 1 hour",
    "totalDuration": "8-12 weeks"
  }
}

## PRICING ACCURACY (2024-2025 rates)
- AWS t3.medium: ~$30/mo, m5.large: ~$70/mo, c5.xlarge: ~$124/mo
- Azure B2s: ~$30/mo, D2s_v3: ~$70/mo, F2s_v2: ~$62/mo
- GCP e2-medium: ~$24/mo, n2-standard-2: ~$49/mo
- OCI VM.Standard.E4.Flex: ~$22/mo (20-30% cheaper than AWS)
- RDS db.t3.medium: ~$50/mo, db.r5.large: ~$175/mo
- ElastiCache cache.t3.medium: ~$45/mo
- GPU: A10G ~$1.00/hr, A100 ~$3.00/hr, H100 ~$4.50/hr

## MERMAID DIAGRAM RULES
- Simple alphanumeric node IDs (A, B, C or LB, API, DB)
- Use --> for arrows
- Use [...] for services, [(...)] for databases
- Keep labels under 15 characters
- Use \\n for newlines in JSON string
- Maximum 12 nodes for clarity
- For multi-cloud, use subgraphs or color coding in labels

## QUALITY CHECKS
Before responding:
1. Total costs = sum of component costs
2. All providers have equivalent capability
3. Assumptions are specific to this workload
4. Trade-offs explain WHAT you sacrifice and WHY
5. Diagram accurately represents architecture
6. For multi-cloud: providerDistribution adds to 100%
7. Migration strategy only if existing infrastructure mentioned`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requirements } = await req.json() as { requirements: RequirementsInput };
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Detect deployment strategy from additional notes if not explicitly set
    let deploymentStrategy = requirements.deploymentStrategy || 'single-cloud';
    const notes = requirements.additionalNotes?.toLowerCase() || '';
    const hasExisting = requirements.existingInfrastructure || notes.includes('existing') || notes.includes('current');

    if (notes.includes('multi-cloud') || notes.includes('multiple cloud')) {
      deploymentStrategy = 'multi-cloud';
    } else if (notes.includes('hybrid') || notes.includes('on-premise')) {
      deploymentStrategy = 'hybrid';
    }

    const userPrompt = `## ARCHITECTURE REQUEST

### Requirements
- **Application Type**: ${requirements.appType}
- **Scale**: ${requirements.expectedUsers.toLocaleString()} monthly users, ${requirements.requestsPerSecond} RPS
- **Data Volume**: ${requirements.dataSizeGB} GB
- **Performance**: ${requirements.latencyTargetMs}ms latency (p99), ${requirements.availabilitySLA}% SLA
- **Regions**: ${requirements.regions.join(', ')}
- **Compliance**: ${requirements.compliance.length > 0 ? requirements.compliance.join(', ') : 'None specified'}
- **Budget**: $${requirements.budgetMin.toLocaleString()} - $${requirements.budgetMax.toLocaleString()}/month
- **Deployment Strategy**: ${deploymentStrategy}
${requirements.existingInfrastructure ? `- **Existing Infrastructure**: ${requirements.existingInfrastructure}` : ''}
${requirements.additionalNotes ? `- **Additional Notes**: ${requirements.additionalNotes}` : ''}

### Instructions
1. Design 3 production-ready architecture variants
2. ${deploymentStrategy === 'multi-cloud' ? 'For at least one variant, distribute workloads across multiple cloud providers for optimal cost/performance' : deploymentStrategy === 'hybrid' ? 'Include hybrid cloud considerations with on-premise integration' : 'Focus on single-cloud deployment with provider comparisons'}
3. ${hasExisting ? 'Include migration strategy from existing infrastructure' : 'Design greenfield architecture'}
4. Provide realistic 2024-2025 pricing
5. Include specific, actionable recommendations

Return ONLY valid JSON, no markdown formatting.`;

    console.log(`Generating ${deploymentStrategy} architecture for ${requirements.appType}...`);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: ENHANCED_SYSTEM_PROMPT + "\n\n" + userPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8000,
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 403) {
        return new Response(JSON.stringify({ error: "Invalid API key or quota exceeded." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No content in Gemini response");
    }

    console.log("Architecture generated successfully");

    // Clean and parse the JSON response
    let cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Handle potential JSON wrapped in extra characters
    const jsonStart = cleanedContent.indexOf('{');
    const jsonEnd = cleanedContent.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1);
    }

    let architectureResult;
    try {
      architectureResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.log("Raw content:", cleanedContent.substring(0, 500));
      throw new Error("Failed to parse AI response as JSON. Please try again.");
    }

    // Validate the response structure
    if (!architectureResult.architectures || !Array.isArray(architectureResult.architectures)) {
      throw new Error("Invalid response structure: missing architectures array");
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
