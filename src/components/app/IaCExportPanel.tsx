import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Check, 
  Download, 
  Cloud, 
  Box, 
  Server,
  FileCode2,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Architecture, Requirements } from '@/types/architecture';

interface IaCExportPanelProps {
  architecture: Architecture;
  requirements: Requirements;
  provider: 'aws' | 'azure' | 'gcp' | 'oci';
}

type IaCFormat = 'terraform' | 'cloudformation' | 'arm' | 'kubernetes' | 'docker';

const IAC_FORMATS: { id: IaCFormat; name: string; icon: React.ReactNode; providers: string[] }[] = [
  { id: 'terraform', name: 'Terraform', icon: <FileCode2 className="w-4 h-4" />, providers: ['aws', 'azure', 'gcp', 'oci'] },
  { id: 'cloudformation', name: 'CloudFormation', icon: <Cloud className="w-4 h-4" />, providers: ['aws'] },
  { id: 'arm', name: 'ARM Template', icon: <Cloud className="w-4 h-4" />, providers: ['azure'] },
  { id: 'kubernetes', name: 'Kubernetes', icon: <Box className="w-4 h-4" />, providers: ['aws', 'azure', 'gcp', 'oci'] },
  { id: 'docker', name: 'Docker Compose', icon: <Server className="w-4 h-4" />, providers: ['aws', 'azure', 'gcp', 'oci'] },
];

