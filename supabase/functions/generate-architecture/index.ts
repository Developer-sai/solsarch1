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

// Context Engineering: Industry-specific patterns and best practices
const INDUSTRY_CONTEXT = {
  'saas': {
    patterns: ['Multi-tenant architecture', 'Horizontal scaling', 'Feature flags', 'Usage-based billing integration'],
    criticalComponents: ['API Gateway', 'Authentication Service', 'Rate Limiting', 'Webhook Processing'],
    scalingStrategy: 'Horizontal pod autoscaling with predictive scaling during business hours',
    dataPatterns: ['Time-series metrics', 'Audit logs', 'User sessions', 'Configuration data'],
    cacheStrategy: 'Multi-layer: CDN for static, Redis for sessions, query cache for frequent reads',
  },
  'ai-inference': {
    patterns: ['Model serving with batching', 'GPU sharing via MIG/MPS', 'Model versioning', 'A/B testing for models'],
    criticalComponents: ['Model Registry', 'Inference Server (Triton/TorchServe)', 'Request Queue', 'GPU Pool'],
    scalingStrategy: 'GPU-aware autoscaling with request queue depth metrics, warm pool for cold start mitigation',
    dataPatterns: ['Model artifacts', 'Inference logs', 'Feature vectors', 'Ground truth for retraining'],
    cacheStrategy: 'Model weights in GPU memory, feature cache in Redis, result cache for idempotent requests',
  },
  'data-pipeline': {
    patterns: ['Lambda architecture', 'Change data capture', 'Schema evolution', 'Exactly-once processing'],
    criticalComponents: ['Stream Processing', 'Data Lake', 'Orchestrator', 'Schema Registry'],
    scalingStrategy: 'Partition-based scaling with backpressure handling and spillover to storage',
    dataPatterns: ['Event streams', 'Batch files', 'Aggregations', 'Metadata catalog'],
    cacheStrategy: 'Hot data in memory, warm in SSD, cold in object storage with intelligent tiering',
  },
  'e-commerce': {
    patterns: ['CQRS for catalog/orders', 'Event sourcing for transactions', 'Circuit breakers', 'Inventory reservation'],
    criticalComponents: ['Product Catalog', 'Cart Service', 'Payment Gateway', 'Inventory Management', 'Search Engine'],
    scalingStrategy: 'Pre-scaled for traffic spikes (Black Friday patterns), with CDN-first architecture',
    dataPatterns: ['Product catalog', 'User profiles', 'Order history', 'Clickstream analytics'],
    cacheStrategy: 'Product pages at CDN, cart in Redis, search index in Elasticsearch/OpenSearch',
  },
  'gaming': {
    patterns: ['Lobby/matchmaking queues', 'State synchronization', 'Anti-cheat integration', 'Leaderboards'],
    criticalComponents: ['Game Server Fleet', 'Matchmaking Service', 'Leaderboard Service', 'Asset CDN'],
    scalingStrategy: 'Regional fleet scaling based on player concurrency, with session affinity',
    dataPatterns: ['Player profiles', 'Match history', 'Real-time game state', 'Analytics events'],
    cacheStrategy: 'Game state in memory, player data in Redis cluster, assets on global CDN',
  },
  'iot': {
    patterns: ['Device shadow/twin', 'OTA updates', 'Edge computing', 'Time-series optimization'],
    criticalComponents: ['MQTT Broker', 'Device Registry', 'Time-Series Database', 'Rules Engine'],
    scalingStrategy: 'Connection-based scaling for brokers, throughput-based for stream processing',
    dataPatterns: ['Telemetry streams', 'Device metadata', 'Commands/responses', 'Firmware binaries'],
    cacheStrategy: 'Device state in memory, recent telemetry in time-series DB, historical in cold storage',
  },
};

