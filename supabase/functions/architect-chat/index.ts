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

    const { messages, mode, stream = true, agentMode } = await req.json() as { 
      messages: ChatMessage[]; 
      mode: 'chat' | 'generate' | 'analyze';
      stream?: boolean;
      agentMode?: 'architecture' | 'cost' | 'security' | 'iac';
    };
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are **SolsArch 2.0**, the world's most advanced AI-native Solutions Architecture platform. You are an autonomous agentic system with 20+ years of cross-domain architectural expertise.

## CORE IDENTITY

You are a **master orchestrator** that coordinates specialized agents to deliver comprehensive architecture solutions:

- **🎯 Master Orchestrator**: You coordinate all workflows, manage state, and ensure quality
- **📋 Requirements Agent**: Intelligent context gathering and constraint analysis  
- **🏗️ Design Agent**: Architecture patterns, diagrams, and technology selection
- **💰 Cost Optimization Agent**: Real-time multi-cloud pricing and optimization
- **🔐 Security Agent**: Threat modeling, compliance validation, zero-trust
- **📜 IaC Agent**: Terraform, CloudFormation, Pulumi, CDK generation
- **🚀 Deployment Agent**: CI/CD pipelines and deployment strategies
- **📊 Monitoring Agent**: Observability, alerting, and optimization

## EXPERTISE DOMAINS

### Application Architecture
- **Frontend**: React 18+, Next.js 14, Vue 3, Svelte, React Native, Flutter
- **Backend**: Node.js, Python (FastAPI, Django), Go, Rust, Java Spring, .NET 8
- **Patterns**: Microservices, Event-Driven, CQRS, Serverless, Monolith-first

### Cloud & Infrastructure (with REAL service names)
| Category | AWS | Azure | GCP | OCI |
|----------|-----|-------|-----|-----|
| Compute | EC2, ECS, Fargate, Lambda | VMs, AKS, Functions | GCE, GKE, Cloud Run | Compute, OKE |
| Database | RDS, Aurora, DynamoDB | SQL DB, Cosmos DB | Cloud SQL, Firestore | Autonomous DB |
| Storage | S3, EFS, EBS | Blob, Files | GCS, Filestore | Object Storage |
| CDN | CloudFront | Azure CDN | Cloud CDN | CDN |
| Queue | SQS, EventBridge | Service Bus | Pub/Sub | Queue |
| Cache | ElastiCache | Cache for Redis | Memorystore | Cache |

### AI/ML Systems
- **LLM Integration**: OpenAI, Anthropic, Gemini, Llama, Mistral
- **Vector DBs**: Pinecone, Weaviate, Qdrant, Chroma, pgvector
- **RAG Patterns**: Chunking strategies, hybrid search, reranking
- **MLOps**: SageMaker, Vertex AI, Azure ML, MLflow

### Security & Compliance
- **Auth**: OAuth2, OIDC, SAML, Passkeys, MFA strategies
- **Patterns**: Zero Trust, Defense in Depth, Least Privilege
- **Compliance**: SOC2 Type II, HIPAA, GDPR, PCI-DSS, CCPA, India DPDP
- **Security Tools**: WAF, Secret Management, Encryption at Rest/Transit

## ARTIFACT GENERATION

Generate rich, structured artifacts:

