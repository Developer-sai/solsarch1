import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Bot, Sparkles, ArrowDown, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ArchitectureResult } from '@/types/architecture';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

I can help you design **any type of software system** from concept to production-ready architecture. Here's what I can do:

### 🌐 Applications
- **Web Apps** — React, Next.js, Vue, Angular, full-stack
- **Mobile Apps** — Native, React Native, Flutter, PWA
- **APIs** — REST, GraphQL, WebSocket, gRPC

### ☁️ Infrastructure
- **Cloud Architecture** — AWS, Azure, GCP, OCI with cost comparisons
- **Microservices** — Container orchestration, service mesh
- **Serverless** — Functions, event-driven systems

### 🗄️ Data & AI
- **Database Design** — SQL, NoSQL, caching, search
- **AI/ML Systems** — LLM integration, RAG, model serving
- **Data Pipelines** — ETL, streaming, analytics

### 🔒 Security & DevOps
- **Authentication** — OAuth, SSO, RBAC
- **CI/CD** — Pipelines, IaC, deployment strategies

**How to get started:**
Tell me about your idea, project, or problem. Be as detailed or as vague as you like — I'll ask clarifying questions.

You can also **upload files** (requirements docs, mockups, existing code) or use **voice input**.

What would you like to build?`;

export const ArchitectChat = ({ onArchitectureGenerated }: ArchitectChatProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string>('New Conversation');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: WELCOME_MESSAGE,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load existing conversation if ID is provided
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    if (conversationParam && user) {
      loadConversation(conversationParam);
    }
  }, [searchParams, user]);

  const loadConversation = async (id: string) => {
    setIsLoadingConversation(true);
    try {
      // Load conversation details
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (convError) throw convError;

      // Load messages
      const { data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;

      setConversationId(id);
      setConversationTitle(conversation.title);
      
      // Convert to our message format
      const loadedMessages: Message[] = messagesData.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.created_at)
      }));

      // Add welcome message at the beginning if not already there
      if (loadedMessages.length > 0 && loadedMessages[0].role !== 'assistant') {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: WELCOME_MESSAGE,
            timestamp: new Date()
          },
          ...loadedMessages
        ]);
      } else if (loadedMessages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: WELCOME_MESSAGE,
            timestamp: new Date()
          }
        ]);
      } else {
        setMessages(loadedMessages);
      }

      toast({
        title: "Conversation loaded",
        description: `Continuing "${conversation.title}"`,
      });
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive"
      });
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const saveConversation = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save conversations",
        variant: "destructive"
      });
      return;
    }

    // Filter out welcome message for saving
    const messagesToSave = messages.filter(m => m.id !== 'welcome');
    
    if (messagesToSave.length < 2) {
      toast({
        title: "Nothing to save",
        description: "Have a conversation first before saving",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // Generate title from first user message
      const firstUserMessage = messagesToSave.find(m => m.role === 'user');
      const title = firstUserMessage 
        ? firstUserMessage.content.slice(0, 100) + (firstUserMessage.content.length > 100 ? '...' : '')
        : 'New Conversation';

      if (conversationId) {
        // Update existing conversation
        await supabase
          .from('conversations')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', conversationId);

        // Delete old messages and insert new ones
        await supabase
          .from('messages')
          .delete()
          .eq('conversation_id', conversationId);

        const { error: msgError } = await supabase
          .from('messages')
          .insert(
            messagesToSave.map(m => ({
              conversation_id: conversationId,
              role: m.role,
              content: m.content,
              created_at: m.timestamp.toISOString()
            }))
          );

        if (msgError) throw msgError;

        toast({
          title: "Conversation updated",
          description: "Your changes have been saved",
        });
      } else {
        // Create new conversation
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            title
          })
          .select()
          .single();

        if (convError) throw convError;

        // Insert messages
        const { error: msgError } = await supabase
          .from('messages')
          .insert(
            messagesToSave.map(m => ({
              conversation_id: newConv.id,
              role: m.role,
              content: m.content,
              created_at: m.timestamp.toISOString()
            }))
          );

        if (msgError) throw msgError;

        setConversationId(newConv.id);
        setConversationTitle(title);

        toast({
          title: "Conversation saved",
          description: "You can continue this conversation later from Chat History",
        });
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      toast({
        title: "Error",
        description: "Failed to save conversation",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

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
  const canSave = user && messages.filter(m => m.id !== 'welcome').length >= 2;

  if (isLoadingConversation) {
    return (
      <div className="flex flex-col h-full bg-background items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-info/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">
              {conversationId ? conversationTitle : 'SolsArch AI'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {conversationId ? 'Saved conversation' : 'Solutions Architect Assistant'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canSave && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={saveConversation}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {conversationId ? 'Update' : 'Save'}
              </Button>
            )}
            {hasEnoughContext && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                <Sparkles className="w-4 h-4" />
                Generate
              </Button>
            )}
          </div>
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
