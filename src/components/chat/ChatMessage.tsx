import React, { memo } from 'react';
import { User, Bot, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

const MermaidBlock = memo(({ code }: { code: string }) => {
  return (
    <div className="my-4 p-4 bg-secondary/50 rounded-lg border border-border overflow-x-auto">
      <pre className="text-sm font-mono text-muted-foreground whitespace-pre-wrap">{code}</pre>
    </div>
  );
});

MermaidBlock.displayName = 'MermaidBlock';

const CodeBlock = memo(({ code, language }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/80 border-b border-border">
        <span className="text-xs font-mono text-muted-foreground">{language || 'code'}</span>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2">
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </Button>
      </div>
      <pre className="p-4 bg-secondary/30 overflow-x-auto">
        <code className="text-sm font-mono text-foreground">{code}</code>
      </pre>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

const parseContent = (content: string) => {
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {formatTextContent(content.slice(lastIndex, match.index))}
        </span>
      );
    }

    const language = match[1];
    const code = match[2].trim();

    if (language === 'mermaid') {
      parts.push(<MermaidBlock key={`mermaid-${match.index}`} code={code} />);
    } else {
      parts.push(<CodeBlock key={`code-${match.index}`} code={code} language={language} />);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(
      <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
        {formatTextContent(content.slice(lastIndex))}
      </span>
    );
  }

  return parts;
};

const formatTextContent = (text: string): React.ReactNode => {
  // Handle bold text
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={`bold-${match.index}`} className="font-semibold">{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

export const ChatMessage = memo(({ role, content, timestamp }: ChatMessageProps) => {
  const isUser = role === 'user';

  return (
    <div className={cn(
      "flex gap-4 p-6 transition-colors",
      isUser ? "bg-transparent" : "bg-secondary/20"
    )}>
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
        isUser 
          ? "bg-primary/20 text-primary" 
          : "bg-gradient-to-br from-primary/30 to-info/30 text-primary"
      )}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-foreground">
            {isUser ? 'You' : 'SolsArch'}
          </span>
          {timestamp && (
            <span className="text-xs text-muted-foreground">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <div className="text-foreground/90 leading-relaxed">
          {parseContent(content)}
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
