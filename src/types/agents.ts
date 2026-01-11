// Agent System Types for SolsArch 2.0

export type AgentType = 
  | 'orchestrator'
  | 'requirements'
  | 'design'
  | 'cost'
  | 'security'
  | 'iac'
  | 'deployment'
  | 'monitoring';

export type AgentStatus = 'idle' | 'running' | 'completed' | 'error' | 'waiting';

export interface AgentStep {
  id: string;
  agentType: AgentType;
  title: string;
  description: string;
  status: AgentStatus;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
  subSteps?: AgentSubStep[];
}

export interface AgentSubStep {
  id: string;
  title: string;
  status: AgentStatus;
  detail?: string;
}

export interface AgentWorkflow {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  steps: AgentStep[];
  startedAt: Date;
  completedAt?: Date;
  totalDuration?: number;
  result?: WorkflowResult;
}

export interface WorkflowResult {
  architecture?: ArchitectureOutput;
  costAnalysis?: CostAnalysisOutput;
  securityAnalysis?: SecurityAnalysisOutput;
  iacCode?: IaCOutput;
  recommendations?: RecommendationOutput[];
}

export interface ArchitectureOutput {
  diagram: string;
  components: ArchitectureComponent[];
  description: string;
  patterns: string[];
}

export interface ArchitectureComponent {
  name: string;
  type: string;
  provider?: string;
  service?: string;
  description: string;
  connections: string[];
}

export interface CostAnalysisOutput {
  totalMonthlyCost: number;
  providers: ProviderCost[];
  breakdown: CostBreakdownItem[];
  optimizations: CostOptimization[];
  savings?: number;
}

export interface ProviderCost {
  provider: 'aws' | 'azure' | 'gcp' | 'oci';
  monthlyCost: number;
  components: { name: string; cost: number }[];
}

export interface CostBreakdownItem {
  category: string;
  service: string;
  monthlyCost: number;
  usage: string;
}

export interface CostOptimization {
  title: string;
  description: string;
  currentCost: number;
  optimizedCost: number;
  savingsPercent: number;
  effort: 'low' | 'medium' | 'high';
}

export interface SecurityAnalysisOutput {
  overallScore: number;
  complianceFrameworks: ComplianceStatus[];
  threats: ThreatModel[];
  recommendations: SecurityRecommendation[];
}

export interface ComplianceStatus {
  framework: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  requirements: { name: string; met: boolean; note?: string }[];
}

export interface ThreatModel {
  id: string;
  name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  mitigation: string;
}

export interface SecurityRecommendation {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  implementation: string;
}

export interface IaCOutput {
  format: 'terraform' | 'cloudformation' | 'pulumi' | 'cdk';
  provider: 'aws' | 'azure' | 'gcp' | 'oci' | 'multi';
  code: string;
  files: { name: string; content: string }[];
  instructions: string[];
}

export interface RecommendationOutput {
  type: 'architecture' | 'cost' | 'security' | 'performance';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}

// Agent metadata
export const AGENT_METADATA: Record<AgentType, { 
  name: string; 
  icon: string; 
  color: string;
  description: string;
}> = {
  orchestrator: {
    name: 'Master Orchestrator',
    icon: '🎯',
    color: 'text-primary',
    description: 'Coordinates all agents and manages workflow'
  },
  requirements: {
    name: 'Requirements Agent',
    icon: '📋',
    color: 'text-blue-400',
    description: 'Analyzes and validates requirements'
  },
  design: {
    name: 'Design Agent',
    icon: '🏗️',
    color: 'text-purple-400',
    description: 'Creates architecture designs and diagrams'
  },
  cost: {
    name: 'Cost Optimization Agent',
    icon: '💰',
    color: 'text-green-400',
    description: 'Calculates and optimizes cloud costs'
  },
  security: {
    name: 'Security Agent',
    icon: '🔐',
    color: 'text-red-400',
    description: 'Validates security and compliance'
  },
  iac: {
    name: 'IaC Agent',
    icon: '📜',
    color: 'text-orange-400',
    description: 'Generates Infrastructure-as-Code'
  },
  deployment: {
    name: 'Deployment Agent',
    icon: '🚀',
    color: 'text-cyan-400',
    description: 'Plans and executes deployments'
  },
  monitoring: {
    name: 'Monitoring Agent',
    icon: '📊',
    color: 'text-yellow-400',
    description: 'Sets up observability and alerting'
  }
};
