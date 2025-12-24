import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArchitectureResult } from '@/types/architecture';
import { User, Bot, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    architectureResult?: ArchitectureResult;
    timestamp: Date;
}

interface ChatMessageProps {
    message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
    const [selectedVariant, setSelectedVariant] = useState(0);
    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                </div>
            )}

            <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                <Card className={`p-4 ${isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border-border'
                    }`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                </Card>

                {message.architectureResult && (
                    <div className="w-full space-y-4 mt-2">
                        {/* Variant Selector */}
                        <div className="flex gap-2 flex-wrap">
                            {message.architectureResult.architectures.map((arch, idx) => (
                                <Button
                                    key={idx}
                                    variant={selectedVariant === idx ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedVariant(idx)}
                                    className="text-xs"
                                >
                                    {arch.name}
                                </Button>
                            ))}
                        </div>

                        {/* Selected Architecture Details */}
                        <Card className="p-4 bg-secondary/50 border-border">
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">
                                        {message.architectureResult.architectures[selectedVariant].name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {message.architectureResult.architectures[selectedVariant].description}
                                    </p>
                                </div>

                                {/* Cost Summary */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {Object.entries(message.architectureResult.architectures[selectedVariant].totalCosts).map(([provider, cost]) => (
                                        <div key={provider} className="bg-card p-2 rounded border border-border">
                                            <div className="text-xs text-muted-foreground uppercase">{provider}</div>
                                            <div className="text-sm font-semibold">${cost.toLocaleString()}/mo</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Key Components */}
                                <div>
                                    <div className="text-xs font-medium mb-2">Key Components:</div>
                                    <div className="flex flex-wrap gap-1">
                                        {message.architectureResult.architectures[selectedVariant].components.slice(0, 6).map((comp, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                {comp.name}
                                            </Badge>
                                        ))}
                                        {message.architectureResult.architectures[selectedVariant].components.length > 6 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{message.architectureResult.architectures[selectedVariant].components.length - 6} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Trade-offs */}
                                {message.architectureResult.architectures[selectedVariant].tradeOffs && (
                                    <div>
                                        <div className="text-xs font-medium mb-1">Trade-offs:</div>
                                        <ul className="text-xs text-muted-foreground space-y-1">
                                            {message.architectureResult.architectures[selectedVariant].tradeOffs.slice(0, 2).map((tradeoff, idx) => (
                                                <li key={idx} className="flex items-start gap-1">
                                                    <span className="text-primary mt-0.5">•</span>
                                                    <span>{tradeoff}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs gap-2"
                                    onClick={() => {
                                        // Scroll to results section
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    View Full Architecture Details
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            {isUser && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-foreground" />
                </div>
            )}
        </div>
    );
};
