import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, DollarSign, Server, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface WorkloadSpotCandidate {
  name: string;
  type: string;
  currentCost: number;
  spotCost: number;
  savingsPercent: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
}

const spotCandidates: WorkloadSpotCandidate[] = [
  { 
    name: 'batch-processor', 
    type: 'Batch Job', 
    currentCost: 890, 
    spotCost: 267, 
    savingsPercent: 70, 
    riskLevel: 'low',
    recommendation: 'Perfect for Spot - stateless and restartable'
  },
  { 
    name: 'dev-environment', 
    type: 'Development', 
    currentCost: 450, 
    spotCost: 135, 
    savingsPercent: 70, 
    riskLevel: 'low',
    recommendation: 'Non-critical workload, ideal for Spot'
  },
  { 
    name: 'test-runners', 
    type: 'CI/CD', 
    currentCost: 620, 
    spotCost: 186, 
    savingsPercent: 70, 
    riskLevel: 'low',
    recommendation: 'Short-lived instances, great Spot fit'
  },
  { 
    name: 'ml-training', 
    type: 'ML Training', 
    currentCost: 2400, 
    spotCost: 840, 
    savingsPercent: 65, 
    riskLevel: 'medium',
    recommendation: 'Use checkpointing for safe Spot usage'
  },
  { 
    name: 'web-backend', 
    type: 'Production API', 
    currentCost: 1200, 
    spotCost: 420, 
    savingsPercent: 65, 
    riskLevel: 'high',
    recommendation: 'Mix with On-Demand for availability'
  },
];

const riskColors = {
  low: 'bg-success/20 text-success border-success/30',
  medium: 'bg-warning/20 text-warning border-warning/30',
  high: 'bg-destructive/20 text-destructive border-destructive/30',
};

export const SpotOptimization = () => {
  const totalOnDemand = spotCandidates.reduce((sum, w) => sum + w.currentCost, 0);
  const totalSpot = spotCandidates.reduce((sum, w) => sum + w.spotCost, 0);
  const totalSavings = totalOnDemand - totalSpot;
  const spotCoverage = 35; // Mock current spot usage

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-warning" />
            Spot & Preemptible Optimization
          </CardTitle>
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            Up to ${totalSavings}/mo savings
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Spot Coverage */}
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Current Spot Coverage</span>
            <span className="text-sm font-bold text-primary">{spotCoverage}%</span>
          </div>
          <Progress value={spotCoverage} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">
            Increasing Spot coverage to 60% could save an additional ${(totalSavings * 0.6).toFixed(0)}/month
          </p>
        </div>

        {/* Savings Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border text-center">
            <Server className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            <div className="text-lg font-bold text-foreground">{spotCandidates.length}</div>
            <div className="text-xs text-muted-foreground">Spot Candidates</div>
          </div>
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-center">
            <DollarSign className="w-5 h-5 text-warning mx-auto mb-1" />
            <div className="text-lg font-bold text-warning">${totalOnDemand.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">On-Demand Cost</div>
          </div>
          <div className="p-3 rounded-lg bg-success/10 border border-success/30 text-center">
            <Zap className="w-5 h-5 text-success mx-auto mb-1" />
            <div className="text-lg font-bold text-success">${totalSpot.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">With Spot</div>
          </div>
        </div>

        {/* Workload Candidates */}
        <div className="space-y-3">
          {spotCandidates.slice(0, 4).map((workload) => (
            <div 
              key={workload.name} 
              className="p-3 rounded-lg bg-secondary/30 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{workload.name}</span>
                  <Badge variant="outline" className="text-xs">{workload.type}</Badge>
                </div>
                <Badge className={`${riskColors[workload.riskLevel]} text-xs`}>
                  {workload.riskLevel === 'low' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {workload.riskLevel !== 'low' && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {workload.riskLevel} risk
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  ${workload.currentCost} → <span className="text-success font-medium">${workload.spotCost}</span>/mo
                </span>
                <span className="text-success font-semibold">
                  Save {workload.savingsPercent}%
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground">{workload.recommendation}</p>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full gap-2">
          View All Spot Opportunities
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};