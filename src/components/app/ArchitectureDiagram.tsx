import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network } from 'lucide-react';

interface ArchitectureDiagramProps {
  diagram: string;
  variant: string;
}

export const ArchitectureDiagram = ({ diagram, variant }: ArchitectureDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#00d4ff',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#334155',
        lineColor: '#64748b',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        background: '#0a0f1a',
        mainBkg: '#1e293b',
        nodeBorder: '#334155',
        clusterBkg: '#1e293b',
        clusterBorder: '#334155',
        titleColor: '#f8fafc',
        edgeLabelBackground: '#1e293b',
      },
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
      },
    });

    const renderDiagram = async () => {
      if (containerRef.current && diagram) {
        containerRef.current.innerHTML = '';
        
        try {
          // Clean up the diagram string
          const cleanDiagram = diagram
            .replace(/\\n/g, '\n')
            .replace(/\\\\/g, '\\');
          
          const { svg } = await mermaid.render(`mermaid-${variant}`, cleanDiagram);
          containerRef.current.innerHTML = svg;
          
          // Style the SVG
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          containerRef.current.innerHTML = `
            <div class="flex items-center justify-center h-48 text-muted-foreground">
              <p>Diagram preview unavailable</p>
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [diagram, variant]);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" />
          Architecture Diagram
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          className="bg-secondary/30 rounded-lg p-4 min-h-[300px] flex items-center justify-center overflow-auto"
        />
      </CardContent>
    </Card>
  );
};
