import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Architecture, CloudProvider, CLOUD_PROVIDERS } from '@/types/architecture';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';
import { TrendingDown, Layers, CheckCircle2 } from 'lucide-react';

interface HybridCostBreakdownProps {
  architecture: Architecture;
}

const PROVIDER_COLORS: Record<CloudProvider | string, string> = {
  aws: '#FF9900',
  azure: '#0078D4',
  gcp: '#EA4335',
  oci: '#F80000',
  'google-maps': '#4285F4',
  mapbox: '#4264fb',
  external: '#6B7280',
};

export const HybridCostBreakdown = ({ architecture }: HybridCostBreakdownProps) => {
  const hybridAnalysis = useMemo(() => {
    // Calculate costs per provider in hybrid mode
    const providerCosts: Record<string, { cost: number; components: string[] }> = {};
    let totalHybridCost = 0;

    architecture.components.forEach((component) => {
      let provider: string;
      let cost: number;

      if (component.isExternal && component.externalService) {
        provider = component.externalService.provider;
        cost = component.externalService.monthlyCost;
      } else if (component.selectedProvider) {
        provider = component.selectedProvider;
        cost = component.providers[component.selectedProvider].monthlyCost;
      } else {
        // Find cheapest provider for this component
        const providers = ['aws', 'azure', 'gcp', 'oci'] as const;
        const cheapest = providers.reduce((a, b) => 
          component.providers[a].monthlyCost < component.providers[b].monthlyCost ? a : b
        );
        provider = cheapest;
        cost = component.providers[cheapest].monthlyCost;
      }

      if (!providerCosts[provider]) {
        providerCosts[provider] = { cost: 0, components: [] };
      }
      providerCosts[provider].cost += cost;
      providerCosts[provider].components.push(component.name);
      totalHybridCost += cost;
    });

    // Calculate single-provider costs for comparison
    const singleProviderCosts = {
      aws: architecture.totalCosts.aws,
      azure: architecture.totalCosts.azure,
      gcp: architecture.totalCosts.gcp,
      oci: architecture.totalCosts.oci,
    };

    const cheapestSingle = Math.min(...Object.values(singleProviderCosts));
    const savings = cheapestSingle - totalHybridCost;
    const savingsPercent = (savings / cheapestSingle) * 100;

    return {
      providerCosts,
      totalHybridCost,
      singleProviderCosts,
      cheapestSingle,
      savings,
      savingsPercent,
    };
  }, [architecture]);

  const pieData = Object.entries(hybridAnalysis.providerCosts).map(([provider, data]) => ({
    name: CLOUD_PROVIDERS[provider as CloudProvider]?.name || provider.toUpperCase(),
    value: data.cost,
    provider,
  }));

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Hybrid Multi-Cloud Cost Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-xs text-muted-foreground mb-1">Hybrid Total</p>
            <p className="text-2xl font-bold text-primary">
              ${hybridAnalysis.totalHybridCost.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
          
          <div className="p-4 rounded-lg bg-success/10 border border-success/30">
            <p className="text-xs text-muted-foreground mb-1">vs Single Cloud</p>
            <p className="text-2xl font-bold text-success flex items-center gap-1">
              <TrendingDown className="w-5 h-5" />
              {hybridAnalysis.savingsPercent.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              ${Math.abs(hybridAnalysis.savings).toLocaleString()} saved
            </p>
          </div>

          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Providers Used</p>
            <p className="text-2xl font-bold text-foreground">
              {Object.keys(hybridAnalysis.providerCosts).length}
            </p>
            <p className="text-xs text-muted-foreground">cloud providers</p>
          </div>

          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Best Single Cloud</p>
            <p className="text-2xl font-bold text-muted-foreground">
              ${hybridAnalysis.cheapestSingle.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
        </div>

        {/* Cost Distribution Chart */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={PROVIDER_COLORS[entry.provider] || '#6B7280'} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}/mo`, 'Cost']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Provider Breakdown */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Cost by Provider</p>
            {Object.entries(hybridAnalysis.providerCosts).map(([provider, data]) => (
              <div 
                key={provider}
                className="p-3 rounded-lg border border-border bg-secondary/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: PROVIDER_COLORS[provider] || '#6B7280' }}
                    />
                    <span className="font-medium text-foreground">
                      {CLOUD_PROVIDERS[provider as CloudProvider]?.name || provider.toUpperCase()}
                    </span>
                  </div>
                  <span className="font-bold text-foreground">
                    ${data.cost.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {data.components.map((comp, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {comp}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Component Details Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="text-foreground">Component</TableHead>
                <TableHead className="text-foreground">Provider</TableHead>
                <TableHead className="text-foreground">Service</TableHead>
                <TableHead className="text-foreground text-right">Monthly Cost</TableHead>
                <TableHead className="text-foreground text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {architecture.components.map((component, index) => {
                const isExternal = component.isExternal && component.externalService;
                const provider = isExternal 
                  ? component.externalService!.provider
                  : component.selectedProvider || 'auto';
                const service = isExternal
                  ? component.externalService!.service
                  : component.selectedProvider 
                    ? component.providers[component.selectedProvider].service
                    : 'Auto-selected';
                const cost = isExternal
                  ? component.externalService!.monthlyCost
                  : component.selectedProvider
                    ? component.providers[component.selectedProvider].monthlyCost
                    : Math.min(...Object.values(component.providers).map(p => p.monthlyCost));

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-foreground">
                      {component.name}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: PROVIDER_COLORS[provider] || '#6B7280',
                          color: PROVIDER_COLORS[provider] || '#6B7280',
                        }}
                      >
                        {CLOUD_PROVIDERS[provider as CloudProvider]?.name || provider.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{service}</TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      ${cost.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {isExternal ? (
                        <Badge variant="secondary" className="text-xs">External</Badge>
                      ) : component.selectedProvider ? (
                        <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
                      ) : (
                        <Badge variant="outline" className="text-xs">Auto</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Recommendations */}
        {hybridAnalysis.savings > 0 && (
          <div className="p-4 rounded-lg bg-success/10 border border-success/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Hybrid Strategy Recommended</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Using a hybrid multi-cloud approach saves you <strong className="text-success">
                  ${hybridAnalysis.savings.toLocaleString()}/month
                  </strong> ({hybridAnalysis.savingsPercent.toFixed(1)}%) compared to staying 
                  with a single cloud provider.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
