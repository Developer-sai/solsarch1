import { memo, useState } from 'react';
import { User, Bot, Copy, Check, ExternalLink, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ArtifactData } from '@/pages/app/AppChat';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  artifact?: ArtifactData | null;
}

interface ChatMessageBubbleProps {
  message: Message;
  onViewArtifact?: () => void;
  onRegenerate?: () => void;
}

export const ChatMessageBubble = memo(({ message, onViewArtifact, onRegenerate }: ChatMessageBubbleProps) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "group relative py-6 px-4 sm:px-6",
      isUser ? "bg-transparent" : "bg-secondary/10"
    )}>
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser 
            ? "bg-gradient-to-br from-primary to-primary/80" 
            : "bg-gradient-to-br from-emerald-500 to-teal-600"
        )}>
          {isUser ? (
            <User className="w-4 h-4 text-primary-foreground" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">
              {isUser ? 'You' : 'SolsArch'}
            </span>
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Message Content */}
          <div className="text-sm text-foreground/90 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
            <MessageContent content={message.content} />
          </div>

          {/* Artifact Button */}
          {message.artifact && onViewArtifact && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 mt-2 bg-primary/5 border-primary/20 hover:bg-primary/10"
              onClick={onViewArtifact}
            >
              <ExternalLink className="w-3 h-3" />
              View {message.artifact.type === 'diagram' ? 'Diagram' : 'Plan'}
            </Button>
          )}

          {/* Action Bar - ChatGPT style */}
          {!isUser && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={handleCopy}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Copy</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "h-7 w-7",
                        feedback === 'up' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Good response</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "h-7 w-7",
                        feedback === 'down' ? "text-destructive" : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Bad response</TooltipContent>
                </Tooltip>

                {onRegenerate && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={onRegenerate}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Regenerate</TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ChatMessageBubble.displayName = 'ChatMessageBubble';

const MessageContent = memo(({ content }: { content: string }) => {
  const parts = parseContent(content);
  return <>{parts}</>;
});

MessageContent.displayName = 'MessageContent';

function parseContent(content: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {formatTextContent(content.slice(lastIndex, match.index))}
        </span>
      );
    }

    const language = match[1];
    const code = match[2].trim();

    parts.push(
      <CodeBlock key={`code-${match.index}`} code={code} language={language} />
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>
        {formatTextContent(content.slice(lastIndex))}
      </span>
    );
  }

  return parts;
}

function formatTextContent(text: string): React.ReactNode {
  const lines = text.split('\n');
  
  return lines.map((line, i) => {
    // Headers
    if (line.startsWith('### ')) {
      return <h4 key={i} className="text-base font-semibold mt-4 mb-2">{processInline(line.slice(4))}</h4>;
    }
    if (line.startsWith('## ')) {
      return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{processInline(line.slice(3))}</h3>;
    }
    if (line.startsWith('# ')) {
      return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{processInline(line.slice(2))}</h2>;
    }
    // List items
    if (line.startsWith('- ')) {
      return <li key={i} className="ml-4">{processInline(line.slice(2))}</li>;
    }
    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const content = line.replace(/^\d+\.\s/, '');
      return <li key={i} className="ml-4 list-decimal">{processInline(content)}</li>;
    }
    // Horizontal rule
    if (line === '---') {
      return <hr key={i} className="my-4 border-border" />;
    }
    // Empty lines
    if (line.trim() === '') {
      return <br key={i} />;
    }
    // Regular paragraph
    return <p key={i} className="mb-1">{processInline(line)}</p>;
  });
}

function processInline(text: string): React.ReactNode {
  // Handle bold, italic, inline code
  const parts: React.ReactNode[] = [];
  // Match bold, italic, or inline code
  const inlineRegex = /(\*\*(.*?)\*\*)|(`([^`]+)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    if (match[1]) {
      // Bold
      parts.push(<strong key={match.index} className="font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      // Inline code
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-secondary text-sm font-mono">
          {match[4]}
        </code>
      );
    }
    
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

const CodeBlock = memo(({ code, language }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-border overflow-hidden bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-border/50">
        <span className="text-xs font-mono text-muted-foreground">{language || 'code'}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopy} 
          className="h-6 px-2 text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              <span className="text-xs">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-[#d4d4d4]">{code}</code>
      </pre>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';