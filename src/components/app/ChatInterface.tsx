import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { Requirements, ArchitectureResult } from '@/types/architecture';
import { Send, Upload, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    architectureResult?: ArchitectureResult;
    timestamp: Date;
}

interface ChatInterfaceProps {
    onArchitectureGenerated: (result: ArchitectureResult, requirements: Requirements) => void;
}

export const ChatInterface = ({ onArchitectureGenerated }: ChatInterfaceProps) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "👋 Hi! I'm SolsArch AI, your professional Solutions Architect. Tell me about your project requirements, and I'll design production-ready cloud architectures for you.\n\nYou can:\n• Paste your requirements as text\n• Upload a requirements document\n• Describe your application needs conversationally\n\nWhat are you building today?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const parseRequirementsFromText = (text: string): Requirements => {
        // Simple parsing logic - can be enhanced with AI
        const lowerText = text.toLowerCase();

        // Detect app type
        let appType = 'saas';
        if (lowerText.includes('ai') || lowerText.includes('ml') || lowerText.includes('machine learning')) {
            appType = 'ai-inference';
        } else if (lowerText.includes('ecommerce') || lowerText.includes('e-commerce') || lowerText.includes('shop')) {
            appType = 'e-commerce';
        } else if (lowerText.includes('data') || lowerText.includes('pipeline') || lowerText.includes('etl')) {
            appType = 'data-pipeline';
        } else if (lowerText.includes('game') || lowerText.includes('gaming')) {
            appType = 'gaming';
        } else if (lowerText.includes('iot') || lowerText.includes('device')) {
            appType = 'iot';
        }

        // Extract numbers
        const userMatch = text.match(/(\d+(?:,\d+)*)\s*(?:users|monthly users|mau)/i);
        const rpsMatch = text.match(/(\d+(?:,\d+)*)\s*(?:rps|requests per second|req\/s)/i);
        const dataMatch = text.match(/(\d+(?:,\d+)*)\s*(?:gb|gigabytes?|data)/i);
        const latencyMatch = text.match(/(\d+(?:,\d+)*)\s*(?:ms|milliseconds?|latency)/i);
        const budgetMatch = text.match(/\$?(\d+(?:,\d+)*)\s*(?:-|to)\s*\$?(\d+(?:,\d+)*)/i);

        // Detect regions
        const regions: string[] = [];
        if (lowerText.includes('us') || lowerText.includes('america')) {
            regions.push('us-east');
        }
        if (lowerText.includes('eu') || lowerText.includes('europe')) {
            regions.push('eu-west');
        }
        if (lowerText.includes('asia') || lowerText.includes('apac') || lowerText.includes('india')) {
            regions.push('ap-south');
        }
        if (regions.length === 0) regions.push('us-east'); // Default

        // Detect compliance
        const compliance: string[] = [];
        if (lowerText.includes('gdpr')) compliance.push('gdpr');
        if (lowerText.includes('hipaa')) compliance.push('hipaa');
        if (lowerText.includes('soc2') || lowerText.includes('soc 2')) compliance.push('soc2');
        if (lowerText.includes('pci')) compliance.push('pci-dss');

        return {
            appType,
            expectedUsers: userMatch ? parseInt(userMatch[1].replace(/,/g, '')) : 10000,
            requestsPerSecond: rpsMatch ? parseInt(rpsMatch[1].replace(/,/g, '')) : 100,
            dataSizeGB: dataMatch ? parseInt(dataMatch[1].replace(/,/g, '')) : 100,
            latencyTargetMs: latencyMatch ? parseInt(latencyMatch[1].replace(/,/g, '')) : 200,
            availabilitySLA: 99.9,
            regions,
            compliance,
            budgetMin: budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, '')) : 500,
            budgetMax: budgetMatch ? parseInt(budgetMatch[2].replace(/,/g, '')) : 5000,
            additionalNotes: text,
        };
    };

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsGenerating(true);

        try {
            // Parse requirements from user input
            const requirements = parseRequirementsFromText(input);

            // Add thinking message
            const thinkingMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '🤔 Analyzing your requirements and designing architectures...',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, thinkingMessage]);

            // Call backend
            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-architecture`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ requirements }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate architecture');
            }

            const result: ArchitectureResult = await response.json();

            // Remove thinking message and add result
            setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));

            const resultMessage: Message = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: `✨ I've designed 3 architecture variants for your ${requirements.appType} application! Here's what I created:`,
                architectureResult: result,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, resultMessage]);
            onArchitectureGenerated(result, requirements);

            toast({
                title: "Architecture Generated!",
                description: "3 variants created with cost comparisons.",
            });
        } catch (error) {
            console.error('Generation error:', error);

            setMessages(prev => prev.filter(m => m.content.includes('Analyzing')));

            const errorMessage: Message = {
                id: (Date.now() + 3).toString(),
                role: 'assistant',
                content: `❌ Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or rephrase your requirements.`,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, errorMessage]);

            toast({
                title: "Generation Failed",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            setInput(text);

            toast({
                title: "File Loaded",
                description: `${file.name} has been loaded. Click Send to generate architecture.`,
            });
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto">
            <Card className="flex-1 flex flex-col border-border bg-card/50 backdrop-blur-sm">
                <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <ChatMessage key={message.id} message={message} />
                        ))}
                        {isGenerating && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Generating architecture...</span>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-border bg-card/80">
                    <div className="flex gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.md,.pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isGenerating}
                            className="shrink-0"
                        >
                            <Upload className="w-4 h-4" />
                        </Button>

                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Describe your requirements... (e.g., 'I need a SaaS app for 50k users with 500 RPS, budget $2000-5000')"
                            className="resize-none bg-secondary border-border"
                            rows={3}
                            disabled={isGenerating}
                        />

                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isGenerating}
                            size="icon"
                            className="shrink-0 bg-gradient-to-r from-primary to-info"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </div>
            </Card>
        </div>
    );
};
