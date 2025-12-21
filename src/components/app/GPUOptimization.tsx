import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Cpu, Zap, MemoryStick, Clock, TrendingDown, AlertTriangle, Sparkles } from 'lucide-react';

interface GPUWorkload {
  name: string;
  gpuType: string;
  gpuCount: number;
  utilization: number;
  memoryUsed: number;
  memoryTotal: number;
  coldStartTime: number;
  recommendedAction: string;
  savingsPercent: number;
}

const gpuWorkloads: GPUWorkload[] = [
  { 
    name: 'llm-inference-gpt', 
    gpuType: 'A100', 
    gpuCount: 4, 
    utilization: 35, 
    memoryUsed: 120, 
    memoryTotal: 320, 
    coldStartTime: 45,
    recommendedAction: 'Enable GPU sharing - 2 A100s would suffice',
    savingsPercent: 50
  },
  { 
    name: 'image-generation', 
    gpuType: 'A100', 
    gpuCount: 2, 
    utilization: 72, 
    memoryUsed: 60, 
    memoryTotal: 80, 
    coldStartTime: 12,
    recommendedAction: 'GPU well utilized - consider MIG partitioning',
    savingsPercent: 15
  },
  { 
    name: 'embedding-service', 
    gpuType: 'T4', 
    gpuCount: 2, 
    utilization: 28, 
    memoryUsed: 8, 
    memoryTotal: 32, 
    coldStartTime: 8,
    recommendedAction: 'Switch to single T4 with GPU sharing',
    savingsPercent: 45
  },
  { 
    name: 'training-pipeline', 
    gpuType: 'H100', 
    gpuCount: 8, 
    utilization: 89, 
    memoryUsed: 560, 
    memoryTotal: 640, 
    coldStartTime: 0,
    recommendedAction: 'Well optimized - maintain current config',
    savingsPercent: 0
  },
];

const migPartitions = [
  { name: '7g.80gb', description: 'Full GPU', available: 1, total: 1 },
  { name: '3g.40gb', description: 'Half GPU', available: 2, total: 2 },
  { name: '2g.20gb', description: 'Quarter GPU', available: 3, total: 4 },
  { name: '1g.10gb', description: 'Eighth GPU', available: 5, total: 8 },
];

export const GPUOptimization = () => {
  const totalGPUs = gpuWorkloads.reduce((sum, w) => sum + w.gpuCount, 0);
  const avgUtilization = gpuWorkloads.reduce((sum, w) => sum + w.utilization, 0) / gpuWorkloads.length;
  const totalSavings = gpuWorkloads.reduce((sum, w) => sum + (w.savingsPercent * 50), 0); // Rough estimate

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI/GPU Workload Optimization
          </CardTitle>
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            ~${totalSavings}/mo potential savings
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border text-center">
            <Cpu className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-lg font-bold text-foreground">{totalGPUs}</div>
            <div className="text-xs text-muted-foreground">Active GPUs</div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 border border-border text-center">
            <Zap className="w-5 h-5 text-warning mx-auto mb-1" />
            <div className="text-lg font-bold text-warning">{avgUtilization.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Avg Utilization</div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 border border-border text-center">
            <MemoryStick className="w-5 h-5 text-info mx-auto mb-1" />
            <div className="text-lg font-bold text-info">
              {gpuWorkloads.reduce((sum, w) => sum + w.memoryUsed, 0)}GB
            </div>
            <div className="text-xs text-muted-foreground">VRAM Used</div>
          </div>
          <div className="p-3 rounded-lg bg-success/10 border border-success/30 text-center">
            <TrendingDown className="w-5 h-5 text-success mx-auto mb-1" />
            <div className="text-lg font-bold text-success">${totalSavings}</div>
            <div className="text-xs text-muted-foreground">Est. Savings</div>
          </div>
        </div>

        {/* GPU Workloads */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">GPU Workloads</h4>
          <div className="space-y-3">
            {gpuWorkloads.map((workload) => {
              const isUnderutilized = workload.utilization < 50;
              const memoryPercent = (workload.memoryUsed / workload.memoryTotal) * 100;
              
              return (
                <div 
                  key={workload.name} 
                  className="p-3 rounded-lg bg-secondary/30 border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{workload.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {workload.gpuCount}x {workload.gpuType}
                      </Badge>
                    </div>
                    {isUnderutilized && (
                      <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Underutilized
                      </Badge>
                    )}
                    {workload.savingsPercent > 0 && (
                      <Badge className="bg-success/20 text-success border-success/30 text-xs">
                        Save {workload.savingsPercent}%
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">GPU Util</span>
                        <span className={workload.utilization < 50 ? 'text-warning' : 'text-success'}>
                          {workload.utilization}%
                        </span>
                      </div>
                      <Progress 
                        value={workload.utilization} 
                        className={`h-1.5 ${workload.utilization < 50 ? 'bg-warning/20' : 'bg-success/20'}`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">VRAM</span>
                        <span className="text-info">{workload.memoryUsed}/{workload.memoryTotal}GB</span>
                      </div>
                      <Progress 
                        value={memoryPercent} 
                        className="h-1.5 bg-info/20"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Cold start:</span>
                      <span className="text-foreground">{workload.coldStartTime}s</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{workload.recommendedAction}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* MIG Partitioning */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            MIG Partitioning Availability
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {migPartitions.map((partition) => (
              <div key={partition.name} className="text-center p-2 rounded bg-secondary/50 border border-border">
                <div className="text-xs font-mono text-foreground">{partition.name}</div>
                <div className="text-xs text-muted-foreground">{partition.description}</div>
                <div className="text-sm font-bold text-primary mt-1">
                  {partition.available}/{partition.total}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" className="w-full gap-2">
          <Sparkles className="w-4 h-4" />
          Apply AI Optimization
        </Button>
      </CardContent>
    </Card>
  );
};