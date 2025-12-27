import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  Network, 
  GitBranch, 
  Workflow, 
  Box, 
  Layers,
  Server,
  Database,
  Lock,
  Zap,
  Globe,
  Cpu
} from 'lucide-react';

export interface DiagramPreset {
  id: string;
  name: string;
  description: string;
  category: 'cloud' | 'network' | 'data' | 'security' | 'microservices' | 'ai-ml';
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
}

export const DIAGRAM_PRESETS: DiagramPreset[] = [
  {
    id: 'web-app-3tier',
    name: '3-Tier Web Application',
    description: 'Classic presentation, business logic, and data tier architecture',
    category: 'cloud',
    prompt: 'Design a 3-tier web application architecture with a React frontend hosted on CDN, Node.js API servers with auto-scaling, and PostgreSQL database with read replicas. Include Redis caching layer and consider multi-region deployment.',
    icon: Globe,
    tags: ['Web', 'Scalable', 'Classic'],
  },
  {
    id: 'microservices',
    name: 'Microservices Architecture',
    description: 'Event-driven microservices with service mesh and API gateway',
    category: 'microservices',
    prompt: 'Design a microservices architecture with 5-10 services, API Gateway, service mesh (Istio/Linkerd), message queue for async communication, distributed tracing, and centralized logging. Include container orchestration with Kubernetes.',
    icon: Layers,
    tags: ['K8s', 'Event-Driven', 'Scalable'],
  },
  {
    id: 'data-pipeline',
    name: 'Real-time Data Pipeline',
    description: 'Streaming data ingestion with analytics and ML processing',
    category: 'data',
    prompt: 'Design a real-time data pipeline that ingests 100K events/second from IoT devices, processes them through Kafka/Kinesis, stores in data lake (S3/GCS), and enables real-time analytics with Apache Flink or Spark Streaming. Include data warehouse integration.',
    icon: Workflow,
    tags: ['Streaming', 'Analytics', 'Big Data'],
  },
  {
    id: 'serverless',
    name: 'Serverless Event Architecture',
    description: 'Fully serverless with functions, queues, and managed services',
    category: 'cloud',
    prompt: 'Design a serverless architecture using Lambda/Cloud Functions, API Gateway, DynamoDB/Firestore, SQS/Pub-Sub for event processing, and S3/GCS for file storage. Include Step Functions for workflow orchestration.',
    icon: Zap,
    tags: ['Serverless', 'Cost-Effective', 'Auto-Scale'],
  },
  {
    id: 'ml-platform',
    name: 'ML Training & Inference Platform',
    description: 'End-to-end machine learning platform with GPU clusters',
    category: 'ai-ml',
    prompt: 'Design an ML platform with GPU training clusters (A100/H100), experiment tracking (MLflow), model registry, feature store, real-time inference endpoints with auto-scaling, A/B testing, and model monitoring. Include data versioning with DVC.',
    icon: Cpu,
    tags: ['GPU', 'MLOps', 'Training'],
  },
  {
    id: 'zero-trust',
    name: 'Zero Trust Security Architecture',
    description: 'Defense in depth with identity-based access control',
    category: 'security',
    prompt: 'Design a zero-trust security architecture with identity provider (Okta/Azure AD), service mesh mTLS, API gateway with JWT validation, secrets management (Vault), network segmentation, WAF, DDoS protection, and SIEM integration.',
    icon: Lock,
    tags: ['Zero Trust', 'IAM', 'Secure'],
  },
  {
    id: 'hybrid-cloud',
    name: 'Hybrid Cloud Architecture',
    description: 'On-premises integrated with public cloud services',
    category: 'network',
    prompt: 'Design a hybrid cloud architecture connecting on-premises datacenter to AWS/Azure via Direct Connect/ExpressRoute. Include hybrid DNS, identity federation, disaster recovery, and workload portability with Kubernetes.',
    icon: Network,
    tags: ['Hybrid', 'Multi-Cloud', 'DR'],
  },
  {
    id: 'saas-multitenant',
    name: 'Multi-Tenant SaaS Platform',
    description: 'SaaS architecture with tenant isolation and billing',
    category: 'cloud',
    prompt: 'Design a multi-tenant SaaS platform with tenant isolation at data and compute layers, usage metering, billing integration (Stripe), admin portal, self-service onboarding, and white-label support. Include compliance features for SOC2.',
    icon: Server,
    tags: ['SaaS', 'Multi-Tenant', 'Billing'],
  },
  {
    id: 'rag-ai',
    name: 'RAG AI Application',
    description: 'Retrieval-augmented generation with vector database',
    category: 'ai-ml',
    prompt: 'Design a RAG (Retrieval Augmented Generation) application with document ingestion pipeline, embedding generation, vector database (Pinecone/Weaviate/pgvector), LLM inference layer (OpenAI/Claude), and caching. Include monitoring for hallucinations.',
    icon: Database,
    tags: ['RAG', 'LLM', 'Vector DB'],
  },
];

interface DiagramPresetsProps {
  onSelectPreset: (preset: DiagramPreset) => void;
}

const categoryColors: Record<DiagramPreset['category'], string> = {
  cloud: 'bg-info/10 text-info border-info/30',
  network: 'bg-accent/10 text-accent border-accent/30',
  data: 'bg-success/10 text-success border-success/30',
  security: 'bg-destructive/10 text-destructive border-destructive/30',
  microservices: 'bg-warning/10 text-warning border-warning/30',
  'ai-ml': 'bg-primary/10 text-primary border-primary/30',
};

export function DiagramPresets({ onSelectPreset }: DiagramPresetsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Load a Preset Architecture</h3>
        <p className="text-sm text-muted-foreground">
          Choose a template to get started quickly, or describe your own requirements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DIAGRAM_PRESETS.map((preset) => (
          <Card 
            key={preset.id}
            className="cursor-pointer hover:border-primary/50 transition-all group bg-card/50"
            onClick={() => onSelectPreset(preset)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <preset.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base leading-tight">{preset.name}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`mt-1.5 text-[10px] capitalize ${categoryColors[preset.category]}`}
                  >
                    {preset.category.replace('-', '/')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs leading-relaxed mb-3">
                {preset.description}
              </CardDescription>
              <div className="flex flex-wrap gap-1.5">
                {preset.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