// Context Engineering: Compliance-specific requirements
const COMPLIANCE_CONTEXT: Record<string, { requirements: string[]; architectureImpact: string[] }> = {
  'soc2': {
    requirements: ['Audit logging', 'Access controls', 'Encryption at rest/transit', 'Incident response'],
    architectureImpact: ['Centralized logging with immutable storage', 'IAM with MFA', 'KMS integration', 'Monitoring dashboards'],
  },
  'gdpr': {
    requirements: ['Data residency in EU', 'Right to erasure', 'Consent management', 'Data portability'],
    architectureImpact: ['EU-only regions for PII', 'Soft delete with purge jobs', 'Consent service', 'Export API endpoints'],
  },
  'hipaa': {
    requirements: ['PHI encryption', 'Audit trails', 'Access controls', 'BAA with providers'],
    architectureImpact: ['Dedicated tenancy options', 'Field-level encryption', 'VPN/Private Link', 'HIPAA-eligible services only'],
  },
  'pci-dss': {
    requirements: ['Cardholder data protection', 'Network segmentation', 'Vulnerability management', 'Access restriction'],
    architectureImpact: ['Tokenization service', 'WAF with PCI ruleset', 'Private subnets', 'HSM for key management'],
  },
  'iso27001': {
    requirements: ['Risk assessment', 'Security controls', 'Continuous improvement', 'Documentation'],
    architectureImpact: ['Security monitoring', 'Automated compliance checks', 'Config management', 'Backup verification'],
  },
  'dpdp': {
    requirements: ['Data localization in India', 'Consent management', 'Data principal rights', 'Breach notification'],
    architectureImpact: ['India region deployment', 'Consent service', 'Data subject request API', 'Incident management'],
  },
};

// Context Engineering: Region-specific considerations
const REGION_CONTEXT: Record<string, { latencyZones: string[]; priceTier: string; specialConsiderations: string[] }> = {
  'us-east': { latencyZones: ['us-west', 'eu-west'], priceTier: 'standard', specialConsiderations: ['Primary hub for US traffic', 'Lowest latency to EU'] },
  'us-west': { latencyZones: ['us-east', 'ap-southeast'], priceTier: 'standard', specialConsiderations: ['Good for Asia-Pacific failover', 'Tech company concentration'] },
  'eu-west': { latencyZones: ['eu-central', 'us-east'], priceTier: 'premium-10%', specialConsiderations: ['GDPR-compliant region', 'Low latency to UK'] },
  'eu-central': { latencyZones: ['eu-west', 'ap-south'], priceTier: 'premium-5%', specialConsiderations: ['German data residency', 'Financial sector preferred'] },
  'ap-south': { latencyZones: ['ap-southeast', 'eu-central'], priceTier: 'discount-5%', specialConsiderations: ['India data localization', 'Growing market'] },
  'ap-southeast': { latencyZones: ['ap-south', 'us-west'], priceTier: 'standard', specialConsiderations: ['ASEAN hub', 'Good for APAC coverage'] },
};

function buildEnrichedContext(requirements: RequirementsInput): string {
  const industry = INDUSTRY_CONTEXT[requirements.appType as keyof typeof INDUSTRY_CONTEXT] || INDUSTRY_CONTEXT['saas'];
  
  const complianceContext = requirements.compliance
    .map(c => COMPLIANCE_CONTEXT[c])
    .filter(Boolean);
  
  const regionContext = requirements.regions
    .map(r => ({ region: r, ...REGION_CONTEXT[r] }))
    .filter(r => r.latencyZones);

  return `
## DOMAIN-SPECIFIC CONTEXT

### Application Type: ${requirements.appType.toUpperCase()}
**Industry Patterns:** ${industry.patterns.join(', ')}
**Critical Components:** ${industry.criticalComponents.join(', ')}
**Recommended Scaling Strategy:** ${industry.scalingStrategy}
**Typical Data Patterns:** ${industry.dataPatterns.join(', ')}
**Caching Strategy:** ${industry.cacheStrategy}

### Scale Analysis
- **User Base:** ${requirements.expectedUsers.toLocaleString()} monthly users
- **Traffic Pattern:** ${requirements.requestsPerSecond} RPS peak → ${Math.ceil(requirements.requestsPerSecond * 86400 * 0.3)} daily requests (assuming 30% of peak average)
- **Compute Estimate:** ${Math.ceil(requirements.requestsPerSecond / 100)} minimum instances for redundancy at 100 RPS/instance baseline
- **Data Footprint:** ${requirements.dataSizeGB}GB primary + ~${Math.ceil(requirements.dataSizeGB * 0.3)}GB for indexes/cache
- **Latency Budget:** ${requirements.latencyTargetMs}ms target → ${Math.ceil(requirements.latencyTargetMs * 0.4)}ms for compute, ${Math.ceil(requirements.latencyTargetMs * 0.3)}ms for DB, ${Math.ceil(requirements.latencyTargetMs * 0.3)}ms for network

### Availability Engineering
- **Target SLA:** ${requirements.availabilitySLA}% → ${((100 - requirements.availabilitySLA) * 525600 / 100).toFixed(1)} minutes/year downtime budget
- **Required Redundancy:** ${requirements.availabilitySLA >= 99.99 ? 'Multi-region active-active' : requirements.availabilitySLA >= 99.9 ? 'Multi-AZ with hot standby' : 'Multi-AZ with auto-failover'}
- **Recovery Objectives:** RTO < ${requirements.availabilitySLA >= 99.99 ? '1 minute' : requirements.availabilitySLA >= 99.9 ? '5 minutes' : '15 minutes'}, RPO < ${requirements.availabilitySLA >= 99.99 ? '0 (synchronous replication)' : '1 minute'}

${complianceContext.length > 0 ? `### Compliance Requirements
${complianceContext.map((c, i) => `**${requirements.compliance[i].toUpperCase()}:**
- Requirements: ${c.requirements.join(', ')}
- Architecture Impact: ${c.architectureImpact.join(', ')}`).join('\n\n')}` : ''}

${regionContext.length > 0 ? `### Regional Strategy
${regionContext.map(r => `**${r.region}:** Price tier ${r.latencyZones?.[0] || 'standard'}, Considerations: ${r.specialConsiderations?.join(', ') || 'Standard deployment'}`).join('\n')}` : ''}

### Budget Analysis
- **Monthly Range:** $${requirements.budgetMin} - $${requirements.budgetMax}
- **Cost-per-user target:** $${(requirements.budgetMax / requirements.expectedUsers * 1000).toFixed(2)}/1000 users
- **Optimization Focus:** ${requirements.budgetMax < 2000 ? 'Maximum cost efficiency, consider serverless' : requirements.budgetMax < 10000 ? 'Balance performance and cost' : 'Performance-first with reserved capacity'}
`;
}

