import { forwardRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  Zap, 
  ArrowRight, 
  Globe, 
  Smartphone, 
  Database, 
  Layers, 
  Sparkles, 
  Layout, 
  BarChart3, 
  Shield, 
  LogIn, 
  MessageSquare, 
  ListChecks, 
  Menu, 
  X,
  CheckCircle2,
  Building2,
  Users,
  FileCode2,
  Network,
  GitBranch,
  Box,
  Workflow,
  Play,
  Star
} from 'lucide-react';

const TRUSTED_LOGOS = [
  { name: 'AWS', icon: Cloud },
  { name: 'Azure', icon: Cloud },
  { name: 'GCP', icon: Cloud },
  { name: 'Oracle', icon: Database },
];

const DIAGRAM_TYPES = [
  { name: 'Cloud Architecture', icon: Cloud, description: 'AWS, Azure, GCP, OCI diagrams' },
  { name: 'Network Topology', icon: Network, description: 'VPCs, subnets, security groups' },
  { name: 'Data Flow', icon: Workflow, description: 'ETL pipelines, streaming' },
  { name: 'Sequence Diagrams', icon: GitBranch, description: 'API flows, integrations' },
  { name: 'C4 Model', icon: Box, description: 'Context, container, component' },
  { name: 'Microservices', icon: Layers, description: 'Service mesh, containers' },
];

