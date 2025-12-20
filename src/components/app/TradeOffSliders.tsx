import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Zap, 
  Layers, 
  TrendingUp, 
  Lock, 
  Unlock,
  Scale,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TradeOff {
  id: string;
  leftLabel: string;
  rightLabel: string;
  leftIcon: typeof DollarSign;
  rightIcon: typeof Zap;
  value: number;
  description: string;
  leftColor: string;
  rightColor: string;
}

const TRADE_OFFS: TradeOff[] = [
  {
    id: 'cost-performance',
    leftLabel: 'Cost Optimized',
    rightLabel: 'Performance Optimized',
    leftIcon: DollarSign,
    rightIcon: Zap,
    value: 50,
    description: 'Balance between minimizing costs and maximizing performance',
    leftColor: 'text-success',
    rightColor: 'text-purple',
  },
  {
    id: 'simplicity-scalability',
    leftLabel: 'Simplicity',
    rightLabel: 'Scalability',
    leftIcon: Layers,
    rightIcon: TrendingUp,
    value: 50,
    description: 'Trade simpler architecture for better scalability',
    leftColor: 'text-info',
    rightColor: 'text-warning',
  },
  {
    id: 'lockin-portability',
    leftLabel: 'Provider Lock-in',
    rightLabel: 'Portability',
    leftIcon: Lock,
    rightIcon: Unlock,
    value: 50,
    description: 'Accept vendor lock-in for better features or stay portable',
    leftColor: 'text-destructive',
    rightColor: 'text-success',
  },
];

interface TradeOffSlidersProps {
  onTradeOffChange?: (tradeOffs: Record<string, number>) => void;
}

export const TradeOffSliders = ({ onTradeOffChange }: TradeOffSlidersProps) => {
  const [tradeOffs, setTradeOffs] = useState<Record<string, number>>(
    TRADE_OFFS.reduce((acc, t) => ({ ...acc, [t.id]: t.value }), {})
  );

  const handleChange = (id: string, value: number[]) => {
    const newTradeOffs = { ...tradeOffs, [id]: value[0] };
    setTradeOffs(newTradeOffs);
    onTradeOffChange?.(newTradeOffs);
  };

  const getTradeOffLabel = (value: number, leftLabel: string, rightLabel: string) => {
    if (value < 35) return { label: leftLabel, intensity: 'Strong' };
    if (value < 45) return { label: leftLabel, intensity: 'Slight' };
    if (value <= 55) return { label: 'Balanced', intensity: '' };
    if (value <= 65) return { label: rightLabel, intensity: 'Slight' };
    return { label: rightLabel, intensity: 'Strong' };
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          Architecture Trade-offs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {TRADE_OFFS.map((tradeOff) => {
          const value = tradeOffs[tradeOff.id];
          const LeftIcon = tradeOff.leftIcon;
          const RightIcon = tradeOff.rightIcon;
          const result = getTradeOffLabel(value, tradeOff.leftLabel, tradeOff.rightLabel);

          return (
            <div key={tradeOff.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LeftIcon className={`w-4 h-4 ${tradeOff.leftColor}`} />
                  <span className="text-sm font-medium text-foreground">
                    {tradeOff.leftLabel}
                  </span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="gap-1.5">
                        {result.intensity && (
                          <span className="text-muted-foreground">{result.intensity}</span>
                        )}
                        {result.label}
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{tradeOff.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {tradeOff.rightLabel}
                  </span>
                  <RightIcon className={`w-4 h-4 ${tradeOff.rightColor}`} />
                </div>
              </div>
              
              <div className="relative">
                <Slider
                  value={[value]}
                  onValueChange={(v) => handleChange(tradeOff.id, v)}
                  min={0}
                  max={100}
                  step={5}
                  className="py-2"
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-px h-4 bg-muted-foreground/50 pointer-events-none" />
              </div>
            </div>
          );
        })}

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Adjust these sliders to influence architecture recommendations. 
            Changes are reflected in real-time cost and component suggestions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
