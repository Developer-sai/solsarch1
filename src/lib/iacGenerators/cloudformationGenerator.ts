import { Architecture, ArchitectureComponent } from '@/types/architecture';

export interface CloudFormationOutput {
    filename: string;
    content: string;
    language: string;
}

interface CloudFormationTemplate {
    AWSTemplateFormatVersion: string;
    Description: string;
    Parameters: Record<string, unknown>;
    Resources: Record<string, unknown>;
    Outputs: Record<string, unknown>;
}

function sanitizeName(name: string): string {
    return name.replace(/[^a-zA-Z0-9]/g, '');
}

function getResourceForComponent(component: ArchitectureComponent): Record<string, unknown> | null {
    const serviceType = component.serviceType.toLowerCase();
    const name = sanitizeName(component.name);

    switch (serviceType) {
        case 'compute':
            return {
                [`${name}Instance`]: {
                    Type: 'AWS::EC2::Instance',
                    Properties: {
                        ImageId: { Ref: 'LatestAmiId' },
                        InstanceType: component.providers.aws.sku || 't3.medium',
                        Tags: [
                            { Key: 'Name', Value: component.name },
                            { Key: 'ManagedBy', Value: 'CloudFormation' }
                        ]
                    }
                }
            };

        case 'database':
            return {
                [`${name}Database`]: {
                    Type: 'AWS::RDS::DBInstance',
                    Properties: {
                        DBInstanceIdentifier: `${name.toLowerCase()}-db`,
                        DBInstanceClass: component.providers.aws.sku || 'db.t3.medium',
                        Engine: 'postgres',
                        EngineVersion: '14',
                        MasterUsername: { Ref: 'DBUsername' },
                        MasterUserPassword: { Ref: 'DBPassword' },
                        AllocatedStorage: 20,
                        StorageType: 'gp2',
                        PubliclyAccessible: false,
                        Tags: [
                            { Key: 'Name', Value: component.name }
                        ]
                    }
                }
            };

        case 'cache':
            return {
                [`${name}Cache`]: {
                    Type: 'AWS::ElastiCache::CacheCluster',
                    Properties: {
                        ClusterName: `${name.toLowerCase()}-cache`,
                        CacheNodeType: component.providers.aws.sku || 'cache.t3.micro',
                        Engine: 'redis',
                        NumCacheNodes: 1,
                        Port: 6379,
                        Tags: [
                            { Key: 'Name', Value: component.name }
                        ]
                    }
                }
            };

        case 'storage':
            return {
                [`${name}Bucket`]: {
                    Type: 'AWS::S3::Bucket',
                    Properties: {
                        BucketName: { 'Fn::Sub': `\${AWS::StackName}-${name.toLowerCase()}` },
                        VersioningConfiguration: {
                            Status: 'Enabled'
                        },
                        Tags: [
                            { Key: 'Name', Value: component.name }
                        ]
                    }
                }
            };

        case 'queue':
            return {
                [`${name}Queue`]: {
                    Type: 'AWS::SQS::Queue',
                    Properties: {
                        QueueName: `${name.toLowerCase()}-queue`,
                        MessageRetentionPeriod: 345600,
                        VisibilityTimeout: 30,
                        Tags: [
                            { Key: 'Name', Value: component.name }
                        ]
                    }
                }
            };

        case 'cdn':
            return {
                [`${name}Distribution`]: {
                    Type: 'AWS::CloudFront::Distribution',
                    Properties: {
                        DistributionConfig: {
                            Enabled: true,
                            DefaultRootObject: 'index.html',
                            Origins: [
                                {
                                    Id: `S3-${name}`,
                                    DomainName: { 'Fn::GetAtt': [`${name}Bucket`, 'RegionalDomainName'] },
                                    S3OriginConfig: {
                                        OriginAccessIdentity: ''
                                    }
                                }
                            ],
                            DefaultCacheBehavior: {
                                TargetOriginId: `S3-${name}`,
                                ViewerProtocolPolicy: 'redirect-to-https',
                                AllowedMethods: ['GET', 'HEAD'],
                                CachedMethods: ['GET', 'HEAD'],
                                ForwardedValues: {
                                    QueryString: false,
                                    Cookies: { Forward: 'none' }
                                }
                            }
                        },
                        Tags: [
                            { Key: 'Name', Value: component.name }
                        ]
                    }
                }
            };

        case 'networking':
            return {
                [`${name}VPC`]: {
                    Type: 'AWS::EC2::VPC',
                    Properties: {
                        CidrBlock: '10.0.0.0/16',
                        EnableDnsHostnames: true,
                        EnableDnsSupport: true,
                        Tags: [
                            { Key: 'Name', Value: component.name }
                        ]
                    }
                },
                [`${name}PublicSubnet`]: {
                    Type: 'AWS::EC2::Subnet',
                    Properties: {
                        VpcId: { Ref: `${name}VPC` },
                        CidrBlock: '10.0.1.0/24',
                        MapPublicIpOnLaunch: true,
                        Tags: [
                            { Key: 'Name', Value: `${component.name}-public` }
                        ]
                    }
                }
            };

        default:
            return null;
    }
}

