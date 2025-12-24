import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppHeader } from '@/components/app/AppHeader';
import { RequirementsWizard } from '@/components/app/RequirementsWizard';
import { ChatInterface } from '@/components/app/ChatInterface';
import { Requirements, ArchitectureResult } from '@/types/architecture';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type InputMode = 'wizard' | 'chat';

const Design = () => {
    const [searchParams] = useSearchParams();
    const initialMode = (searchParams.get('mode') as InputMode) || 'wizard';

    const [inputMode, setInputMode] = useState<InputMode>(initialMode);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleGenerate = async (reqs: Requirements) => {
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

            // Store in sessionStorage for results page
            sessionStorage.setItem('architecture_result', JSON.stringify(data));
            sessionStorage.setItem('architecture_requirements', JSON.stringify(reqs));

            toast({
                title: "Architecture Generated!",
                description: "3 architecture variants created with cost comparisons.",
            });

            // Navigate to results page
            navigate('/results');
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

    const handleChatArchitectureGenerated = (architectureResult: ArchitectureResult, reqs: Requirements) => {
        // Store in sessionStorage for results page
        sessionStorage.setItem('architecture_result', JSON.stringify(architectureResult));
        sessionStorage.setItem('architecture_requirements', JSON.stringify(reqs));

        // Navigate to results page
        navigate('/results');
    };

    const handleReset = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background">
            <AppHeader onReset={handleReset} hasResults={false} showExport={false} />

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

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold mb-3 gradient-text">Design Your Architecture</h1>
                        <p className="text-lg text-muted-foreground">
                            Choose your preferred method to define requirements
                        </p>
                    </div>

                    <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as InputMode)} className="w-full">
                        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                            <TabsTrigger value="wizard" className="gap-2">
                                <Sparkles className="w-4 h-4" />
                                Guided Wizard
                            </TabsTrigger>
                            <TabsTrigger value="chat" className="gap-2">
                                <Sparkles className="w-4 h-4" />
                                Chat with AI
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="wizard" className="mt-0">
                            <RequirementsWizard onSubmit={handleGenerate} isLoading={isGenerating} />
                        </TabsContent>

                        <TabsContent value="chat" className="mt-0">
                            <ChatInterface onArchitectureGenerated={handleChatArchitectureGenerated} />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
};

export default Design;
