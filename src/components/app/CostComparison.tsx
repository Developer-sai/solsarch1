import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Architecture } from '@/types/architecture';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CostComparisonProps {
  architecture: Architecture;
}

const providerInfo = {
  aws: { name: 'AWS', color: 'bg-orange' },
  azure: { name: 'Azure', color: 'bg-info' },
  gcp: { name: 'GCP', color: 'bg-destructive' },
  oci: { name: 'OCI', color: 'bg-purple' },
};

export const CostComparison = ({ architecture }: CostComparisonProps) => {
  const providers = ['aws', 'azure', 'gcp', 'oci'] as const;
  const cheapest = providers.reduce((a, b) => 
    architecture.totalCosts[a] < architecture.totalCosts[b] ? a : b
  );

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Cost Comparison by Provider</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Total Cost Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {providers.map((provider) => {
            const info = providerInfo[provider];
            const isCheapest = provider === cheapest;
            const cost = architecture.totalCosts[provider];

            return (
              <div
                key={provider}
                className={`p-4 rounded-lg border ${
                  isCheapest 
                    ? 'border-success bg-success/10' 
                    : 'border-border bg-secondary/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {info.name}
                  </span>
                  {isCheapest && (
                    <Badge className="bg-success text-xs">Cheapest</Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${cost.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">per month</p>
              </div>
            );
          })}
        </div>

        {/* Component Breakdown Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="text-foreground">Component</TableHead>
                {providers.map((p) => (
                  <TableHead key={p} className="text-foreground text-right">
                    {providerInfo[p].name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {architecture.components.map((component, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-foreground">
                    {component.name}
                  </TableCell>
                  {providers.map((provider) => (
                    <TableCell key={provider} className="text-right text-muted-foreground">
                      ${component.providers[provider].monthlyCost.toLocaleString()}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Savings Callout */}
        <div className="mt-4 p-4 rounded-lg bg-success/10 border border-success/30">
          <p className="text-sm text-foreground">
            <strong>Potential Savings:</strong> Choosing {providerInfo[cheapest].name} saves up to{' '}
            <span className="text-success font-semibold">
              ${(Math.max(...Object.values(architecture.totalCosts)) - architecture.totalCosts[cheapest]).toLocaleString()}
            </span>{' '}
            per month compared to the most expensive option.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