const ENTERPRISE_FEATURES = [
  { title: 'SOC 2 Compliant', icon: Shield, description: 'Enterprise security standards' },
  { title: 'Team Collaboration', icon: Users, description: 'Share & collaborate on designs' },
  { title: 'API Access', icon: FileCode2, description: 'Integrate with your CI/CD' },
  { title: 'SSO & SAML', icon: Building2, description: 'Enterprise authentication' },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-2xl">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary via-primary/80 to-info flex items-center justify-center shadow-lg shadow-primary/20">
                <Cloud className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">SolsArch</span>
              <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] px-1.5 py-0">ENTERPRISE</Badge>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/guide" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Guide</Link>
              <Link to="/faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
              <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <Button asChild variant="hero">
                  <Link to="/app">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link to="/sign-in">Sign In</Link>
                  </Button>
                  <Button asChild variant="hero" className="shadow-lg shadow-primary/20">
                    <Link to="/sign-up">Start Free Trial</Link>
                  </Button>
                </>
              )}
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-2xl">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link to="/about" className="text-base py-2 text-muted-foreground hover:text-foreground">About</Link>
              <Link to="/guide" className="text-base py-2 text-muted-foreground hover:text-foreground">Guide</Link>
              <Link to="/faq" className="text-base py-2 text-muted-foreground hover:text-foreground">FAQ</Link>
              <Link to="/contact" className="text-base py-2 text-muted-foreground hover:text-foreground">Contact</Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <Button asChild variant="hero" className="w-full">
                    <Link to="/app">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/sign-in">Sign In</Link>
                    </Button>
                    <Button asChild variant="hero" className="w-full">
                      <Link to="/sign-up">Start Free Trial</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="relative overflow-hidden pt-16">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.03]" />
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-info/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/10 rounded-full blur-[150px]" />
        
        <div className="container relative mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border/50 backdrop-blur-sm mb-8 animate-fade-in">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span className="text-sm font-medium text-muted-foreground">
                Trusted by 500+ Enterprise Teams
              </span>
              <span className="text-xs text-muted-foreground/60">|</span>
              <span className="text-sm text-primary font-semibold">4.9/5 Rating</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              AI Architecture{" "}
              <span className="gradient-text">Diagram Generator</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mb-8 px-2 animate-fade-in-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
              Design production-ready cloud architectures in seconds. Generate diagrams, compare costs across AWS, Azure, GCP, and OCI — all powered by AI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              {user ? (
                <>
                  <Button onClick={() => navigate('/app/chat')} variant="hero" size="lg" className="gap-2 w-full sm:w-auto shadow-xl shadow-primary/25 text-base px-8">
                    <MessageSquare className="w-5 h-5" />
                    Chat with AI Architect
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <Button onClick={() => navigate('/app/wizard')} variant="outline" size="lg" className="gap-2 border-border/50 w-full sm:w-auto text-base">
                    <ListChecks className="w-5 h-5" />
                    Use Wizard
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => navigate('/sign-up')} variant="hero" size="lg" className="gap-2 w-full sm:w-auto shadow-xl shadow-primary/25 text-base px-8">
                    <Play className="w-5 h-5" />
                    Start Building Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <Button onClick={() => navigate('/sign-in')} variant="outline" size="lg" className="gap-2 border-border/50 w-full sm:w-auto text-base">
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </Button>
                </>
              )}
            </div>

            {/* Quick Features */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground mb-16 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>50 free diagrams/month</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Export to PDF, PNG, Markdown</span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagram Types Section */}
        <div className="container mx-auto px-4 sm:px-6 pb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Generate Any Architecture Diagram</h2>
            <p className="text-muted-foreground">From simple cloud diagrams to complex enterprise architectures</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            {DIAGRAM_TYPES.map((type, index) => (
              <DiagramTypeCard key={type.name} type={type} index={index} />
            ))}
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="container mx-auto px-4 sm:px-6 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Multi-Cloud Support"
              description="Design for AWS, Azure, GCP, and OCI with provider-specific services and real-time pricing"
              gradient="from-info/20 to-info/5"
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Live Cost Comparison"
              description="Compare costs side-by-side across all major cloud providers with what-if analysis"
              gradient="from-success/20 to-success/5"
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI-Powered Generation"
              description="Describe your requirements in plain English and get production-ready architectures"
              gradient="from-primary/20 to-primary/5"
            />
            <FeatureCard
              icon={<Layout className="w-6 h-6" />}
              title="Auto Diagram Export"
              description="Generate professional Mermaid, PlantUML, and image exports instantly"
              gradient="from-accent/20 to-accent/5"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Compliance Ready"
              description="Built-in support for SOC2, GDPR, HIPAA, and regional compliance requirements"
              gradient="from-warning/20 to-warning/5"
            />
            <FeatureCard
              icon={<Layers className="w-6 h-6" />}
              title="Enterprise Scale"
              description="From microservices to monoliths, design architectures that scale to millions"
              gradient="from-destructive/20 to-destructive/5"
            />
          </div>
        </div>

        {/* Enterprise Features */}
        <div className="border-y border-border/50 bg-secondary/20">
          <div className="container mx-auto px-4 sm:px-6 py-16">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">ENTERPRISE</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Enterprise Teams</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Security, compliance, and collaboration features that scale with your organization
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {ENTERPRISE_FEATURES.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="p-6 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all group animate-fade-in-up"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 sm:px-6 py-20">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-info/20 to-accent/20 blur-3xl" />
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 sm:p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to architect smarter?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of developers and architects who use SolsArch to design, compare, and optimize their cloud infrastructure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate(user ? '/app/chat' : '/sign-up')} variant="hero" size="lg" className="gap-2 shadow-xl shadow-primary/25">
                  {user ? 'Open Dashboard' : 'Get Started Free'}
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button onClick={() => navigate('/contact')} variant="outline" size="lg">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
                  <Cloud className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">SolsArch</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered solution architecture platform for the modern cloud era.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/guide" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
                <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2024 SolsArch. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Powered by AI</span>
              <span className="text-primary">•</span>
              <span>Multi-Cloud Ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/40 transition-all duration-300 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function DiagramTypeCard({ type, index }: { type: typeof DIAGRAM_TYPES[0]; index: number }) {
  return (
    <div 
      className="group p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/40 hover:bg-card/80 transition-all text-center cursor-pointer"
    >
      <div className="w-10 h-10 mx-auto rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:bg-primary/20 transition-colors">
        <type.icon className="w-5 h-5" />
      </div>
      <h3 className="font-medium text-sm mb-1">{type.name}</h3>
      <p className="text-xs text-muted-foreground">{type.description}</p>
    </div>
  );
}
