import { useState, useEffect, forwardRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppHeader } from '@/components/app/AppHeader';
import { RequirementsWizard } from '@/components/app/RequirementsWizard';
import { ArchitectureView } from '@/components/app/ArchitectureView';
import { CostComparison } from '@/components/app/CostComparison';
import { ArchitectureDiagram } from '@/components/app/ArchitectureDiagram';
import { GPUDashboard } from '@/components/app/GPUDashboard';
import { Recommendations } from '@/components/app/Recommendations';
import { TradeOffSliders } from '@/components/app/TradeOffSliders';
import { ExportButton } from '@/components/app/ExportButton';
import { ResourceRightsizing } from '@/components/app/ResourceRightsizing';
import { CostBreakdown } from '@/components/app/CostBreakdown';
import { SpotOptimization } from '@/components/app/SpotOptimization';
import { ObservabilityPanel } from '@/components/app/ObservabilityPanel';
import { GPUOptimization } from '@/components/app/GPUOptimization';
import { CloudBillAnalyzer } from '@/components/app/CloudBillAnalyzer';
import { OneClickOptimizations } from '@/components/app/OneClickOptimizations';
import { ArchitectChat } from '@/components/chat/ArchitectChat';
import { Requirements, ArchitectureResult } from '@/types/architecture';
import { Loader2, Sparkles, ArrowRight, Cloud, Cpu, DollarSign, Zap, BarChart3, Shield, Globe, Activity, Server, FileText, MessageSquare, ListChecks, LogIn, Smartphone, Layout, Database, Layers, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ViewMode = 'landing' | 'wizard' | 'chat' | 'results';

const Index = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [isGenerating, setIsGenerating] = useState(false);
  const [requirements, setRequirements] = useState<Requirements | null>(null);
  const [result, setResult] = useState<ArchitectureResult | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number>(1);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Handle URL query param for mode switching
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'chat' && user) {
      setViewMode('chat');
    } else if (mode === 'wizard' && user) {
      setViewMode('wizard');
    }
  }, [searchParams, user]);

  const handleGenerate = async (reqs: Requirements) => {
    setRequirements(reqs);
    setIsGenerating(true);

    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to generate architectures.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-architecture`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ requirements: reqs }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate architecture');
      }

      const data: ArchitectureResult = await response.json();
      setResult(data);
      setViewMode('results');
      
      toast({
        title: "Architecture Generated!",
        description: "3 architecture variants created with cost comparisons.",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setViewMode('landing');
    setResult(null);
    setRequirements(null);
  };

  const handleStartWizard = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to use the architecture wizard.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    setViewMode('wizard');
  };

  const handleStartChat = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to chat with the AI architect.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    setViewMode('chat');
  };

  const handleChatArchitectureGenerated = (architectureResult: ArchitectureResult) => {
    setResult(architectureResult);
    setViewMode('results');
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        onReset={handleReset} 
        hasResults={viewMode === 'results'}
        showExport={viewMode === 'results' && result !== null && requirements !== null}
        exportComponent={
          result && requirements ? (
            <ExportButton 
              result={result} 
              requirements={requirements} 
              selectedVariant={selectedVariant} 
            />
          ) : undefined
        }
      />
      
      {isGenerating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-8 rounded-xl bg-card border border-border shadow-2xl">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <Sparkles className="w-5 h-5 text-primary absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">Generating Architecture</h3>
              <p className="text-muted-foreground">AI is designing your cloud infrastructure...</p>
            </div>
          </div>
        </div>
      )}

      {/* Landing View */}
      {viewMode === 'landing' && (
        <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5" />
          <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-48 md:w-80 h-48 md:h-80 bg-info/20 rounded-full blur-[100px]" />
          
          <div className="container relative mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-20">
            <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-secondary/80 border border-border/50 backdrop-blur-sm mb-6 sm:mb-8 animate-fade-in">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  AI-Powered Solutions Architect
                </span>
              </div>
              
              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                Architect. Plan.{" "}
                <span className="gradient-text">Build.</span>
              </h1>
              
              <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mb-6 sm:mb-10 px-2 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                Your AI-powered Solutions Architect for web apps, mobile apps, cloud infrastructure, and any software system.
              </p>
              
              {/* CTA Buttons - Dual Mode */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-16 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                {user ? (
                  <>
                    <Button onClick={handleStartChat} variant="hero" size="lg" className="gap-2 w-full sm:w-auto">
                      <MessageSquare className="w-5 h-5" />
                      Chat with AI Architect
                      <ArrowRight className="w-5 h-5 hidden sm:block" />
                    </Button>
                    <Button onClick={handleStartWizard} variant="outline" size="lg" className="gap-2 border-primary/50 text-primary hover:bg-primary/10 w-full sm:w-auto">
                      <ListChecks className="w-5 h-5" />
                      Guided Wizard
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => navigate('/auth')} variant="hero" size="lg" className="gap-2 w-full sm:w-auto">
                      <LogIn className="w-5 h-5" />
                      Get Started Free
                      <ArrowRight className="w-5 h-5 hidden sm:block" />
                    </Button>
                    <Button onClick={() => navigate('/auth')} variant="outline" size="lg" className="gap-2 border-primary/50 text-primary hover:bg-primary/10 w-full sm:w-auto">
                      Sign In
                    </Button>
                  </>
                )}
              </div>
              
              {/* Feature cards - Application types */}
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

              {/* More capabilities */}
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

              {/* Additional features */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full mt-4 sm:mt-6 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
                <SmallFeature icon={<BarChart3 className="w-4 h-4" />} text="Cost Optimization" />
                <SmallFeature icon={<Shield className="w-4 h-4" />} text="Security Best Practices" />
                <SmallFeature icon={<Globe className="w-4 h-4" />} text="Multi-Region Support" />
                <SmallFeature icon={<Zap className="w-4 h-4" />} text="Instant Generation" />
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Chat View */}
      {viewMode === 'chat' && (
        <main className="h-[calc(100vh-4rem)]">
          <ArchitectChat onArchitectureGenerated={handleChatArchitectureGenerated} />
        </main>
      )}

      {/* Wizard View */}
      {viewMode === 'wizard' && (
        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <RequirementsWizard onSubmit={handleGenerate} isLoading={isGenerating} />
        </main>
      )}

      {/* Results View */}
      {viewMode === 'results' && result && (
        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="space-y-8 animate-fade-in">
            <ArchitectureView 
              architectures={result.architectures}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
            />
            
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
              <CostComparison 
                architecture={result.architectures[selectedVariant]} 
              />
              <ArchitectureDiagram 
                diagram={result.mermaidDiagram}
                variant={result.architectures[selectedVariant].variant}
              />
            </div>

            {/* Tabbed optimization sections */}
            <Tabs defaultValue="optimizations" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                <TabsTrigger value="optimizations" className="text-xs sm:text-sm py-2">Optimizations</TabsTrigger>
                <TabsTrigger value="bill" className="text-xs sm:text-sm py-2">Bill Analyzer</TabsTrigger>
                <TabsTrigger value="resources" className="text-xs sm:text-sm py-2">Resources</TabsTrigger>
                <TabsTrigger value="observability" className="text-xs sm:text-sm py-2">Observability</TabsTrigger>
              </TabsList>
              
              <TabsContent value="optimizations" className="mt-4 sm:mt-6">
                <OneClickOptimizations />
              </TabsContent>
              
              <TabsContent value="bill" className="mt-4 sm:mt-6">
                <CloudBillAnalyzer />
              </TabsContent>
              
              <TabsContent value="resources" className="mt-4 sm:mt-6 space-y-4 sm:space-y-8">
                <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
                  <ResourceRightsizing />
                  <GPUOptimization />
                </div>
                <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
                  <CostBreakdown />
                  <SpotOptimization />
                </div>
              </TabsContent>
              
              <TabsContent value="observability" className="mt-4 sm:mt-6">
                <ObservabilityPanel />
              </TabsContent>
            </Tabs>

            <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
              <div className="lg:col-span-2">
                <GPUDashboard />
              </div>
              <TradeOffSliders />
            </div>

            <Recommendations recommendations={result.recommendations} />
          </div>
        </main>
      )}
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

const SmallFeature = forwardRef<HTMLDivElement, { icon: React.ReactNode; text: string }>(
  ({ icon, text }, ref) => (
    <div ref={ref} className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-secondary/30 border border-border/30">
      <div className="text-primary flex-shrink-0">{icon}</div>
      <span className="text-xs sm:text-sm text-muted-foreground truncate">{text}</span>
    </div>
  )
);
SmallFeature.displayName = 'SmallFeature';

export default Index;
