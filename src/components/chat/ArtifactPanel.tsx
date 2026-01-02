import { X, Copy, Check, Download, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect, useRef } from 'react';
import type { ArtifactData } from '@/pages/app/AppChat';
import mermaid from 'mermaid';
import { cn } from '@/lib/utils';

interface ArtifactPanelProps {
  artifact: ArtifactData | null;
  onClose: () => void;
}

let mermaidInitialized = false;

const initMermaid = () => {
  if (mermaidInitialized) return;
  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      themeVariables: {
        darkMode: true,
        background: '#0f172a',
        primaryColor: '#14b8a6',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#334155',
        lineColor: '#64748b',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
      },
    });
    mermaidInitialized = true;
  } catch (e) {
    console.warn('Mermaid already initialized');
  }
};

export function ArtifactPanel({ artifact, onClose }: ArtifactPanelProps) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(0);

  useEffect(() => {
    if (artifact?.type === 'diagram' && mermaidRef.current) {
      initMermaid();
      
      const currentRenderId = ++renderIdRef.current;
      const diagramId = `mermaid-artifact-${currentRenderId}`;
      
      mermaid.render(diagramId, artifact.content)
        .then(({ svg }) => {
          if (mermaidRef.current && renderIdRef.current === currentRenderId) {
            mermaidRef.current.innerHTML = svg;
          }
        })
        .catch(err => {
          console.warn('Mermaid render error:', err);
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = `<pre class="text-xs text-muted-foreground p-4 overflow-auto font-mono">${artifact.content}</pre>`;
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

  const handleDownload = () => {
    if (!artifact) return;
    const extension = artifact.type === 'diagram' ? 'mmd' : 'md';
    const blob = new Blob([artifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.toLowerCase().replace(/\s+/g, '-')}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!artifact) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">No artifact to display</p>
          <p className="text-xs text-muted-foreground mt-1">Generate a diagram or plan to view it here</p>
        </div>
      </div>
    );
  }

  const getArtifactIcon = () => {
    switch (artifact.type) {
      case 'diagram': return '📊';
      case 'plan': return '📋';
      case 'code': return '💻';
      default: return '📄';
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-card",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getArtifactIcon()}</span>
          <div>
            <h3 className="font-semibold text-sm">{artifact.title}</h3>
            <p className="text-xs text-muted-foreground capitalize">{artifact.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
            {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
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
              className="bg-slate-900/50 rounded-xl p-6 min-h-[300px] flex items-center justify-center overflow-x-auto"
            />
          ) : artifact.type === 'code' ? (
            <div className="bg-[#0d1117] rounded-xl overflow-hidden">
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm font-mono text-[#c9d1d9]">{artifact.content}</code>
              </pre>
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
        if (line.startsWith('- [ ] ')) {
          return (
            <div key={i} className="flex items-center gap-2 my-1">
              <input type="checkbox" readOnly className="rounded border-border" />
              <span className="text-sm">{processBold(line.slice(6))}</span>
            </div>
          );
        }
        if (line.startsWith('- [x] ')) {
          return (
            <div key={i} className="flex items-center gap-2 my-1">
              <input type="checkbox" checked readOnly className="rounded border-border" />
              <span className="text-sm line-through text-muted-foreground">{processBold(line.slice(6))}</span>
            </div>
          );
        }
        if (line.startsWith('- ')) {
          return <li key={i} className="ml-4 text-sm list-disc">{processBold(line.slice(2))}</li>;
        }
        if (/^\d+\.\s/.test(line)) {
          return <li key={i} className="ml-4 text-sm list-decimal">{processBold(line.replace(/^\d+\.\s/, ''))}</li>;
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
