import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  CloudCog, 
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  PieChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CostData {
  provider: 'aws' | 'azure' | 'gcp' | 'oci';
  name: string;
  color: string;
  totalCost: number;
  breakdown: { service: string; cost: number; change: number }[];
}

const MOCK_COST_DATA: CostData[] = [
  {
    provider: 'aws',
    name: 'AWS',
    color: 'bg-orange-500',
    totalCost: 8420,
    breakdown: [
      { service: 'EC2', cost: 3200, change: -5 },
      { service: 'RDS', cost: 2100, change: 2 },
      { service: 'S3', cost: 890, change: -12 },
      { service: 'CloudFront', cost: 650, change: 0 },
      { service: 'Lambda', cost: 420, change: 8 },
      { service: 'Other', cost: 1160, change: 3 }
    ]
  },
  {
    provider: 'azure',
    name: 'Azure',
    color: 'bg-blue-500',
    totalCost: 7850,
    breakdown: [
      { service: 'VMs', cost: 2900, change: -3 },
      { service: 'SQL Database', cost: 1950, change: 0 },
      { service: 'Blob Storage', cost: 780, change: -8 },
      { service: 'CDN', cost: 580, change: 5 },
      { service: 'Functions', cost: 380, change: 12 },
      { service: 'Other', cost: 1260, change: 1 }
    ]
  },
  {
    provider: 'gcp',
    name: 'GCP',
    color: 'bg-red-500',
    totalCost: 6920,
    breakdown: [
      { service: 'Compute Engine', cost: 2600, change: -7 },
      { service: 'Cloud SQL', cost: 1800, change: -2 },
      { service: 'Cloud Storage', cost: 720, change: -15 },
      { service: 'Cloud CDN', cost: 490, change: 3 },
      { service: 'Cloud Functions', cost: 350, change: 6 },
      { service: 'Other', cost: 960, change: 0 }
    ]
  },
  {
    provider: 'oci',
    name: 'OCI',
    color: 'bg-purple-500',
    totalCost: 5280,
    breakdown: [
      { service: 'Compute', cost: 1900, change: -10 },
      { service: 'Autonomous DB', cost: 1400, change: -5 },
      { service: 'Object Storage', cost: 580, change: -20 },
      { service: 'CDN', cost: 420, change: 0 },
      { service: 'Functions', cost: 280, change: 4 },
      { service: 'Other', cost: 700, change: -2 }
    ]
  }
];

const OPTIMIZATIONS = [
  {
    id: 1,
    title: 'Right-size EC2 instances',
    description: 'Downsize underutilized instances (avg 15% CPU)',
    savings: 1800,
    effort: 'low' as const,
    impact: 43
  },
  {
    id: 2,
    title: 'Enable S3 lifecycle policies',
    description: 'Move cold data to Glacier after 30 days',
    savings: 800,
    effort: 'low' as const,
    impact: 50
  },
  {
    id: 3,
    title: 'Use reserved instances',
    description: '1-year commitment for stable workloads',
    savings: 2400,
    effort: 'medium' as const,
    impact: 35
  },
  {
    id: 4,
    title: 'Consolidate RDS instances',
    description: 'Merge dev/staging databases',
    savings: 600,
    effort: 'high' as const,
    impact: 28
  }
];

export function MultiCloudCostDashboard() {
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  
  const totalCost = MOCK_COST_DATA.reduce((sum, p) => sum + p.totalCost, 0);
  const cheapestProvider = MOCK_COST_DATA.reduce((min, p) => 
    p.totalCost < min.totalCost ? p : min
  );
  const potentialSavings = OPTIMIZATIONS.reduce((sum, o) => sum + o.savings, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Monthly Cost</p>
                <p className="text-2xl font-bold">${totalCost.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Cheapest Provider</p>
                <p className="text-2xl font-bold">{cheapestProvider.name}</p>
                <p className="text-xs text-green-500">${cheapestProvider.totalCost}/mo</p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Potential Savings</p>
                <p className="text-2xl font-bold">${potentialSavings.toLocaleString()}</p>
                <p className="text-xs text-yellow-500">{Math.round((potentialSavings / totalCost) * 100)}% reduction</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Providers</p>
                <p className="text-2xl font-bold">4</p>
                <p className="text-xs text-blue-500">Multi-cloud active</p>
              </div>
              <CloudCog className="w-8 h-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5 text-primary" />
            Provider Cost Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MOCK_COST_DATA.map(provider => {
              const percentage = (provider.totalCost / totalCost) * 100;
              const isCheapest = provider.provider === cheapestProvider.provider;
              
              return (
                <div key={provider.provider} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", provider.color)} />
                      <span className="font-medium">{provider.name}</span>
                      {isCheapest && (
                        <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-500 border-0">
                          Cheapest
                        </Badge>
                      )}
                    </div>
                    <span className="font-semibold">${provider.totalCost.toLocaleString()}/mo</span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={cn("h-2", isCheapest && "[&>div]:bg-green-500")} 
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown & Optimizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown by Service */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="w-5 h-5 text-primary" />
              Cost by Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="aws">
              <TabsList className="grid grid-cols-4 mb-4">
                {MOCK_COST_DATA.map(p => (
                  <TabsTrigger key={p.provider} value={p.provider} className="text-xs">
                    {p.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {MOCK_COST_DATA.map(provider => (
                <TabsContent key={provider.provider} value={provider.provider}>
                  <div className="space-y-3">
                    {provider.breakdown.map(item => (
                      <div key={item.service} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <span className="text-sm">{item.service}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">${item.cost}</span>
                          {item.change !== 0 && (
                            <span className={cn(
                              "text-xs flex items-center gap-0.5",
                              item.change > 0 ? "text-red-500" : "text-green-500"
                            )}>
                              {item.change > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {Math.abs(item.change)}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Optimization Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-yellow-500" />
              Optimization Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {OPTIMIZATIONS.map(opt => (
                <div 
                  key={opt.id} 
                  className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{opt.title}</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            opt.effort === 'low' && "border-green-500/50 text-green-500",
                            opt.effort === 'medium' && "border-yellow-500/50 text-yellow-500",
                            opt.effort === 'high' && "border-red-500/50 text-red-500"
                          )}
                        >
                          {opt.effort} effort
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-500">-${opt.savings}/mo</p>
                      <p className="text-xs text-muted-foreground">{opt.impact}% savings</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      Apply <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Total potential savings</span>
              </div>
              <p className="text-2xl font-bold text-green-500 mt-1">
                ${potentialSavings.toLocaleString()}/month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
