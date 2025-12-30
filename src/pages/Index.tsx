import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Cloud, Zap, ArrowRight, MessageSquare, Globe, Smartphone, Database, Layers, Sparkles, Layout, BarChart3, Shield, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartChat = () => {
    if (!user) {
      navigate('/sign-in');
      return;
    }
    navigate('/app/chat');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <Cloud className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SolsArch</span>
          </Link>
          
          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate('/app')} variant="hero" size="sm" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Open App
              </Button>
            ) : (
              <>
                <Button onClick={() => navigate('/sign-in')} variant="ghost" size="sm">
                  Sign In
                </Button>
                <Button onClick={() => navigate('/sign-up')} variant="hero" size="sm" className="gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative min-h-screen overflow-hidden pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 md:w-80 h-48 md:h-80 bg-info/20 rounded-full blur-[100px]" />
        
        <div className="container relative mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border/50 backdrop-blur-sm mb-6 sm:mb-8 animate-fade-in">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                AI Solutions Architect
              </span>
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Design any system.{" "}
              <span className="gradient-text">Instantly.</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mb-8 sm:mb-10 px-2 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Chat with an AI architect to design production-ready cloud architectures, applications, and infrastructure with real-time cost intelligence.
            </p>
            
            {/* CTA Button - Single primary action like ChatGPT */}
            <div className="flex flex-col items-center gap-4 mb-12 sm:mb-16 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <Button onClick={handleStartChat} variant="hero" size="xl" className="gap-3 w-full sm:w-auto text-lg px-8">
                {user ? (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    Start Chatting
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Get Started Free
                  </>
                )}
                <ArrowRight className="w-5 h-5" />
              </Button>
              {!user && (
                <p className="text-sm text-muted-foreground">
                  No credit card required
                </p>
              )}
            </div>
            
            {/* Feature cards - What SolsArch can do */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <FeatureCard
                icon={<Globe className="w-5 sm:w-6 h-5 sm:h-6" />}
                title="Web & Mobile Apps"
                description="Full-stack architecture for React, Next.js, Flutter, React Native"
              />
              <FeatureCard
                icon={<Cloud className="w-5 sm:w-6 h-5 sm:h-6" />}
                title="Cloud Infrastructure"
                description="AWS, Azure, GCP, OCI with real-time cost comparisons"
              />
              <FeatureCard
                icon={<Sparkles className="w-5 sm:w-6 h-5 sm:h-6" />}
                title="AI/ML Systems"
                description="LLM integration, RAG, model serving, and data pipelines"
              />
            </div>

            {/* More capabilities */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full mt-6 sm:mt-8 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
              <SmallFeature icon={<Database className="w-4 h-4" />} text="Database Design" />
              <SmallFeature icon={<Layers className="w-4 h-4" />} text="Microservices" />
              <SmallFeature icon={<Layout className="w-4 h-4" />} text="Auto Diagrams" />
              <SmallFeature icon={<BarChart3 className="w-4 h-4" />} text="Cost Analysis" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full mt-3 sm:mt-4 animate-fade-in-up" style={{ animationDelay: "0.55s" }}>
              <SmallFeature icon={<Shield className="w-4 h-4" />} text="Security Best Practices" />
              <SmallFeature icon={<Globe className="w-4 h-4" />} text="Multi-Region" />
              <SmallFeature icon={<Zap className="w-4 h-4" />} text="Instant Generation" />
              <SmallFeature icon={<Sparkles className="w-4 h-4" />} text="Voice Input" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cloud className="w-4 h-4" />
              <span className="text-sm">© 2024 SolsArch. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/guide" className="hover:text-foreground transition-colors">Guide</Link>
              <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
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

function SmallFeature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-secondary/30 border border-border/30">
      <div className="text-primary flex-shrink-0">{icon}</div>
      <span className="text-xs sm:text-sm text-muted-foreground truncate">{text}</span>
    </div>
  );
}

export default Index;
