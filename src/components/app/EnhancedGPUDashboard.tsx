import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { 
  Cpu, 
  Loader2, 
  TrendingDown, 
  Zap, 
  DollarSign,
  Clock,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown
} from 'lucide-react';

interface GPUSku {
  id: string;
  name: string;
  display_name: string;
  gpu_type: string | null;
  gpu_count: number | null;
  gpu_memory_gb: number | null;
  tflops: number | null;
  price_per_hour: number;
  price_per_month: number | null;
  region: string;
  provider_id: string;
}

interface Provider {
  id: string;
  name: string;
  display_name: string;
}

interface GPUMetrics extends GPUSku {
  monthlyPrice: number;
  costPerTflop: number | null;
  costPerGBVram: number | null;
  spotPrice: number | null;
  spotSavings: number | null;
  provider?: Provider;
}

// Spot pricing estimates (actual % discount from on-demand)
const SPOT_DISCOUNTS: Record<string, number> = {
  aws: 0.7,    // ~70% discount on spot
  azure: 0.6,  // ~60% discount on spot
  gcp: 0.69,   // ~69% discount on preemptible
  oci: 0.5,    // ~50% discount on preemptible
};

type SortField = 'price' | 'tflops' | 'vram' | 'efficiency';

export function EnhancedGPUDashboard() {
  const [gpuSkus, setGpuSkus] = useState<GPUSku[]>([]);
  const [providers, setProviders] = useState<Record<string, Provider>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [minVram, setMinVram] = useState<number>(0);
  const [useSpot, setUseSpot] = useState(false);
  const [hoursPerMonth, setHoursPerMonth] = useState<number>(730);
  const [sortBy, setSortBy] = useState<SortField>('efficiency');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: providersData } = await supabase
          .from('providers')
          .select('*');
        
        const providersMap: Record<string, Provider> = {};
        providersData?.forEach(p => {
          providersMap[p.id] = p;
        });
        setProviders(providersMap);

        const { data: skusData } = await supabase
          .from('skus')
          .select('*')
          .not('gpu_type', 'is', null)
          .order('price_per_hour', { ascending: true });

        setGpuSkus(skusData || []);
      } catch (error) {
        console.error('Error fetching GPU data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const gpuMetrics = useMemo<GPUMetrics[]>(() => {
    return gpuSkus.map(gpu => {
      const provider = providers[gpu.provider_id];
      const providerName = provider?.name?.toLowerCase() || 'aws';
      const spotDiscount = SPOT_DISCOUNTS[providerName] || 0.5;
      
      const baseHourlyPrice = gpu.price_per_hour;
      const spotHourlyPrice = baseHourlyPrice * (1 - spotDiscount);
      const effectiveHourlyPrice = useSpot ? spotHourlyPrice : baseHourlyPrice;
      
      const monthlyPrice = effectiveHourlyPrice * hoursPerMonth;
      const spotPrice = spotHourlyPrice * hoursPerMonth;
      const spotSavings = (baseHourlyPrice - spotHourlyPrice) * hoursPerMonth;
      
      const costPerTflop = gpu.tflops ? monthlyPrice / gpu.tflops : null;
      const costPerGBVram = gpu.gpu_memory_gb ? monthlyPrice / gpu.gpu_memory_gb : null;

      return {
        ...gpu,
        monthlyPrice,
        costPerTflop,
        costPerGBVram,
        spotPrice,
        spotSavings,
        provider,
      };
    });
  }, [gpuSkus, providers, useSpot, hoursPerMonth]);

  const filteredMetrics = useMemo(() => {
    let filtered = gpuMetrics;
    
    if (selectedProvider !== 'all') {
      filtered = filtered.filter(gpu => gpu.provider?.name?.toLowerCase() === selectedProvider);
    }
    
    if (minVram > 0) {
      filtered = filtered.filter(gpu => (gpu.gpu_memory_gb || 0) >= minVram);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.monthlyPrice - b.monthlyPrice;
        case 'tflops':
          return (b.tflops || 0) - (a.tflops || 0);
        case 'vram':
          return (b.gpu_memory_gb || 0) - (a.gpu_memory_gb || 0);
        case 'efficiency':
          return (a.costPerTflop || Infinity) - (b.costPerTflop || Infinity);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [gpuMetrics, selectedProvider, minVram, sortBy]);

  const stats = useMemo(() => {
    if (filteredMetrics.length === 0) return null;
    
    const bestValue = filteredMetrics.reduce((best, current) => {
      if (!current.costPerTflop) return best;
      if (!best || !best.costPerTflop) return current;
      return current.costPerTflop < best.costPerTflop ? current : best;
    }, null as GPUMetrics | null);
    
    const cheapest = filteredMetrics[0];
    const mostPowerful = filteredMetrics.reduce((best, current) => {
      return (current.tflops || 0) > (best?.tflops || 0) ? current : best;
    }, filteredMetrics[0]);
    
    const totalSpotSavings = filteredMetrics.reduce((sum, gpu) => sum + (gpu.spotSavings || 0), 0);
    
    return { bestValue, cheapest, mostPowerful, totalSpotSavings };
  }, [filteredMetrics]);

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            GPU Price-Performance Intelligence
            <Badge variant="outline" className="ml-2">
              {gpuSkus.length} GPUs
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Cloud Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="aws">AWS</SelectItem>
                  <SelectItem value="azure">Azure</SelectItem>
                  <SelectItem value="gcp">GCP</SelectItem>
                  <SelectItem value="oci">Oracle Cloud</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Minimum VRAM: {minVram} GB</Label>
              <Slider
                value={[minVram]}
                onValueChange={([v]) => setMinVram(v)}
                max={80}
                step={8}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Hours/Month: {hoursPerMonth}</Label>
              <Slider
                value={[hoursPerMonth]}
                onValueChange={([v]) => setHoursPerMonth(v)}
                min={100}
                max={730}
                step={10}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortField)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efficiency">Best Value ($/TFLOP)</SelectItem>
                  <SelectItem value="price">Lowest Price</SelectItem>
                  <SelectItem value="tflops">Highest TFLOPS</SelectItem>
                  <SelectItem value="vram">Most VRAM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Spot Instance Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/30 mb-6">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium">Use Spot/Preemptible Instances</p>
                <p className="text-sm text-muted-foreground">
                  Save 50-70% with interruptible capacity
                </p>
              </div>
            </div>
            <Switch checked={useSpot} onCheckedChange={setUseSpot} />
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {stats.bestValue && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Best Value</span>
                  </div>
                  <p className="font-bold text-lg">{stats.bestValue.gpu_type}</p>
                  <p className="text-sm text-muted-foreground">
                    ${stats.bestValue.costPerTflop?.toFixed(2)}/TFLOP
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {stats.bestValue.provider?.display_name}
                  </Badge>
                </div>
              )}
              
              <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium">Cheapest Option</span>
                </div>
                <p className="font-bold text-lg">{stats.cheapest?.gpu_type}</p>
                <p className="text-sm text-muted-foreground">
                  ${stats.cheapest?.monthlyPrice.toLocaleString()}/mo
                </p>
                <Badge variant="outline" className="mt-2">
                  {stats.cheapest?.provider?.display_name}
                </Badge>
              </div>
              
              {useSpot && (
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium">Spot Savings</span>
                  </div>
                  <p className="font-bold text-lg text-success">
                    Up to 70% Off
                  </p>
                  <p className="text-sm text-muted-foreground">
                    On all GPU instances
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* GPU Comparison Table */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          {filteredMetrics.length > 0 ? (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="text-foreground">GPU</TableHead>
                    <TableHead className="text-foreground">Provider</TableHead>
                    <TableHead className="text-foreground text-right">VRAM</TableHead>
                    <TableHead className="text-foreground text-right">TFLOPS</TableHead>
                    <TableHead className="text-foreground text-right">$/Hour</TableHead>
                    <TableHead className="text-foreground text-right">$/Month</TableHead>
                    <TableHead className="text-foreground text-right">$/TFLOP</TableHead>
                    {useSpot && (
                      <TableHead className="text-foreground text-right">Spot Savings</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMetrics.slice(0, 20).map((gpu, index) => (
                    <TableRow key={gpu.id} className={index === 0 ? 'bg-primary/5' : ''}>
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Badge className="bg-primary text-xs">Best</Badge>}
                          <div>
                            <p>{gpu.gpu_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {gpu.gpu_count}x GPU
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {gpu.provider?.display_name || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {gpu.gpu_memory_gb} GB
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {gpu.tflops || '-'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ${(useSpot ? gpu.price_per_hour * (1 - (SPOT_DISCOUNTS[gpu.provider?.name?.toLowerCase() || 'aws'] || 0.5)) : gpu.price_per_hour).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-foreground font-medium">
                        ${gpu.monthlyPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </TableCell>
                      <TableCell className="text-right">
                        {gpu.costPerTflop ? (
                          <span className={index === 0 ? 'text-primary font-semibold' : 'text-muted-foreground'}>
                            ${gpu.costPerTflop.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      {useSpot && (
                        <TableCell className="text-right text-success font-medium">
                          ${gpu.spotSavings?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Cpu className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No GPUs match your filters</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSelectedProvider('all');
                  setMinVram(0);
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            GPU Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/30">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Use Spot Instances for Training</p>
                  <p className="text-sm text-muted-foreground">
                    Save 50-70% on training workloads. Use checkpointing to handle interruptions.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-info/10 border border-info/30">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Right-size Your GPU Selection</p>
                  <p className="text-sm text-muted-foreground">
                    For inference: T4/L4 offers best cost-efficiency. For training: A100/H100 has best TFLOPS/$.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Consider Multi-Cloud Strategy</p>
                  <p className="text-sm text-muted-foreground">
                    GPU availability varies by region and provider. Spread workloads for better reliability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
