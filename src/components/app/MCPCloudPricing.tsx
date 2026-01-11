import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Cloud, 
  DollarSign, 
  TrendingDown, 
  TrendingUp,
  RefreshCw,
  Zap,
  Server,
  Database,
  HardDrive,
  Globe,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingData {
  service: string;
  tier: string;
  region: string;
  pricePerHour: number;
  pricePerMonth: number;
  specs: {
    vcpu?: number;
    memory?: number;
    storage?: number;
  };
}

interface ProviderPricing {
  provider: 'aws' | 'azure' | 'gcp' | 'oci';
  name: string;
  color: string;
  bgColor: string;
  logo: string;
  services: PricingData[];
  lastUpdated: Date;
  status: 'connected' | 'syncing' | 'error';
}

// Mock real-time pricing data (would be from MCP in production)
const MOCK_PRICING: ProviderPricing[] = [
  {
    provider: 'aws',
    name: 'Amazon Web Services',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    logo: '🟠',
    status: 'connected',
    lastUpdated: new Date(),
    services: [
      { service: 'EC2', tier: 't3.medium', region: 'us-east-1', pricePerHour: 0.0416, pricePerMonth: 30.37, specs: { vcpu: 2, memory: 4 } },
      { service: 'EC2', tier: 't3.large', region: 'us-east-1', pricePerHour: 0.0832, pricePerMonth: 60.74, specs: { vcpu: 2, memory: 8 } },
      { service: 'EC2', tier: 'm5.xlarge', region: 'us-east-1', pricePerHour: 0.192, pricePerMonth: 140.16, specs: { vcpu: 4, memory: 16 } },
      { service: 'RDS', tier: 'db.t3.medium', region: 'us-east-1', pricePerHour: 0.068, pricePerMonth: 49.64, specs: { vcpu: 2, memory: 4, storage: 20 } },
      { service: 'RDS', tier: 'db.r5.large', region: 'us-east-1', pricePerHour: 0.24, pricePerMonth: 175.2, specs: { vcpu: 2, memory: 16, storage: 100 } },
      { service: 'S3', tier: 'Standard', region: 'us-east-1', pricePerHour: 0.023, pricePerMonth: 23, specs: { storage: 1000 } },
      { service: 'Lambda', tier: '1M requests', region: 'us-east-1', pricePerHour: 0, pricePerMonth: 0.20, specs: {} },
      { service: 'CloudFront', tier: '1TB transfer', region: 'global', pricePerHour: 0, pricePerMonth: 85, specs: {} },
    ]
  },
  {
    provider: 'azure',
    name: 'Microsoft Azure',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    logo: '🔵',
    status: 'connected',
    lastUpdated: new Date(),
    services: [
      { service: 'VM', tier: 'B2s', region: 'eastus', pricePerHour: 0.0416, pricePerMonth: 30.37, specs: { vcpu: 2, memory: 4 } },
      { service: 'VM', tier: 'D2s v3', region: 'eastus', pricePerHour: 0.096, pricePerMonth: 70.08, specs: { vcpu: 2, memory: 8 } },
      { service: 'VM', tier: 'D4s v3', region: 'eastus', pricePerHour: 0.192, pricePerMonth: 140.16, specs: { vcpu: 4, memory: 16 } },
      { service: 'SQL Database', tier: 'S2', region: 'eastus', pricePerHour: 0.1, pricePerMonth: 73, specs: { vcpu: 2, memory: 4, storage: 250 } },
      { service: 'Blob Storage', tier: 'Hot', region: 'eastus', pricePerHour: 0.02, pricePerMonth: 20, specs: { storage: 1000 } },
      { service: 'Functions', tier: '1M executions', region: 'eastus', pricePerHour: 0, pricePerMonth: 0.20, specs: {} },
      { service: 'CDN', tier: 'Standard', region: 'global', pricePerHour: 0, pricePerMonth: 75, specs: {} },
    ]
  },
  {
    provider: 'gcp',
    name: 'Google Cloud Platform',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    logo: '🔴',
    status: 'connected',
    lastUpdated: new Date(),
    services: [
      { service: 'Compute Engine', tier: 'e2-medium', region: 'us-central1', pricePerHour: 0.0335, pricePerMonth: 24.46, specs: { vcpu: 2, memory: 4 } },
      { service: 'Compute Engine', tier: 'e2-standard-2', region: 'us-central1', pricePerHour: 0.067, pricePerMonth: 48.91, specs: { vcpu: 2, memory: 8 } },
      { service: 'Compute Engine', tier: 'n2-standard-4', region: 'us-central1', pricePerHour: 0.194, pricePerMonth: 141.62, specs: { vcpu: 4, memory: 16 } },
      { service: 'Cloud SQL', tier: 'db-standard-2', region: 'us-central1', pricePerHour: 0.0945, pricePerMonth: 68.99, specs: { vcpu: 2, memory: 7.5, storage: 10 } },
      { service: 'Cloud Storage', tier: 'Standard', region: 'us', pricePerHour: 0.02, pricePerMonth: 20, specs: { storage: 1000 } },
      { service: 'Cloud Functions', tier: '1M invocations', region: 'us-central1', pricePerHour: 0, pricePerMonth: 0.40, specs: {} },
      { service: 'Cloud CDN', tier: 'Standard', region: 'global', pricePerHour: 0, pricePerMonth: 70, specs: {} },
    ]
  },
  {
    provider: 'oci',
    name: 'Oracle Cloud Infrastructure',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    logo: '🟣',
    status: 'connected',
    lastUpdated: new Date(),
    services: [
      { service: 'Compute', tier: 'VM.Standard.E4.Flex', region: 'us-ashburn-1', pricePerHour: 0.025, pricePerMonth: 18.25, specs: { vcpu: 2, memory: 4 } },
      { service: 'Compute', tier: 'VM.Standard.E4.Flex', region: 'us-ashburn-1', pricePerHour: 0.05, pricePerMonth: 36.50, specs: { vcpu: 2, memory: 8 } },
      { service: 'Compute', tier: 'VM.Standard.E4.Flex', region: 'us-ashburn-1', pricePerHour: 0.1, pricePerMonth: 73, specs: { vcpu: 4, memory: 16 } },
      { service: 'Autonomous DB', tier: 'ATP', region: 'us-ashburn-1', pricePerHour: 0.0567, pricePerMonth: 41.39, specs: { vcpu: 1, memory: 8, storage: 20 } },
      { service: 'Object Storage', tier: 'Standard', region: 'us-ashburn-1', pricePerHour: 0.0255, pricePerMonth: 25.50, specs: { storage: 1000 } },
      { service: 'Functions', tier: '1M invocations', region: 'us-ashburn-1', pricePerHour: 0, pricePerMonth: 0.20, specs: {} },
    ]
  },
];

