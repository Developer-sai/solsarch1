import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Recommendation } from '@/types/architecture';
import { Lightbulb, TrendingDown, Shield, Zap, Check } from 'lucide-react';

interface RecommendationsProps {
  recommendations: Recommendation[];
}

const typeIcons: Record<string, typeof Lightbulb> = {
  'cost-saving': TrendingDown,
  'performance': Zap,
  'security': Shield,
};

const priorityColors: Record<string, string> = {
  high: 'bg-destructive',
  medium: 'bg-warning',
  low: 'bg-info',
};

export const Recommendations = ({ recommendations }: RecommendationsProps) => {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Optimization Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const Icon = typeIcons[rec.type] || Lightbulb;

            return (
              <div 
                key={index}
                className="p-4 rounded-lg bg-secondary/30 border border-border"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{rec.title}</h4>
                      <Badge className={`${priorityColors[rec.priority]} text-xs`}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {rec.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-success font-medium">
                        Potential savings: {rec.impactPercentage}%
                      </p>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Check className="w-4 h-4" />
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
