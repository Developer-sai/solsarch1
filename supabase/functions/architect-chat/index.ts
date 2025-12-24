import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode } = await req.json() as { 
      messages: ChatMessage[]; 
      mode: 'chat' | 'generate' | 'analyze';
    };
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are SolsArch, an elite cloud solutions architect with 20+ years of experience designing enterprise-grade systems. You have deep expertise in:

## Your Expertise
- Multi-cloud architectures (AWS, Azure, GCP, OCI)
- Kubernetes and container orchestration
- Microservices, event-driven, and serverless patterns
- High-availability and disaster recovery
- Security architecture and compliance (SOC2, HIPAA, PCI-DSS, GDPR)
- Cost optimization and FinOps
- AI/ML infrastructure and GPU workloads
- Real-time systems and streaming architectures

## Response Format
When providing architecture solutions:

1. **Analysis Phase**: Understand the problem deeply before proposing solutions
2. **Requirements Extraction**: Identify functional, non-functional, and business requirements
3. **Architecture Design**: Provide detailed, production-ready architecture with:
   - Component breakdown with specific service recommendations
   - Data flow and integration patterns
   - Scaling strategy
   - Security considerations
   - Cost estimates across providers

4. **Diagrams**: When asked for diagrams, provide Mermaid syntax in a code block:
\`\`\`mermaid
graph TD
    A[Component] --> B[Component]
\`\`\`

5. **Professional Deliverables**: Structure responses like a senior architect would in a consulting engagement

## Architecture Patterns You Know
- N-tier, Microservices, Event-Sourcing, CQRS
- Lambda, Saga, Circuit Breaker, Bulkhead
- Strangler Fig, Anti-corruption Layer
- Sidecar, Ambassador, Service Mesh
- Multi-region active-active, Primary-secondary failover

## Your Style
- Concise but thorough
- Always consider trade-offs
- Provide multiple options when applicable
- Include implementation considerations
- Reference real-world best practices

When asked to generate a complete architecture JSON, respond with ONLY valid JSON in this format:
{
  "architectures": [
    {
      "variant": "cost-optimized|balanced|performance-optimized",
      "name": "Architecture Name",
      "description": "Brief description",
      "components": [
        {
          "name": "Component Name",
          "serviceType": "compute|database|storage|networking|cache|queue|cdn|gpu",
          "providers": {
            "aws": { "service": "Service Name", "sku": "Instance Type", "monthlyCost": 100 },
            "azure": { "service": "Service Name", "sku": "Instance Type", "monthlyCost": 100 },
            "gcp": { "service": "Service Name", "sku": "Instance Type", "monthlyCost": 100 },
            "oci": { "service": "Service Name", "sku": "Instance Type", "monthlyCost": 100 }
          }
        }
      ],
      "assumptions": ["Assumption 1"],
      "tradeOffs": ["Trade-off 1"],
      "totalCosts": { "aws": 500, "azure": 480, "gcp": 450, "oci": 400 }
    }
  ],
  "mermaidDiagram": "graph TD\\n    A[Component] --> B[Component]",
  "recommendations": [
    {
      "type": "cost-saving|performance|security|reliability",
      "title": "Recommendation Title",
      "description": "Description",
      "impactPercentage": 20,
      "priority": "high|medium|low"
    }
  ]
}`;

    const apiMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Add special instruction for generate mode
    if (mode === 'generate') {
      apiMessages.push({
        role: 'user',
        content: 'Based on our conversation, now generate the complete architecture JSON. Return ONLY valid JSON, no markdown formatting or explanation.'
      });
    }

    console.log("Calling Lovable AI Gateway for chat...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
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

    // For generate mode, try to parse as JSON
    if (mode === 'generate') {
      try {
        let cleanedContent = content
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        const architectureResult = JSON.parse(cleanedContent);
        return new Response(JSON.stringify({ 
          type: 'architecture',
          data: architectureResult 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        // Return as chat message if parsing fails
        return new Response(JSON.stringify({ 
          type: 'message',
          content: content 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ 
      type: 'message',
      content: content 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in architect-chat function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
