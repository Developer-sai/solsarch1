import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  ListChecks,
  Globe,
  Smartphone,
  Server,
  Database,
  Layers,
  Sparkles,
  Layout,
  Palette,
  Cpu,
  FileCode2,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  History,
  Settings2
} from "lucide-react";

const STATS = [
  { value: '40+', label: 'Hours Saved', icon: Clock },
  { value: '20-40%', label: 'Cost Savings', icon: DollarSign },
  { value: '4', label: 'Cloud Providers', icon: Globe },
  { value: '5', label: 'IaC Formats', icon: FileCode2 },
];

export default function AppDashboard() {
  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header with stats */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to SolsArch</h1>
          <p className="text-muted-foreground mb-6">AI-powered Solutions Architect for any application</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border/50">
                <stat.icon className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <Card className="group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all bg-card/80">
            <Link to="/app/chat">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-info/20 flex items-center justify-center text-primary mb-4 group-hover:from-primary/30 group-hover:to-info/30 transition-colors">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl">Chat with AI Architect</CardTitle>
                <CardDescription className="text-base">
                  Describe your idea in natural language. Get 3 architecture variants with multi-cloud cost comparison.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Voice Input</Badge>
                  <Badge variant="secondary">File Upload</Badge>
                  <Badge variant="secondary">3 Variants</Badge>
                  <Badge variant="secondary">Multi-Cloud</Badge>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all bg-card/80">
            <Link to="/app/history">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-info/20 to-accent/20 flex items-center justify-center text-info mb-4 group-hover:from-info/30 group-hover:to-accent/30 transition-colors">
                  <History className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl">Continue Conversations</CardTitle>
                <CardDescription className="text-base">
                  Resume previous architecture discussions and iterate on existing designs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Version History</Badge>
                  <Badge variant="secondary">Saved Chats</Badge>
                  <Badge variant="secondary">Iterate Designs</Badge>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/app/gpu">
            <Card className="h-full group hover:border-primary/50 transition-all bg-card/50">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning mb-3">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-medium mb-1">GPU Dashboard</h3>
                <p className="text-sm text-muted-foreground">Compare A100, V100, T4 with TFLOPS/$ analysis</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/app/history">
            <Card className="h-full group hover:border-primary/50 transition-all bg-card/50">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center text-info mb-3">
                  <History className="w-5 h-5" />
                </div>
                <h3 className="font-medium mb-1">Chat History</h3>
                <p className="text-sm text-muted-foreground">Continue previous architecture conversations</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/app/profile">
            <Card className="h-full group hover:border-primary/50 transition-all bg-card/50">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent-foreground mb-3">
                  <Settings2 className="w-5 h-5" />
                </div>
                <h3 className="font-medium mb-1">AI Settings</h3>
                <p className="text-sm text-muted-foreground">Configure LLM provider and model preferences</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="h-full bg-card/50 border-dashed">
            <CardContent className="pt-6">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-medium mb-1">Cost Optimization</h3>
              <p className="text-sm text-muted-foreground">Spot instances, rightsizing recommendations</p>
              <Badge variant="outline" className="mt-2 text-xs">Coming Soon</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Capabilities */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">What can SolsArch architect?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <CapabilityCard icon={<Globe className="w-5 h-5" />} title="Web Apps" />
            <CapabilityCard icon={<Smartphone className="w-5 h-5" />} title="Mobile Apps" />
            <CapabilityCard icon={<Server className="w-5 h-5" />} title="Cloud Infra" />
            <CapabilityCard icon={<Database className="w-5 h-5" />} title="Data Pipelines" />
            <CapabilityCard icon={<Layers className="w-5 h-5" />} title="Microservices" />
            <CapabilityCard icon={<Sparkles className="w-5 h-5" />} title="AI/ML Systems" />
          </div>
        </div>

        {/* Features */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Platform Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              icon={<Layout className="w-5 h-5" />}
              title="Architecture Diagrams"
              description="Auto-generated Mermaid diagrams for any system"
            />
            <FeatureCard
              icon={<Globe className="w-5 h-5" />}
              title="Multi-Cloud Compare"
              description="AWS, Azure, GCP, OCI side-by-side pricing"
            />
            <FeatureCard
              icon={<FileCode2 className="w-5 h-5" />}
              title="IaC Export"
              description="Terraform, CloudFormation, ARM, K8s, Docker"
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5" />}
              title="Compliance Ready"
              description="SOC2, HIPAA, PCI-DSS, GDPR patterns"
            />
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Who uses SolsArch?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {['Startups', 'Enterprise', 'Consultants', 'SaaS', 'FinTech', 'AI/ML Teams'].map((segment) => (
              <div key={segment} className="px-4 py-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
                <span className="text-sm font-medium">{segment}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CapabilityCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all">
      <div className="text-primary">{icon}</div>
      <span className="text-sm text-center text-muted-foreground">{title}</span>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
        {icon}
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
