import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Requirements } from '@/types/architecture';
import { 
  Rocket, 
  Users, 
  Zap, 
  Database, 
  Clock, 
  Shield, 
  Globe, 
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface RequirementsWizardProps {
  onSubmit: (requirements: Requirements) => void;
  isLoading: boolean;
}

const APP_TYPES = [
  { id: 'saas', label: 'SaaS Application', icon: Rocket },
  { id: 'ai-inference', label: 'AI/ML Inference', icon: Sparkles },
  { id: 'data-pipeline', label: 'Data Pipeline', icon: Database },
  { id: 'e-commerce', label: 'E-Commerce', icon: DollarSign },
  { id: 'gaming', label: 'Gaming Backend', icon: Zap },
  { id: 'iot', label: 'IoT Platform', icon: Globe },
];

const REGIONS = [
  { id: 'us-east', label: 'US East' },
  { id: 'us-west', label: 'US West' },
  { id: 'eu-west', label: 'EU West' },
  { id: 'eu-central', label: 'EU Central' },
  { id: 'ap-south', label: 'Asia Pacific (Mumbai)' },
  { id: 'ap-southeast', label: 'Asia Pacific (Singapore)' },
];

const COMPLIANCE = [
  { id: 'soc2', label: 'SOC 2' },
  { id: 'gdpr', label: 'GDPR' },
  { id: 'hipaa', label: 'HIPAA' },
  { id: 'pci-dss', label: 'PCI DSS' },
  { id: 'iso27001', label: 'ISO 27001' },
  { id: 'dpdp', label: 'India DPDP' },
];

export const RequirementsWizard = ({ onSubmit, isLoading }: RequirementsWizardProps) => {
  const [step, setStep] = useState(1);
  const [requirements, setRequirements] = useState<Requirements>({
    appType: '',
    expectedUsers: 10000,
    requestsPerSecond: 100,
    dataSizeGB: 100,
    latencyTargetMs: 200,
    availabilitySLA: 99.9,
    regions: [],
    compliance: [],
    budgetMin: 500,
    budgetMax: 5000,
    additionalNotes: '',
  });

  const updateRequirements = (updates: Partial<Requirements>) => {
    setRequirements(prev => ({ ...prev, ...updates }));
  };

  const toggleArrayItem = (key: 'regions' | 'compliance', item: string) => {
    setRequirements(prev => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter(i => i !== item)
        : [...prev[key], item],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return requirements.appType !== '';
      case 2: return true;
      case 3: return requirements.regions.length > 0;
      case 4: return true;
      default: return true;
    }
  };

  const handleSubmit = () => {
    onSubmit(requirements);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                s === step
                  ? 'border-primary bg-primary text-primary-foreground'
                  : s < step
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-border bg-card text-muted-foreground'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
        <div className="h-1 bg-secondary rounded-full">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: App Type */}
      {step === 1 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              What are you building?
            </CardTitle>
            <CardDescription>
              Select the type of application to get optimized architecture recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {APP_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => updateRequirements({ appType: type.id })}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    requirements.appType === type.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-secondary/30 hover:border-muted-foreground'
                  }`}
                >
                  <type.icon className={`w-8 h-8 ${
                    requirements.appType === type.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <span className="font-medium text-foreground">{type.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Scale & Performance */}
      {step === 2 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Scale & Performance Requirements
            </CardTitle>
            <CardDescription>
              Define your expected traffic and performance needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Expected Monthly Users
              </Label>
              <Input
                type="number"
                value={requirements.expectedUsers}
                onChange={(e) => updateRequirements({ expectedUsers: parseInt(e.target.value) || 0 })}
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Requests per Second (Peak)
              </Label>
              <Input
                type="number"
                value={requirements.requestsPerSecond}
                onChange={(e) => updateRequirements({ requestsPerSecond: parseInt(e.target.value) || 0 })}
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Data Size (GB)
              </Label>
              <Input
                type="number"
                value={requirements.dataSizeGB}
                onChange={(e) => updateRequirements({ dataSizeGB: parseInt(e.target.value) || 0 })}
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Latency Target: {requirements.latencyTargetMs}ms
              </Label>
              <Slider
                value={[requirements.latencyTargetMs]}
                onValueChange={([v]) => updateRequirements({ latencyTargetMs: v })}
                min={10}
                max={1000}
                step={10}
                className="py-2"
              />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Availability SLA: {requirements.availabilitySLA}%
              </Label>
              <Slider
                value={[requirements.availabilitySLA]}
                onValueChange={([v]) => updateRequirements({ availabilitySLA: v })}
                min={99}
                max={99.99}
                step={0.01}
                className="py-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Regions & Compliance */}
      {step === 3 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Regions & Compliance
            </CardTitle>
            <CardDescription>
              Select deployment regions and compliance requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Deployment Regions</Label>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map((region) => (
                  <Badge
                    key={region.id}
                    variant={requirements.regions.includes(region.id) ? 'default' : 'outline'}
                    className="cursor-pointer px-3 py-1.5"
                    onClick={() => toggleArrayItem('regions', region.id)}
                  >
                    {region.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Compliance Requirements</Label>
              <div className="flex flex-wrap gap-2">
                {COMPLIANCE.map((comp) => (
                  <Badge
                    key={comp.id}
                    variant={requirements.compliance.includes(comp.id) ? 'default' : 'outline'}
                    className="cursor-pointer px-3 py-1.5"
                    onClick={() => toggleArrayItem('compliance', comp.id)}
                  >
                    {comp.label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Budget & Notes */}
      {step === 4 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Budget & Additional Details
            </CardTitle>
            <CardDescription>
              Set your budget range and any additional requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Minimum Monthly Budget ($)</Label>
                <Input
                  type="number"
                  value={requirements.budgetMin}
                  onChange={(e) => updateRequirements({ budgetMin: parseInt(e.target.value) || 0 })}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-3">
                <Label>Maximum Monthly Budget ($)</Label>
                <Input
                  type="number"
                  value={requirements.budgetMax}
                  onChange={(e) => updateRequirements({ budgetMax: parseInt(e.target.value) || 0 })}
                  className="bg-secondary border-border"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Additional Notes</Label>
              <Textarea
                value={requirements.additionalNotes}
                onChange={(e) => updateRequirements({ additionalNotes: e.target.value })}
                placeholder="Any specific requirements, constraints, or preferences..."
                className="bg-secondary border-border min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 1}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {step < 4 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-2 bg-gradient-to-r from-primary to-info"
          >
            <Sparkles className="w-4 h-4" />
            Generate Architecture
          </Button>
        )}
      </div>
    </div>
  );
};
