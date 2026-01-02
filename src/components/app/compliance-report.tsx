"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Issue {
  severity: "high" | "medium" | "low"
  message: string
}

interface ComplianceResult {
  standard: string
  status: "compliant" | "at-risk" | "non-compliant"
  score: number
  issues: Issue[]
  recommendations: string[]
}

interface ComplianceReportProps {
  results: Record<string, ComplianceResult>
  isLoading?: boolean
}

export function ComplianceReport({ results, isLoading = false }: ComplianceReportProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </Card>
    )
  }

  const standards = Object.values(results)
  const compliantCount = standards.filter((s) => s.status === "compliant").length
  const overallScore = Math.round(standards.reduce((sum, s) => sum + s.score, 0) / standards.length)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-500/10 text-green-700 border-green-500/30"
      case "at-risk":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/30"
      case "non-compliant":
        return "bg-red-500/10 text-red-700 border-red-500/30"
      default:
        return "bg-gray-500/10 text-gray-700"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/20 text-red-700"
      case "medium":
        return "bg-yellow-500/20 text-yellow-700"
      case "low":
        return "bg-blue-500/20 text-blue-700"
      default:
        return "bg-gray-500/20 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
          <p className="text-3xl font-bold">{overallScore}%</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Compliant Standards</p>
          <p className="text-3xl font-bold text-green-600">
            {compliantCount}/{standards.length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Issues</p>
          <p className="text-3xl font-bold text-red-600">{standards.reduce((sum, s) => sum + s.issues.length, 0)}</p>
        </Card>
      </div>

      {/* Standards */}
      <div className="space-y-4">
        {standards.map((standard) => (
          <Card key={standard.standard} className="overflow-hidden">
            <div className={`p-6 border-l-4 ${getStatusColor(standard.status)}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold mb-1">{standard.standard}</h3>
                  <p className="text-sm text-muted-foreground">Compliance Score: {standard.score}%</p>
                </div>
                <Badge className={getStatusColor(standard.status)} variant="outline">
                  {standard.status.replace("-", " ").toUpperCase()}
                </Badge>
              </div>

              {standard.issues.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Issues Found:</p>
                  <div className="space-y-2">
                    {standard.issues.map((issue, idx) => (
                      <div key={idx} className={`p-3 rounded text-sm ${getSeverityColor(issue.severity)}`}>
                        <div className="font-medium mb-1 capitalize">{issue.severity} Severity</div>
                        <div>{issue.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {standard.recommendations.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Recommendations:</p>
                  <ul className="space-y-1">
                    {standard.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Action Items */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="font-bold mb-4">Next Steps</h3>
        <ol className="space-y-2 text-sm">
          <li>1. Review all high-severity issues and address them first</li>
          <li>2. Implement recommendations for each compliance standard</li>
          <li>3. Document your security policies and controls</li>
          <li>4. Schedule regular compliance audits and assessments</li>
          <li>5. Train your team on security best practices</li>
        </ol>
      </Card>
    </div>
  )
}
