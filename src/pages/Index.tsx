import { useState } from 'react';
import { AppHeader } from '@/components/app/AppHeader';
import { RequirementsWizard } from '@/components/app/RequirementsWizard';
import { ArchitectureView } from '@/components/app/ArchitectureView';
import { CostComparison } from '@/components/app/CostComparison';
import { ArchitectureDiagram } from '@/components/app/ArchitectureDiagram';
import { GPUDashboard } from '@/components/app/GPUDashboard';
import { Recommendations } from '@/components/app/Recommendations';
import { Requirements, ArchitectureResult } from '@/types/architecture';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'wizard' | 'results';

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('wizard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [requirements, setRequirements] = useState<Requirements | null>(null);
  const [result, setResult] = useState<ArchitectureResult | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number>(1);
  const { toast } = useToast();

  const handleGenerate = async (reqs: Requirements) => {
    setRequirements(reqs);
    setIsGenerating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-architecture`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
    setViewMode('wizard');
    setResult(null);
    setRequirements(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onReset={handleReset} hasResults={viewMode === 'results'} />
      
      {isGenerating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-8 rounded-xl bg-card border border-border">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">Generating Architecture</h3>
              <p className="text-muted-foreground">AI is designing your cloud infrastructure...</p>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {viewMode === 'wizard' && (
          <RequirementsWizard onSubmit={handleGenerate} isLoading={isGenerating} />
        )}

        {viewMode === 'results' && result && (
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

            <GPUDashboard />

            <Recommendations recommendations={result.recommendations} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
