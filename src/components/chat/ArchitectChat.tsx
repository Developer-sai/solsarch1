import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Bot, Sparkles, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ArchitectureResult } from '@/types/architecture';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ArchitectChatProps {
  onArchitectureGenerated: (result: ArchitectureResult) => void;
}

const WELCOME_MESSAGE = `Welcome to **SolsArch** — your AI Solutions Architect.

I can help you design production-ready cloud architectures for any scale. Here's what I can do:

• **Analyze** your requirements and constraints
• **Design** multi-cloud architectures (AWS, Azure, GCP, OCI)
• **Optimize** for cost, performance, or reliability
• **Generate** professional diagrams and documentation

**How to get started:**
1. Describe your application or system requirements
2. Tell me about your scale, budget, and constraints
3. Ask questions or request specific architecture patterns

You can also **upload files** (requirements docs, existing architecture, cloud bills) or use **voice input**.

What would you like to architect today?`;

export const ArchitectChat = ({ onArchitectureGenerated }: ArchitectChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: WELCOME_MESSAGE,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const sendMessage = async (content: string, files?: File[]) => {
    // Handle file content extraction
    let fullContent = content;
    
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const text = await file.text();
          fullContent += `\n\n--- Attached File: ${file.name} ---\n${text}\n--- End of ${file.name} ---`;
        } catch (err) {
          console.error('Failed to read file:', err);
          toast({
            title: "File Error",
            description: `Could not read ${file.name}`,
            variant: "destructive"
          });
        }
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: fullContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use the AI architect.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/architect-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content
            })),
            mode: 'chat'
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to generate architectures.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/architect-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: messages.map(m => ({
              role: m.role,
              content: m.content
            })),
            mode: 'generate'
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate architecture');
      }

      const data = await response.json();
      
      if (data.type === 'architecture' && data.data) {
        toast({
          title: "Architecture Generated!",
          description: "Your cloud architecture is ready to view.",
        });
        onArchitectureGenerated(data.data);
      } else {
        // Add as regular message if not architecture
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content || "I couldn't generate a complete architecture. Please provide more details about your requirements.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasEnoughContext = messages.length >= 3; // Welcome + at least one exchange

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-info/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">SolsArch AI</h2>
            <p className="text-xs text-muted-foreground">Solutions Architect Assistant</p>
          </div>
          {hasEnoughContext && (
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto gap-2 border-primary/50 text-primary hover:bg-primary/10"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              <Sparkles className="w-4 h-4" />
              Generate Architecture
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
          />
        ))}
        
        {isLoading && (
          <div className="flex gap-4 p-6 bg-secondary/20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-info/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-foreground">SolsArch</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "absolute bottom-24 right-8 rounded-full shadow-lg",
            "bg-secondary/90 backdrop-blur-sm border border-border"
          )}
          onClick={scrollToBottom}
        >
          <ArrowDown className="w-4 h-4" />
        </Button>
      )}

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        onGenerate={handleGenerate}
        isLoading={isLoading}
        canGenerate={hasEnoughContext}
        placeholder="Describe your architecture needs... (e.g., 'I need a scalable e-commerce platform for 1M users')"
      />
    </div>
  );
};
