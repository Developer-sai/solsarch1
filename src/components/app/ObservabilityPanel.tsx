import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Activity, AlertTriangle, CheckCircle, Clock, Gauge, TrendingUp } from 'lucide-react';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: number;
  unit: string;
  threshold: number;
  trend: 'up' | 'down' | 'stable';
}

const healthMetrics: HealthMetric[] = [
  { name: 'CPU Utilization', status: 'healthy', value: 42, unit: '%', threshold: 80, trend: 'stable' },
  { name: 'Memory Usage', status: 'warning', value: 78, unit: '%', threshold: 85, trend: 'up' },
  { name: 'Pod Restart Rate', status: 'healthy', value: 2, unit: '/hr', threshold: 10, trend: 'down' },
  { name: 'Request Latency P99', status: 'warning', value: 420, unit: 'ms', threshold: 500, trend: 'up' },
  { name: 'Error Rate', status: 'healthy', value: 0.12, unit: '%', threshold: 1, trend: 'stable' },
  { name: 'Node Utilization', status: 'healthy', value: 65, unit: '%', threshold: 90, trend: 'stable' },
];

interface Alert {
  severity: 'info' | 'warning' | 'critical';
  message: string;
  time: string;
  service: string;
}

const recentAlerts: Alert[] = [
  { severity: 'warning', message: 'Memory pressure detected on worker-node-3', time: '5m ago', service: 'worker-service' },
  { severity: 'info', message: 'Auto-scaling triggered: 3 → 5 replicas', time: '12m ago', service: 'web-api' },
  { severity: 'warning', message: 'P99 latency above threshold', time: '18m ago', service: 'api-gateway' },
];

const statusColors = {
  healthy: 'text-success',
  warning: 'text-warning',
  critical: 'text-destructive',
};

const statusBg = {
  healthy: 'bg-success/10 border-success/30',
  warning: 'bg-warning/10 border-warning/30',
  critical: 'bg-destructive/10 border-destructive/30',
};

const alertColors = {
  info: 'bg-info/10 text-info border-info/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  critical: 'bg-destructive/10 text-destructive border-destructive/30',
};

export const ObservabilityPanel = () => {
  const healthyCount = healthMetrics.filter(m => m.status === 'healthy').length;
  const warningCount = healthMetrics.filter(m => m.status === 'warning').length;
  const criticalCount = healthMetrics.filter(m => m.status === 'critical').length;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Observability & Health
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`${statusBg.healthy} text-success text-xs`}>
              <CheckCircle className="w-3 h-3 mr-1" />{healthyCount} Healthy
            </Badge>
            {warningCount > 0 && (
              <Badge className={`${statusBg.warning} text-warning text-xs`}>
                <AlertTriangle className="w-3 h-3 mr-1" />{warningCount} Warning
              </Badge>
            )}
            {criticalCount > 0 && (
              <Badge className={`${statusBg.critical} text-destructive text-xs`}>
                <AlertTriangle className="w-3 h-3 mr-1" />{criticalCount} Critical
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {healthMetrics.map((metric) => {
            const progressValue = (metric.value / metric.threshold) * 100;
            
            return (
              <div 
                key={metric.name} 
                className={`p-3 rounded-lg border ${statusBg[metric.status]}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground truncate">{metric.name}</span>
                  <TrendingUp 
                    className={`w-3 h-3 ${
                      metric.trend === 'up' ? 'text-warning' : 
                      metric.trend === 'down' ? 'text-success rotate-180' : 
                      'text-muted-foreground'
                    }`} 
                  />
                </div>
                <div className={`text-xl font-bold ${statusColors[metric.status]}`}>
                  {metric.value}{metric.unit}
                </div>
                <Progress 
                  value={Math.min(progressValue, 100)} 
                  className={`h-1 mt-2 ${
                    metric.status === 'healthy' ? 'bg-success/20' : 
                    metric.status === 'warning' ? 'bg-warning/20' : 
                    'bg-destructive/20'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Recent Alerts */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Recent Alerts
          </h4>
          <div className="space-y-2">
            {recentAlerts.map((alert, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${alertColors[alert.severity]}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{alert.service}</Badge>
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                    </div>
                  </div>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" className="w-full gap-2">
          <Gauge className="w-4 h-4" />
          Open Full Dashboard
        </Button>
      </CardContent>
    </Card>
  );
};