"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Template {
  id: string
  title: string
  description: string
  category: string
  difficulty_level: string
  estimated_cost_monthly: number
  tags: string[]
  highlights: string[]
}

interface TemplateCardProps {
  template: Template
  onUse: (templateId: string) => void
  isLoading?: boolean
}

export function TemplateCard({ template, onUse, isLoading = false }: TemplateCardProps) {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-500/20 text-green-700"
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-700"
      case "advanced":
        return "bg-red-500/20 text-red-700"
      default:
        return "bg-gray-500/20"
    }
  }

  return (
    <Card className="p-6 flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-lg font-bold flex-1">{template.title}</h3>
          <Badge className={getDifficultyColor(template.difficulty_level)}>
            {template.difficulty_level.charAt(0).toUpperCase() + template.difficulty_level.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </div>

      {/* Cost */}
      <div className="mb-4 p-3 bg-primary/5 rounded-lg">
        <p className="text-xs text-muted-foreground mb-1">Estimated Monthly Cost</p>
        <p className="text-lg font-bold">${template.estimated_cost_monthly}</p>
      </div>

      {/* Highlights */}
      <div className="mb-4 flex-1">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Key Features</p>
        <ul className="space-y-1">
          {template.highlights.slice(0, 3).map((highlight, idx) => (
            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="mb-4 flex flex-wrap gap-1">
        {template.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Action */}
      <Button onClick={() => onUse(template.id)} disabled={isLoading} className="w-full">
        {isLoading ? "Creating..." : "Use This Template"}
      </Button>
    </Card>
  )
}
