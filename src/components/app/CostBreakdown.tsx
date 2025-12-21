import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Layers, TrendingUp, AlertCircle } from 'lucide-react';

interface CostCategory {
  name: string;
  cost: number;
  waste: number;
  color: string;
}

const costData: CostCategory[] = [
  { name: 'Compute', cost: 2450, waste: 320, color: 'hsl(var(--info))' },
  { name: 'Database', cost: 890, waste: 45, color: 'hsl(var(--success))' },
  { name: 'Storage', cost: 340, waste: 80, color: 'hsl(var(--warning))' },
  { name: 'Network', cost: 280, waste: 15, color: 'hsl(var(--accent))' },
  { name: 'GPU/ML', cost: 1200, waste: 180, color: 'hsl(var(--primary))' },
];

interface TeamCost {
  team: string;
  spend: number;
  trend: number;
  topService: string;
}

const teamCosts: TeamCost[] = [
  { team: 'Platform', spend: 2100, trend: -5, topService: 'EKS Cluster' },
  { team: 'ML/AI', spend: 1800, trend: 12, topService: 'GPU Instances' },
  { team: 'Backend', spend: 890, trend: 3, topService: 'RDS PostgreSQL' },
  { team: 'Frontend', spend: 370, trend: -8, topService: 'CloudFront CDN' },
];

export const CostBreakdown = () => {
  const totalCost = costData.reduce((sum, c) => sum + c.cost, 0);
  const totalWaste = costData.reduce((sum, c) => sum + c.waste, 0);
  const wastePercent = ((totalWaste / totalCost) * 100).toFixed(1);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Cost Breakdown & Allocation
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
              <AlertCircle className="w-3 h-3 mr-1" />
              ${totalWaste}/mo waste detected
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">By Category</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="cost"
                  >
                    {costData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as CostCategory;
                        return (
                          <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
                            <p className="font-medium text-foreground">{data.name}</p>
                            <p className="text-sm text-muted-foreground">Cost: ${data.cost}/mo</p>
                            <p className="text-sm text-destructive">Waste: ${data.waste}/mo</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    formatter={(value: string) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Summary */}
            <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Monthly Spend</p>
                  <p className="text-xl font-bold text-foreground">${totalCost.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Waste Ratio</p>
                  <p className="text-xl font-bold text-destructive">{wastePercent}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Breakdown */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">By Team</h4>
            <div className="space-y-3">
              {teamCosts.map((team) => (
                <div 
                  key={team.team} 
                  className="p-3 rounded-lg bg-secondary/30 border border-border"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{team.team}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">${team.spend.toLocaleString()}</span>
                      <Badge 
                        variant="outline" 
                        className={team.trend > 0 
                          ? 'bg-destructive/10 text-destructive border-destructive/30' 
                          : 'bg-success/10 text-success border-success/30'
                        }
                      >
                        <TrendingUp className={`w-3 h-3 mr-1 ${team.trend < 0 ? 'rotate-180' : ''}`} />
                        {Math.abs(team.trend)}%
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Top service: {team.topService}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};