import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Cloud, ArrowRight, DollarSign, Cpu, Zap, BarChart3, Shield, Globe, Activity, Server, FileText, MessageSquare, Wand2, Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <Cloud className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">SolsArch</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/design">
              <Button variant="default" size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-info/20 rounded-full blur-[100px]" />

        <div className="container relative mx-auto px-6 pt-20 pb-20">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border/50 backdrop-blur-sm mb-8 animate-fade-in">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                AI-Powered Solutions Architect
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Design. Compare.{" "}
              <span className="gradient-text">Optimize.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Your professional AI-based Solutions Architect for everything - from small-scale apps to enterprise systems. SolsArch is here for you.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <Link to="/design?mode=wizard">
                <Button variant="hero" size="xl" className="gap-2">
                  <Wand2 className="w-5 h-5" />
                  Guided Wizard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/design?mode=chat">
                <Button variant="outline" size="xl" className="gap-2 border-primary/50 hover:bg-primary/10">
                  <MessageSquare className="w-5 h-5" />
                  Chat with AI
                  <Sparkles className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <FeatureCard
                icon={<Cloud className="w-6 h-6" />}
                title="Multi-Cloud Architecture"
                description="Design for AWS, Azure, GCP, OCI with provider-specific optimizations"
              />
              <FeatureCard
                icon={<DollarSign className="w-6 h-6" />}
                title="Live Cost Intelligence"
                description="Real-time pricing comparison across all major cloud providers"
              />
              <FeatureCard
                icon={<Cpu className="w-6 h-6" />}
                title="GPU Price-Performance"
                description="Compare A100, H100, L40, T4 costs per TFLOP across providers"
              />
            </div>

            {/* ScaleOps-inspired features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-8 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
              <FeatureCard
                icon={<Activity className="w-5 h-5" />}
                title="Resource Rightsizing"
                description="Auto-optimize CPU & memory based on actual usage"
              />
              <FeatureCard
                icon={<Zap className="w-5 h-5" />}
                title="Spot Optimization"
                description="Save up to 70% with intelligent Spot placement"
              />
              <FeatureCard
                icon={<Server className="w-5 h-5" />}
                title="GPU Workload Tuning"
                description="Maximize GPU utilization with MIG-aware partitioning"
              />
              <FeatureCard
                icon={<FileText className="w-5 h-5" />}
                title="Bill Analyzer"
                description="Upload your cloud bill and find savings instantly"
              />
            </div>

            {/* Additional features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-6 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
              <SmallFeature icon={<BarChart3 className="w-4 h-4" />} text="Cost Optimization" />
              <SmallFeature icon={<Shield className="w-4 h-4" />} text="Security Best Practices" />
              <SmallFeature icon={<Globe className="w-4 h-4" />} text="Multi-Region Support" />
              <SmallFeature icon={<Zap className="w-4 h-4" />} text="Instant Generation" />
            </div>

            {/* Enterprise CTA */}
            <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-info/10 border border-primary/20 w-full max-w-3xl">
              <h2 className="text-2xl font-bold mb-3">Built for Enterprise Scale</h2>
              <p className="text-muted-foreground mb-6">
                Already have cloud infrastructure? SolsArch analyzes your existing setup, identifies optimization opportunities,
                and helps plan multi-cloud migrations with compliance gap analysis.
              </p>
              <Link to="/about">
                <Button variant="outline" className="gap-2">
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
                <Cloud className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">SolsArch</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ for cloud architects and developers
            </p>
            <div className="flex items-center gap-4">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/design" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-300">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

const SmallFeature = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border/30">
    <div className="text-primary">{icon}</div>
    <span className="text-sm text-muted-foreground">{text}</span>
  </div>
);

export default Index;
