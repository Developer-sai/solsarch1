import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Copy, 
  Check, 
  Download, 
  FileCode2, 
  Folder,
  ChevronRight,
  Play,
  Terminal,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IaCFile {
  name: string;
  path: string;
  language: 'hcl' | 'yaml' | 'json' | 'typescript';
  content: string;
}

interface IaCPreviewPanelProps {
  format: 'terraform' | 'cloudformation' | 'pulumi' | 'cdk';
  provider: 'aws' | 'azure' | 'gcp' | 'oci';
  files?: IaCFile[];
  onClose?: () => void;
}

const TERRAFORM_EXAMPLE: IaCFile[] = [
  {
    name: 'main.tf',
    path: 'infrastructure/main.tf',
    language: 'hcl',
    content: `# SolsArch Generated Infrastructure
# Provider: AWS | Region: us-east-1

terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "solsarch-tfstate"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "SolsArch"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC Module
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "\${var.project_name}-vpc"
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  enable_nat_gateway     = true
  single_nat_gateway     = var.environment != "production"
  enable_dns_hostnames   = true
  enable_dns_support     = true

  tags = {
    Environment = var.environment
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "\${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  configuration {
    execute_command_configuration {
      logging = "OVERRIDE"
      log_configuration {
        cloud_watch_log_group_name = aws_cloudwatch_log_group.ecs.name
      }
    }
  }
}

# Application Load Balancer
module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 9.0"

  name               = "\${var.project_name}-alb"
  load_balancer_type = "application"
  vpc_id             = module.vpc.vpc_id
  subnets            = module.vpc.public_subnets
  security_groups    = [aws_security_group.alb.id]

  enable_deletion_protection = var.environment == "production"
}`
  },
  {
    name: 'variables.tf',
    path: 'infrastructure/variables.tf',
    language: 'hcl',
    content: `# Variables for SolsArch Infrastructure

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "solsarch"
}

variable "environment" {
  description = "Environment (dev/staging/production)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}`
  },
  {
    name: 'outputs.tf',
    path: 'infrastructure/outputs.tf',
    language: 'hcl',
    content: `# Outputs for SolsArch Infrastructure

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = module.alb.dns_name
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}`
  }
];

export function IaCPreviewPanel({ format, provider, files = TERRAFORM_EXAMPLE, onClose }: IaCPreviewPanelProps) {
  const [selectedFile, setSelectedFile] = useState(files[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const content = files.map(f => `# ${f.path}\n${f.content}`).join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solsarch-${format}-${provider}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFormatInfo = () => {
    switch (format) {
      case 'terraform':
        return { name: 'Terraform', icon: '🏗️', color: 'text-purple-400' };
      case 'cloudformation':
        return { name: 'CloudFormation', icon: '☁️', color: 'text-orange-400' };
      case 'pulumi':
        return { name: 'Pulumi', icon: '🔧', color: 'text-blue-400' };
      case 'cdk':
        return { name: 'AWS CDK', icon: '⚡', color: 'text-yellow-400' };
      default:
        return { name: 'IaC', icon: '📜', color: 'text-primary' };
    }
  };

  const formatInfo = getFormatInfo();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-background/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">{formatInfo.icon}</span>
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-2">
              {formatInfo.name} Code
              <Badge variant="outline" className="text-xs">{provider.toUpperCase()}</Badge>
            </h3>
            <p className="text-xs text-muted-foreground">{files.length} files generated</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownloadAll} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Download
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File Tree */}
        <div className="w-48 border-r border-border bg-muted/30 p-2">
          <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground mb-2">
            <Folder className="w-3.5 h-3.5" />
            <span>infrastructure</span>
          </div>
          {files.map(file => (
            <button
              key={file.path}
              onClick={() => setSelectedFile(file)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm text-left transition-colors",
                selectedFile.path === file.path
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              {file.name}
            </button>
          ))}
        </div>

        {/* Code View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-[#0d1117] border-b border-border/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{selectedFile.path}</span>
            <Badge variant="secondary" className="text-xs">{selectedFile.language}</Badge>
          </div>
          <ScrollArea className="flex-1">
            <pre className="p-4 text-sm font-mono bg-[#0d1117]">
              <code className="text-[#c9d1d9]">
                {selectedFile.content.split('\n').map((line, i) => (
                  <div key={i} className="flex">
                    <span className="w-8 text-right pr-4 text-muted-foreground/50 select-none">
                      {i + 1}
                    </span>
                    <span className={cn(
                      line.startsWith('#') && 'text-green-400',
                      line.includes('=') && !line.startsWith('#') && 'text-blue-300',
                      line.includes('"') && 'text-orange-300'
                    )}>
                      {line || ' '}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
          </ScrollArea>
        </div>
      </div>

      {/* Footer with commands */}
      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Terminal className="w-3.5 h-3.5" />
            <span>Quick commands:</span>
          </div>
          <code className="px-2 py-1 bg-secondary rounded text-primary">terraform init</code>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          <code className="px-2 py-1 bg-secondary rounded text-primary">terraform plan</code>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          <code className="px-2 py-1 bg-secondary rounded text-primary">terraform apply</code>
        </div>
      </div>
    </div>
  );
}
