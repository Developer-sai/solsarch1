export interface Requirements {
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

export interface ProviderCost {
  service: string;
  sku: string;
  monthlyCost: number;
}

export interface ArchitectureComponent {
  name: string;
  serviceType: string;
  providers: {
    aws: ProviderCost;
    azure: ProviderCost;
    gcp: ProviderCost;
    oci: ProviderCost;
  };
}

export interface Architecture {
  variant: 'cost-optimized' | 'balanced' | 'performance-optimized';
  name: string;
  description: string;
  components: ArchitectureComponent[];
  assumptions: string[];
  tradeOffs: string[];
  totalCosts: {
    aws: number;
    azure: number;
    gcp: number;
    oci: number;
  };
}

export interface Recommendation {
  type: string;
  title: string;
  description: string;
  impactPercentage: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ArchitectureResult {
  architectures: Architecture[];
  mermaidDiagram: string;
  recommendations: Recommendation[];
}

export interface GPUSku {
  id: string;
  provider: string;
  name: string;
  gpuType: string;
  gpuCount: number;
  gpuMemoryGB: number;
  tflops: number;
  pricePerHour: number;
  pricePerMonth: number;
  region: string;
}
