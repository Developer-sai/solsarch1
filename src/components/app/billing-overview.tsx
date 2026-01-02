"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"
import Link from "next/link"

interface BillingData {
  subscription: {
    planTier: string
    status: string
    currentPeriodEnd: string
  } | null
  usage: {
    architecturesGenerated: number
    apiCalls: number
    storageGb: number
  } | null
  nextInvoice: {
    amount: number
    dueDate: string
  } | null
}

interface BillingOverviewProps {
  user: User
  organizationId: string
}

export function BillingOverview({ organizationId }: BillingOverviewProps) {
  const [billing, setBilling] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const response = await fetch(`/api/billing/usage?organizationId=${organizationId}`)
        if (response.ok) {
          const data = await response.json()
          setBilling({
            subscription: data.subscription,
            usage: data.usage,
            nextInvoice: data.nextInvoice,
          })
        }
      } catch (error) {
        console.error("[v0] Failed to fetch billing:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBilling()
  }, [organizationId])

  if (loading) {
    return <div className="text-muted-foreground">Loading billing information...</div>
  }

  if (!billing?.subscription) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
        <p className="text-muted-foreground mb-4">Get started with SolsArch today</p>
        <Button asChild>
          <Link href="/pricing">View Plans</Link>
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="text-xl font-bold capitalize">{billing.subscription.planTier}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-xl font-bold capitalize">{billing.subscription.status}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Renews</p>
            <p className="text-xl font-bold">{new Date(billing.subscription.currentPeriodEnd).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>

      {billing.usage && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Current Usage</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Architectures Generated</p>
              <p className="text-2xl font-bold">{billing.usage.architecturesGenerated}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">API Calls</p>
              <p className="text-2xl font-bold">{billing.usage.apiCalls.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Storage Used</p>
              <p className="text-2xl font-bold">{billing.usage.storageGb.toFixed(2)} GB</p>
            </div>
          </div>
        </Card>
      )}

      {billing.nextInvoice && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Next Invoice</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Amount Due</p>
              <p className="text-2xl font-bold">${(billing.nextInvoice.amount / 100).toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="text-lg font-semibold">{new Date(billing.nextInvoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>
      )}

      <Button variant="outline" asChild className="w-full bg-transparent">
        <Link href="/settings/billing">Manage Subscription</Link>
      </Button>
    </div>
  )
}
