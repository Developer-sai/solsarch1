"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

interface TourStep {
  title: string
  description: string
  element?: string
  position?: "top" | "bottom" | "left" | "right"
}

export function FeatureTour() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(true)

  const steps: TourStep[] = [
    {
      title: "Welcome to SolsArch",
      description: "Let me show you around. We'll create your first architecture in just a few clicks.",
    },
    {
      title: "Start Generating",
      description: "Click here to describe your architecture needs. The AI will generate a complete design for you.",
      element: "[data-tour='generate']",
    },
    {
      title: "View Your Architecture",
      description: "Once generated, see your complete architecture with components, costs, and more.",
      element: "[data-tour='architectures']",
    },
    {
      title: "Check Compliance",
      description: "Automatically validate your architecture against security and compliance standards.",
      element: "[data-tour='compliance']",
    },
    {
      title: "Export Code",
      description: "Export production-ready code in Terraform, Kubernetes, Docker, and more formats.",
      element: "[data-tour='export']",
    },
    {
      title: "Invite Your Team",
      description: "Share architectures with your team and collaborate together.",
      element: "[data-tour='share']",
    },
  ]

  if (!isOpen) return null

  return (
    <Card className="fixed bottom-4 right-4 w-full max-w-sm p-6 z-50">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold">{steps[currentStep].title}</h3>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-accent rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{steps[currentStep].description}</p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button size="sm" onClick={() => setCurrentStep(currentStep + 1)}>
            Next
          </Button>
        ) : (
          <Button size="sm" onClick={() => setIsOpen(false)}>
            Done
          </Button>
        )}
      </div>
    </Card>
  )
}