interface MCPCloudPricingProps {
  onSelectPricing?: (provider: string, service: string, tier: string) => void;
}

export function MCPCloudPricing({ onSelectPricing }: MCPCloudPricingProps) {
  const [providers, setProviders] = useState<ProviderPricing[]>(MOCK_PRICING);
  const [selectedCategory, setSelectedCategory] = useState<string>('compute');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState({ vcpu: 2, memory: 8 });

  const refreshPricing = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate MCP fetch
    await new Promise(resolve => setTimeout(resolve, 1500));
    setProviders(prev => prev.map(p => ({ ...p, lastUpdated: new Date() })));
    setIsRefreshing(false);
  }, []);

  const getServiceIcon = (service: string) => {
    const lower = service.toLowerCase();
    if (lower.includes('ec2') || lower.includes('vm') || lower.includes('compute')) return <Server className="w-4 h-4" />;
    if (lower.includes('rds') || lower.includes('sql') || lower.includes('db')) return <Database className="w-4 h-4" />;
    if (lower.includes('s3') || lower.includes('storage') || lower.includes('blob')) return <HardDrive className="w-4 h-4" />;
    if (lower.includes('cdn') || lower.includes('cloudfront')) return <Globe className="w-4 h-4" />;
    if (lower.includes('lambda') || lower.includes('function')) return <Zap className="w-4 h-4" />;
    return <Cloud className="w-4 h-4" />;
  };

  const categories = [
    { id: 'compute', name: 'Compute', icon: Server },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'storage', name: 'Storage', icon: HardDrive },
    { id: 'serverless', name: 'Serverless', icon: Zap },
  ];

  const filterByCategory = (services: PricingData[], category: string) => {
    return services.filter(s => {
      const lower = s.service.toLowerCase();
      switch (category) {
        case 'compute': return lower.includes('ec2') || lower.includes('vm') || lower.includes('compute');
        case 'database': return lower.includes('rds') || lower.includes('sql') || lower.includes('db');
        case 'storage': return lower.includes('s3') || lower.includes('storage') || lower.includes('blob') || lower.includes('object');
        case 'serverless': return lower.includes('lambda') || lower.includes('function');
        default: return true;
      }
    });
  };

  const findCheapestForSpecs = (vcpu: number, memory: number) => {
    const results: { provider: string; service: PricingData; color: string }[] = [];
    
    providers.forEach(p => {
      const matching = p.services.filter(s => 
        (s.specs.vcpu || 0) >= vcpu && 
        (s.specs.memory || 0) >= memory
      ).sort((a, b) => a.pricePerMonth - b.pricePerMonth);
      
      if (matching.length > 0) {
        results.push({ provider: p.name, service: matching[0], color: p.color });
      }
    });
    
    return results.sort((a, b) => a.service.pricePerMonth - b.service.pricePerMonth);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Cloud className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">MCP Cloud Pricing</h3>
            <p className="text-xs text-muted-foreground">Real-time pricing across providers</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshPricing}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Provider Status */}
      <div className="grid grid-cols-4 gap-2">
        {providers.map(provider => (
          <div 
            key={provider.provider}
            className={cn(
              "p-3 rounded-lg border border-border/50 text-center",
              provider.bgColor
            )}
          >
            <div className="text-lg mb-1">{provider.logo}</div>
            <div className="text-xs font-medium truncate">{provider.provider.toUpperCase()}</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                provider.status === 'connected' && "bg-green-500",
                provider.status === 'syncing' && "bg-yellow-500 animate-pulse",
                provider.status === 'error' && "bg-red-500"
              )} />
              <span className="text-[10px] text-muted-foreground capitalize">{provider.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-4 w-full">
          {categories.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id} className="text-xs gap-1.5">
              <cat.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{cat.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(cat => (
          <TabsContent key={cat.id} value={cat.id} className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{cat.name} Pricing Comparison</span>
                  <Badge variant="secondary" className="text-xs font-normal">
                    Updated {new Date().toLocaleTimeString()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {providers.map(provider => {
                      const services = filterByCategory(provider.services, cat.id);
                      if (services.length === 0) return null;

                      return (
                        <div key={provider.provider} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span>{provider.logo}</span>
                            <span className={cn("text-sm font-medium", provider.color)}>
                              {provider.name}
                            </span>
                          </div>
                          <div className="grid gap-2 pl-6">
                            {services.map((service, idx) => (
                              <button
                                key={idx}
                                onClick={() => onSelectPricing?.(provider.provider, service.service, service.tier)}
                                className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors text-left group"
                              >
                                <div className="flex items-center gap-2">
                                  {getServiceIcon(service.service)}
                                  <div>
                                    <div className="text-sm font-medium">{service.tier}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {service.specs.vcpu && `${service.specs.vcpu} vCPU`}
                                      {service.specs.memory && ` • ${service.specs.memory} GB RAM`}
                                      {service.specs.storage && ` • ${service.specs.storage} GB`}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-primary">
                                    ${service.pricePerMonth.toFixed(2)}/mo
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    ${service.pricePerHour.toFixed(4)}/hr
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Compare */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Quick Compare: {selectedSpecs.vcpu} vCPU, {selectedSpecs.memory} GB RAM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            {[{v: 2, m: 4}, {v: 2, m: 8}, {v: 4, m: 16}, {v: 8, m: 32}].map(spec => (
              <Button
                key={`${spec.v}-${spec.m}`}
                variant={selectedSpecs.vcpu === spec.v && selectedSpecs.memory === spec.m ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setSelectedSpecs({ vcpu: spec.v, memory: spec.m })}
              >
                {spec.v}vCPU/{spec.m}GB
              </Button>
            ))}
          </div>
          
          <div className="space-y-2">
            {findCheapestForSpecs(selectedSpecs.vcpu, selectedSpecs.memory).map((result, idx) => (
              <div 
                key={result.provider}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg",
                  idx === 0 ? "bg-green-500/10 border border-green-500/20" : "bg-secondary/30"
                )}
              >
                <div className="flex items-center gap-2">
                  {idx === 0 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  <span className={cn("text-sm font-medium", result.color)}>{result.provider}</span>
                  <span className="text-xs text-muted-foreground">{result.service.tier}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">${result.service.pricePerMonth.toFixed(2)}/mo</span>
                  {idx === 0 && <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">Cheapest</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
