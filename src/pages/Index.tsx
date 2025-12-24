import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { Loader2, Sparkles, ArrowRight, Cloud, Cpu, DollarSign, Zap, BarChart3, Shield, Globe, Activity, Server, FileText, MessageSquare, ListChecks } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ViewMode = 'landing' | 'wizard' | 'chat' | 'results';

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [isGenerating, setIsGenerating] = useState(false);
  const [requirements, setRequirements] = useState<Requirements | null>(null);
  const [result, setResult] = useState<ArchitectureResult | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number>(1);
  const { toast } = useToast();

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
    setViewMode('wizard');
  };

  const handleStartChat = () => {
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
                The AI Solutions Architect that designs production-ready cloud architectures with real-time pricing intelligence across AWS, Azure, GCP, and OCI.
              </p>
              
              {/* CTA Buttons - Dual Mode */}
              <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <Button onClick={handleStartChat} variant="hero" size="xl" className="gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chat with AI Architect
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button onClick={handleStartWizard} variant="outline" size="xl" className="gap-2 border-primary/50 text-primary hover:bg-primary/10">
                  <ListChecks className="w-5 h-5" />
                  Guided Wizard
                </Button>
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
        <main className="container mx-auto px-4 py-8">
          <RequirementsWizard onSubmit={handleGenerate} isLoading={isGenerating} />
        </main>
      )}

      {/* Results View */}
      {viewMode === 'results' && result && (
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8 animate-fade-in">
            <ArchitectureView 
              architectures={result.architectures}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
            />
            
            <div className="grid lg:grid-cols-2 gap-8">
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="optimizations">One-Click Optimizations</TabsTrigger>
                <TabsTrigger value="bill">Bill Analyzer</TabsTrigger>
                <TabsTrigger value="resources">Resource Intelligence</TabsTrigger>
                <TabsTrigger value="observability">Observability</TabsTrigger>
              </TabsList>
              
              <TabsContent value="optimizations" className="mt-6">
                <OneClickOptimizations />
              </TabsContent>
              
              <TabsContent value="bill" className="mt-6">
                <CloudBillAnalyzer />
              </TabsContent>
              
              <TabsContent value="resources" className="mt-6 space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  <ResourceRightsizing />
                  <GPUOptimization />
                </div>
                <div className="grid lg:grid-cols-2 gap-8">
                  <CostBreakdown />
                  <SpotOptimization />
                </div>
              </TabsContent>
              
              <TabsContent value="observability" className="mt-6">
                <ObservabilityPanel />
              </TabsContent>
            </Tabs>

            <div className="grid lg:grid-cols-3 gap-8">
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
