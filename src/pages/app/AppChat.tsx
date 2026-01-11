import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Bot, ArrowDown, Save, Loader2, PanelRightOpen, PanelRightClose, 
  Plus, Sparkles, FolderTree, Zap, BarChart3, Shield, FileCode2,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { EnhancedChatInput } from '@/components/chat/EnhancedChatInput';
import { ArtifactPanel } from '@/components/chat/ArtifactPanel';
import { CodebasePanel } from '@/components/chat/CodebasePanel';
import { AgentStatusPanel } from '@/components/app/AgentStatusPanel';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCodebaseContext } from '@/hooks/useCodebaseContext';
import { useAgentWorkflow } from '@/hooks/useAgentWorkflow';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ArtifactData {
  type: 'architecture' | 'diagram' | 'plan' | 'code' | 'cost' | 'security';
  title: string;
  content: string;
}

const WELCOME_MESSAGE = `Hey! I'm **SolsArch 2.0**, your AI-native Solutions Architecture platform.

I'm powered by **autonomous AI agents** that work together to design, analyze, and deploy your systems:

🎯 **Master Orchestrator** — Coordinates all agents and workflows
🏗️ **Design Agent** — Creates architecture diagrams and patterns  
💰 **Cost Agent** — Real-time multi-cloud pricing (AWS, Azure, GCP, OCI)
🔐 **Security Agent** — Compliance validation and threat modeling
📜 **IaC Agent** — Generates Terraform, CloudFormation, Pulumi code

**Quick Actions:**
- Click ⚡ **Agent Mode** to run specialized workflows
- Click 📁 **Codebase** to analyze GitHub repos or uploaded files

**Just describe what you want to build** — I'll activate the right agents and deliver comprehensive architecture with costs, security analysis, and deployable infrastructure code.`;

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
  const [showCodebasePanel, setShowCodebasePanel] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Codebase context
  const {
    context: codebaseContext,
    fetchGitHubRepo,
    addFilesFromUpload,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    clearContext,
    getSelectedFilesContent,
  } = useCodebaseContext();

  // Agent workflow
  const { workflow, isRunning, currentAgent, startWorkflow, cancelWorkflow } = useAgentWorkflow();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load conversation if ID provided
  useEffect(() => {
    if (urlConversationId && user) {
      loadConversation(urlConversationId);
    } else if (!urlConversationId) {
      setConversationId(null);
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: WELCOME_MESSAGE,
        timestamp: new Date()
      }]);
      setCurrentArtifact(null);
      setShowArtifactPanel(false);
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
      let title = customTitle;
      if (!title && firstUserMessage) {
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

  const extractArtifact = (content: string): ArtifactData | null => {
    // Check for mermaid diagrams
    const mermaidMatch = content.match(/```mermaid\n([\s\S]*?)```/);
    if (mermaidMatch) {
      return {
        type: 'diagram',
        title: 'Architecture Diagram',
        content: mermaidMatch[1].trim()
      };
    }

    // Check for cost analysis
    if (content.includes('Cost Analysis') || (content.includes('AWS') && content.includes('Azure') && content.includes('/mo'))) {
      return {
        type: 'cost',
        title: 'Multi-Cloud Cost Analysis',
        content: content
      };
    }

    // Check for security analysis
    if (content.includes('Security') && (content.includes('SOC2') || content.includes('HIPAA') || content.includes('Compliance'))) {
      return {
        type: 'security',
        title: 'Security & Compliance Analysis',
        content: content
      };
    }

    // Check for implementation plans
    if (content.includes('## Implementation Plan') || content.includes('### Phase 1')) {
      return {
        type: 'plan',
        title: 'Implementation Plan',
        content: content
      };
    }

    // Check for Terraform/IaC code
    if (content.includes('```hcl') || content.includes('```terraform') || content.includes('resource "')) {
      const codeMatch = content.match(/```(?:hcl|terraform)\n([\s\S]*?)```/);
      return {
        type: 'code',
        title: 'Infrastructure Code',
        content: codeMatch ? codeMatch[1].trim() : content
      };
    }

    // Check for code blocks with substantial content
    const codeMatch = content.match(/```(\w+)\n([\s\S]{200,}?)```/);
    if (codeMatch) {
      return {
        type: 'code',
        title: `Code: ${codeMatch[1]}`,
        content: codeMatch[2].trim()
      };
    }

    return null;
  };

  const runAgentWorkflow = async (agentMode: 'architecture' | 'cost' | 'security' | 'iac') => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) {
      toast({
        title: "No context",
        description: "Please describe what you want to build first",
        variant: "destructive"
      });
      return;
    }

    setShowAgentPanel(true);
    startWorkflow(agentMode, lastUserMessage.content);

    // Also send to AI with agent mode
    await sendMessage(`[AGENT: ${agentMode.toUpperCase()}] ${lastUserMessage.content}`, undefined, agentMode);
  };

  const sendMessage = async (content: string, files?: File[], agentMode?: 'architecture' | 'cost' | 'security' | 'iac') => {
    let fullContent = content;
    
    // Add uploaded files as context
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

    // Add selected codebase files as context
    if (codebaseContext.selectedFiles.length > 0) {
      const codeContent = await getSelectedFilesContent();
      if (codeContent) {
        fullContent = `[CODEBASE CONTEXT]\n${codeContent}\n\n[USER MESSAGE]\n${fullContent}`;
      }
    }

    // Add repo info as context if available
    if (codebaseContext.repo && codebaseContext.selectedFiles.length > 0) {
      const repoInfo = `\n\n[REPOSITORY INFO]\nName: ${codebaseContext.repo.name}\nOwner: ${codebaseContext.repo.owner}\nSource: ${codebaseContext.repo.source}\nFiles in context: ${codebaseContext.selectedFiles.length}`;
      fullContent = repoInfo + '\n' + fullContent;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: fullContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

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
            stream: true,
            agentMode
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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

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
              fullResponse += deltaContent;
              setMessages(prev => prev.map(m => 
                m.id === assistantMessageId 
                  ? { ...m, content: fullResponse }
                  : m
              ));
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
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
              fullResponse += deltaContent;
              setMessages(prev => prev.map(m => 
                m.id === assistantMessageId 
                  ? { ...m, content: fullResponse }
                  : m
              ));
            }
          } catch { /* ignore */ }
        }
      }

      // Extract artifact if present
      const artifact = extractArtifact(fullResponse);
      if (artifact) {
        setCurrentArtifact(artifact);
        setShowArtifactPanel(true);
      }

    } catch (error) {
      console.error('Chat error:', error);
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

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: WELCOME_MESSAGE,
      timestamp: new Date()
    }]);
    setCurrentArtifact(null);
    setShowArtifactPanel(false);
    setShowAgentPanel(false);
    clearContext();
    navigate('/app/chat');
  };

  const hasMessages = messages.length > 1 || (messages.length === 1 && messages[0].id !== 'welcome');
  const hasCodebaseContext = codebaseContext.repo !== null || codebaseContext.files.length > 0;

  return (
    <div className="h-full flex">
      {/* Codebase Panel (Left) */}
      {showCodebasePanel && (
        <div className="hidden md:block w-[320px] border-r border-border bg-card flex-shrink-0">
          <CodebasePanel
            repo={codebaseContext.repo}
            files={codebaseContext.files}
            selectedFiles={codebaseContext.selectedFiles}
            isLoading={codebaseContext.isLoading}
            error={codebaseContext.error}
            onFetchRepo={fetchGitHubRepo}
            onUploadFiles={addFilesFromUpload}
            onToggleFile={toggleFileSelection}
            onSelectAll={selectAllFiles}
            onClearSelection={clearSelection}
            onClear={clearContext}
            onClose={() => setShowCodebasePanel(false)}
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        showArtifactPanel && "lg:mr-[500px]"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleNewChat}
                  className="h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Chat</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowCodebasePanel(!showCodebasePanel)}
                  className={cn("h-8 w-8 hidden md:flex", showCodebasePanel && "bg-primary/10 text-primary")}
                >
                  <FolderTree className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showCodebasePanel ? 'Hide codebase' : 'Analyze codebase'}
              </TooltipContent>
            </Tooltip>
            
            {/* Agent Mode Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "gap-2 h-8",
                    isRunning && "bg-primary/10 text-primary"
                  )}
                >
                  <Zap className={cn("h-4 w-4", isRunning && "animate-pulse")} />
                  <span className="hidden sm:inline">Agent Mode</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => runAgentWorkflow('architecture')}>
                  <Sparkles className="h-4 w-4 mr-2 text-purple-400" />
                  Full Architecture
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => runAgentWorkflow('cost')}>
                  <BarChart3 className="h-4 w-4 mr-2 text-green-400" />
                  Cost Analysis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => runAgentWorkflow('security')}>
                  <Shield className="h-4 w-4 mr-2 text-red-400" />
                  Security Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => runAgentWorkflow('iac')}>
                  <FileCode2 className="h-4 w-4 mr-2 text-orange-400" />
                  Generate IaC
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {conversationId ? 'Conversation' : 'New Chat'}
              </span>
              {hasCodebaseContext && (
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {codebaseContext.selectedFiles.length} files
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {workflow && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowAgentPanel(!showAgentPanel)}
                    className={cn("h-8 w-8", showAgentPanel && "bg-primary/10 text-primary")}
                  >
                    <Zap className={cn("h-4 w-4", isRunning && "animate-pulse text-primary")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showAgentPanel ? 'Hide agents' : 'View agent status'}
                </TooltipContent>
              </Tooltip>
            )}
            
            {hasMessages && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => saveConversation()}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Save</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save conversation</TooltipContent>
              </Tooltip>
            )}
            
            {currentArtifact && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowArtifactPanel(!showArtifactPanel)}
                    className={cn("h-8 w-8", showArtifactPanel && "bg-primary/10 text-primary")}
                  >
                    {showArtifactPanel ? (
                      <PanelRightClose className="h-4 w-4" />
                    ) : (
                      <PanelRightOpen className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showArtifactPanel ? 'Close artifact' : 'View artifact'}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Agent Status (Floating) */}
        {showAgentPanel && workflow && (
          <div className="absolute top-16 right-4 z-20 w-80">
            <AgentStatusPanel 
              workflow={workflow}
              onToggleMinimize={() => setShowAgentPanel(false)}
            />
          </div>
        )}

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}
            
            {isLoading && messages[messages.length - 1]?.content === '' && (
              <div className="flex items-center gap-3 px-6 py-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-3">
                  {isRunning && currentAgent && (
                    <span className="text-xs text-primary">
                      {currentAgent === 'orchestrator' && '🎯 Orchestrating...'}
                      {currentAgent === 'requirements' && '📋 Analyzing...'}
                      {currentAgent === 'design' && '🏗️ Designing...'}
                      {currentAgent === 'cost' && '💰 Calculating...'}
                      {currentAgent === 'security' && '🔐 Validating...'}
                      {currentAgent === 'iac' && '📜 Generating...'}
                    </span>
                  )}
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Scroll button */}
        {showScrollButton && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-24 right-8 rounded-full shadow-lg z-10"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}

        {/* Input */}
        <EnhancedChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          codebaseFiles={codebaseContext.files}
          selectedCodeFiles={codebaseContext.selectedFiles}
          hasCodebaseContext={hasCodebaseContext}
          onOpenCodebase={() => setShowCodebasePanel(true)}
          onToggleCodeFile={toggleFileSelection}
        />
      </div>

      {/* Artifact Panel */}
      {showArtifactPanel && currentArtifact && (
        <div className="hidden lg:block fixed right-0 top-14 bottom-0 w-[500px] border-l border-border bg-card overflow-hidden">
          <ArtifactPanel 
            artifact={currentArtifact}
            onClose={() => setShowArtifactPanel(false)}
          />
        </div>
      )}
    </div>
  );
}
