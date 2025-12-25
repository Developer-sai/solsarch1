import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Requirements, ArchitectureResult } from '@/types/architecture';
import { Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

export default function AppWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [requirements, setRequirements] = useState<Requirements | null>(null);
  const [result, setResult] = useState<ArchitectureResult | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number>(0);

  const handleGenerate = async (reqs: Requirements) => {
    setRequirements(reqs);
    setIsGenerating(true);

    try {
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
    setResult(null);
    setRequirements(null);
  };

  return (
    <div className="h-full overflow-auto">
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

      {!result ? (
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <RequirementsWizard onSubmit={handleGenerate} isLoading={isGenerating} />
        </div>
      ) : (
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Architecture Results</h1>
            <div className="flex items-center gap-2">
              {requirements && (
                <ExportButton 
                  result={result} 
                  requirements={requirements} 
                  selectedVariant={selectedVariant} 
                />
              )}
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                New Design
              </Button>
            </div>
          </div>

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
        </div>
      )}
    </div>
  );
}
