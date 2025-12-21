import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Upload, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  PieChart,
  ArrowRight,
  CheckCircle,
  Zap,
  Cloud
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BillLineItem {
  service: string;
  usage: string;
  cost: number;
  optimization: string | null;
  savingsPercent: number;
}

interface AnalysisResult {
  provider: string;
  period: string;
  totalCost: number;
  optimizedCost: number;
  lineItems: BillLineItem[];
  topWaste: { service: string; waste: number; reason: string }[];
}

const mockAnalysis: AnalysisResult = {
  provider: 'AWS',
  period: 'November 2024',
  totalCost: 8450,
  optimizedCost: 5890,
  lineItems: [
    { service: 'EC2 Instances', usage: '12 instances (m5.xlarge)', cost: 2340, optimization: 'Switch 6 to t3.large, use Reserved Instances', savingsPercent: 45 },
    { service: 'RDS PostgreSQL', usage: 'db.r5.2xlarge Multi-AZ', cost: 1890, optimization: 'Right-size to db.r5.xlarge during off-peak', savingsPercent: 30 },
    { service: 'S3 Storage', usage: '15 TB Standard', cost: 450, optimization: 'Move 8TB to Glacier for archival', savingsPercent: 60 },
    { service: 'NAT Gateway', usage: '4 gateways, 12TB egress', cost: 1200, optimization: 'Consolidate to 2 gateways, use VPC endpoints', savingsPercent: 50 },
    { service: 'EBS Volumes', usage: '50 gp2 volumes (10TB total)', cost: 1000, optimization: 'Upgrade to gp3 for 20% cost reduction', savingsPercent: 20 },
    { service: 'Lambda Functions', usage: '50M invocations', cost: 320, optimization: 'Optimize memory allocation', savingsPercent: 25 },
    { service: 'CloudWatch Logs', usage: '500GB ingested', cost: 250, optimization: 'Reduce retention, filter logs', savingsPercent: 40 },
    { service: 'Elastic Load Balancer', usage: '4 ALBs', cost: 1000, optimization: 'Consolidate to 2 ALBs', savingsPercent: 50 },
  ],
  topWaste: [
    { service: 'Idle EC2 Instances', waste: 680, reason: '4 instances with <5% CPU utilization' },
    { service: 'Orphaned EBS Volumes', waste: 340, reason: '15 unattached volumes' },
    { service: 'Unused Elastic IPs', waste: 45, reason: '12 unassociated IPs' },
    { service: 'Over-provisioned RDS', waste: 520, reason: 'Multi-AZ not needed for dev DB' },
  ],
};

