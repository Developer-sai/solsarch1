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

// Industry-specific context (embedded for Deno compatibility)
const INDUSTRY_CONTEXT: Record<string, any> = {
  'fintech': {
    name: 'Financial Technology',
    criticalComponents: ['Fraud Detection', 'Transaction Processing', 'Audit Trail', 'Payment Gateway', 'KYC/AML'],
    patterns: ['Event Sourcing', 'CQRS', 'Saga Pattern', 'Circuit Breakers'],
    references: ['Stripe: 99.999% uptime', 'Square: Real-time processing', 'Robinhood: Sub-100ms latency'],
    performance: '<100ms latency, >10k TPS',
    costTips: ['Reserved instances for processing', 'Spot for batch fraud analysis', 'Auto-scale for peak hours']
  },
  'e-commerce': {
    name: 'E-commerce & Retail',
    criticalComponents: ['Product Catalog', 'Shopping Cart', 'Payment', 'Inventory', 'Search Engine'],
    patterns: ['CQRS for catalog', 'Event sourcing for orders', 'Cache-aside pattern'],
    references: ['Amazon: Global scale', 'Shopify: Multi-tenant SaaS', 'Walmart: Omnichannel'],
    performance: '<200ms page loads, handle 10x spikes',
    costTips: ['CDN for images', 'ElastiCache for catalog', 'Auto-scale for Black Friday']
  },
  'healthcare': {
    name: 'Healthcare & Medical',
    criticalComponents: ['PHI Encryption', 'Audit Logging', 'EHR Integration', 'Telemedicine', 'Medical Imaging'],
    patterns: ['Zero Trust Security', 'Field-level encryption', 'RBAC', 'Immutable logs'],
    references: ['Epic: Enterprise EHR', 'Cerner: Cloud platform', 'Teladoc: Telemedicine at scale'],
    performance: '<200ms queries, 99.99% availability',
    costTips: ['S3 Glacier for records', 'Intelligent tiering for imaging', 'Reserved for core systems']
  },
  'saas': {
    name: 'Software as a Service',
    criticalComponents: ['Multi-tenant DB', 'Auth & Authorization', 'API Gateway', 'Usage Metering', 'Feature Flags'],
    patterns: ['Multi-tenant architecture', 'Horizontal pod autoscaling', 'Feature flags', 'API versioning'],
    references: ['Salesforce: Multi-tenant CRM', 'Slack: Real-time messaging', 'Zoom: Global distribution'],
    performance: '<300ms API calls, 99.9% availability',
    costTips: ['Serverless for variable loads', 'Auto-scale by tenant', 'Reserved for base load']
  },
  'ai-inference': {
    name: 'AI/ML Inference',
    criticalComponents: ['Model Registry', 'Inference Server', 'GPU Pool', 'Model Monitoring', 'Feature Store'],
    patterns: ['Model serving with batching', 'GPU sharing via MIG', 'A/B testing', 'Canary deployments'],
    references: ['OpenAI: Global inference', 'Hugging Face: Model hosting', 'Anthropic: High-throughput'],
    performance: '<500ms inference, >1000 req/sec per GPU',
    costTips: ['Spot instances for GPUs (60-70% savings)', 'Model quantization', 'Batch inference']
  }
};