export function IaCExportPanel({ architecture, requirements, provider }: IaCExportPanelProps) {
  const [selectedFormat, setSelectedFormat] = useState<IaCFormat>('terraform');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateTerraform = (): string => {
    const providerBlock = {
      aws: `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "${requirements.regions[0] || 'us-east-1'}"
}`,
      azure: `terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}`,
      gcp: `terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = "${requirements.regions[0] || 'us-central1'}"
}`,
      oci: `terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
}

provider "oci" {
  region = "${requirements.regions[0] || 'us-phoenix-1'}"
}`
    };

    const resourceBlocks = architecture.components.map((component, index) => {
      const providerService = component.providers[provider];
      return `
# ${component.name}
# Service: ${providerService.service} (${providerService.sku})
# Estimated Cost: $${providerService.monthlyCost}/month
resource "${provider}_${component.serviceType}_${index}" "component_${index}" {
  name = "${component.name.toLowerCase().replace(/\s+/g, '-')}"
  
  # TODO: Configure specific settings for ${providerService.service}
  # SKU: ${providerService.sku}
  
  tags = {
    Name        = "${component.name}"
    Environment = "production"
    ManagedBy   = "solsarch"
    Variant     = "${architecture.variant}"
  }
}`;
    }).join('\n');

    return `# SolsArch Generated Terraform Configuration
# Architecture: ${architecture.name}
# Variant: ${architecture.variant}
# Provider: ${provider.toUpperCase()}
# Generated: ${new Date().toISOString()}
# Estimated Monthly Cost: $${architecture.totalCosts[provider]}

${providerBlock[provider]}

variable "environment" {
  description = "Environment name"
  default     = "production"
}

${resourceBlocks}

output "architecture_info" {
  value = {
    name       = "${architecture.name}"
    variant    = "${architecture.variant}"
    components = ${architecture.components.length}
    monthly_cost = ${architecture.totalCosts[provider]}
  }
}`;
  };

  const generateCloudFormation = (): string => {
    return `AWSTemplateFormatVersion: '2010-09-09'
Description: |
  SolsArch Generated CloudFormation Template
  Architecture: ${architecture.name}
  Variant: ${architecture.variant}
  Generated: ${new Date().toISOString()}
  Estimated Monthly Cost: $${architecture.totalCosts.aws}

Parameters:
  Environment:
    Type: String
    Default: production
    AllowedValues:
      - development
      - staging
      - production

Resources:
${architecture.components.map((component, index) => `
  ${component.name.replace(/\s+/g, '')}:
    Type: AWS::${getAWSResourceType(component.serviceType)}
    Properties:
      # Service: ${component.providers.aws.service}
      # SKU: ${component.providers.aws.sku}
      # Estimated Cost: $${component.providers.aws.monthlyCost}/month
      Tags:
        - Key: Name
          Value: ${component.name}
        - Key: Environment
          Value: !Ref Environment
        - Key: ManagedBy
          Value: solsarch
`).join('')}

Outputs:
  ArchitectureName:
    Description: Architecture name
    Value: ${architecture.name}
  EstimatedMonthlyCost:
    Description: Estimated monthly cost
    Value: $${architecture.totalCosts.aws}`;
  };

  const generateARM = (): string => {
    return `{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "metadata": {
    "_generator": {
      "name": "solsarch",
      "version": "2.0.0"
    },
    "architecture": "${architecture.name}",
    "variant": "${architecture.variant}",
    "estimatedMonthlyCost": ${architecture.totalCosts.azure}
  },
  "parameters": {
    "environment": {
      "type": "string",
      "defaultValue": "production",
      "allowedValues": ["development", "staging", "production"]
    },
    "location": {
      "type": "string",
      "defaultValue": "[resourceGroup().location]"
    }
  },
  "variables": {
    "architectureName": "${architecture.name.replace(/\s+/g, '-').toLowerCase()}"
  },
  "resources": [
${architecture.components.map((component, index) => `    {
      "type": "Microsoft.Resources/deployments",
      "apiVersion": "2021-04-01",
      "name": "${component.name.replace(/\s+/g, '')}",
      "properties": {
        "mode": "Incremental",
        "template": {
          "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
          "contentVersion": "1.0.0.0",
          "resources": []
        }
      },
      "tags": {
        "component": "${component.name}",
        "serviceType": "${component.serviceType}",
        "service": "${component.providers.azure.service}",
        "sku": "${component.providers.azure.sku}",
        "estimatedCost": "${component.providers.azure.monthlyCost}",
        "managedBy": "solsarch"
      }
    }`).join(',\n')}
  ],
  "outputs": {
    "architectureInfo": {
      "type": "object",
      "value": {
        "name": "${architecture.name}",
        "variant": "${architecture.variant}",
        "componentsCount": ${architecture.components.length},
        "estimatedMonthlyCost": ${architecture.totalCosts.azure}
      }
    }
  }
}`;
  };

  const generateKubernetes = (): string => {
    return `# SolsArch Generated Kubernetes Manifests
# Architecture: ${architecture.name}
# Variant: ${architecture.variant}
# Generated: ${new Date().toISOString()}

---
apiVersion: v1
kind: Namespace
metadata:
  name: ${architecture.name.toLowerCase().replace(/\s+/g, '-')}
  labels:
    managed-by: solsarch
    variant: ${architecture.variant}

${architecture.components.filter(c => ['compute', 'api', 'web'].includes(c.serviceType)).map((component, index) => `---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${component.name.toLowerCase().replace(/\s+/g, '-')}
  namespace: ${architecture.name.toLowerCase().replace(/\s+/g, '-')}
  labels:
    app: ${component.name.toLowerCase().replace(/\s+/g, '-')}
    component: ${component.serviceType}
    managed-by: solsarch
spec:
  replicas: ${getReplicaCount(component.serviceType, requirements)}
  selector:
    matchLabels:
      app: ${component.name.toLowerCase().replace(/\s+/g, '-')}
  template:
    metadata:
      labels:
        app: ${component.name.toLowerCase().replace(/\s+/g, '-')}
    spec:
      containers:
      - name: ${component.name.toLowerCase().replace(/\s+/g, '-')}
        image: placeholder:latest  # TODO: Replace with actual image
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: ${component.name.toLowerCase().replace(/\s+/g, '-')}-svc
  namespace: ${architecture.name.toLowerCase().replace(/\s+/g, '-')}
spec:
  selector:
    app: ${component.name.toLowerCase().replace(/\s+/g, '-')}
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
`).join('\n')}`;
  };

  const generateDockerCompose = (): string => {
    return `# SolsArch Generated Docker Compose
# Architecture: ${architecture.name}
# Variant: ${architecture.variant}
# Generated: ${new Date().toISOString()}

version: '3.8'

services:
${architecture.components.map((component, index) => `
  ${component.name.toLowerCase().replace(/\s+/g, '-')}:
    # ${component.serviceType}: ${component.providers[provider].service}
    image: placeholder:latest  # TODO: Replace with actual image
    container_name: ${component.name.toLowerCase().replace(/\s+/g, '-')}
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - SERVICE_NAME=${component.name}
    ${component.serviceType === 'database' ? `volumes:
      - ${component.name.toLowerCase().replace(/\s+/g, '-')}-data:/var/lib/data` : ''}
    ${component.serviceType === 'compute' || component.serviceType === 'web' ? `ports:
      - "${3000 + index}:8080"` : ''}
    labels:
      - "solsarch.managed=true"
      - "solsarch.component=${component.name}"
      - "solsarch.serviceType=${component.serviceType}"
`).join('')}

${architecture.components.filter(c => c.serviceType === 'database').length > 0 ? `
volumes:
${architecture.components.filter(c => c.serviceType === 'database').map(c => `  ${c.name.toLowerCase().replace(/\s+/g, '-')}-data:`).join('\n')}` : ''}

networks:
  default:
    name: ${architecture.name.toLowerCase().replace(/\s+/g, '-')}-network`;
  };

  const getCode = (): string => {
    switch (selectedFormat) {
      case 'terraform':
        return generateTerraform();
      case 'cloudformation':
        return generateCloudFormation();
      case 'arm':
        return generateARM();
      case 'kubernetes':
        return generateKubernetes();
      case 'docker':
        return generateDockerCompose();
      default:
        return '';
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(getCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: `${IAC_FORMATS.find(f => f.id === selectedFormat)?.name} code copied to clipboard`,
      });
    } catch {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const downloadCode = () => {
    const code = getCode();
    const extensions: Record<IaCFormat, string> = {
      terraform: 'tf',
      cloudformation: 'yaml',
      arm: 'json',
      kubernetes: 'yaml',
      docker: 'yml',
    };
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solsarch-${architecture.variant}-${selectedFormat}.${extensions[selectedFormat]}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Downloaded',
      description: `${IAC_FORMATS.find(f => f.id === selectedFormat)?.name} file saved`,
    });
  };

  const availableFormats = IAC_FORMATS.filter(f => f.providers.includes(provider));

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-primary" />
          Infrastructure as Code Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Format selector */}
        <div className="flex flex-wrap gap-2">
          {availableFormats.map((format) => (
            <Button
              key={format.id}
              variant={selectedFormat === format.id ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
              onClick={() => setSelectedFormat(format.id)}
            >
              {format.icon}
              {format.name}
            </Button>
          ))}
        </div>

        {/* Code preview */}
        <div className="relative">
          <div className="absolute top-2 right-2 flex gap-2 z-10">
            <Button variant="ghost" size="icon" onClick={copyCode}>
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={downloadCode}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
          <pre className="p-4 rounded-lg bg-secondary/50 border border-border overflow-x-auto text-xs max-h-[400px] overflow-y-auto">
            <code className="text-foreground">{getCode()}</code>
          </pre>
        </div>

        {/* Info badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {architecture.components.length} Components
          </Badge>
          <Badge variant="outline">
            ${architecture.totalCosts[provider]}/mo
          </Badge>
          <Badge variant="secondary">
            {provider.toUpperCase()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function getAWSResourceType(serviceType: string): string {
  const mapping: Record<string, string> = {
    compute: 'EC2::Instance',
    database: 'RDS::DBInstance',
    storage: 'S3::Bucket',
    cache: 'ElastiCache::CacheCluster',
    queue: 'SQS::Queue',
    cdn: 'CloudFront::Distribution',
    networking: 'EC2::VPC',
    gpu: 'EC2::Instance',
  };
  return mapping[serviceType] || 'CloudFormation::CustomResource';
}

function getReplicaCount(serviceType: string, requirements: Requirements): number {
  if (requirements.availabilitySLA >= 99.99) return 3;
  if (requirements.availabilitySLA >= 99.9) return 2;
  return 1;
}
