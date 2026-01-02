"use client"

import { Card } from "@/components/ui/card"

interface CostBreakdown {
  provider: string
  compute: number
  database: number
  storage: number
  total: number
  recommendation: string
}

interface CostComparisonTableProps {
  costs: Record<string, CostBreakdown>
  isLoading?: boolean
}

export function CostComparisonTable({ costs, isLoading = false }: CostComparisonTableProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </Card>
    )
  }

  const sortedCosts = Object.values(costs).sort((a, b) => a.total - b.total)
  const cheapest = sortedCosts[0]

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        {sortedCosts.map((cost) => (
          <Card
            key={cost.provider}
            className={`p-4 ${cost.provider === cheapest.provider ? "border-green-500/50 bg-green-500/5" : ""}`}
          >
            <h3 className="font-bold mb-2">{cost.provider}</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Monthly</p>
                <p className="text-2xl font-bold">${cost.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Yearly</p>
                <p className="text-lg font-semibold">${(cost.total * 12).toFixed(2)}</p>
              </div>
              {cost.provider === cheapest.provider && (
                <p className="text-xs text-green-600 font-medium">Most affordable</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/50">
                <th className="p-4 text-left font-semibold">Provider</th>
                <th className="p-4 text-right font-semibold">Compute</th>
                <th className="p-4 text-right font-semibold">Database</th>
                <th className="p-4 text-right font-semibold">Storage</th>
                <th className="p-4 text-right font-semibold">Total/Month</th>
                <th className="p-4 text-left font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {sortedCosts.map((cost) => (
                <tr key={cost.provider} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{cost.provider}</td>
                  <td className="p-4 text-right">${cost.compute.toFixed(2)}</td>
                  <td className="p-4 text-right">${cost.database.toFixed(2)}</td>
                  <td className="p-4 text-right">${cost.storage.toFixed(2)}</td>
                  <td className="p-4 text-right font-bold text-primary">${cost.total.toFixed(2)}</td>
                  <td className="p-4 text-xs text-muted-foreground">{cost.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Savings Information */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="font-bold mb-2">Cost Optimization</h3>
        <p className="text-sm text-muted-foreground mb-3">
          By choosing {cheapest.provider} over the most expensive option, you could save approximately{" "}
          <span className="font-bold text-primary">
            ${((Math.max(...sortedCosts.map((c) => c.total)) - cheapest.total) * 12).toFixed(0)}/year
          </span>
          .
        </p>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Monthly savings: ${(Math.max(...sortedCosts.map((c) => c.total)) - cheapest.total).toFixed(2)}</li>
          <li>• These estimates are based on typical small-scale deployments</li>
          <li>• Actual costs may vary based on usage patterns and commitment options</li>
        </ul>
      </Card>
    </div>
  )
}
