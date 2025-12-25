import { forwardRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Cloud, Zap, ArrowRight, Globe, Smartphone, Database, Layers, Sparkles, Layout, BarChart3, Shield, LogIn, MessageSquare, ListChecks, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
                <Cloud className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">SolsArch</span>
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
                  <Link to="/app">Go to App</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link to="/sign-in">Sign In</Link>
                  </Button>
                  <Button asChild variant="hero">
                    <Link to="/sign-up">Get Started</Link>
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
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link to="/about" className="text-base py-2 text-muted-foreground hover:text-foreground">About</Link>
              <Link to="/guide" className="text-base py-2 text-muted-foreground hover:text-foreground">Guide</Link>
              <Link to="/faq" className="text-base py-2 text-muted-foreground hover:text-foreground">FAQ</Link>
              <Link to="/contact" className="text-base py-2 text-muted-foreground hover:text-foreground">Contact</Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <Button asChild variant="hero" className="w-full">
                    <Link to="/app">Go to App</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/sign-in">Sign In</Link>
                    </Button>
                    <Button asChild variant="hero" className="w-full">
                      <Link to="/sign-up">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <main className="relative min-h-screen overflow-hidden pt-16">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 md:w-80 h-48 md:h-80 bg-info/20 rounded-full blur-[100px]" />
        
        <div className="container relative mx-auto px-4 sm:px-6 pt-12 sm:pt-24 pb-16 sm:pb-20">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-secondary/80 border border-border/50 backdrop-blur-sm mb-6 sm:mb-8 animate-fade-in">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                AI-Powered Solutions Architect
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Architect. Plan.{" "}
              <span className="gradient-text">Build.</span>
            </h1>
            
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mb-6 sm:mb-10 px-2 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Your AI-powered Solutions Architect for web apps, mobile apps, cloud infrastructure, and any software system.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-16 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              {user ? (
                <>
                  <Button onClick={() => navigate('/app/chat')} variant="hero" size="lg" className="gap-2 w-full sm:w-auto">
                    <MessageSquare className="w-5 h-5" />
                    Chat with AI Architect
                    <ArrowRight className="w-5 h-5 hidden sm:block" />
                  </Button>
                  <Button onClick={() => navigate('/app/wizard')} variant="outline" size="lg" className="gap-2 border-primary/50 text-primary hover:bg-primary/10 w-full sm:w-auto">
                    <ListChecks className="w-5 h-5" />
                    Guided Wizard
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => navigate('/sign-up')} variant="hero" size="lg" className="gap-2 w-full sm:w-auto">
                    <LogIn className="w-5 h-5" />
                    Get Started Free
                    <ArrowRight className="w-5 h-5 hidden sm:block" />
                  </Button>
                  <Button onClick={() => navigate('/sign-in')} variant="outline" size="lg" className="gap-2 border-primary/50 text-primary hover:bg-primary/10 w-full sm:w-auto">
                    Sign In
                  </Button>
                </>
              )}
            </div>
            
            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <FeatureCard
                icon={<Globe className="w-5 sm:w-6 h-5 sm:h-6" />}
                title="Web Applications"
                description="React, Next.js, Vue, Angular — full-stack architecture design"
              />
              <FeatureCard
                icon={<Smartphone className="w-5 sm:w-6 h-5 sm:h-6" />}
                title="Mobile Applications"
                description="Native, React Native, Flutter, PWA architecture patterns"
              />
              <FeatureCard
                icon={<Cloud className="w-5 sm:w-6 h-5 sm:h-6" />}
                title="Cloud Infrastructure"
                description="AWS, Azure, GCP, OCI with real-time cost comparisons"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full mt-6 sm:mt-8 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
              <FeatureCard
                icon={<Database className="w-4 sm:w-5 h-4 sm:h-5" />}
                title="Data Architecture"
                description="Database design, caching, search, and data pipelines"
              />
              <FeatureCard
                icon={<Layers className="w-4 sm:w-5 h-4 sm:h-5" />}
                title="Microservices"
                description="Container orchestration and service mesh patterns"
              />
              <FeatureCard
                icon={<Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />}
                title="AI/ML Systems"
                description="LLM integration, RAG, and model serving architecture"
              />
              <FeatureCard
                icon={<Layout className="w-4 sm:w-5 h-4 sm:h-5" />}
                title="Auto Diagrams"
                description="Generate professional architecture diagrams instantly"
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full mt-4 sm:mt-6 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
              <SmallFeature icon={<BarChart3 className="w-4 h-4" />} text="Cost Optimization" />
              <SmallFeature icon={<Shield className="w-4 h-4" />} text="Security Best Practices" />
              <SmallFeature icon={<Globe className="w-4 h-4" />} text="Multi-Region Support" />
              <SmallFeature icon={<Zap className="w-4 h-4" />} text="Instant Generation" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" />
              <span className="font-semibold">SolsArch</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/guide" className="hover:text-foreground transition-colors">Guide</Link>
              <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 SolsArch</p>
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
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative p-4 sm:p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-300">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

const SmallFeature = forwardRef<HTMLDivElement, { icon: React.ReactNode; text: string }>(
  ({ icon, text }, ref) => (
    <div ref={ref} className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-secondary/30 border border-border/30">
      <div className="text-primary flex-shrink-0">{icon}</div>
      <span className="text-xs sm:text-sm text-muted-foreground truncate">{text}</span>
    </div>
  )
);
SmallFeature.displayName = 'SmallFeature';
