import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Cpu, MemoryStick, TrendingDown, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface ResourceMetric {
  name: string;
  type: 'cpu' | 'memory';
  requested: number;
  used: number;
  recommended: number;
  unit: string;
  savingsPercent: number;
  savingsAmount: number;
}

const mockResources: ResourceMetric[] = [
  { name: 'web-api', type: 'cpu', requested: 4, used: 1.2, recommended: 2, unit: 'vCPU', savingsPercent: 50, savingsAmount: 45 },
  { name: 'web-api', type: 'memory', requested: 8, used: 3.1, recommended: 4, unit: 'GB', savingsPercent: 50, savingsAmount: 32 },
  { name: 'worker-service', type: 'cpu', requested: 8, used: 2.5, recommended: 4, unit: 'vCPU', savingsPercent: 50, savingsAmount: 89 },
  { name: 'worker-service', type: 'memory', requested: 16, used: 5.8, recommended: 8, unit: 'GB', savingsPercent: 50, savingsAmount: 64 },
  { name: 'ml-inference', type: 'cpu', requested: 16, used: 12.4, recommended: 14, unit: 'vCPU', savingsPercent: 12, savingsAmount: 22 },
  { name: 'ml-inference', type: 'memory', requested: 64, used: 48.2, recommended: 56, unit: 'GB', savingsPercent: 12, savingsAmount: 45 },
];

export const ResourceRightsizing = () => {
  const totalSavings = mockResources.reduce((sum, r) => sum + r.savingsAmount, 0);
  const overProvisionedCount = mockResources.filter(r => r.savingsPercent > 30).length;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            Resource Rightsizing
          </CardTitle>
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            ${totalSavings}/mo potential savings
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border text-center">
            <div className="text-2xl font-bold text-foreground">{mockResources.length}</div>
            <div className="text-xs text-muted-foreground">Resources Analyzed</div>
          </div>
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-center">
            <div className="text-2xl font-bold text-warning">{overProvisionedCount}</div>
            <div className="text-xs text-muted-foreground">Over-provisioned</div>
          </div>
          <div className="p-3 rounded-lg bg-success/10 border border-success/30 text-center">
            <div className="text-2xl font-bold text-success">${totalSavings}</div>
            <div className="text-xs text-muted-foreground">Monthly Savings</div>
          </div>
        </div>

        {/* Resource List */}
        <div className="space-y-3">
          {mockResources.slice(0, 4).map((resource, index) => {
            const utilizationPercent = (resource.used / resource.requested) * 100;
            const isOverProvisioned = resource.savingsPercent > 30;
            
            return (
              <div 
                key={index} 
                className="p-3 rounded-lg bg-secondary/30 border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {resource.type === 'cpu' ? (
                      <Cpu className="w-4 h-4 text-info" />
                    ) : (
                      <MemoryStick className="w-4 h-4 text-purple" />
                    )}
                    <span className="font-medium text-foreground text-sm">{resource.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {resource.type.toUpperCase()}
                    </Badge>
                  </div>
                  {isOverProvisioned ? (
                    <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Over-provisioned
                    </Badge>
                  ) : (
                    <Badge className="bg-success/20 text-success border-success/30 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Optimal
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-muted-foreground">Requested:</span>
                    <span className="ml-1 text-foreground font-medium">{resource.requested} {resource.unit}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Used:</span>
                    <span className="ml-1 text-foreground font-medium">{resource.used} {resource.unit}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recommended:</span>
                    <span className="ml-1 text-primary font-medium">{resource.recommended} {resource.unit}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Savings:</span>
                    <span className="ml-1 text-success font-medium">${resource.savingsAmount}/mo</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Utilization</span>
                    <span className="text-foreground">{utilizationPercent.toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={utilizationPercent} 
                    className={`h-2 ${utilizationPercent < 40 ? 'bg-destructive/20' : utilizationPercent < 70 ? 'bg-warning/20' : 'bg-success/20'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <Button variant="outline" className="w-full gap-2">
          View All Resources
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};