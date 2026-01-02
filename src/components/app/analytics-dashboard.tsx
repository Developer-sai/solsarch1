"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AnalyticsData {
  metrics: {
    totalArchitectures: number
    totalSharedArchitectures: number
    templatesUsed: number
    totalCostSavings: number
    exportsGenerated: number
    lastActivityAt: string
  }
  trends: Array<{
    date: string
    architecturesCreated: number
    optimizationsCompleted: number
    costSaved: number
  }>
  savings: {
    monthly: number
    annual: number
    percentage: number
  }
}

interface AnalyticsDashboardProps {
  userId: string
}

export function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [userId])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics/user-metrics")
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }

  if (!analytics) {
    return <div className="text-center py-8">No analytics data available</div>
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="p-6">
          <p className="text-xs text-muted-foreground mb-1">Architectures Created</p>
          <p className="text-3xl font-bold">{analytics.metrics.totalArchitectures}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs text-muted-foreground mb-1">Shared With Team</p>
          <p className="text-3xl font-bold">{analytics.metrics.totalSharedArchitectures}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs text-muted-foreground mb-1">Templates Used</p>
          <p className="text-3xl font-bold">{analytics.metrics.templatesUsed}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs text-muted-foreground mb-1">Exports Generated</p>
          <p className="text-3xl font-bold">{analytics.metrics.exportsGenerated}</p>
        </Card>
        <Card className="p-6 bg-green-500/5 border-green-500/20">
          <p className="text-xs text-muted-foreground mb-1">Total Cost Savings</p>
          <p className="text-3xl font-bold text-green-600">${analytics.metrics.totalCostSavings.toLocaleString()}</p>
        </Card>
      </div>

      {/* Cost Savings Breakdown */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-6">Cost Savings Summary</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Monthly Savings</p>
            <p className="text-3xl font-bold text-primary">${analytics.savings.monthly.toFixed(0)}</p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <p className="text-xs text-muted-foreground mb-1">Annual Savings</p>
            <p className="text-3xl font-bold text-green-600">${analytics.savings.annual.toFixed(0)}</p>
          </div>
          <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
            <p className="text-xs text-muted-foreground mb-1">Average Savings %</p>
            <p className="text-3xl font-bold">{analytics.savings.percentage}%</p>
          </div>
        </div>
      </Card>

      {/* Activity Timeline */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-6">Activity Over Last 30 Days</h3>
        <div className="space-y-3">
          {analytics.trends.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet</p>
          ) : (
            analytics.trends.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                <div>
                  <p className="font-medium">{day.date}</p>
                  <p className="text-sm text-muted-foreground">
                    {day.architecturesCreated} architectures • {day.optimizationsCompleted} optimizations
                  </p>
                </div>
                {day.costSaved > 0 && (
                  <Badge className="bg-green-500/20 text-green-700">Save ${day.costSaved.toFixed(0)}</Badge>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
