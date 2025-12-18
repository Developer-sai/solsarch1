import { 
  Layers, 
  GitBranch, 
  BarChart3, 
  Shield, 
  Cpu, 
  FileText,
  Sparkles,
  TrendingDown
} from "lucide-react";

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
      
      <div className="container relative mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Architect Smart</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From requirements to production-ready architecture with live cost intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Sparkles className="w-5 h-5" />}
            title="AI Architecture"
            description="Generate cost-optimized, balanced, or performance architectures from plain English requirements"
          />
          <FeatureCard
            icon={<GitBranch className="w-5 h-5" />}
            title="Visual Diagrams"
            description="Auto-generated architecture diagrams that sync with cost calculations"
          />
          <FeatureCard
            icon={<BarChart3 className="w-5 h-5" />}
            title="Cost Comparison"
            description="Side-by-side pricing across AWS, Azure, GCP, and OCI with what-if analysis"
          />
          <FeatureCard
            icon={<Cpu className="w-5 h-5" />}
            title="GPU Intelligence"
            description="Compare A100, H100, L40 costs per TFLOP and per GB VRAM"
          />
          <FeatureCard
            icon={<TrendingDown className="w-5 h-5" />}
            title="Optimization"
            description="AI-powered recommendations to reduce costs without sacrificing performance"
          />
          <FeatureCard
            icon={<Shield className="w-5 h-5" />}
            title="Compliance Ready"
            description="Built-in support for SOC2, GDPR, and India DPDP requirements"
          />
          <FeatureCard
            icon={<Layers className="w-5 h-5" />}
            title="Service Mapping"
            description="Automatic mapping from generic services to provider-specific offerings"
          />
          <FeatureCard
            icon={<FileText className="w-5 h-5" />}
            title="Export Reports"
            description="Generate solution design documents, cost comparisons, and trade-off analysis"
          />
        </div>
      </div>
    </section>
  );
}

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
    <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
