import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, RefreshCw, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import mermaid from 'mermaid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ArchitectureDiagramProps {
  diagram: string;
  variant: string;
}

// Default diagram to use if provided diagram fails
const DEFAULT_DIAGRAM = `graph TD
    LB[Load Balancer] --> WS1[Web Server 1]
    LB --> WS2[Web Server 2]
    WS1 --> API[API Gateway]
    WS2 --> API
    API --> APP1[App Server 1]
    API --> APP2[App Server 2]
    APP1 --> CACHE[(Redis Cache)]
    APP2 --> CACHE
    APP1 --> DB[(Primary Database)]
    APP2 --> DB
    DB --> REPLICA[(Read Replica)]
    APP1 --> QUEUE[Message Queue]
    APP2 --> QUEUE
    QUEUE --> WORKER[Background Workers]
    WORKER --> STORAGE[(Object Storage)]
    CDN[CDN] --> LB`;

// Initialize mermaid once at module level
let mermaidInitialized = false;
const initMermaid = () => {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
      primaryColor: '#6366f1',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#818cf8',
      lineColor: '#a5b4fc',
      secondaryColor: '#1e1b4b',
      tertiaryColor: '#0f172a',
      background: '#0f172a',
      mainBkg: '#1e1b4b',
      nodeBorder: '#818cf8',
      clusterBkg: '#1e1b4b',
      titleColor: '#ffffff',
      edgeLabelBackground: '#1e1b4b',
    },
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis',
      padding: 20,
    },
    securityLevel: 'loose',
  });
  mermaidInitialized = true;
};

const cleanDiagramString = (diagramStr: string): string => {
  if (!diagramStr || typeof diagramStr !== 'string') {
    return DEFAULT_DIAGRAM;
  }
  
  // Clean up the diagram string - handle various escape patterns
  let cleaned = diagramStr
    .replace(/\\\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\\\/g, '\\')
    .replace(/\\"/g, '"')
    .replace(/\\t/g, '  ')
    .trim();
  
  // Replace semicolons that are used as line separators with newlines
  // But only if the line doesn't start with graph/flowchart declaration
  if (cleaned.includes(';') && !cleaned.includes('\n')) {
    cleaned = cleaned.replace(/;\s*/g, '\n    ');
  }
  
  // Ensure it starts with a valid graph declaration
  if (!cleaned.match(/^(graph|flowchart|sequenceDiagram|classDiagram)/i)) {
    cleaned = 'graph TD\n    ' + cleaned;
  }
  
  return cleaned;
};

export const ArchitectureDiagram = ({ diagram, variant }: ArchitectureDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const renderAttemptRef = useRef(0);

  const renderDiagram = useCallback(async (diagramStr: string): Promise<{ success: boolean; svg?: string }> => {
    initMermaid();
    
    try {
      const cleanDiagram = cleanDiagramString(diagramStr);
      const id = `mermaid-${variant}-${Date.now()}-${renderAttemptRef.current++}`;
      
      const { svg } = await mermaid.render(id, cleanDiagram);
      return { success: true, svg };
    } catch (error) {
      console.error('Mermaid rendering error with provided diagram:', error);
      
      // Try with default diagram
      try {
        const id = `mermaid-fallback-${variant}-${Date.now()}-${renderAttemptRef.current++}`;
        const { svg } = await mermaid.render(id, DEFAULT_DIAGRAM);
        return { success: true, svg };
      } catch (fallbackError) {
        console.error('Fallback diagram also failed:', fallbackError);
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

  // Apply SVG to container when content changes
  useEffect(() => {
    if (containerRef.current && svgContent) {
      containerRef.current.innerHTML = svgContent;
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.style.maxWidth = '100%';
        svgElement.style.height = 'auto';
        svgElement.style.minHeight = '200px';
      }
    }
  }, [svgContent]);

  // Apply SVG to fullscreen container
  useEffect(() => {
    if (isFullscreenOpen && fullscreenContainerRef.current && svgContent) {
      fullscreenContainerRef.current.innerHTML = svgContent;
      const svgElement = fullscreenContainerRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.style.maxWidth = '100%';
        svgElement.style.height = 'auto';
        svgElement.style.minHeight = '400px';
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

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" />
          Architecture Diagram
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Auto-generated
          </Badge>
          {renderError && (
            <Button variant="ghost" size="sm" onClick={handleRetry}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
          <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Maximize2 className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Architecture Diagram</DialogTitle>
              </DialogHeader>
              <div 
                ref={fullscreenContainerRef}
                className="w-full min-h-[500px] bg-secondary/30 rounded-lg p-4 overflow-auto"
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          className="w-full min-h-[300px] bg-secondary/30 rounded-lg p-4 overflow-auto flex items-center justify-center"
        >
          {!isRendered && !renderError && (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
              <Network className="w-8 h-8 opacity-50 animate-pulse" />
              <p className="text-sm">Rendering architecture diagram...</p>
            </div>
          )}
          {renderError && (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
              <Network className="w-8 h-8 opacity-50" />
              <p className="text-sm">Using default architecture diagram</p>
              <Button variant="outline" size="sm" onClick={handleRetry} className="mt-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