export function generateCloudFormation(architecture: Architecture, projectName: string, environment: string): CloudFormationOutput[] {
    const template: CloudFormationTemplate = {
        AWSTemplateFormatVersion: '2010-09-09',
        Description: `CloudFormation template for ${architecture.name} - Generated by SolsArch`,
        Parameters: {
            Environment: {
                Type: 'String',
                Default: environment,
                AllowedValues: ['dev', 'staging', 'prod'],
                Description: 'Environment name'
            },
            LatestAmiId: {
                Type: 'AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>',
                Default: '/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2',
                Description: 'Latest Amazon Linux 2 AMI'
            },
            DBUsername: {
                Type: 'String',
                Default: 'admin',
                Description: 'Database admin username',
                NoEcho: true
            },
            DBPassword: {
                Type: 'String',
                Description: 'Database admin password',
                NoEcho: true,
                MinLength: 8
            }
        },
        Resources: {},
        Outputs: {}
    };

    // Generate resources for each component
    for (const component of architecture.components) {
        const resources = getResourceForComponent(component);
        if (resources) {
            Object.assign(template.Resources, resources);

            // Add outputs
            for (const resourceName of Object.keys(resources)) {
                template.Outputs[`${resourceName}Id`] = {
                    Description: `${component.name} resource ID`,
                    Value: { Ref: resourceName },
                    Export: {
                        Name: { 'Fn::Sub': `\${AWS::StackName}-${resourceName}` }
                    }
                };
            }
        }
    }

    // Generate both JSON and YAML versions
    const outputs: CloudFormationOutput[] = [];

    // JSON version
    outputs.push({
        filename: `${projectName.toLowerCase()}-${architecture.variant}.json`,
        content: JSON.stringify(template, null, 2),
        language: 'json'
    });

    // YAML version
    const yamlContent = `# CloudFormation template for ${architecture.name}
# Generated by SolsArch - ${new Date().toISOString()}
# Variant: ${architecture.variant}

AWSTemplateFormatVersion: '2010-09-09'
Description: ${template.Description}

Parameters:
${Object.entries(template.Parameters).map(([key, value]) => {
        const v = value as Record<string, unknown>;
        return `  ${key}:
    Type: ${v.Type}
${v.Default ? `    Default: ${v.Default}` : ''}
${v.Description ? `    Description: ${v.Description}` : ''}
${v.NoEcho ? '    NoEcho: true' : ''}
${v.MinLength ? `    MinLength: ${v.MinLength}` : ''}
${(v.AllowedValues as string[] | undefined) ? `    AllowedValues:\n${(v.AllowedValues as string[]).map(av => `      - ${av}`).join('\n')}` : ''}`;
    }).join('\n\n')}

Resources:
${Object.entries(template.Resources).map(([key, value]) => {
        const v = value as Record<string, unknown>;
        return `  ${key}:
    Type: ${v.Type}
    Properties:
      # See JSON version for full properties`;
    }).join('\n\n')}

Outputs:
${Object.entries(template.Outputs).map(([key, value]) => {
        const v = value as Record<string, unknown>;
        return `  ${key}:
    Description: ${v.Description}
    Value: !Ref ${key.replace('Id', '')}`;
    }).join('\n\n')}
`;

    outputs.push({
        filename: `${projectName.toLowerCase()}-${architecture.variant}.yaml`,
        content: yamlContent,
        language: 'yaml'
    });

    return outputs;
}
