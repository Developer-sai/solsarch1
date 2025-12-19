import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Architecture } from '@/types/architecture';
import { DollarSign, Zap, Scale, Check, AlertTriangle } from 'lucide-react';

interface ArchitectureViewProps {
  architectures: Architecture[];
  selectedVariant: number;
  onVariantChange: (index: number) => void;
}

const variantIcons = {
  'cost-optimized': DollarSign,
  'balanced': Scale,
  'performance-optimized': Zap,
};

const variantColors = {
  'cost-optimized': 'from-success to-emerald-600',
  'balanced': 'from-info to-blue-600',
  'performance-optimized': 'from-purple to-violet-600',
};

export const ArchitectureView = ({ 
  architectures, 
  selectedVariant, 
  onVariantChange 
}: ArchitectureViewProps) => {
  const selected = architectures[selectedVariant];
  const Icon = variantIcons[selected.variant];

  return (
    <div className="space-y-6">
      {/* Variant Selector */}
      <div className="grid sm:grid-cols-3 gap-4">
        {architectures.map((arch, index) => {
          const VariantIcon = variantIcons[arch.variant];
          const isSelected = index === selectedVariant;
          const minCost = Math.min(...Object.values(arch.totalCosts));

          return (
            <button
              key={arch.variant}
              onClick={() => onVariantChange(index)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-border bg-card hover:border-muted-foreground'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${variantColors[arch.variant]} flex items-center justify-center mb-3`}>
                <VariantIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">{arch.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">From ${minCost.toLocaleString()}/mo</p>
              
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <Check className="w-5 h-5 text-primary" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Architecture Details */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${variantColors[selected.variant]} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>{selected.name}</CardTitle>
              <CardDescription>{selected.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Components */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Components</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selected.components.map((component, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {component.serviceType}
                    </Badge>
                  </div>
                  <p className="font-medium text-foreground text-sm">{component.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Assumptions & Trade-offs */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                Assumptions
              </h4>
              <ul className="space-y-2">
                {selected.assumptions.map((assumption, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                    {assumption}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                Trade-offs
              </h4>
              <ul className="space-y-2">
                {selected.tradeOffs.map((tradeoff, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                    {tradeoff}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
