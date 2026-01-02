import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

interface PricingCardProps {
  plan: "starter" | "professional" | "enterprise"
  name: string
  price: number | null
  description: string
  features: string[]
  isPopular?: boolean
}

export function PricingCard({ plan, name, price, description, features, isPopular }: PricingCardProps) {
  return (
    <Card
      className={`p-6 md:p-8 flex flex-col ${isPopular ? "border-primary bg-primary/5 relative" : "border-border/40 bg-card/50"}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <div className="mb-6">
        {price !== null ? (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">${price}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
        ) : (
          <div className="text-3xl font-bold">Custom Pricing</div>
        )}
      </div>

      <Button asChild className="w-full mb-8" variant={isPopular ? "default" : "outline"}>
        <Link href={plan === "enterprise" ? "/contact" : `/api/billing/checkout?plan=${plan}`}>
          {plan === "enterprise" ? "Contact Sales" : "Get Started"}
        </Link>
      </Button>

      <div className="space-y-3 flex-1">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