export const CloudBillAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [billFile, setBillFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBillFile(file);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAnalysisResult(mockAnalysis);
    setIsAnalyzing(false);
    
    toast({
      title: "Bill Analysis Complete",
      description: `Found $${(mockAnalysis.totalCost - mockAnalysis.optimizedCost).toLocaleString()} in potential savings!`,
    });
  };

  const handleDemoAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAnalysisResult(mockAnalysis);
    setIsAnalyzing(false);
    
    toast({
      title: "Demo Analysis Loaded",
      description: "Showing sample AWS bill analysis with optimization recommendations.",
    });
  };

  const totalSavings = analysisResult 
    ? analysisResult.totalCost - analysisResult.optimizedCost 
    : 0;
  const savingsPercent = analysisResult 
    ? ((totalSavings / analysisResult.totalCost) * 100).toFixed(1) 
    : 0;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Cloud Bill Analyzer
          </CardTitle>
          {analysisResult && (
            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
              ${totalSavings.toLocaleString()}/mo savings found
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!analysisResult ? (
          <div className="space-y-4">
            {/* Upload Section */}
            <div className="p-6 border-2 border-dashed border-border rounded-xl text-center hover:border-primary/50 transition-colors">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-medium text-foreground mb-2">Upload Your Cloud Bill</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Supports AWS Cost & Usage Reports, Azure Cost Management exports, GCP billing exports
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="relative">
                  <Input
                    type="file"
                    accept=".csv,.json,.xlsx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="pointer-events-none">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
                {billFile && (
                  <span className="text-sm text-muted-foreground">{billFile.name}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                onClick={handleAnalyze} 
                disabled={!billFile || isAnalyzing}
                className="flex-1 gap-2"
              >
                {isAnalyzing ? (
                  <>Analyzing...</>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Analyze Bill
                  </>
                )}
              </Button>
              <Button 
                onClick={handleDemoAnalysis}
                variant="outline"
                disabled={isAnalyzing}
                className="gap-2"
              >
                <Cloud className="w-4 h-4" />
                Try Demo
              </Button>
            </div>

            {/* Supported Providers */}
            <div className="flex items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded bg-[hsl(var(--aws))]/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-[hsl(var(--aws))]">A</span>
                </div>
                AWS
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded bg-[hsl(var(--azure))]/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-[hsl(var(--azure))]">A</span>
                </div>
                Azure
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded bg-[hsl(var(--gcp))]/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-[hsl(var(--gcp))]">G</span>
                </div>
                GCP
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded bg-[hsl(var(--oci))]/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-[hsl(var(--oci))]">O</span>
                </div>
                OCI
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Header */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-secondary/50 border border-border text-center">
                <DollarSign className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <div className="text-xl font-bold text-foreground">${analysisResult.totalCost.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Current Cost</div>
              </div>
              <div className="p-4 rounded-lg bg-success/10 border border-success/30 text-center">
                <TrendingDown className="w-5 h-5 text-success mx-auto mb-1" />
                <div className="text-xl font-bold text-success">${analysisResult.optimizedCost.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Optimized Cost</div>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
                <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="text-xl font-bold text-primary">${totalSavings.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Savings</div>
              </div>
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 text-center">
                <PieChart className="w-5 h-5 text-warning mx-auto mb-1" />
                <div className="text-xl font-bold text-warning">{savingsPercent}%</div>
                <div className="text-xs text-muted-foreground">Reduction</div>
              </div>
            </div>

            <Tabs defaultValue="services" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="services">Service Breakdown</TabsTrigger>
                <TabsTrigger value="waste">Waste Detection</TabsTrigger>
              </TabsList>
              
              <TabsContent value="services" className="mt-4 space-y-3">
                {analysisResult.lineItems.map((item, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg bg-secondary/30 border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{item.service}</span>
                        <Badge variant="outline" className="text-xs">{item.usage}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-foreground">${item.cost.toLocaleString()}</span>
                        {item.savingsPercent > 0 && (
                          <Badge className="bg-success/20 text-success border-success/30 text-xs">
                            Save {item.savingsPercent}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    {item.optimization && (
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-muted-foreground">{item.optimization}</p>
                        <Button size="sm" variant="ghost" className="gap-1 text-primary">
                          Apply <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    {item.savingsPercent > 0 && (
                      <Progress value={item.savingsPercent} className="h-1 mt-2" />
                    )}
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="waste" className="mt-4 space-y-3">
                {analysisResult.topWaste.map((waste, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg bg-destructive/10 border border-destructive/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="font-medium text-foreground">{waste.service}</span>
                      </div>
                      <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                        ${waste.waste}/mo wasted
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{waste.reason}</p>
                    <Button size="sm" variant="outline" className="mt-2 gap-1 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Fix Now
                    </Button>
                  </div>
                ))}
                
                <div className="p-4 rounded-lg bg-success/10 border border-success/30 text-center">
                  <h4 className="font-medium text-success mb-1">Total Waste Identified</h4>
                  <p className="text-2xl font-bold text-success">
                    ${analysisResult.topWaste.reduce((sum, w) => sum + w.waste, 0).toLocaleString()}/mo
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <Button onClick={() => setAnalysisResult(null)} variant="outline" className="w-full">
              Analyze Another Bill
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};