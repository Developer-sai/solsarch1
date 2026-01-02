import { forwardRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  ArrowRight, 
  Globe, 
  Database, 
  Layers, 
  Layout, 
  LogIn, 
  MessageSquare, 
  Menu, 
  X,
  CheckCircle2,
  Building2,
  Users,
  FileCode2,
  GitBranch,
  Play,
  Star,
  Clock,
  DollarSign,
  Target,
  Rocket,
  HeartPulse,
  Gamepad2,
  Brain,
  CreditCard,
  ShoppingCart,
  TrendingUp,
  FileSpreadsheet,
  XCircle,
  Check,
  Sparkles,
  BarChart3,
  Shield,
  Cpu
} from 'lucide-react';

const TRUSTED_LOGOS = [
  { name: 'AWS', icon: Cloud },
  { name: 'Azure', icon: Cloud },
  { name: 'GCP', icon: Cloud },
  { name: 'Oracle', icon: Database },
];

const PROBLEMS = [
  { icon: FileSpreadsheet, text: 'Spreadsheet-based cost comparisons' },
  { icon: Layout, text: 'Manual diagram creation' },
  { icon: GitBranch, text: 'No version control for architectures' },
  { icon: Target, text: 'Vendor-biased recommendations' },
  { icon: Clock, text: 'Outdated pricing data' },
  { icon: FileCode2, text: 'Copy-pasted Terraform templates' },
];

const TARGET_CUSTOMERS = [
  {
    title: 'Tech Startups',
    icon: Rocket,
    problem: 'Limited budget, need to ship fast, can\'t afford surprise cloud bills',
    solution: 'AI generates cost-optimized architectures in minutes with real prices',
    benefits: ['3 variants in 60 seconds', 'Cost-optimized designs', 'Multi-cloud options', 'Export Terraform instantly'],
    roi: 'Save 40+ hours of architecture design',
    color: 'from-primary/20 to-primary/5'
  },
  {
    title: 'Enterprise IT Teams',
    icon: Building2,
    problem: 'Complex governance, multi-cloud sprawl, manual compliance checks',
    solution: 'Consistent architectures with compliance built-in',
    benefits: ['SOC2, HIPAA, PCI-DSS filters', '4 providers compared', 'Version control', 'Team collaboration'],
    roi: 'Reduce architecture review cycles by 60%',
    color: 'from-info/20 to-info/5'
  },
  {
    title: 'Consulting & MSPs',
    icon: Users,
    problem: 'Create proposals for multiple clients with different cloud preferences',
    solution: 'Generate professional architecture docs with real pricing',
    benefits: ['Instant proposals', 'All 4 major clouds', 'PDF/Markdown exports', 'White-label ready'],
    roi: 'Handle 3x more client engagements',
    color: 'from-success/20 to-success/5'
  },
  {
    title: 'SaaS Companies',
    icon: Layers,
    problem: 'Need multi-tenant architectures, scaling plans, GPU cost control',
    solution: 'Production-ready patterns with growth projections',
    benefits: ['Multi-tenancy patterns', 'GPU dashboard', '3 scaling variants', 'Continuous optimization'],
    roi: 'Reduce cloud spend by 20-30%',
    color: 'from-accent/20 to-accent/5'
  },
  {
    title: 'FinTech & Healthcare',
    icon: HeartPulse,
    problem: 'Strict compliance, audit trails, can\'t use random cloud configs',
    solution: 'Compliant architectures with full documentation',
    benefits: ['HIPAA/PCI-DSS ready', 'Audit trail logs', 'Security-first design', 'Detailed documentation'],
    roi: 'Pass audits faster, avoid compliance fines',
    color: 'from-warning/20 to-warning/5'
  },
  {
    title: 'AI/ML Teams',
    icon: Brain,
    problem: 'GPU costs are insane, need to compare A100 vs V100 vs T4',
    solution: 'GPU-focused pricing and optimization dashboard',
    benefits: ['20+ GPU SKUs', 'TFLOPS/$ analysis', 'Spot instance savings', 'Multi-cloud GPU compare'],
    roi: 'Cut GPU costs by 40% with spot + rightsizing',
    color: 'from-destructive/20 to-destructive/5'
  },
];

