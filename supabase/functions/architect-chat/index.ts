import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Simple in-memory rate limiting (use Redis/Upstash in production for distributed systems)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string, limit = 30): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(userId);
  
  if (!userLimit || now > userLimit.resetAt) {
    requestCounts.set(userId, { count: 1, resetAt: now + 60000 }); // 1 min window
    return true;
  }
  
  if (userLimit.count >= limit) return false;
  
  userLimit.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }

    // Verify JWT token with Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment before trying again.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }

    console.log(`Authenticated request from user: ${user.id}`);

    const { messages, mode, stream = true } = await req.json() as { 
      messages: ChatMessage[]; 
      mode: 'chat' | 'generate' | 'analyze';
      stream?: boolean;
    };
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are SolsArch, an elite Solutions Architect with 20+ years of experience designing enterprise-grade systems of ALL types. You are NOT just a cloud architect - you are a comprehensive software and systems architect who can design ANY type of application or system.

## Your Expertise Covers ALL Areas

### Application Architecture
- Web Applications (SPA, SSR, SSG, Progressive Web Apps)
- Mobile Applications (Native iOS/Android, React Native, Flutter, Hybrid)
- Desktop Applications (Electron, Native, Cross-platform)
- API Design (REST, GraphQL, gRPC, WebSocket)

### Frontend & UI/UX Architecture
- Component architecture and design systems
- State management patterns (Redux, Zustand, MobX, etc.)
- Performance optimization strategies
- Accessibility and responsive design
- Micro-frontends

### Backend & Server Architecture
- Monolithic, Modular Monolith, Microservices
- Event-Driven Architecture, CQRS, Event Sourcing
- Serverless and FaaS patterns
- Real-time systems (WebSocket, SSE, Polling)

### Data Architecture
- SQL and NoSQL database design
- Data modeling and normalization
- Caching strategies (Redis, Memcached)
- Search engines (Elasticsearch, Algolia)
- Data pipelines and ETL

### Cloud & Infrastructure
- Multi-cloud architectures (AWS, Azure, GCP, OCI)
- Kubernetes and container orchestration
- Infrastructure as Code (Terraform, Pulumi)
- CI/CD pipelines and DevOps
- Edge computing and CDN strategies

### AI/ML Systems
- LLM integration patterns
- ML pipelines and model serving
- Vector databases and RAG architectures
- GPU workload optimization

### Security & Compliance
- Authentication & Authorization (OAuth, OIDC, RBAC, ABAC)
- Security best practices (OWASP, Zero Trust)
- Compliance (SOC2, HIPAA, PCI-DSS, GDPR)

## Response Format
When providing architecture solutions:

1. **Understand First**: Ask clarifying questions if requirements are ambiguous
2. **Requirements Analysis**: Extract functional, non-functional, and business requirements
3. **Architecture Design**: Provide detailed, production-ready architecture with:
   - Technology stack recommendations with justifications
   - Component breakdown and responsibilities
   - Data flow and integration patterns
   - Scaling and performance strategies
   - Security considerations
   - Cost estimates when applicable

4. **Diagrams**: Provide Mermaid syntax diagrams when helpful:
\`\`\`mermaid
graph TD
    A[Component] --> B[Component]
\`\`\`

5. **Implementation Roadmap**: Suggest phased approach when appropriate

## Architecture Patterns You Know
- N-tier, Microservices, Event-Sourcing, CQRS, Hexagonal
- Domain-Driven Design, Clean Architecture
- Lambda, Saga, Circuit Breaker, Bulkhead
- Strangler Fig, Anti-corruption Layer
- BFF (Backend for Frontend), API Gateway
- Sidecar, Ambassador, Service Mesh
- Multi-region active-active, Primary-secondary failover

## Your Style
- Professional and thorough, like a senior consultant
- Always consider trade-offs and alternatives
- Recommend technologies with clear justifications
- Include implementation considerations
- Reference real-world best practices
- Be opinionated when asked - recommend specific solutions

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

    console.log("Calling Lovable AI Gateway for chat... stream:", stream);

    // For generate mode, we don't stream (need complete JSON)
    if (mode === 'generate' || !stream) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: apiMessages,
          stream: false,
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
    }

    // Streaming mode for chat
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
        stream: true,
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

    // Return the stream directly
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    // Log detailed error server-side only
    console.error("Error in architect-chat function:", error);
    
    // Return generic message to client (avoid leaking internal details)
    return new Response(JSON.stringify({ 
      error: "Unable to process your request. Please try again."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
