import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  DollarSign,
  Cpu,
  Server,
  Database,
  HardDrive,
  Play,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Optimization {
  id: string;
  title: string;
  description: string;
  category: 'compute' | 'database' | 'storage' | 'network';
  impact: 'high' | 'medium' | 'low';
  savings: number;
  timeToApply: string;
  status: 'pending' | 'applying' | 'applied' | 'failed';
  risk: 'low' | 'medium' | 'high';
}

const categoryIcons = {
  compute: Cpu,
  database: Database,
  storage: HardDrive,
  network: Server,
};

const impactColors = {
  high: 'bg-success/20 text-success border-success/30',
  medium: 'bg-warning/20 text-warning border-warning/30',
  low: 'bg-info/20 text-info border-info/30',
};

const riskColors = {
  low: 'text-success',
  medium: 'text-warning',
  high: 'text-destructive',
};

export const OneClickOptimizations = () => {
  const [optimizations, setOptimizations] = useState<Optimization[]>([
    {
      id: '1',
      title: 'Enable Reserved Instance Coverage',
      description: 'Convert 8 on-demand EC2 instances to 1-year Reserved Instances for predictable workloads',
      category: 'compute',
      impact: 'high',
      savings: 1240,
      timeToApply: '~2 min',
      status: 'pending',
      risk: 'low',
    },
    {
      id: '2',
      title: 'Right-size Underutilized Instances',
      description: 'Downgrade 4 m5.2xlarge instances to m5.xlarge based on 30-day CPU/memory utilization',
      category: 'compute',
      impact: 'high',
      savings: 680,
      timeToApply: '~5 min',
      status: 'pending',
      risk: 'medium',
    },
    {
      id: '3',
      title: 'Enable S3 Intelligent-Tiering',
      description: 'Automatically move infrequently accessed objects to lower-cost storage tiers',
      category: 'storage',
      impact: 'medium',
      savings: 320,
      timeToApply: '~1 min',
      status: 'pending',
      risk: 'low',
    },
    {
      id: '4',
      title: 'Clean Up Orphaned EBS Volumes',
      description: 'Delete 15 unattached EBS volumes that are no longer in use',
      category: 'storage',
      impact: 'medium',
      savings: 280,
      timeToApply: '~1 min',
      status: 'pending',
      risk: 'low',
    },
    {
      id: '5',
      title: 'Enable RDS Read Replicas Auto-Scaling',
      description: 'Configure read replica auto-scaling to handle traffic spikes efficiently',
      category: 'database',
      impact: 'medium',
      savings: 450,
      timeToApply: '~3 min',
      status: 'pending',
      risk: 'low',
    },
    {
      id: '6',
      title: 'Migrate to Graviton Instances',
      description: 'Switch 6 x86 instances to ARM-based Graviton for 20% better price-performance',
      category: 'compute',
      impact: 'high',
      savings: 520,
      timeToApply: '~10 min',
      status: 'pending',
      risk: 'medium',
    },
  ]);

  const { toast } = useToast();

  const applyOptimization = async (id: string) => {
    setOptimizations(prev => 
      prev.map(opt => opt.id === id ? { ...opt, status: 'applying' as const } : opt)
    );

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

    const success = Math.random() > 0.1; // 90% success rate

    setOptimizations(prev => 
      prev.map(opt => opt.id === id ? { ...opt, status: success ? 'applied' as const : 'failed' as const } : opt)
    );

    const optimization = optimizations.find(o => o.id === id);
    
    if (success) {
      toast({
        title: "Optimization Applied!",
        description: `${optimization?.title} - Saving $${optimization?.savings}/mo`,
      });
    } else {
      toast({
        title: "Optimization Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const applyAll = async () => {
    const pendingOpts = optimizations.filter(o => o.status === 'pending');
    for (const opt of pendingOpts) {
      await applyOptimization(opt.id);
    }
  };

  const totalSavings = optimizations.reduce((sum, o) => sum + o.savings, 0);
  const appliedSavings = optimizations
    .filter(o => o.status === 'applied')
    .reduce((sum, o) => sum + o.savings, 0);
  const pendingCount = optimizations.filter(o => o.status === 'pending').length;
  const appliedCount = optimizations.filter(o => o.status === 'applied').length;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            One-Click Optimizations
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
              ${appliedSavings.toLocaleString()} saved
            </Badge>
            <Badge variant="outline">
              {pendingCount} pending
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Summary */}
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Optimization Progress</span>
            <span className="text-sm text-muted-foreground">
              {appliedCount}/{optimizations.length} applied
            </span>
          </div>
          <Progress 
            value={(appliedCount / optimizations.length) * 100} 
            className="h-2 mb-3"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Potential savings: <strong className="text-foreground">${totalSavings.toLocaleString()}/mo</strong>
            </span>
            <Button 
              size="sm" 
              onClick={applyAll}
              disabled={pendingCount === 0}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Apply All ({pendingCount})
            </Button>
          </div>
        </div>

        {/* Optimization List */}
        <div className="space-y-3">
          {optimizations.map((opt) => {
            const Icon = categoryIcons[opt.category];
            
            return (
              <div 
                key={opt.id}
                className={`p-4 rounded-lg border transition-all ${
                  opt.status === 'applied' 
                    ? 'bg-success/5 border-success/30' 
                    : opt.status === 'failed'
                    ? 'bg-destructive/5 border-destructive/30'
                    : 'bg-secondary/30 border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    opt.status === 'applied' ? 'bg-success/20' : 'bg-primary/20'
                  }`}>
                    {opt.status === 'applied' ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : opt.status === 'applying' ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : (
                      <Icon className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{opt.title}</h4>
                      <Badge className={impactColors[opt.impact]} variant="outline">
                        {opt.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{opt.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-success">
                        <DollarSign className="w-3 h-3" />
                        ${opt.savings}/mo
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {opt.timeToApply}
                      </span>
                      <span className={`flex items-center gap-1 ${riskColors[opt.risk]}`}>
                        <AlertTriangle className="w-3 h-3" />
                        {opt.risk} risk
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={opt.status === 'applied' ? 'ghost' : 'default'}
                    disabled={opt.status !== 'pending'}
                    onClick={() => applyOptimization(opt.id)}
                    className="shrink-0"
                  >
                    {opt.status === 'pending' && 'Apply'}
                    {opt.status === 'applying' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {opt.status === 'applied' && <CheckCircle className="w-4 h-4 text-success" />}
                    {opt.status === 'failed' && 'Retry'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};