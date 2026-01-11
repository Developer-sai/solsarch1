import { X, Copy, Check, Download, Maximize2, Minimize2, Code, FileText, BarChart3, Shield, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect, useRef } from 'react';
import type { ArtifactData } from '@/pages/app/AppChat';
import mermaid from 'mermaid';
import { cn } from '@/lib/utils';
import { IaCPreviewPanel } from '@/components/app/IaCPreviewPanel';
import { MultiCloudCostDashboard } from '@/components/app/MultiCloudCostDashboard';

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
  const [activeTab, setActiveTab] = useState<string>('preview');
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
    const extension = artifact.type === 'diagram' ? 'mmd' : artifact.type === 'code' ? 'tf' : 'md';
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
          <Layers className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No artifact to display</p>
          <p className="text-xs text-muted-foreground mt-1">Generate a diagram, plan, or code to view it here</p>
        </div>
      </div>
    );
  }

  const getArtifactIcon = () => {
    switch (artifact.type) {
      case 'diagram': return <BarChart3 className="w-4 h-4" />;
      case 'plan': return <FileText className="w-4 h-4" />;
      case 'code': return <Code className="w-4 h-4" />;
      case 'cost': return <BarChart3 className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getArtifactColor = () => {
    switch (artifact.type) {
      case 'diagram': return 'text-blue-400';
      case 'plan': return 'text-purple-400';
      case 'code': return 'text-orange-400';
      case 'cost': return 'text-green-400';
      case 'security': return 'text-red-400';
      default: return 'text-primary';
    }
  };

  // Check if this is an IaC artifact
  const isIaCCode = artifact.type === 'code' && (
    artifact.content.includes('terraform') ||
    artifact.content.includes('resource "') ||
    artifact.content.includes('provider "')
  );

  // Check if this is a cost analysis
  const isCostAnalysis = artifact.type === 'cost' || 
    (artifact.content.includes('Cost') && artifact.content.includes('AWS') && artifact.content.includes('Azure'));

  return (
    <div className={cn(
      "flex flex-col h-full bg-card",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/50">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-secondary", getArtifactColor())}>
            {getArtifactIcon()}
          </div>
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
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabbed Content for complex artifacts */}
      {(isIaCCode || isCostAnalysis) ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-2 justify-start bg-muted/50">
            <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
            {isIaCCode && <TabsTrigger value="code" className="text-xs">Code</TabsTrigger>}
            {isCostAnalysis && <TabsTrigger value="dashboard" className="text-xs">Dashboard</TabsTrigger>}
            <TabsTrigger value="raw" className="text-xs">Raw</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="flex-1 mt-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                {artifact.type === 'diagram' ? (
                  <div 
                    ref={mermaidRef} 
                    className="bg-slate-900/50 rounded-xl p-6 min-h-[300px] flex items-center justify-center overflow-x-auto"
                  />
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ArtifactMarkdown content={artifact.content} />
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          {isIaCCode && (
            <TabsContent value="code" className="flex-1 mt-0 overflow-hidden">
              <IaCPreviewPanel 
                format="terraform" 
                provider="aws" 
              />
            </TabsContent>
          )}
          
          {isCostAnalysis && (
            <TabsContent value="dashboard" className="flex-1 mt-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <MultiCloudCostDashboard />
                </div>
              </ScrollArea>
            </TabsContent>
          )}
          
          <TabsContent value="raw" className="flex-1 mt-0">
            <ScrollArea className="h-full">
              <pre className="p-4 text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                {artifact.content}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      ) : (
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
      )}
    </div>
  );
}

function ArtifactMarkdown({ content }: { content: string }) {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(0);
  const lines = content.split('\n');
  
  // Check for embedded mermaid diagrams
  const mermaidMatch = content.match(/```mermaid\n([\s\S]*?)```/);
  
  useEffect(() => {
    if (mermaidMatch && mermaidRef.current) {
      initMermaid();
      const currentRenderId = ++renderIdRef.current;
      const diagramId = `mermaid-inline-${currentRenderId}`;
      
      mermaid.render(diagramId, mermaidMatch[1].trim())
        .then(({ svg }) => {
          if (mermaidRef.current && renderIdRef.current === currentRenderId) {
            mermaidRef.current.innerHTML = svg;
          }
        })
        .catch(err => {
          console.warn('Inline mermaid render error:', err);
        });
    }
  }, [content, mermaidMatch]);
  
  return (
    <>
      {mermaidMatch && (
        <div 
          ref={mermaidRef}
          className="bg-slate-900/50 rounded-xl p-4 my-4 overflow-x-auto"
        />
      )}
      {lines.map((line, i) => {
        // Skip mermaid code blocks in text rendering
        if (line.includes('```mermaid') || (mermaidMatch && content.indexOf(line) >= content.indexOf('```mermaid') && content.indexOf(line) <= content.indexOf('```', content.indexOf('```mermaid') + 10))) {
          return null;
        }
        
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
        if (line.startsWith('|') && line.endsWith('|')) {
          // Table row
          const cells = line.split('|').filter(Boolean);
          const isHeader = lines[i + 1]?.includes('---');
          const isSeparator = line.includes('---');
          
          if (isSeparator) return null;
          
          return (
            <div key={i} className="flex border-b border-border/50 text-sm">
              {cells.map((cell, j) => (
                <div 
                  key={j} 
                  className={cn(
                    "flex-1 px-2 py-1",
                    isHeader && "font-semibold bg-secondary/50"
                  )}
                >
                  {processBold(cell.trim())}
                </div>
              ))}
            </div>
          );
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
  let remaining = text;
  let keyIndex = 0;

  // Process bold
  while (remaining.includes('**')) {
    const start = remaining.indexOf('**');
    const end = remaining.indexOf('**', start + 2);
    if (end === -1) break;
    
    if (start > 0) {
      parts.push(processCode(remaining.slice(0, start), keyIndex++));
    }
    parts.push(<strong key={`bold-${keyIndex++}`} className="font-semibold">{remaining.slice(start + 2, end)}</strong>);
    remaining = remaining.slice(end + 2);
  }
  
  if (remaining) {
    parts.push(processCode(remaining, keyIndex++));
  }

  return parts.length > 0 ? parts : text;
}

function processCode(text: string, keyBase: number): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.includes('`')) {
    const start = remaining.indexOf('`');
    const end = remaining.indexOf('`', start + 1);
    if (end === -1) break;
    
    if (start > 0) {
      parts.push(processEmoji(remaining.slice(0, start), keyBase + keyIndex++));
    }
    parts.push(
      <code key={`code-${keyBase}-${keyIndex++}`} className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono text-primary">
        {remaining.slice(start + 1, end)}
      </code>
    );
    remaining = remaining.slice(end + 1);
  }
  
  if (remaining) {
    parts.push(processEmoji(remaining, keyBase + keyIndex++));
  }

  return parts.length > 0 ? parts : processEmoji(text, keyBase);
}

function processEmoji(text: string, key: number): React.ReactNode {
  // Process checkmarks and x marks
  return text
    .replace(/✅/g, '✅ ')
    .replace(/❌/g, '❌ ')
    .replace(/⚠️/g, '⚠️ ')
    .replace(/🔴/g, '🔴 ')
    .replace(/🟡/g, '🟡 ')
    .replace(/🟢/g, '🟢 ');
}