// Enhanced system prompt with advanced techniques
function buildEnhancedPrompt(requirements: RequirementsInput): string {
  const industry = INDUSTRY_CONTEXT[requirements.appType] || INDUSTRY_CONTEXT['saas'];
  const budget = (requirements.budgetMin + requirements.budgetMax) / 2;

  return `You are SolsArch AI, a senior cloud solutions architect with exceptional credentials:

## CREDENTIALS
- 15+ years at AWS, Google Cloud, Microsoft Azure
- AWS Solutions Architect Professional, GCP Professional Cloud Architect
- Designed 500+ production systems for Fortune 500 companies
- Clients: Netflix, Airbnb, Uber, Stripe, Spotify, DoorDash
- Specialized in: FinTech, HealthTech, E-commerce, AI/ML, Gaming, IoT

## EXPERTISE
- Multi-cloud architecture (AWS, Azure, GCP, OCI)
- Cost optimization ($100M+ saved for clients)
- Compliance (SOC2, HIPAA, PCI-DSS, GDPR, DPDP, ISO 27001)
- High-scale systems (millions of RPS)
- GPU clusters for AI/ML workloads
- Zero-downtime migrations
- Well-Architected Framework (all 6 pillars)

## YOUR APPROACH
- **Data-Driven**: Every decision backed by metrics
- **Risk-Aware**: Identify and mitigate risks proactively
- **Cost-Conscious**: Optimize for value, not just lowest price
- **Security-First**: Security by design
- **Pragmatic**: Production-ready over perfect
- **Transparent**: Explain reasoning and trade-offs

---

## INDUSTRY CONTEXT: ${industry.name}

### Critical Components
${industry.criticalComponents.map((c: string) => `- ${c}`).join('\n')}

### Architecture Patterns
${industry.patterns.map((p: string) => `- ${p}`).join('\n')}

### Reference Clients (Learn from the best)
${industry.references.map((r: string) => `- ${r}`).join('\n')}

### Performance Targets
${industry.performance}

### Cost Optimization Strategies
${industry.costTips.map((t: string) => `- ${t}`).join('\n')}

---

## CHAIN-OF-THOUGHT REASONING

Before generating, think step-by-step:

**STEP 1: WORKLOAD ANALYSIS**
- Type: ${requirements.requestsPerSecond > 1000 ? 'High-throughput' : 'Standard'}, ${requirements.dataSizeGB > 1000 ? 'Data-intensive' : 'Compute-focused'}
- Traffic: ${requirements.requestsPerSecond} RPS (${requirements.requestsPerSecond > 5000 ? 'needs auto-scaling' : 'predictable'})
- Data: ${requirements.dataSizeGB}GB (${requirements.dataSizeGB > 500 ? 'consider tiering' : 'standard storage'})

**STEP 2: CONSTRAINTS**
- Budget: $${requirements.budgetMin}-$${requirements.budgetMax}/month (target: $${budget})
- Latency: <${requirements.latencyTargetMs}ms (${requirements.latencyTargetMs < 100 ? 'needs CDN + edge' : requirements.latencyTargetMs < 300 ? 'needs caching' : 'standard'})
- Availability: ${requirements.availabilitySLA}% (${requirements.availabilitySLA >= 99.99 ? 'multi-region required' : requirements.availabilitySLA >= 99.9 ? 'multi-AZ required' : 'single-AZ acceptable'})
- Compliance: ${requirements.compliance.join(', ') || 'None'}

**STEP 3: COMPONENT SELECTION**
For each component, justify:
- Why this service? (specific reasoning)
- Alternatives considered? (and why rejected)
- Cost implication? (with calculations)
- Operational complexity? (team can manage?)

**STEP 4: VALIDATION**
✓ Meets ${requirements.latencyTargetMs}ms latency?
✓ Achieves ${requirements.availabilitySLA}% SLA?
✓ Within $${requirements.budgetMin}-$${requirements.budgetMax} budget?
✓ Handles ${requirements.requestsPerSecond} RPS?
✓ Compliant with ${requirements.compliance.join(', ') || 'no specific requirements'}?

**STEP 5: OPTIMIZATION**
- Can we use serverless to reduce costs?
- Are there managed services to reduce ops?
- Can we use spot/preemptible instances?
- Is there a cheaper region?
- Can we cache more aggressively?

---

## OUTPUT FORMAT

Return ONLY valid JSON (no markdown) with this structure:

{
  "architectures": [
    {
      "variant": "cost-optimized",
      "name": "Cost-Optimized Architecture",
      "description": "2-3 sentences explaining HOW costs are minimized while meeting requirements",
      "components": [
        {
          "name": "Descriptive Component Name",
          "serviceType": "compute|database|storage|networking|cache|queue|cdn|gpu|security|monitoring",
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
      "totalCosts": { "aws": <number>, "azure": <number>, "gcp": <number>, "oci": <number> }
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
  "mermaidDiagram": "graph TD\\n    USER[Users] --> CDN[CDN]\\n    CDN --> LB[Load Balancer]\\n    LB --> API[API Gateway]\\n    API --> APP[App Servers]\\n    APP --> CACHE[(Cache)]\\n    APP --> DB[(Primary DB)]",
  "recommendations": [
    {
      "type": "cost-saving|performance|reliability|security|compliance",
      "title": "Actionable Recommendation",
      "description": "Specific action with expected outcome",
      "impactPercentage": <realistic_number>,
      "priority": "high|medium|low"
    }
  ]
}

## PRICING ACCURACY (2024-2025)
- AWS t3.medium: ~$30/mo, m5.large: ~$70/mo, c5.xlarge: ~$124/mo
- Azure B2s: ~$30/mo, D2s_v3: ~$70/mo
- GCP e2-medium: ~$24/mo, n2-standard-2: ~$49/mo
- OCI VM.Standard.E4.Flex: ~$22/mo (20-30% cheaper)
- RDS db.t3.medium: ~$50/mo, db.r5.large: ~$175/mo
- ElastiCache cache.t3.medium: ~$45/mo
- GPU: A10G ~$1.00/hr, A100 ~$3.00/hr, H100 ~$4.50/hr

## MERMAID DIAGRAM RULES
- Simple alphanumeric node IDs
- Use --> for arrows
- Use [...] for services, [(...)] for databases
- Keep labels under 15 characters
- Maximum 12 nodes for clarity

## QUALITY CHECKS
Before responding:
1. Total costs = sum of component costs
2. All providers have equivalent capability
3. Assumptions are specific to this workload
4. Trade-offs explain WHAT you sacrifice and WHY
5. Diagram accurately represents architecture

---

## YOUR TASK

Design 3 production-ready architecture variants for:

- App Type: ${requirements.appType}
- Scale: ${requirements.expectedUsers.toLocaleString()} users, ${requirements.requestsPerSecond} RPS
- Data: ${requirements.dataSizeGB} GB
- Performance: <${requirements.latencyTargetMs}ms latency, ${requirements.availabilitySLA}% SLA
- Regions: ${requirements.regions.join(', ')}
- Compliance: ${requirements.compliance.join(', ') || 'None'}
- Budget: $${requirements.budgetMin.toLocaleString()}-$${requirements.budgetMax.toLocaleString()}/month
${requirements.additionalNotes ? `- Notes: ${requirements.additionalNotes}` : ''}

Return ONLY valid JSON, no markdown formatting.`;
}

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

    const enhancedPrompt = buildEnhancedPrompt(requirements);

    console.log(`Generating architecture for ${requirements.appType} with advanced prompt engineering...`);

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
              { text: enhancedPrompt }
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

    console.log("Architecture generated successfully with enhanced prompting");

    // Clean and parse JSON
    let cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

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

    // Validate response structure
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
