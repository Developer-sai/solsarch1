"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

interface OptimizationRecommendation {
  type: string
  title: string
  description: string
  potentialSavings: number
  savingsPercentage: number
  implementationDifficulty: string
  timeToImplement: string
  riskLevel: string
}

interface CostOptimizationCardProps {
  currentCost: number
  optimizedCost: number
  totalSavings: number
  savingsPercentage: number
  recommendations: OptimizationRecommendation[]
  breakEvenMonths: number
}

export function CostOptimizationCard({
  currentCost,
  optimizedCost,
  totalSavings,
  savingsPercentage,
  recommendations,
  breakEvenMonths,
}: CostOptimizationCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-700"
      case "medium":
        return "bg-yellow-500/20 text-yellow-700"
      case "hard":
        return "bg-red-500/20 text-red-700"
      default:
        return "bg-gray-500/20 text-gray-700"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-500/20 text-green-700"
      case "medium":
        return "bg-yellow-500/20 text-yellow-700"
      case "high":
        return "bg-red-500/20 text-red-700"
      default:
        return "bg-gray-500/20 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <h3 className="text-xl font-bold mb-6">Cost Optimization Opportunity</h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Current Monthly</p>
            <p className="text-2xl font-bold">${currentCost.toFixed(0)}</p>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Optimized Monthly</p>
            <p className="text-2xl font-bold text-green-600">${optimizedCost.toFixed(0)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Annual Savings</p>
            <p className="text-xl font-bold">${(totalSavings * 12).toFixed(0)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Savings Percentage</p>
            <p className="text-xl font-bold text-green-600">{savingsPercentage}%</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground mb-1">Break-even Period</p>
            <p className="text-base font-semibold">{breakEvenMonths} months</p>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <div>
        <h4 className="font-bold mb-4">Top Recommendations</h4>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start gap-4 mb-3">
                <div>
                  <h5 className="font-semibold">{rec.title}</h5>
                  <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-green-600">${rec.potentialSavings.toFixed(0)}/mo</p>
                  <p className="text-xs text-muted-foreground">{rec.savingsPercentage}% savings</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Badge className={getDifficultyColor(rec.implementationDifficulty)}>
                  {rec.implementationDifficulty === "easy"
                    ? "Easy"
                    : rec.implementationDifficulty === "medium"
                      ? "Medium"
                      : "Complex"}
                </Badge>
                <Badge variant="outline">{rec.timeToImplement}</Badge>
                <Badge className={getRiskColor(rec.riskLevel)}>Risk: {rec.riskLevel}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
