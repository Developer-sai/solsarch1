import { X, Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect, useRef } from 'react';
import type { ArtifactData } from '@/pages/app/AppChat';
import mermaid from 'mermaid';

interface ArtifactPanelProps {
  artifact: ArtifactData | null;
  onClose: () => void;
}

export function ArtifactPanel({ artifact, onClose }: ArtifactPanelProps) {
  const [copied, setCopied] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (artifact?.type === 'diagram' && mermaidRef.current) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
      });
      
      mermaid.render('mermaid-diagram', artifact.content).then(({ svg }) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
        }
      }).catch(err => {
        console.error('Mermaid render error:', err);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `<pre class="text-xs text-muted-foreground">${artifact.content}</pre>`;
        }
      });
    }
  }, [artifact]);

  const handleCopy = async () => {
    if (!artifact) return;
    await navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!artifact) {
    return (
      <div className="fixed right-0 top-14 bottom-0 w-[400px] border-l border-border bg-card/95 backdrop-blur-xl flex items-center justify-center lg:relative lg:top-0">
        <div className="text-center p-6">
          <p className="text-muted-foreground text-sm">No artifact to display</p>
          <p className="text-xs text-muted-foreground mt-1">Generate a plan or diagram to view it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-14 bottom-0 w-[400px] border-l border-border bg-card/95 backdrop-blur-xl flex flex-col lg:relative lg:top-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h3 className="font-semibold text-sm">{artifact.title}</h3>
          <p className="text-xs text-muted-foreground capitalize">{artifact.type}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {artifact.type === 'diagram' ? (
            <div 
              ref={mermaidRef} 
              className="bg-secondary/30 rounded-lg p-4 overflow-x-auto"
            />
          ) : artifact.type === 'architecture' && artifact.sections ? (
            <div className="space-y-6">
              {artifact.sections.map((section, i) => (
                <div key={i}>
                  <h4 className="font-semibold text-sm mb-2 text-primary">{section.title}</h4>
                  <div className="text-sm text-foreground/90 whitespace-pre-wrap">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ArtifactMarkdown content={artifact.content} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ArtifactMarkdown({ content }: { content: string }) {
  const lines = content.split('\n');
  
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return <h4 key={i} className="text-sm font-semibold mt-4 mb-2 text-primary">{line.slice(4)}</h4>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={i} className="text-base font-semibold mt-4 mb-2">{line.slice(3)}</h3>;
        }
        if (line.startsWith('# ')) {
          return <h2 key={i} className="text-lg font-bold mt-4 mb-2">{line.slice(2)}</h2>;
        }
        if (line.startsWith('- ')) {
          return <li key={i} className="ml-4 text-sm">{processBold(line.slice(2))}</li>;
        }
        if (line === '---') {
          return <hr key={i} className="my-4 border-border" />;
        }
        if (line.trim() === '') {
          return <br key={i} />;
        }
        return <p key={i} className="text-sm mb-1">{processBold(line)}</p>;
      })}
    </>
  );
}

function processBold(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
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
