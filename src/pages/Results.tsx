import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/app/AppHeader';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Results = () => {
    const [result, setResult] = useState<ArchitectureResult | null>(null);
    const [requirements, setRequirements] = useState<Requirements | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<number>(1);
    const navigate = useNavigate();

    useEffect(() => {
        // Load from sessionStorage
        const storedResult = sessionStorage.getItem('architecture_result');
        const storedRequirements = sessionStorage.getItem('architecture_requirements');

        if (storedResult && storedRequirements) {
            setResult(JSON.parse(storedResult));
            setRequirements(JSON.parse(storedRequirements));
        } else {
            // No data, redirect to design page
            navigate('/design');
        }
    }, [navigate]);

    const handleReset = () => {
        sessionStorage.removeItem('architecture_result');
        sessionStorage.removeItem('architecture_requirements');
        navigate('/');
    };

    const handleNewDesign = () => {
        sessionStorage.removeItem('architecture_result');
        sessionStorage.removeItem('architecture_requirements');
        navigate('/design');
    };

    if (!result || !requirements) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading results...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <AppHeader
                onReset={handleReset}
                hasResults={true}
                showExport={true}
                exportComponent={
                    <ExportButton
                        result={result}
                        requirements={requirements}
                        selectedVariant={selectedVariant}
                    />
                }
            />

            <main className="container mx-auto px-4 py-8">
                <div className="space-y-8 animate-fade-in">
                    {/* Back button and header */}
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" onClick={handleNewDesign} className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            New Design
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            {requirements.appType} • {requirements.expectedUsers.toLocaleString()} users • ${requirements.budgetMin}-${requirements.budgetMax}/mo
                        </div>
                    </div>

                    {/* Architecture variants */}
                    <ArchitectureView
                        architectures={result.architectures}
                        selectedVariant={selectedVariant}
                        onVariantChange={setSelectedVariant}
                    />

                    {/* Cost comparison and diagram */}
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

                    {/* GPU Dashboard and Trade-offs */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <GPUDashboard />
                        </div>
                        <TradeOffSliders />
                    </div>

                    {/* Recommendations */}
                    <Recommendations recommendations={result.recommendations} />
                </div>
            </main>
        </div>
    );
};

export default Results;
