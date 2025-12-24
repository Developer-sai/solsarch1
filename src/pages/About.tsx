import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Cloud,
    ArrowLeft,
    Sparkles,
    CheckCircle2,
    Zap,
    Shield,
    TrendingUp,
    Users,
    Building2,
    Globe
} from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Background effects */}
            <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />

            {/* Header */}
            <header className="relative z-10 border-b border-border bg-card/50 backdrop-blur-xl">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
                            <Cloud className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-bold">SolsArch</span>
                    </Link>
                    <Link to="/">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Main content */}
            <main className="relative z-10 container mx-auto px-6 py-20">
                <div className="max-w-4xl mx-auto">
                    {/* Hero section */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border/50 backdrop-blur-sm mb-6">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-muted-foreground">
                                AI-Powered Cloud Architecture
                            </span>
                        </div>
                        <h1 className="text-5xl font-bold mb-6">
                            About <span className="gradient-text">SolsArch</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Your professional AI-based Solutions Architect for designing production-ready,
                            cost-optimized cloud architectures at enterprise scale.
                        </p>
                    </div>

                    {/* What is SolsArch */}
                    <Card className="p-8 mb-12 bg-card/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-4">What is SolsArch?</h2>
                        <p className="text-muted-foreground mb-4">
                            SolsArch is an intelligent cloud architecture design platform that helps companies of all sizes—from
                            startups to Fortune 500 enterprises—design, compare, and optimize their cloud infrastructure across
                            AWS, Azure, GCP, and OCI.
                        </p>
                        <p className="text-muted-foreground">
                            Powered by Google Gemini AI, SolsArch analyzes your requirements and generates production-ready
                            architecture recommendations with real-time cost comparisons, compliance considerations, and
                            optimization strategies.
                        </p>
                    </Card>

                    {/* For Enterprise Companies */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-primary" />
                            Built for Enterprise Scale
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <FeatureCard
                                icon={<TrendingUp className="w-5 h-5" />}
                                title="Existing Infrastructure Analysis"
                                description="Already have cloud infrastructure? SolsArch analyzes your current setup and identifies optimization opportunities."
                            />
                            <FeatureCard
                                icon={<Globe className="w-5 h-5" />}
                                title="Multi-Cloud & Hybrid Strategies"
                                description="Design true multi-cloud architectures with workloads distributed across providers for optimal performance and cost."
                            />
                            <FeatureCard
                                icon={<Shield className="w-5 h-5" />}
                                title="Compliance Gap Analysis"
                                description="Identify compliance gaps for HIPAA, SOC2, GDPR, PCI-DSS, ISO 27001, and DPDP with remediation recommendations."
                            />
                            <FeatureCard
                                icon={<Users className="w-5 h-5" />}
                                title="Migration Planning"
                                description="Plan cloud migrations with phased timelines, risk assessments, and cost projections for current vs. target state."
                            />
                        </div>
                    </div>

                    {/* Key Features */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">Key Features</h2>
                        <div className="space-y-4">
                            <Feature
                                title="Dual Input Modes"
                                description="Choose between a guided wizard for structured input or conversational chat for natural language requirements."
                            />
                            <Feature
                                title="AI-Powered Generation"
                                description="Get 3 architecture variants (cost-optimized, balanced, performance-optimized) with detailed component breakdowns."
                            />
                            <Feature
                                title="Real-Time Cost Comparison"
                                description="Compare costs across AWS, Azure, GCP, and OCI with accurate 2024-2025 pricing data."
                            />
                            <Feature
                                title="GPU Intelligence"
                                description="Specialized recommendations for AI/ML workloads with GPU price-performance analysis (A100, H100, L40, T4)."
                            />
                            <Feature
                                title="Optimization Tools"
                                description="Resource rightsizing, spot optimization, bill analyzer, and one-click optimization recommendations."
                            />
                            <Feature
                                title="Compliance Support"
                                description="Built-in compliance frameworks for SOC2, GDPR, HIPAA, PCI-DSS, ISO 27001, and DPDP."
                            />
                            <Feature
                                title="Visual Diagrams"
                                description="Auto-generated Mermaid architecture diagrams with export to PNG/SVG."
                            />
                            <Feature
                                title="TCO Calculator"
                                description="Total Cost of Ownership projections over 1, 3, and 5 years including migration and operational costs."
                            />
                        </div>
                    </div>

                    {/* Use Cases */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">Who Uses SolsArch?</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <UseCaseCard
                                title="Startups"
                                description="Design cost-efficient architectures that scale with your growth."
                            />
                            <UseCaseCard
                                title="Scale-ups"
                                description="Optimize existing infrastructure and plan multi-cloud strategies."
                            />
                            <UseCaseCard
                                title="Enterprises"
                                description="Analyze complex systems, plan migrations, and ensure compliance."
                            />
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <Link to="/design">
                            <Button variant="hero" size="lg" className="gap-2">
                                <Sparkles className="w-5 h-5" />
                                Start Designing
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <Card className="p-6 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
            {icon}
        </div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
);

const Feature = ({ title, description }: { title: string; description: string }) => (
    <div className="flex gap-3">
        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
);

const UseCaseCard = ({ title, description }: { title: string; description: string }) => (
    <Card className="p-6 text-center bg-card/50 backdrop-blur-sm">
        <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
);

export default About;
