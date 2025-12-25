import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot, Sparkles, ArrowDown, Save, Loader2, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessageBubble } from '@/components/chat/ChatMessageBubble';
import { ChatInputArea } from '@/components/chat/ChatInputArea';
import { ArtifactPanel } from '@/components/chat/ArtifactPanel';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  artifact?: ArtifactData | null;
}

export interface ArtifactData {
  type: 'architecture' | 'plan' | 'diagram';
  title: string;
  content: string;
  sections?: {
    title: string;
    content: string;
  }[];
}

const WELCOME_MESSAGE = `# Welcome to SolsArch

I'm your AI Solutions Architect. I can help you design **any type of software system** from concept to production-ready architecture.

## What I can help with:

### 🌐 Applications
- Web Apps, Mobile Apps, APIs, PWAs

### ☁️ Infrastructure  
- Cloud Architecture (AWS, Azure, GCP, OCI)
- Microservices, Serverless, Containers

### 🗄️ Data & AI
- Database Design, AI/ML Systems, Data Pipelines

### 🔒 Security & DevOps
- Authentication, CI/CD, IaC

---

**Tell me about your project** — be as detailed or vague as you like. I'll ask clarifying questions and generate a comprehensive architecture plan.`;

export default function AppChat() {
  const { conversationId: urlConversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [conversationId, setConversationId] = useState<string | null>(urlConversationId || null);
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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [currentArtifact, setCurrentArtifact] = useState<ArtifactData | null>(null);
  const [showArtifactPanel, setShowArtifactPanel] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load conversation if ID provided
  useEffect(() => {
    if (urlConversationId && user) {
      loadConversation(urlConversationId);
    } else if (!urlConversationId) {
      // Reset to new conversation
      setConversationId(null);
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: WELCOME_MESSAGE,
        timestamp: new Date()
      }]);
      setCurrentArtifact(null);
    }
  }, [urlConversationId, user]);

  const loadConversation = async (id: string) => {
    try {
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (convError) throw convError;

      const { data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;

      setConversationId(id);
      
      const loadedMessages: Message[] = messagesData.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.created_at)
      }));

      if (loadedMessages.length > 0) {
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
      navigate('/app/chat');
    }
  };

  const saveConversation = async (customTitle?: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save conversations",
        variant: "destructive"
      });
      return;
    }

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
      const firstUserMessage = messagesToSave.find(m => m.role === 'user');
      // Generate a better title from user's first message
      let title = customTitle;
      if (!title && firstUserMessage) {
        // Extract first meaningful sentence/phrase
        const content = firstUserMessage.content.trim();
        const firstLine = content.split('\n')[0];
        title = firstLine.slice(0, 80) + (firstLine.length > 80 ? '...' : '');
      }
      title = title || 'Architecture Discussion';

      if (conversationId) {
        await supabase
          .from('conversations')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', conversationId);

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
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            title
          })
          .select()
          .single();

        if (convError) throw convError;

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
        navigate(`/app/chat/${newConv.id}`, { replace: true });

        toast({
          title: "Conversation saved",
          description: "You can continue this conversation later",
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
    let fullContent = content;
    
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const text = await file.text();
          fullContent += `\n\n--- Attached File: ${file.name} ---\n${text}\n--- End of ${file.name} ---`;
        } catch (err) {
          console.error('Failed to read file:', err);
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

    // Create placeholder assistant message for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use the AI architect.",
          variant: "destructive"
        });
        setIsLoading(false);
        // Remove the empty assistant message
        setMessages(prev => prev.filter(m => m.id !== assistantMessageId));
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
            messages: [...messages.filter(m => m.id !== 'welcome'), userMessage].map(m => ({
              role: m.role,
              content: m.content
            })),
            mode: 'chat',
            stream: true
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent2 = '';
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        // Process line-by-line for SSE
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (deltaContent) {
              fullContent2 += deltaContent;
              // Update the assistant message with new content
              setMessages(prev => prev.map(m => 
                m.id === assistantMessageId 
                  ? { ...m, content: fullContent2 }
                  : m
              ));
            }
          } catch {
            // Incomplete JSON, put it back and wait for more
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush of remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (deltaContent) {
              fullContent2 += deltaContent;
              setMessages(prev => prev.map(m => 
                m.id === assistantMessageId 
                  ? { ...m, content: fullContent2 }
                  : m
              ));
            }
          } catch { /* ignore */ }
        }
      }

      // Parse for artifacts after streaming is complete
      const artifact = parseArtifact(fullContent2);
      if (artifact) {
        setMessages(prev => prev.map(m => 
          m.id === assistantMessageId 
            ? { ...m, artifact }
            : m
        ));
        setCurrentArtifact(artifact);
        setShowArtifactPanel(true);
      }

    } catch (error) {
      console.error('Chat error:', error);
      // Remove the empty assistant message on error
      setMessages(prev => prev.filter(m => m.id !== assistantMessageId));
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
            messages: messages.filter(m => m.id !== 'welcome').map(m => ({
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
        const artifact: ArtifactData = {
          type: 'architecture',
          title: 'Architecture Plan',
          content: JSON.stringify(data.data, null, 2),
          sections: [
            { title: 'Overview', content: data.data.architectures?.[0]?.description || '' },
            { title: 'Components', content: formatComponents(data.data.architectures?.[0]?.components) },
            { title: 'Recommendations', content: formatRecommendations(data.data.recommendations) },
          ]
        };
        
        setCurrentArtifact(artifact);
        setShowArtifactPanel(true);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I've generated your architecture plan. You can view it in the panel on the right.",
          timestamp: new Date(),
          artifact
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        toast({
          title: "Architecture Generated!",
          description: "Your cloud architecture is ready to view.",
        });
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content || "I couldn't generate a complete architecture. Please provide more details.",
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

  const hasEnoughContext = messages.filter(m => m.id !== 'welcome').length >= 2;
  const canSave = user && messages.filter(m => m.id !== 'welcome').length >= 2;

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        showArtifactPanel && "lg:mr-[400px]"
      )}>
        {/* Chat Header */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-info/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">SolsArch AI</h2>
                <p className="text-xs text-muted-foreground">Solutions Architect</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canSave && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 h-8 text-xs"
                  onClick={() => saveConversation()}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Save className="w-3 h-3" />
                  )}
                  {conversationId ? 'Update' : 'Save'}
                </Button>
              )}
              {hasEnoughContext && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 h-8 text-xs border-primary/50 text-primary hover:bg-primary/10"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  <Sparkles className="w-3 h-3" />
                  Generate
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowArtifactPanel(!showArtifactPanel)}
              >
                {showArtifactPanel ? (
                  <PanelRightClose className="w-4 h-4" />
                ) : (
                  <PanelRightOpen className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessageBubble 
                key={message.id} 
                message={message}
                onViewArtifact={message.artifact ? () => {
                  setCurrentArtifact(message.artifact!);
                  setShowArtifactPanel(true);
                } : undefined}
              />
            ))}
            {isLoading && (
              <div className="flex gap-4 p-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-info/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Scroll button */}
        {showScrollButton && (
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-24 right-6 rounded-full shadow-lg"
            onClick={scrollToBottom}
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
        )}

        {/* Input */}
        <ChatInputArea 
          onSend={sendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Artifact Panel */}
      {showArtifactPanel && (
        <ArtifactPanel 
          artifact={currentArtifact}
          onClose={() => setShowArtifactPanel(false)}
        />
      )}
    </div>
  );
}

function parseArtifact(content: string): ArtifactData | null {
  // Check for mermaid diagrams
  const mermaidMatch = content.match(/```mermaid\n([\s\S]*?)```/);
  if (mermaidMatch) {
    return {
      type: 'diagram',
      title: 'Architecture Diagram',
      content: mermaidMatch[1].trim()
    };
  }
  
  // Check for structured plan sections
  const hasPlanSections = content.includes('## Overview') || 
                          content.includes('## Architecture') ||
                          content.includes('## Components') ||
                          content.includes('## Implementation');
  
  if (hasPlanSections) {
    return {
      type: 'plan',
      title: 'Architecture Plan',
      content: content
    };
  }
  
  return null;
}

function formatComponents(components: any[]): string {
  if (!components) return 'No components defined';
  return components.map(c => `- **${c.name}** (${c.serviceType})`).join('\n');
}

function formatRecommendations(recommendations: any[]): string {
  if (!recommendations) return 'No recommendations';
  return recommendations.map(r => `- **${r.title}**: ${r.description}`).join('\n');
}