const USE_CASES = [
  {
    industry: 'E-commerce',
    icon: ShoppingCart,
    quote: '"I need a scalable shop that handles Black Friday spikes under $5K/month"',
    output: 'Auto-scaling compute, managed DB, CDN, queue-based order processing across 4 clouds'
  },
  {
    industry: 'Healthcare Platform',
    icon: HeartPulse,
    quote: '"HIPAA-compliant patient portal with encrypted data"',
    output: 'Compliant architecture with encryption, audit logging, private subnets, BAA-eligible services'
  },
  {
    industry: 'Gaming Backend',
    icon: Gamepad2,
    quote: '"Real-time multiplayer with low latency globally"',
    output: 'Edge compute, global load balancers, in-memory cache, WebSocket servers'
  },
  {
    industry: 'ML Training Pipeline',
    icon: Brain,
    quote: '"Train models on 8x A100 GPUs with cost control"',
    output: 'Spot GPU instances, auto-scaling, checkpoint storage, cost alerts'
  },
  {
    industry: 'Fintech Payments',
    icon: CreditCard,
    quote: '"PCI-DSS compliant payment processing"',
    output: 'Isolated VPCs, encrypted transit, WAF, compliant database configurations'
  },
];

const COMPARISON_DATA = [
  { painPoint: 'Architecture design', traditional: '2-5 days', solsarch: '5 minutes' },
  { painPoint: 'Cost comparison', traditional: '4 spreadsheets', solsarch: '1 click' },
  { painPoint: 'Diagram creation', traditional: '2-3 hours', solsarch: 'Auto-generated' },
  { painPoint: 'IaC writing', traditional: '8+ hours', solsarch: 'Instant export' },
  { painPoint: 'Version tracking', traditional: 'None / Git chaos', solsarch: 'Built-in' },
  { painPoint: 'Pricing accuracy', traditional: 'Outdated', solsarch: 'Real SKU catalog' },
];

const COMPETITORS = [
  { name: 'Lucidchart', advantage: 'We generate architectures + pricing, not just diagrams' },
  { name: 'Cloudcraft', advantage: 'We support 4 clouds, not just AWS' },
  { name: 'AWS Calculator', advantage: 'We compare all providers, not just one' },
  { name: 'Manual design', advantage: 'AI does 40 hours of work in 5 minutes' },
  { name: 'Consulting firms', advantage: '$0 vs $50K+ for architecture consulting' },
];

