import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, RefreshCw, Maximize2, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import mermaid from 'mermaid';
import DOMPurify from 'dompurify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ArchitectureDiagramProps {
  diagram: string;
  variant: string;
  className?: string;
}

// Professional default diagram
const DEFAULT_DIAGRAM = `graph TB
    subgraph Client["Client Layer"]
        CDN[CDN / Edge Network]
        LB[Load Balancer]
    end
    
    subgraph Application["Application Layer"]
        API[API Gateway]
        WEB[Web Servers]
        APP[Application Servers]
    end
    
    subgraph Service["Service Layer"]
        AUTH[Auth Service]
        CACHE[(Redis Cache)]
        QUEUE[Message Queue]
        SEARCH[Search Engine]
    end
    
    subgraph Data["Data Layer"]
        DB[(Primary Database)]
        REPLICA[(Read Replicas)]
        STORAGE[(Object Storage)]
    end
    
    subgraph Background["Background Processing"]
        WORKER[Workers]
        SCHEDULER[Job Scheduler]
    end
    
    CDN --> LB
    LB --> API
    API --> WEB
    WEB --> APP
    APP --> AUTH
    APP --> CACHE
    APP --> QUEUE
    APP --> SEARCH
    APP --> DB
    DB --> REPLICA
    QUEUE --> WORKER
    WORKER --> STORAGE
    SCHEDULER --> QUEUE`;

// Track initialized state
let isMermaidInitialized = false;

// Professional theme configuration
const initMermaid = () => {
  if (isMermaidInitialized) return;
  
  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        primaryColor: '#0d3b4c',
        primaryTextColor: '#e2e8f0',
        primaryBorderColor: '#22d3ee',
        lineColor: '#64748b',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        background: '#0f172a',
        mainBkg: '#1e293b',
        nodeBorder: '#334155',
        clusterBkg: '#1e293b',
        clusterBorder: '#334155',
        titleColor: '#f1f5f9',
        edgeLabelBackground: '#1e293b',
        textColor: '#e2e8f0',
        nodeTextColor: '#e2e8f0',
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 30,
        nodeSpacing: 50,
        rankSpacing: 70,
        diagramPadding: 20,
      },
      securityLevel: 'loose',
      suppressErrorRendering: true,
    });
    isMermaidInitialized = true;
  } catch (e) {
    console.warn('Mermaid already initialized');
  }
};

const cleanDiagramString = (diagramStr: string): string => {
  if (!diagramStr || typeof diagramStr !== 'string') {
    return DEFAULT_DIAGRAM;
  }
  
  let cleaned = diagramStr
    .replace(/\\\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\\\/g, '\\')
    .replace(/\\"/g, '"')
    .replace(/\\t/g, '  ')
    .trim();
  
  // Remove any leading/trailing backticks or markdown
  cleaned = cleaned.replace(/^```mermaid\s*/i, '').replace(/```\s*$/i, '');
  
  // Replace problematic characters in labels
  cleaned = cleaned.replace(/["']/g, '');
  
  // Fix subgraph naming - ensure proper format
  cleaned = cleaned.replace(/subgraph\s+"([^"]+)"/g, 'subgraph $1');
  cleaned = cleaned.replace(/subgraph\s+'([^']+)'/g, 'subgraph $1');
  
  // Ensure proper line breaks
  if (cleaned.includes(';') && !cleaned.includes('\n')) {
    cleaned = cleaned.replace(/;\s*/g, '\n    ');
  }
  
  // Check for valid diagram type
  const validTypes = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie', 'gitGraph', 'mindmap', 'timeline', 'sankey', 'quadrant', 'xychart', 'block'];
  const hasValidType = validTypes.some(type => 
    cleaned.toLowerCase().startsWith(type.toLowerCase())
  );
  
  if (!hasValidType) {
    cleaned = 'graph TD\n    ' + cleaned;
  }
  
  return cleaned;
};

const DiagramControls = memo(({ 
  zoom, 
  onZoomIn, 
  onZoomOut, 
  onReset,
  onDownload 
}: { 
  zoom: number; 
  onZoomIn: () => void; 
  onZoomOut: () => void; 
  onReset: () => void;
  onDownload: () => void;
}) => (
  <div className="absolute top-4 right-4 flex items-center gap-1 bg-secondary/90 backdrop-blur-sm rounded-lg border border-border p-1 z-10">
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomOut} disabled={zoom <= 0.5}>
      <ZoomOut className="w-4 h-4" />
    </Button>
    <span className="text-xs font-mono w-12 text-center text-muted-foreground">{Math.round(zoom * 100)}%</span>
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomIn} disabled={zoom >= 2}>
      <ZoomIn className="w-4 h-4" />
    </Button>
    <div className="w-px h-6 bg-border mx-1" />
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onReset}>
      <RotateCcw className="w-4 h-4" />
    </Button>
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDownload}>
      <Download className="w-4 h-4" />
    </Button>
  </div>
));

DiagramControls.displayName = 'DiagramControls';