const SYSTEM_PROMPT = `You are SolsArch AI, an elite cloud solutions architect with 15+ years of experience designing production systems for Fortune 500 companies. You have deep expertise in AWS, Azure, GCP, and OCI, including hands-on experience with:

- Designing systems handling millions of requests per second
- GPU cluster optimization for AI/ML workloads
- Multi-region active-active architectures
- Cost optimization that has saved clients $10M+ annually
- Compliance implementations (SOC2, HIPAA, PCI-DSS, GDPR, DPDP)

## YOUR TASK

Generate exactly 3 architecture variants for the given requirements. Each variant must be production-ready, not theoretical.

## THINKING PROCESS (Apply this reasoning)

1. **Workload Analysis**: Analyze the request pattern, data access patterns, and compute requirements
2. **Component Selection**: Choose services based on actual production suitability, not marketing
3. **Cost Modeling**: Calculate realistic costs based on actual usage patterns, not just list prices
4. **Trade-off Evaluation**: Every architecture decision has trade-offs - make them explicit
5. **Provider Comparison**: Compare equivalent services across providers fairly

## OUTPUT FORMAT

Return a valid JSON object with this exact structure:

{
  "architectures": [
    {
      "variant": "cost-optimized",
      "name": "Cost-Optimized Architecture",
      "description": "2-3 sentence description focusing on HOW costs are minimized while meeting requirements",
      "components": [
        {
          "name": "Descriptive Component Name",
          "serviceType": "compute|database|storage|networking|cache|queue|cdn|gpu|security|monitoring",
          "providers": {
            "aws": { "service": "Service Name", "sku": "Specific SKU/Size", "monthlyCost": <realistic_number> },
            "azure": { "service": "Service Name", "sku": "Specific SKU/Size", "monthlyCost": <realistic_number> },
            "gcp": { "service": "Service Name", "sku": "Specific SKU/Size", "monthlyCost": <realistic_number> },
            "oci": { "service": "Service Name", "sku": "Specific SKU/Size", "monthlyCost": <realistic_number> }
          }
        }
      ],
      "assumptions": ["Specific assumption about usage pattern", "Assumption about data growth", "Assumption about team capabilities"],
      "tradeOffs": ["Specific trade-off and its impact", "What you give up for cost savings"],
      "totalCosts": { "aws": <number>, "azure": <number>, "gcp": <number>, "oci": <number> }
    },
    {
      "variant": "balanced",
      "name": "Balanced Architecture", 
      "description": "Description explaining the balance between cost, performance, and reliability",
      "components": [...],
      "assumptions": [...],
      "tradeOffs": [...],
      "totalCosts": {...}
    },
    {
      "variant": "performance-optimized",
      "name": "Performance-Optimized Architecture",
      "description": "Description focusing on maximum performance, reliability, and scalability",
      "components": [...],
      "assumptions": [...],
      "tradeOffs": [...],
      "totalCosts": {...}
    }
  ],
  "mermaidDiagram": "graph TD\\n    USER[Users] --> CDN[CDN]\\n    CDN --> LB[Load Balancer]\\n    LB --> API[API Gateway]\\n    API --> APP[App Servers]\\n    APP --> CACHE[(Cache)]\\n    APP --> DB[(Primary DB)]\\n    DB --> REPLICA[(Read Replica)]\\n    APP --> QUEUE[Message Queue]\\n    QUEUE --> WORKER[Workers]\\n    APP --> STORAGE[(Object Storage)]",
  "recommendations": [
    {
      "type": "cost-saving|performance|reliability|security",
      "title": "Actionable Recommendation Title",
      "description": "Specific, actionable recommendation with expected outcome",
      "impactPercentage": <realistic_percentage>,
      "priority": "high|medium|low"
    }
  ]
}

## CRITICAL REQUIREMENTS

### Pricing Accuracy (2024-2025 rates)
- Use ACTUAL pricing, not approximations. Common references:
  - AWS t3.medium: ~$30/month, m5.large: ~$70/month, c5.xlarge: ~$124/month
  - Azure B2s: ~$30/month, D2s_v3: ~$70/month, F2s_v2: ~$62/month
  - GCP e2-medium: ~$24/month, n2-standard-2: ~$49/month
  - OCI VM.Standard.E4.Flex: ~$22/month (typically 20-30% cheaper than AWS)
  - RDS db.t3.medium: ~$50/month, db.r5.large: ~$175/month
  - ElastiCache cache.t3.medium: ~$45/month

### GPU Pricing (if AI/ML workload)
- Include GPU instances: A10G ~$1.00/hr, A100 ~$3.00/hr, H100 ~$4.50/hr
- Consider spot/preemptible for training: 60-70% savings
- Factor in GPU memory requirements for model size

### Mermaid Diagram Rules
- Use simple alphanumeric node IDs only (A, B, C or LB, API, DB)
- Use --> for arrows
- Use [...] for services, [(...)] for databases/storage
- Keep labels short (under 15 characters)
- Use \\n for newlines in JSON string
- Maximum 12 nodes for clarity

### Component Guidelines
- Include ALL necessary components for production (monitoring, logging, secrets management)
- Each component must have all 4 providers with realistic pricing
- Service types: compute, database, storage, networking, cache, queue, cdn, gpu, security, monitoring

## QUALITY CHECKS
Before responding, verify:
1. Total costs are sum of component costs (no math errors)
2. All providers have equivalent capability for each component
3. Assumptions are specific to this workload, not generic
4. Trade-offs explain WHAT you sacrifice and WHY
5. Diagram accurately represents the architecture
6. Recommendations are actionable with realistic impact percentages
`;

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

    // Build enriched context for better AI understanding
    const enrichedContext = buildEnrichedContext(requirements);

    const userPrompt = `## ARCHITECTURE REQUEST

${enrichedContext}

## RAW REQUIREMENTS
- **Application Type:** ${requirements.appType}
- **Expected Users:** ${requirements.expectedUsers.toLocaleString()} monthly
- **Peak Traffic:** ${requirements.requestsPerSecond} requests/second
- **Data Volume:** ${requirements.dataSizeGB} GB
- **Latency Target:** ${requirements.latencyTargetMs}ms (p99)
- **Availability SLA:** ${requirements.availabilitySLA}%
- **Regions:** ${requirements.regions.join(', ')}
- **Compliance:** ${requirements.compliance.length > 0 ? requirements.compliance.join(', ') : 'None specified'}
- **Monthly Budget:** $${requirements.budgetMin.toLocaleString()} - $${requirements.budgetMax.toLocaleString()}
${requirements.additionalNotes ? `- **Special Requirements:** ${requirements.additionalNotes}` : ''}

Now design 3 production-ready architecture variants. Return ONLY valid JSON, no markdown code blocks or additional text.`;

    console.log("Calling Lovable AI Gateway with enhanced prompt...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 8000,
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
      console.log("Raw content:", cleanedContent.substring(0, 1000));
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
