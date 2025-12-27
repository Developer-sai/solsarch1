import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CloudProvider, 
  ExistingService, 
  Requirements,
  CLOUD_PROVIDERS 
} from '@/types/architecture';
import { 
  Cloud, 
  Database, 
  HardDrive, 
  Globe, 
  Cpu, 
  Map, 
  Search, 
  BarChart3,
  Plus,
  X,
  Layers
} from 'lucide-react';

interface HybridCloudConfigProps {
  requirements: Requirements;
  onUpdate: (updates: Partial<Requirements>) => void;
}

const SERVICE_OPTIONS = [
  { id: 'storage', label: 'Storage / Images', icon: HardDrive },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'compute', label: 'Compute', icon: Cpu },
  { id: 'cdn', label: 'CDN', icon: Globe },
  { id: 'cache', label: 'Cache', icon: Layers },
  { id: 'maps', label: 'Maps API', icon: Map },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const PROVIDER_OPTIONS: { id: CloudProvider | 'google-maps' | 'mapbox'; label: string }[] = [
  { id: 'aws', label: 'AWS' },
  { id: 'azure', label: 'Azure' },
  { id: 'gcp', label: 'GCP' },
  { id: 'oci', label: 'Oracle Cloud' },
];

const EXTERNAL_PROVIDERS = [
  { id: 'google-maps', label: 'Google Maps' },
  { id: 'mapbox', label: 'Mapbox' },
  { id: 'twilio', label: 'Twilio' },
  { id: 'stripe', label: 'Stripe' },
  { id: 'other', label: 'Other' },
];

export const HybridCloudConfig = ({ requirements, onUpdate }: HybridCloudConfigProps) => {
  const [newService, setNewService] = useState<Partial<ExistingService>>({});
  const [showAddService, setShowAddService] = useState(false);

  const toggleHybridMode = (enabled: boolean) => {
    onUpdate({ 
      hybridMode: enabled,
      providerPreferences: enabled ? requirements.providerPreferences || {} : undefined,
      existingServices: enabled ? requirements.existingServices || [] : undefined,
    });
  };

  const updateProviderPreference = (serviceType: string, provider: CloudProvider) => {
    onUpdate({
      providerPreferences: {
        ...requirements.providerPreferences,
        [serviceType]: provider,
      },
    });
  };

  const addExistingService = () => {
    if (newService.name && newService.provider && newService.serviceType) {
      const existingServices = requirements.existingServices || [];
      onUpdate({
        existingServices: [...existingServices, newService as ExistingService],
      });
      setNewService({});
      setShowAddService(false);
    }
  };

  const removeExistingService = (index: number) => {
    const existingServices = [...(requirements.existingServices || [])];
    existingServices.splice(index, 1);
    onUpdate({ existingServices });
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" />
              Hybrid Multi-Cloud Configuration
            </CardTitle>
            <CardDescription>
              Configure provider preferences for a hybrid cloud architecture
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="hybrid-mode" className="text-sm text-muted-foreground">
              Enable Hybrid Mode
            </Label>
            <Switch
              id="hybrid-mode"
              checked={requirements.hybridMode || false}
              onCheckedChange={toggleHybridMode}
            />
          </div>
        </div>
      </CardHeader>

      {requirements.hybridMode && (
        <CardContent className="space-y-6">
          {/* Provider Preferences */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Provider Preferences by Service Type</Label>
            <p className="text-xs text-muted-foreground">
              Select your preferred cloud provider for each service type. Leave empty for best-cost recommendation.
            </p>
            
            <div className="grid gap-3">
              {SERVICE_OPTIONS.map((service) => (
                <div 
                  key={service.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <service.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{service.label}</span>
                  </div>
                  <Select
                    value={requirements.providerPreferences?.[service.id as keyof typeof requirements.providerPreferences] || ''}
                    onValueChange={(value) => updateProviderPreference(service.id, value as CloudProvider)}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="Best cost" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="best">Best Cost</SelectItem>
                      {service.id === 'maps' ? (
                        <>
                          <SelectItem value="gcp">Google Maps</SelectItem>
                          <SelectItem value="azure">Azure Maps</SelectItem>
                          <SelectItem value="aws">AWS Location</SelectItem>
                        </>
                      ) : (
                        PROVIDER_OPTIONS.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Existing Services */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Existing Services</Label>
                <p className="text-xs text-muted-foreground">
                  Add services you're already using that should be included in the architecture
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddService(true)}
                className="gap-1"
              >
                <Plus className="w-3 h-3" />
                Add
              </Button>
            </div>

            {/* Existing services list */}
            {(requirements.existingServices || []).length > 0 && (
              <div className="space-y-2">
                {requirements.existingServices?.map((service, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {service.provider}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">{service.name}</span>
                      <span className="text-xs text-muted-foreground">({service.serviceType})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {service.monthlyCost && (
                        <span className="text-xs text-muted-foreground">
                          ${service.monthlyCost}/mo
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExistingService(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new service form */}
            {showAddService && (
              <div className="p-4 rounded-lg border border-dashed border-border bg-secondary/20 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Service Name</Label>
                    <Input
                      placeholder="e.g., S3 Images Bucket"
                      value={newService.name || ''}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Service Type</Label>
                    <Select
                      value={newService.serviceType || ''}
                      onValueChange={(value) => setNewService({ ...newService, serviceType: value })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_OPTIONS.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Provider</Label>
                    <Select
                      value={newService.provider || ''}
                      onValueChange={(value) => setNewService({ ...newService, provider: value as any })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...PROVIDER_OPTIONS, ...EXTERNAL_PROVIDERS].map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Monthly Cost ($)</Label>
                    <Input
                      type="number"
                      placeholder="Optional"
                      value={newService.monthlyCost || ''}
                      onChange={(e) => setNewService({ ...newService, monthlyCost: parseFloat(e.target.value) || undefined })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddService(false);
                      setNewService({});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={addExistingService}
                    disabled={!newService.name || !newService.provider || !newService.serviceType}
                  >
                    Add Service
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Quick presets */}
          <div className="space-y-3 pt-4 border-t border-border">
            <Label className="text-sm font-medium">Quick Presets</Label>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => {
                  onUpdate({
                    providerPreferences: {
                      storage: 'aws',
                      database: 'azure',
                      compute: 'gcp',
                    },
                    existingServices: [
                      { name: 'Google Maps API', provider: 'google-maps', serviceType: 'maps', monthlyCost: 200 }
                    ],
                  });
                }}
              >
                AWS Storage + Azure DB + GCP Compute + Google Maps
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => {
                  onUpdate({
                    providerPreferences: {
                      storage: 'aws',
                      database: 'aws',
                      compute: 'gcp',
                      cdn: 'gcp',
                    },
                  });
                }}
              >
                AWS Backend + GCP Frontend
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => {
                  onUpdate({
                    providerPreferences: {
                      database: 'azure',
                      compute: 'azure',
                      storage: 'aws',
                      cdn: 'gcp',
                    },
                  });
                }}
              >
                Enterprise Hybrid (Azure Core + AWS Storage)
              </Badge>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
