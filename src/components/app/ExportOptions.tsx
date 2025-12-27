import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Download, 
  FileText, 
  FileJson, 
  FileImage, 
  FileCode, 
  Presentation,
  Copy,
  Check,
  Loader2,
  Share2
} from 'lucide-react';
import { Architecture, ArchitectureResult, Requirements } from '@/types/architecture';
import { useToast } from '@/hooks/use-toast';

interface ExportOptionsProps {
  result: ArchitectureResult;
  requirements: Requirements;
  selectedVariant: number;
  compact?: boolean;
}

export function ExportOptions({ result, requirements, selectedVariant, compact = false }: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const selectedArch = result.architectures[selectedVariant];

  const exportAsPDF = async () => {
    setIsExporting('pdf');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(24);
      doc.setTextColor(0, 150, 136);
      doc.text('SolsArch Architecture Report', 20, 20);
      
      // Date
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Architecture name
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text(selectedArch.name, 20, 45);
      
      // Description
      doc.setFontSize(11);
      doc.setTextColor(60);
      const descLines = doc.splitTextToSize(selectedArch.description, 170);
      doc.text(descLines, 20, 55);
      
      let yPos = 65 + (descLines.length * 5);
      
      // Requirements summary
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Requirements', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(60);
      const reqs = [
        `App Type: ${requirements.appType}`,
        `Expected Users: ${requirements.expectedUsers.toLocaleString()}`,
        `RPS: ${requirements.requestsPerSecond}`,
        `Latency Target: ${requirements.latencyTargetMs}ms`,
        `Availability SLA: ${requirements.availabilitySLA}%`,
        `Budget: $${requirements.budgetMin} - $${requirements.budgetMax}/month`,
      ];
      reqs.forEach((req) => {
        doc.text(req, 20, yPos);
        yPos += 6;
      });
      
      yPos += 10;
      
      // Cost comparison
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Cost Comparison', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(60);
      const providers = ['AWS', 'Azure', 'GCP', 'OCI'] as const;
      providers.forEach((provider) => {
        const cost = selectedArch.totalCosts[provider.toLowerCase() as keyof typeof selectedArch.totalCosts];
        doc.text(`${provider}: $${cost.toLocaleString()}/month`, 20, yPos);
        yPos += 6;
      });
      
      yPos += 10;
      
      // Components
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Components', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(60);
      selectedArch.components.forEach((component) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${component.name} (${component.serviceType})`, 20, yPos);
        yPos += 6;
      });
      
      doc.save(`solsarch-${selectedArch.variant}-${Date.now()}.pdf`);
      
      toast({
        title: 'PDF Exported',
        description: 'Architecture report downloaded successfully',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(null);
    }
  };

  const exportAsJSON = () => {
    setIsExporting('json');
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        requirements,
        selectedArchitecture: selectedArch,
        allArchitectures: result.architectures,
        recommendations: result.recommendations,
        mermaidDiagram: result.mermaidDiagram,
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solsarch-${selectedArch.variant}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'JSON Exported',
        description: 'Architecture data downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export JSON',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(null);
    }
  };

  const exportAsMarkdown = () => {
    setIsExporting('md');
    try {
      const md = `# ${selectedArch.name}

${selectedArch.description}

**Generated:** ${new Date().toLocaleDateString()}

## Requirements

| Metric | Value |
|--------|-------|
| App Type | ${requirements.appType} |
| Expected Users | ${requirements.expectedUsers.toLocaleString()} |
| Requests/Second | ${requirements.requestsPerSecond} |
| Latency Target | ${requirements.latencyTargetMs}ms |
| Availability SLA | ${requirements.availabilitySLA}% |
| Budget | $${requirements.budgetMin} - $${requirements.budgetMax}/month |

## Cost Comparison

| Provider | Monthly Cost |
|----------|--------------|
| AWS | $${selectedArch.totalCosts.aws.toLocaleString()} |
| Azure | $${selectedArch.totalCosts.azure.toLocaleString()} |
| GCP | $${selectedArch.totalCosts.gcp.toLocaleString()} |
| OCI | $${selectedArch.totalCosts.oci.toLocaleString()} |

## Components

${selectedArch.components.map(c => `- **${c.name}** (${c.serviceType})`).join('\n')}

## Assumptions

${selectedArch.assumptions.map(a => `- ${a}`).join('\n')}

## Trade-offs

${selectedArch.tradeOffs.map(t => `- ${t}`).join('\n')}

## Architecture Diagram

\`\`\`mermaid
${result.mermaidDiagram}
\`\`\`

## Recommendations

${result.recommendations.map(r => `### ${r.title}
${r.description}
- **Impact:** ${r.impactPercentage}% savings
- **Priority:** ${r.priority}
`).join('\n')}

---
*Generated by SolsArch - AI-Powered Solution Architecture*
`;
      
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solsarch-${selectedArch.variant}-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Markdown Exported',
        description: 'Architecture document downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export Markdown',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(null);
    }
  };

  const copyMermaid = async () => {
    try {
      await navigator.clipboard.writeText(result.mermaidDiagram);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied',
        description: 'Mermaid diagram copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={exportAsPDF} disabled={isExporting === 'pdf'}>
            {isExporting === 'pdf' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportAsMarkdown} disabled={isExporting === 'md'}>
            {isExporting === 'md' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileCode className="w-4 h-4 mr-2" />}
            Export as Markdown
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportAsJSON} disabled={isExporting === 'json'}>
            {isExporting === 'json' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileJson className="w-4 h-4 mr-2" />}
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyMermaid}>
            {copied ? <Check className="w-4 h-4 mr-2 text-success" /> : <Copy className="w-4 h-4 mr-2" />}
            Copy Mermaid Code
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Card className="border-border bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Export & Share
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 h-auto py-3 flex-col"
            onClick={exportAsPDF}
            disabled={isExporting === 'pdf'}
          >
            {isExporting === 'pdf' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            <span className="text-xs">PDF</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 h-auto py-3 flex-col"
            onClick={exportAsMarkdown}
            disabled={isExporting === 'md'}
          >
            {isExporting === 'md' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileCode className="w-5 h-5" />}
            <span className="text-xs">Markdown</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 h-auto py-3 flex-col"
            onClick={exportAsJSON}
            disabled={isExporting === 'json'}
          >
            {isExporting === 'json' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileJson className="w-5 h-5" />}
            <span className="text-xs">JSON</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 h-auto py-3 flex-col"
            onClick={copyMermaid}
          >
            {copied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
            <span className="text-xs">Mermaid</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
