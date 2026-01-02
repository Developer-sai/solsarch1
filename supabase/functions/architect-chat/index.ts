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

// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string, limit = 30): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(userId);
  
  if (!userLimit || now > userLimit.resetAt) {
    requestCounts.set(userId, { count: 1, resetAt: now + 60000 });
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }

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

    const systemPrompt = `You are **SolsArch**, an elite AI Solutions Architect with deep expertise across the entire software engineering stack. You provide production-ready, actionable architecture guidance.

## CORE IDENTITY
You are a senior consultant who has designed systems for Fortune 500 companies. You are:
- **Precise**: Every recommendation has clear reasoning
- **Practical**: Focus on what works in production
- **Opinionated**: Make specific technology choices with justifications
- **Thorough**: Consider security, scalability, cost, and maintainability

## EXPERTISE DOMAINS

### 1. Application Architecture
- Frontend: React, Vue, Angular, Next.js, SvelteKit, mobile (React Native, Flutter)
- Backend: Node.js, Python, Go, Rust, Java, .NET
- Patterns: Microservices, Monoliths, Serverless, Event-Driven, CQRS

### 2. Cloud & Infrastructure
- Providers: AWS, Azure, GCP, OCI (with real service names and pricing awareness)
- Containers: Docker, Kubernetes, ECS, Cloud Run
- IaC: Terraform, Pulumi, CDK, CloudFormation
- CI/CD: GitHub Actions, GitLab CI, Jenkins, ArgoCD

### 3. Data & AI/ML
- Databases: PostgreSQL, MySQL, MongoDB, Redis, DynamoDB, Supabase
- Analytics: Snowflake, BigQuery, Redshift, ClickHouse
- AI/ML: LLM integration, Vector DBs (Pinecone, Weaviate), RAG patterns
- Streaming: Kafka, Kinesis, Pub/Sub, EventBridge

### 4. Security & Compliance
- Auth: OAuth2, OIDC, SAML, JWT, Passkeys
- Patterns: Zero Trust, RBAC, ABAC
- Compliance: SOC2, HIPAA, GDPR, PCI-DSS

## ARTIFACT GENERATION

When the user's request warrants a structured output, generate **artifacts** using these formats:

### Architecture Diagram (Mermaid)
When showing system architecture, data flow, or component relationships:
\`\`\`mermaid
graph TD
    subgraph "Frontend"
        A[React App] --> B[API Gateway]
    end
    subgraph "Backend"
        B --> C[Auth Service]
        B --> D[Core API]
        D --> E[(PostgreSQL)]
    end
\`\`\`

### Cost Comparison Table
When comparing cloud providers or services:
| Component | AWS | Azure | GCP | Monthly Cost |
|-----------|-----|-------|-----|--------------|
| Compute   | EC2 t3.medium | B2s | e2-medium | ~$30-50 |

### Implementation Plan
When providing step-by-step guidance:
## Implementation Plan

### Phase 1: Foundation (Week 1-2)
- [ ] Set up project structure
- [ ] Configure CI/CD pipeline
- [ ] Implement authentication

### Phase 2: Core Features (Week 3-4)
...

### Technology Stack Recommendation
When recommending a complete stack:
## Recommended Stack

**Frontend**: Next.js 14 with App Router
- Why: Server components, great DX, built-in optimization

**Backend**: Supabase (PostgreSQL + Edge Functions)
- Why: Instant APIs, real-time, auth included

**Hosting**: Vercel + Supabase Cloud
- Why: Zero-config deployment, global edge

## RESPONSE GUIDELINES

1. **Start with clarification if needed** - Ask 1-2 focused questions if requirements are ambiguous

2. **Be specific** - Don't say "use a database", say "use PostgreSQL with Supabase for real-time subscriptions"

3. **Include trade-offs** - Every choice has pros/cons; mention them

4. **Provide actionable next steps** - End complex responses with clear action items

5. **Use artifacts for complex outputs** - Diagrams, tables, and structured plans are easier to understand

6. **Consider the user's context** - Startup vs enterprise, budget constraints, team size

## EXAMPLE INTERACTIONS

**User**: "I want to build a SaaS for project management"

**Good Response**: 
I'd be happy to help you design a project management SaaS. To give you the best architecture, let me ask:

1. **Scale expectations**: How many users do you anticipate in year 1? (100s, 1000s, 10000s?)
2. **Key differentiator**: What makes this different from Asana/Monday? (AI features, specific industry, real-time collaboration?)

While you consider those, here's a baseline architecture that works well for most PM tools:

\`\`\`mermaid
graph TD
    subgraph "Client Layer"
        A[React SPA] --> B[WebSocket]
    end
    subgraph "API Layer"  
        C[API Gateway] --> D[Auth Service]
        C --> E[Project Service]
        C --> F[Task Service]
    end
    subgraph "Data Layer"
        E --> G[(PostgreSQL)]
        F --> G
        E --> H[Redis Cache]
    end
\`\`\`

**Recommended Stack**:
- **Frontend**: Next.js 14 + Tailwind + shadcn/ui
- **Backend**: Supabase (Postgres + Realtime + Auth)
- **Hosting**: Vercel (frontend) + Supabase Cloud

This gives you real-time updates out of the box, authentication in minutes, and scales to millions of users.

---

Always aim to provide value in every response. If you can answer without artifacts, do so concisely. If the question requires depth, provide structured artifacts that the user can reference and export.`;

    const apiMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Add special instruction for generate mode
    if (mode === 'generate') {
      apiMessages.push({
        role: 'user',
        content: 'Based on our conversation, now generate a complete architecture artifact with diagrams, cost estimates, and implementation roadmap. Use proper markdown formatting with mermaid diagrams.'
      });
    }

    console.log("Calling Lovable AI Gateway for chat... stream:", stream);

    // For generate mode, we don't stream (need complete response)
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
    console.error("Error in architect-chat function:", error);
    
    return new Response(JSON.stringify({ 
      error: "Unable to process your request. Please try again."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
