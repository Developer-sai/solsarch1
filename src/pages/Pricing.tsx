import { PricingCard } from "@/components/pricing/PricingCard";

const Pricing = () => {
    const plans = [
        {
            plan: "starter" as const,
            name: "Starter",
            price: 49,
            description: "Perfect for individuals and small teams",
            features: [
                "Up to 10 architecture designs per month",
                "Multi-cloud cost comparison",
                "Basic templates library",
                "Export to PDF and PNG",
                "Community support",
                "7-day version history",
            ],
        },
        {
            plan: "professional" as const,
            name: "Professional",
            price: 149,
            description: "For growing teams and businesses",
            isPopular: true,
            features: [
                "Unlimited architecture designs",
                "Advanced cost optimization",
                "Full templates library + custom templates",
                "Export to IaC (Terraform, CloudFormation)",
                "Priority support",
                "30-day version history",
                "Team collaboration (up to 10 users)",
                "Compliance validation (SOC2, HIPAA, GDPR)",
                "Analytics dashboard",
            ],
        },
        {
            plan: "enterprise" as const,
            name: "Enterprise",
            price: null,
            description: "For large organizations with custom needs",
            features: [
                "Everything in Professional",
                "Unlimited team members",
                "Dedicated account manager",
                "Custom integrations",
                "SLA guarantee",
                "Advanced security features",
                "Custom compliance frameworks",
                "On-premise deployment option",
                "Training and onboarding",
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                            Simple, transparent pricing
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Choose the plan that's right for your team. All plans include a 14-day free trial.
                        </p>
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <PricingCard key={plan.plan} {...plan} />
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <div className="border-t border-border/40">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">Can I change plans later?</h3>
                            <p className="text-muted-foreground">
                                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                            <p className="text-muted-foreground">
                                We accept all major credit cards, PayPal, and can arrange invoicing for Enterprise customers.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                            <p className="text-muted-foreground">
                                Yes, all plans include a 14-day free trial. No credit card required to start.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">What happens after my trial ends?</h3>
                            <p className="text-muted-foreground">
                                You can choose to upgrade to a paid plan or continue with limited free features.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
