import { memo, useState } from 'react';
import { User, Bot, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ArtifactData } from '@/pages/app/AppChat';

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
}

export const ChatMessageBubble = memo(({ message, onViewArtifact }: ChatMessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "flex gap-4 p-4 sm:p-6",
      isUser ? "bg-transparent" : "bg-secondary/20"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
        isUser 
          ? "bg-primary/20 text-primary" 
          : "bg-gradient-to-br from-primary/30 to-info/30 text-primary"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">
            {isUser ? 'You' : 'SolsArch'}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="text-sm text-foreground/90 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
          <MessageContent content={message.content} />
        </div>
        {message.artifact && onViewArtifact && (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 mt-2"
            onClick={onViewArtifact}
          >
            <ExternalLink className="w-3 h-3" />
            View {message.artifact.type === 'diagram' ? 'Diagram' : 'Plan'}
          </Button>
        )}
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
  // Split by newlines and process each line
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
  // Bold
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} className="font-semibold">{match[1]}</strong>);
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
    <div className="my-3 rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-secondary/80 border-b border-border">
        <span className="text-xs font-mono text-muted-foreground">{language || 'code'}</span>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 px-2">
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </Button>
      </div>
      <pre className="p-3 bg-secondary/30 overflow-x-auto">
        <code className="text-xs font-mono text-foreground">{code}</code>
      </pre>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';
