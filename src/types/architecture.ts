export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'oci';

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
  // Hybrid multi-cloud preferences
  hybridMode?: boolean;
  providerPreferences?: {
    storage?: CloudProvider;
    database?: CloudProvider;
    compute?: CloudProvider;
    cdn?: CloudProvider;
    cache?: CloudProvider;
    queue?: CloudProvider;
    networking?: CloudProvider;
    gpu?: CloudProvider;
    maps?: 'google' | 'azure' | 'aws' | 'mapbox';
    search?: CloudProvider;
    analytics?: CloudProvider;
  };
  existingServices?: ExistingService[];
}

export interface ExistingService {
  name: string;
  provider: CloudProvider | 'google-maps' | 'mapbox' | 'twilio' | 'stripe' | 'other';
  serviceType: string;
  description?: string;
  monthlyCost?: number;
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
  // For hybrid mode - which provider is selected for this component
  selectedProvider?: CloudProvider;
  // For external/third-party services
  isExternal?: boolean;
  externalService?: {
    provider: string;
    service: string;
    monthlyCost: number;
  };
}

export interface Architecture {
  variant: 'cost-optimized' | 'balanced' | 'performance-optimized' | 'hybrid-optimized';
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
  // Hybrid mode specific
  hybridTotalCost?: number;
  hybridBreakdown?: {
    provider: CloudProvider | string;
    components: string[];
    cost: number;
  }[];
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
  // Hybrid specific
  hybridArchitecture?: Architecture;
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

// Provider metadata
export const CLOUD_PROVIDERS: Record<CloudProvider, { name: string; color: string; icon: string }> = {
  aws: { name: 'AWS', color: 'bg-orange-500', icon: '☁️' },
  azure: { name: 'Azure', color: 'bg-blue-500', icon: '🔷' },
  gcp: { name: 'GCP', color: 'bg-red-500', icon: '🔺' },
  oci: { name: 'OCI', color: 'bg-purple-500', icon: '🔮' },
};

export const SERVICE_TYPES = [
  'compute',
  'database',
  'storage',
  'networking',
  'cache',
  'queue',
  'cdn',
  'gpu',
  'maps',
  'search',
  'analytics',
  'auth',
  'api-gateway',
  'container',
  'serverless',
] as const;

export type ServiceType = typeof SERVICE_TYPES[number];