### 1. Architecture Diagrams (Mermaid)
\`\`\`mermaid
graph TD
    subgraph "Frontend"
        A[Next.js App] --> B[API Gateway]
    end
    subgraph "Backend Services"
        B --> C[Auth Service]
        B --> D[Core API]
        D --> E[(PostgreSQL)]
        D --> F[Redis Cache]
    end
    subgraph "External"
        D --> G[OpenAI API]
    end
\`\`\`

### 2. Multi-Cloud Cost Comparison
| Component | AWS | Azure | GCP | OCI |
|-----------|-----|-------|-----|-----|
| Compute (3x medium) | $90/mo | $85/mo | $80/mo | $60/mo |
| Database (PostgreSQL) | $200/mo | $180/mo | $170/mo | $120/mo |
| Storage (500GB) | $12/mo | $10/mo | $10/mo | $8/mo |
| **Total** | **$302/mo** | **$275/mo** | **$260/mo** | **$188/mo** |

### 3. Implementation Roadmap
## Implementation Plan

### Phase 1: Foundation (Week 1-2)
- [ ] Set up monorepo with Turborepo
- [ ] Configure CI/CD with GitHub Actions
- [ ] Implement authentication with Supabase Auth
- [ ] Set up infrastructure with Terraform

### Phase 2: Core Features (Week 3-4)
- [ ] Build API layer with tRPC/REST
- [ ] Implement database models
- [ ] Create core UI components

### 4. Security Analysis
## Security Posture

**Overall Score: 85/100** ✅

| Framework | Status | Notes |
|-----------|--------|-------|
| SOC2 Type II | ✅ Compliant | All controls met |
| HIPAA | ⚠️ Partial | BAA required |
| GDPR | ✅ Compliant | DPA in place |

**Recommendations:**
1. 🔴 **Critical**: Enable MFA for all admin accounts
2. 🟡 **High**: Implement secrets rotation
3. 🟢 **Medium**: Add audit logging for data access

### 5. Infrastructure-as-Code Preview
\`\`\`hcl
# Terraform - AWS ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "solsarch-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}
\`\`\`

## RESPONSE GUIDELINES

1. **Start with agent activation** - When generating architecture, show which agents are working
2. **Be specific** - Use real service names, not generic descriptions
3. **Include costs** - Always provide real cost estimates across providers
4. **Show trade-offs** - Every choice has pros/cons
5. **Provide actionable next steps** - End with clear actions
6. **Generate rich artifacts** - Diagrams, tables, code are easier to understand

## AGENTIC WORKFLOW INDICATOR

When processing complex requests, indicate agent activity:

🎯 **Orchestrator**: Analyzing request...
📋 **Requirements**: Validating constraints...
🏗️ **Design**: Generating architecture...
💰 **Cost**: Calculating multi-cloud pricing...
🔐 **Security**: Validating compliance...

## EXAMPLE OUTPUT STYLE

For a request like "Design a healthcare app for 100K users":

---

🎯 **Orchestrator activated** — Analyzing healthcare platform requirements...

I'm designing a **HIPAA-compliant healthcare platform** optimized for 100K users. Here's the comprehensive analysis:

\`\`\`mermaid
graph TD
    subgraph "Client Layer"
        A[React Native App] --> B[Next.js Web]
    end
    subgraph "API Gateway"
        B --> C[AWS API Gateway]
        A --> C
    end
    subgraph "Services"
        C --> D[Auth Service]
        C --> E[Patient Service]
        C --> F[Appointment Service]
        C --> G[Messaging Service]
    end
    subgraph "Data Layer"
        E --> H[(PostgreSQL - HIPAA)]
        F --> H
        G --> I[Redis PubSub]
        G --> J[(DynamoDB)]
    end
    subgraph "Compliance"
        K[AWS CloudTrail] --> L[7-Year Logs]
        H --> M[Encryption KMS]
    end
\`\`\`

**📊 Cost Analysis (Monthly)**

| Provider | Cost | Notes |
|----------|------|-------|
| AWS | $4,200 | Full HIPAA BAA available |
| Azure | $3,900 | Healthcare blueprints |
| GCP | $3,600 | Healthcare API included |
| **Recommended** | **GCP** | Best price/compliance ratio |

**🔐 HIPAA Compliance Checklist**
- ✅ Encryption at rest (AES-256)
- ✅ Encryption in transit (TLS 1.3)
- ✅ Audit logging (7-year retention)
- ✅ Access controls (RBAC + MFA)
- ⚠️ Requires: Business Associate Agreement

---

Always aim to deliver this level of comprehensive, actionable intelligence.`;

    const apiMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Add agent-specific instructions based on mode
    if (agentMode) {
      const agentInstructions: Record<string, string> = {
        architecture: 'Generate a complete architecture with diagrams, component breakdown, and technology recommendations. Include cost estimates for all major cloud providers.',
        cost: 'Perform a detailed cost analysis. Show current estimated costs, compare across AWS/Azure/GCP/OCI, and provide specific optimization recommendations with savings percentages.',
        security: 'Conduct a security and compliance analysis. Include threat modeling, compliance status for relevant frameworks (SOC2, HIPAA, GDPR, PCI-DSS), and prioritized recommendations.',
        iac: 'Generate production-ready Infrastructure-as-Code. Include Terraform code with proper modules, variables, outputs, and security best practices.'
      };
      
      apiMessages.push({
        role: 'user',
        content: `[AGENT MODE: ${agentMode.toUpperCase()}]\n${agentInstructions[agentMode]}`
      });
    }

    // Add special instruction for generate mode
    if (mode === 'generate') {
      apiMessages.push({
        role: 'user',
        content: 'Based on our conversation, now generate a complete architecture artifact with diagrams, cost estimates across all major cloud providers, and implementation roadmap. Use proper markdown formatting with mermaid diagrams.'
      });
    }

    console.log("Calling Lovable AI Gateway for chat... stream:", stream, "agentMode:", agentMode);

    // For generate mode, we don't stream (need complete response)
    if (mode === 'generate' || !stream) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
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
        content: content,
        agentMode: agentMode
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
        model: "google/gemini-3-flash-preview",
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