export const ArchitectureDiagram = memo(({ diagram, variant, className }: ArchitectureDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const renderIdRef = useRef(0);

  const renderDiagram = useCallback(async (diagramStr: string): Promise<{ success: boolean; svg?: string }> => {
    initMermaid();
    
    const currentRenderId = ++renderIdRef.current;
    
    try {
      const cleanDiagram = cleanDiagramString(diagramStr);
      const id = `mermaid-${variant.replace(/\s+/g, '-')}-${currentRenderId}`;
      
      // Remove any existing element with this ID
      const existing = document.getElementById(id);
      if (existing) {
        existing.remove();
      }
      
      const { svg } = await mermaid.render(id, cleanDiagram);
      return { success: true, svg };
    } catch (error) {
      console.warn('Mermaid rendering error, using fallback:', error);
      
      try {
        const fallbackId = `mermaid-fallback-${variant.replace(/\s+/g, '-')}-${currentRenderId}`;
        
        // Remove any existing element with this ID
        const existing = document.getElementById(fallbackId);
        if (existing) {
          existing.remove();
        }
        
        const { svg } = await mermaid.render(fallbackId, DEFAULT_DIAGRAM);
        return { success: true, svg };
      } catch (fallbackError) {
        console.error('Fallback diagram failed:', fallbackError);
        return { success: false };
      }
    }
  }, [variant]);

  useEffect(() => {
    let isMounted = true;
    
    const render = async () => {
      if (!diagram) return;
      
      const result = await renderDiagram(diagram);
      
      if (isMounted) {
        if (result.success && result.svg) {
          setSvgContent(result.svg);
          setIsRendered(true);
          setRenderError(false);
        } else {
          setRenderError(true);
          setIsRendered(false);
        }
      }
    };

    render();
    
    return () => {
      isMounted = false;
    };
  }, [diagram, renderDiagram]);

  useEffect(() => {
    if (containerRef.current && svgContent) {
      // Sanitize SVG to prevent XSS attacks
      const sanitizedSvg = DOMPurify.sanitize(svgContent, {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: ['use'],
        FORBID_TAGS: ['script', 'style'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
      });
      containerRef.current.innerHTML = sanitizedSvg;
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.style.maxWidth = '100%';
        svgElement.style.height = 'auto';
        svgElement.style.minHeight = '300px';
        svgElement.style.transform = `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`;
        svgElement.style.transformOrigin = 'center center';
        svgElement.style.transition = 'transform 0.2s ease-out';
      }
    }
  }, [svgContent, zoom, pan]);

  useEffect(() => {
    if (isFullscreenOpen && fullscreenContainerRef.current && svgContent) {
      // Sanitize SVG for fullscreen view as well
      const sanitizedSvg = DOMPurify.sanitize(svgContent, {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: ['use'],
        FORBID_TAGS: ['script', 'style'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
      });
      fullscreenContainerRef.current.innerHTML = sanitizedSvg;
      const svgElement = fullscreenContainerRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.style.maxWidth = '100%';
        svgElement.style.height = 'auto';
        svgElement.style.minHeight = '500px';
      }
    }
  }, [isFullscreenOpen, svgContent]);

  const handleRetry = async () => {
    setRenderError(false);
    setIsRendered(false);
    
    const result = await renderDiagram(diagram);
    
    if (result.success && result.svg) {
      setSvgContent(result.svg);
      setIsRendered(true);
      setRenderError(false);
    } else {
      setRenderError(true);
    }
  };

  const handleDownload = () => {
    if (!svgContent) return;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `architecture-${variant}-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("border-border bg-card overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Network className="w-5 h-5 text-primary" />
          Architecture Diagram
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-normal">
            {variant}
          </Badge>
          {renderError && (
            <Button variant="ghost" size="sm" onClick={handleRetry} className="h-8">
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          )}
          <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Maximize2 className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-primary" />
                  Architecture Diagram — {variant}
                </DialogTitle>
              </DialogHeader>
              <div 
                ref={fullscreenContainerRef}
                className="w-full min-h-[70vh] bg-secondary/30 rounded-lg p-6 overflow-auto"
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="relative p-0">
        {isRendered && (
          <DiagramControls
            zoom={zoom}
            onZoomIn={() => setZoom(z => Math.min(z + 0.25, 2))}
            onZoomOut={() => setZoom(z => Math.max(z - 0.25, 0.5))}
            onReset={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            onDownload={handleDownload}
          />
        )}
        
        <div 
          ref={containerRef}
          className={cn(
            "w-full min-h-[400px] bg-gradient-to-br from-secondary/50 to-secondary/20 overflow-auto",
            "flex items-center justify-center p-6"
          )}
        >
          {!isRendered && !renderError && (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
              <div className="relative">
                <Network className="w-10 h-10 opacity-50" />
                <div className="absolute inset-0 animate-ping opacity-30">
                  <Network className="w-10 h-10" />
                </div>
              </div>
              <p className="text-sm">Rendering architecture diagram...</p>
            </div>
          )}
          {renderError && (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
              <Network className="w-10 h-10 opacity-50" />
              <p className="text-sm">Using fallback diagram</p>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Original
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ArchitectureDiagram.displayName = 'ArchitectureDiagram';