import { Architecture, ArchitectureComponent } from '@/types/architecture';

export interface IaCGeneratorOptions {
  provider: 'aws' | 'azure' | 'gcp' | 'oci';
  region: string;
  projectName: string;
  environment: 'dev' | 'staging' | 'prod';
}

export interface IaCOutput {
  filename: string;
  content: string;
  language: string;
}

// Service type to provider-specific resource mapping
const TERRAFORM_RESOURCE_MAP: Record<string, Record<string, { resource: string; config: (c: ArchitectureComponent, opts: IaCGeneratorOptions) => string }>> = {
  compute: {
    aws: {
      resource: 'aws_instance',
      config: (c, opts) => `
resource "aws_instance" "${sanitizeName(c.name)}" {
  ami           = "ami-0c55b159cbfafe1f0" # Amazon Linux 2
  instance_type = "${c.providers.aws.sku}"
  
  tags = {
    Name        = "${c.name}"
    Environment = "${opts.environment}"
    Project     = "${opts.projectName}"
    ManagedBy   = "terraform"
  }
}
`
    },
    azure: {
      resource: 'azurerm_linux_virtual_machine',
      config: (c, opts) => `
resource "azurerm_linux_virtual_machine" "${sanitizeName(c.name)}" {
  name                = "${sanitizeName(c.name)}-vm"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  size                = "${c.providers.azure.sku}"
  admin_username      = "adminuser"
  
  network_interface_ids = [
    azurerm_network_interface.${sanitizeName(c.name)}.id,
  ]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }

  tags = {
    Environment = "${opts.environment}"
    Project     = "${opts.projectName}"
  }
}
`
    },
    gcp: {
      resource: 'google_compute_instance',
      config: (c, opts) => `
resource "google_compute_instance" "${sanitizeName(c.name)}" {
  name         = "${sanitizeName(c.name)}-instance"
  machine_type = "${c.providers.gcp.sku}"
  zone         = "${opts.region}-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network = "default"
    access_config {
      // Ephemeral public IP
    }
  }

  labels = {
    environment = "${opts.environment}"
    project     = "${opts.projectName}"
  }
}
`
    },
    oci: {
      resource: 'oci_core_instance',
      config: (c, opts) => `
resource "oci_core_instance" "${sanitizeName(c.name)}" {
  availability_domain = data.oci_identity_availability_domain.ad.name
  compartment_id      = var.compartment_id
  display_name        = "${c.name}"
  shape               = "${c.providers.oci.sku}"

  source_details {
    source_type = "image"
    source_id   = var.instance_image_id
  }

  freeform_tags = {
    "Environment" = "${opts.environment}"
    "Project"     = "${opts.projectName}"
  }
}
`
    }
  },
  database: {
    aws: {
      resource: 'aws_db_instance',
      config: (c, opts) => `
resource "aws_db_instance" "${sanitizeName(c.name)}" {
  identifier             = "${sanitizeName(c.name)}-db"
  allocated_storage      = 20
  storage_type           = "gp2"
  engine                 = "postgres"
  engine_version         = "14"
  instance_class         = "${c.providers.aws.sku}"
  db_name                = "${sanitizeName(opts.projectName)}db"
  username               = "admin"
  password               = var.db_password
  parameter_group_name   = "default.postgres14"
  skip_final_snapshot    = true
  publicly_accessible    = false

  tags = {
    Name        = "${c.name}"
    Environment = "${opts.environment}"
  }
}
`
    },
    azure: {
      resource: 'azurerm_postgresql_flexible_server',
      config: (c, opts) => `
resource "azurerm_postgresql_flexible_server" "${sanitizeName(c.name)}" {
  name                   = "${sanitizeName(c.name)}-psql"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "14"
  administrator_login    = "psqladmin"
  administrator_password = var.db_password
  storage_mb             = 32768
  sku_name               = "${c.providers.azure.sku}"

  tags = {
    Environment = "${opts.environment}"
  }
}
`
    },
    gcp: {
      resource: 'google_sql_database_instance',
      config: (c, opts) => `
resource "google_sql_database_instance" "${sanitizeName(c.name)}" {
  name             = "${sanitizeName(c.name)}-sql"
  database_version = "POSTGRES_14"
  region           = "${opts.region}"

  settings {
    tier = "${c.providers.gcp.sku}"
    
    backup_configuration {
      enabled = true
    }
  }

  deletion_protection = false
}
`
    },
    oci: {
      resource: 'oci_database_autonomous_database',
      config: (c, opts) => `
resource "oci_database_autonomous_database" "${sanitizeName(c.name)}" {
  compartment_id           = var.compartment_id
  db_name                  = "${sanitizeName(c.name)}db"
  display_name             = "${c.name}"
  db_workload              = "OLTP"
  is_auto_scaling_enabled  = true
  cpu_core_count           = 1
  data_storage_size_in_tbs = 1
  admin_password           = var.db_password
}
`
    }
  },
  cache: {
    aws: {
      resource: 'aws_elasticache_cluster',
      config: (c, opts) => `
resource "aws_elasticache_cluster" "${sanitizeName(c.name)}" {
  cluster_id           = "${sanitizeName(c.name)}-cache"
  engine               = "redis"
  node_type            = "${c.providers.aws.sku}"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.0"
  port                 = 6379

  tags = {
    Name        = "${c.name}"
    Environment = "${opts.environment}"
  }
}
`
    },
    azure: {
      resource: 'azurerm_redis_cache',
      config: (c, opts) => `
resource "azurerm_redis_cache" "${sanitizeName(c.name)}" {
  name                = "${sanitizeName(c.name)}-redis"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  capacity            = 1
  family              = "C"
  sku_name            = "Basic"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  tags = {
    Environment = "${opts.environment}"
  }
}
`
    },
    gcp: {
      resource: 'google_redis_instance',
      config: (c, opts) => `
resource "google_redis_instance" "${sanitizeName(c.name)}" {
  name           = "${sanitizeName(c.name)}-redis"
  tier           = "BASIC"
  memory_size_gb = 1
  region         = "${opts.region}"
  redis_version  = "REDIS_7_0"

  labels = {
    environment = "${opts.environment}"
  }
}
`
    },
    oci: {
      resource: 'oci_cache_cluster',
      config: (c, opts) => `
# OCI Cache Cluster (Redis compatible)
# Note: OCI Cache with Redis is in Limited Availability
resource "oci_redis_redis_cluster" "${sanitizeName(c.name)}" {
  compartment_id = var.compartment_id
  display_name   = "${c.name}"
  node_count     = 1
  node_memory_in_gbs = 8
  software_version   = "REDIS_7_0"
  subnet_id          = var.subnet_id
}
`
    }
  },
  storage: {
    aws: {
      resource: 'aws_s3_bucket',
      config: (c, opts) => `
resource "aws_s3_bucket" "${sanitizeName(c.name)}" {
  bucket = "${sanitizeName(opts.projectName)}-${sanitizeName(c.name)}-${opts.environment}"

  tags = {
    Name        = "${c.name}"
    Environment = "${opts.environment}"
  }
}

resource "aws_s3_bucket_versioning" "${sanitizeName(c.name)}_versioning" {
  bucket = aws_s3_bucket.${sanitizeName(c.name)}.id
  versioning_configuration {
    status = "Enabled"
  }
}
`
    },
    azure: {
      resource: 'azurerm_storage_account',
      config: (c, opts) => `
resource "azurerm_storage_account" "${sanitizeName(c.name)}" {
  name                     = "${sanitizeName(opts.projectName)}${sanitizeName(c.name)}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
    Environment = "${opts.environment}"
  }
}
`
    },
    gcp: {
      resource: 'google_storage_bucket',
      config: (c, opts) => `
resource "google_storage_bucket" "${sanitizeName(c.name)}" {
  name          = "${sanitizeName(opts.projectName)}-${sanitizeName(c.name)}-${opts.environment}"
  location      = "${opts.region}"
  force_destroy = true

  versioning {
    enabled = true
  }

  labels = {
    environment = "${opts.environment}"
  }
}
`
    },
    oci: {
      resource: 'oci_objectstorage_bucket',
      config: (c, opts) => `
resource "oci_objectstorage_bucket" "${sanitizeName(c.name)}" {
  compartment_id = var.compartment_id
  name           = "${sanitizeName(opts.projectName)}-${sanitizeName(c.name)}"
  namespace      = data.oci_objectstorage_namespace.ns.namespace

  freeform_tags = {
    "Environment" = "${opts.environment}"
  }
}
`
    }
  },
  cdn: {
    aws: {
      resource: 'aws_cloudfront_distribution',
      config: (c, opts) => `
resource "aws_cloudfront_distribution" "${sanitizeName(c.name)}" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  origin {
    domain_name = aws_s3_bucket.${sanitizeName(c.name)}_origin.bucket_regional_domain_name
    origin_id   = "S3-${sanitizeName(c.name)}"
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${sanitizeName(c.name)}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Environment = "${opts.environment}"
  }
}
`
    },
    azure: {
      resource: 'azurerm_cdn_profile',
      config: (c, opts) => `
resource "azurerm_cdn_profile" "${sanitizeName(c.name)}" {
  name                = "${sanitizeName(c.name)}-cdn"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "Standard_Microsoft"

  tags = {
    Environment = "${opts.environment}"
  }
}
`
    },
    gcp: {
      resource: 'google_compute_backend_bucket',
      config: (c, opts) => `
resource "google_compute_backend_bucket" "${sanitizeName(c.name)}" {
  name        = "${sanitizeName(c.name)}-cdn"
  bucket_name = google_storage_bucket.${sanitizeName(c.name)}_origin.name
  enable_cdn  = true
}
`
    },
    oci: {
      resource: 'oci_waa_web_app_acceleration',
      config: (c, opts) => `
# OCI Web Application Acceleration
resource "oci_waa_web_app_acceleration" "${sanitizeName(c.name)}" {
  compartment_id             = var.compartment_id
  backend_type               = "LOAD_BALANCER"
  web_app_acceleration_policy_id = var.waa_policy_id
  load_balancer_id           = var.lb_id
}
`
    }
  },
  queue: {
    aws: {
      resource: 'aws_sqs_queue',
      config: (c, opts) => `
resource "aws_sqs_queue" "${sanitizeName(c.name)}" {
  name                      = "${sanitizeName(c.name)}-queue"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 345600
  receive_wait_time_seconds = 10

  tags = {
    Name        = "${c.name}"
    Environment = "${opts.environment}"
  }
}
`
    },
    azure: {
      resource: 'azurerm_servicebus_queue',
      config: (c, opts) => `
resource "azurerm_servicebus_queue" "${sanitizeName(c.name)}" {
  name         = "${sanitizeName(c.name)}-queue"
  namespace_id = azurerm_servicebus_namespace.main.id
}
`
    },
    gcp: {
      resource: 'google_pubsub_topic',
      config: (c, opts) => `
resource "google_pubsub_topic" "${sanitizeName(c.name)}" {
  name = "${sanitizeName(c.name)}-topic"

  labels = {
    environment = "${opts.environment}"
  }
}

resource "google_pubsub_subscription" "${sanitizeName(c.name)}_sub" {
  name  = "${sanitizeName(c.name)}-subscription"
  topic = google_pubsub_topic.${sanitizeName(c.name)}.name
}
`
    },
    oci: {
      resource: 'oci_streaming_stream',
      config: (c, opts) => `
resource "oci_streaming_stream" "${sanitizeName(c.name)}" {
  compartment_id     = var.compartment_id
  name               = "${sanitizeName(c.name)}-stream"
  partitions         = 1
  retention_in_hours = 24
}
`
    }
  },
  networking: {
    aws: {
      resource: 'aws_vpc',
      config: (c, opts) => `
resource "aws_vpc" "${sanitizeName(c.name)}" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${c.name}"
    Environment = "${opts.environment}"
  }
}

resource "aws_subnet" "${sanitizeName(c.name)}_public" {
  vpc_id                  = aws_vpc.${sanitizeName(c.name)}.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true

  tags = {
    Name = "${c.name}-public"
  }
}
`
    },
    azure: {
      resource: 'azurerm_virtual_network',
      config: (c, opts) => `
resource "azurerm_virtual_network" "${sanitizeName(c.name)}" {
  name                = "${sanitizeName(c.name)}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = {
    Environment = "${opts.environment}"
  }
}

resource "azurerm_subnet" "${sanitizeName(c.name)}_subnet" {
  name                 = "internal"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.${sanitizeName(c.name)}.name
  address_prefixes     = ["10.0.1.0/24"]
}
`
    },
    gcp: {
      resource: 'google_compute_network',
      config: (c, opts) => `
resource "google_compute_network" "${sanitizeName(c.name)}" {
  name                    = "${sanitizeName(c.name)}-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "${sanitizeName(c.name)}_subnet" {
  name          = "${sanitizeName(c.name)}-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = "${opts.region}"
  network       = google_compute_network.${sanitizeName(c.name)}.id
}
`
    },
    oci: {
      resource: 'oci_core_vcn',
      config: (c, opts) => `
resource "oci_core_vcn" "${sanitizeName(c.name)}" {
  compartment_id = var.compartment_id
  cidr_blocks    = ["10.0.0.0/16"]
  display_name   = "${c.name}"
  dns_label      = "${sanitizeName(c.name)}"
}

resource "oci_core_subnet" "${sanitizeName(c.name)}_subnet" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.${sanitizeName(c.name)}.id
  cidr_block     = "10.0.1.0/24"
  display_name   = "${c.name}-subnet"
}
`
    }
  }
};

function sanitizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

function getProviderBlock(provider: string, region: string): string {
  switch (provider) {
    case 'aws':
      return `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "${region}"
}
`;
    case 'azure':
      return `terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = "${region}"
}
`;
    case 'gcp':
      return `terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = "${region}"
}
`;
    case 'oci':
      return `terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
}

provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = "${region}"
}
`;
    default:
      return '';
  }
}

function getVariablesBlock(provider: string): string {
  const commonVars = `
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}
`;

  switch (provider) {
    case 'aws':
      return commonVars;
    case 'azure':
      return commonVars + `
variable "resource_group_name" {
  description = "Azure Resource Group name"
  type        = string
}
`;
    case 'gcp':
      return commonVars + `
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}
`;
    case 'oci':
      return commonVars + `
variable "tenancy_ocid" {
  description = "OCI Tenancy OCID"
  type        = string
}

variable "user_ocid" {
  description = "OCI User OCID"
  type        = string
}

variable "fingerprint" {
  description = "API Key fingerprint"
  type        = string
}

variable "private_key_path" {
  description = "Path to OCI API private key"
  type        = string
}

variable "compartment_id" {
  description = "OCI Compartment ID"
  type        = string
}
`;
    default:
      return commonVars;
  }
}

export function generateTerraform(architecture: Architecture, options: IaCGeneratorOptions): IaCOutput[] {
  const outputs: IaCOutput[] = [];
  const { provider, region, projectName, environment } = options;

  // Main configuration
  let mainContent = `# Terraform configuration for ${architecture.name}
# Generated by SolsArch - ${new Date().toISOString()}
# Provider: ${provider.toUpperCase()}
# Environment: ${environment}

${getProviderBlock(provider, region)}
`;

  // Generate resources for each component
  for (const component of architecture.components) {
    const serviceType = component.serviceType.toLowerCase();
    const resourceMap = TERRAFORM_RESOURCE_MAP[serviceType];
    
    if (resourceMap && resourceMap[provider]) {
      mainContent += resourceMap[provider].config(component, options);
    } else {
      // Fallback comment for unsupported service types
      mainContent += `
# TODO: ${component.name} (${component.serviceType})
# Service: ${component.providers[provider as keyof typeof component.providers]?.service || 'Unknown'}
# SKU: ${component.providers[provider as keyof typeof component.providers]?.sku || 'Unknown'}
`;
    }
  }

  outputs.push({
    filename: 'main.tf',
    content: mainContent,
    language: 'hcl'
  });

  // Variables file
  outputs.push({
    filename: 'variables.tf',
    content: `# Variables for ${architecture.name}
# Generated by SolsArch

${getVariablesBlock(provider)}
`,
    language: 'hcl'
  });

  // Outputs file
  let outputsContent = `# Outputs for ${architecture.name}
# Generated by SolsArch

`;
  
  for (const component of architecture.components) {
    const safeName = sanitizeName(component.name);
    outputsContent += `# output "${safeName}_id" {
#   description = "${component.name} resource ID"
#   value       = <resource>.${safeName}.id
# }

`;
  }

  outputs.push({
    filename: 'outputs.tf',
    content: outputsContent,
    language: 'hcl'
  });

  // Terraform.tfvars example
  outputs.push({
    filename: 'terraform.tfvars.example',
    content: `# Example variable values for ${architecture.name}
# Copy this to terraform.tfvars and fill in your values

environment = "${environment}"
db_password = "CHANGE_ME_SECURE_PASSWORD"
${provider === 'azure' ? 'resource_group_name = "solsarch-rg"' : ''}
${provider === 'gcp' ? 'project_id = "your-gcp-project-id"' : ''}
${provider === 'oci' ? `tenancy_ocid     = "ocid1.tenancy.oc1..example"
user_ocid        = "ocid1.user.oc1..example"
fingerprint      = "xx:xx:xx:xx:xx"
private_key_path = "~/.oci/oci_api_key.pem"
compartment_id   = "ocid1.compartment.oc1..example"` : ''}
`,
    language: 'hcl'
  });

  return outputs;
}