const STATS = [
  { value: '40+', label: 'Hours saved per architecture', icon: Clock },
  { value: '20-40%', label: 'Cloud spend savings', icon: DollarSign },
  { value: '4', label: 'Clouds compared fairly', icon: Globe },
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
              AI-Powered{" "}
              <span className="gradient-text">Solutions Architect</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mb-8 px-2 animate-fade-in-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
              Design production-ready cloud architectures in seconds. Compare costs across AWS, Azure, GCP, and OCI. Export Terraform, diagrams, and docs — all powered by AI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              {user ? (
                <Button onClick={() => navigate('/app/chat')} variant="hero" size="lg" className="gap-2 w-full sm:w-auto shadow-xl shadow-primary/25 text-base px-8">
                  <MessageSquare className="w-5 h-5" />
                  Chat with AI Architect
                  <ArrowRight className="w-5 h-5" />
                </Button>
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

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 mb-16 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
              {STATS.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 px-6 py-3 rounded-xl bg-card/50 border border-border/50">
                  <stat.icon className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The Problem Section */}
        <div className="border-y border-border/50 bg-destructive/5">
          <div className="container mx-auto px-4 sm:px-6 py-16">
            <div className="text-center mb-12">
              <Badge variant="destructive" className="mb-4">THE PROBLEM</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Cloud Architecture is Broken</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Companies spend weeks designing cloud infrastructure, manually comparing prices, and writing IaC from scratch.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {PROBLEMS.map((problem) => (
                <div 
                  key={problem.text}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-destructive/20"
                >
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{problem.text}</span>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="text-xl font-semibold text-primary">SolsArch fixes all of this.</p>
            </div>
          </div>
        </div>

        {/* Who Needs SolsArch Section */}
        <div className="container mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">TARGET CUSTOMERS</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Teams That Ship</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From startup to enterprise, SolsArch accelerates your cloud architecture workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TARGET_CUSTOMERS.map((customer, index) => (
              <div 
                key={customer.title}
                className={`p-6 rounded-xl bg-gradient-to-br ${customer.color} border border-border/50 hover:border-primary/30 transition-all group animate-fade-in-up`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-card/80 flex items-center justify-center">
                    <customer.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">{customer.title}</h3>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{customer.problem}</p>
                
                <div className="space-y-2 mb-4">
                  {customer.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-success">{customer.roi}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table Section */}
        <div className="border-y border-border/50 bg-secondary/20">
          <div className="container mx-auto px-4 sm:px-6 py-20">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">COMPARISON</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">What SolsArch Solves</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See the difference between traditional architecture workflows and SolsArch
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="rounded-xl overflow-hidden border border-border/50">
                <div className="grid grid-cols-3 bg-card/80 p-4 font-semibold border-b border-border/50">
                  <div>Pain Point</div>
                  <div className="text-center text-muted-foreground">Traditional</div>
                  <div className="text-center text-primary">With SolsArch</div>
                </div>
                {COMPARISON_DATA.map((row, index) => (
                  <div 
                    key={row.painPoint} 
                    className={`grid grid-cols-3 p-4 ${index % 2 === 0 ? 'bg-card/30' : 'bg-card/50'}`}
                  >
                    <div className="font-medium">{row.painPoint}</div>
                    <div className="text-center text-muted-foreground">{row.traditional}</div>
                    <div className="text-center text-primary font-medium">{row.solsarch}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="container mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">USE CASES</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Real-World Examples</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how SolsArch handles complex architecture requirements across industries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {USE_CASES.map((useCase, index) => (
              <div 
                key={useCase.industry}
                className="p-6 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <useCase.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold">{useCase.industry}</h3>
                </div>
                
                <p className="text-sm italic text-muted-foreground mb-4">{useCase.quote}</p>
                
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{useCase.output}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitive Advantage Section */}
        <div className="border-y border-border/50 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 py-20">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">COMPETITIVE EDGE</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose SolsArch?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See how we compare to traditional tools and consulting
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {COMPETITORS.map((comp) => (
                <div 
                  key={comp.name}
                  className="p-5 rounded-xl bg-card/50 border border-border/50"
                >
                  <div className="text-sm text-muted-foreground mb-2">vs. {comp.name}</div>
                  <p className="font-medium">{comp.advantage}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="container mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">FEATURES</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features for modern cloud architecture design
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              icon={<Cpu className="w-6 h-6" />}
              title="GPU Optimization"
              description="Compare A100, V100, T4 GPUs across clouds with TFLOPS/$ analysis"
              gradient="from-destructive/20 to-destructive/5"
            />
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
                AI-powered solutions architecture platform for the modern cloud era.
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
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SolsArch. All rights reserved.
            </p>
            <div className="flex gap-6">
              {TRUSTED_LOGOS.map((logo) => (
                <div key={logo.name} className="flex items-center gap-1.5 text-muted-foreground/60">
                  <logo.icon className="w-4 h-4" />
                  <span className="text-xs">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon, title, description, gradient }, ref) => (
    <div
      ref={ref}
      className={`group p-6 rounded-xl bg-gradient-to-br ${gradient} border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5`}
    >
      <div className="w-12 h-12 rounded-lg bg-card/80 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
);

FeatureCard.displayName = 'FeatureCard';
