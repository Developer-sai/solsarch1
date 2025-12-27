import { Architecture, ArchitectureComponent } from '@/types/architecture';

export interface ARMTemplateOutput {
    filename: string;
    content: string;
    language: string;
}

interface ARMTemplate {
    $schema: string;
    contentVersion: string;
    parameters: Record<string, unknown>;
    variables: Record<string, unknown>;
    resources: unknown[];
    outputs: Record<string, unknown>;
}

function sanitizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getResourceForComponent(component: ArchitectureComponent, location: string): unknown[] {
    const serviceType = component.serviceType.toLowerCase();
    const name = sanitizeName(component.name);

    switch (serviceType) {
        case 'compute':
            return [
                {
                    type: 'Microsoft.Network/networkInterfaces',
                    apiVersion: '2023-05-01',
                    name: `${name}-nic`,
                    location: location,
                    properties: {
                        ipConfigurations: [
                            {
                                name: 'ipconfig1',
                                properties: {
                                    subnet: {
                                        id: "[resourceId('Microsoft.Network/virtualNetworks/subnets', variables('vnetName'), 'default')]"
                                    },
                                    privateIPAllocationMethod: 'Dynamic'
                                }
                            }
                        ]
                    }
                },
                {
                    type: 'Microsoft.Compute/virtualMachines',
                    apiVersion: '2023-07-01',
                    name: `${name}-vm`,
                    location: location,
                    dependsOn: [
                        `[resourceId('Microsoft.Network/networkInterfaces', '${name}-nic')]`
                    ],
                    properties: {
                        hardwareProfile: {
                            vmSize: component.providers.azure.sku || 'Standard_B2s'
                        },
                        storageProfile: {
                            imageReference: {
                                publisher: 'Canonical',
                                offer: 'UbuntuServer',
                                sku: '18.04-LTS',
                                version: 'latest'
                            },
                            osDisk: {
                                createOption: 'FromImage',
                                managedDisk: {
                                    storageAccountType: 'Standard_LRS'
                                }
                            }
                        },
                        osProfile: {
                            computerName: `${name}-vm`,
                            adminUsername: "[parameters('adminUsername')]",
                            adminPassword: "[parameters('adminPassword')]"
                        },
                        networkProfile: {
                            networkInterfaces: [
                                {
                                    id: `[resourceId('Microsoft.Network/networkInterfaces', '${name}-nic')]`
                                }
                            ]
                        }
                    },
                    tags: {
                        component: component.name,
                        managedBy: 'arm-template'
                    }
                }
            ];

        case 'database':
            return [
                {
                    type: 'Microsoft.DBforPostgreSQL/flexibleServers',
                    apiVersion: '2023-03-01-preview',
                    name: `${name}-psql`,
                    location: location,
                    sku: {
                        name: component.providers.azure.sku || 'Standard_B1ms',
                        tier: 'Burstable'
                    },
                    properties: {
                        version: '14',
                        administratorLogin: "[parameters('dbAdminUsername')]",
                        administratorLoginPassword: "[parameters('dbAdminPassword')]",
                        storage: {
                            storageSizeGB: 32
                        },
                        backup: {
                            backupRetentionDays: 7,
                            geoRedundantBackup: 'Disabled'
                        }
                    },
                    tags: {
                        component: component.name
                    }
                }
            ];

        case 'cache':
            return [
                {
                    type: 'Microsoft.Cache/redis',
                    apiVersion: '2023-08-01',
                    name: `${name}-redis`,
                    location: location,
                    properties: {
                        sku: {
                            name: 'Basic',
                            family: 'C',
                            capacity: 0
                        },
                        enableNonSslPort: false,
                        minimumTlsVersion: '1.2'
                    },
                    tags: {
                        component: component.name
                    }
                }
            ];

        case 'storage':
            return [
                {
                    type: 'Microsoft.Storage/storageAccounts',
                    apiVersion: '2023-01-01',
                    name: `${name}storage`,
                    location: location,
                    sku: {
                        name: 'Standard_LRS'
                    },
                    kind: 'StorageV2',
                    properties: {
                        accessTier: 'Hot',
                        supportsHttpsTrafficOnly: true,
                        minimumTlsVersion: 'TLS1_2'
                    },
                    tags: {
                        component: component.name
                    }
                }
            ];

        case 'queue':
            return [
                {
                    type: 'Microsoft.ServiceBus/namespaces',
                    apiVersion: '2022-10-01-preview',
                    name: `${name}-sb`,
                    location: location,
                    sku: {
                        name: 'Standard',
                        tier: 'Standard'
                    },
                    properties: {},
                    tags: {
                        component: component.name
                    }
                },
                {
                    type: 'Microsoft.ServiceBus/namespaces/queues',
                    apiVersion: '2022-10-01-preview',
                    name: `${name}-sb/${name}-queue`,
                    dependsOn: [
                        `[resourceId('Microsoft.ServiceBus/namespaces', '${name}-sb')]`
                    ],
                    properties: {
                        maxSizeInMegabytes: 1024,
                        defaultMessageTimeToLive: 'P14D'
                    }
                }
            ];

        case 'cdn':
            return [
                {
                    type: 'Microsoft.Cdn/profiles',
                    apiVersion: '2023-05-01',
                    name: `${name}-cdn`,
                    location: 'global',
                    sku: {
                        name: 'Standard_Microsoft'
                    },
                    properties: {},
                    tags: {
                        component: component.name
                    }
                }
            ];

        case 'networking':
            return [
                {
                    type: 'Microsoft.Network/virtualNetworks',
                    apiVersion: '2023-05-01',
                    name: `${name}-vnet`,
                    location: location,
                    properties: {
                        addressSpace: {
                            addressPrefixes: ['10.0.0.0/16']
                        },
                        subnets: [
                            {
                                name: 'default',
                                properties: {
                                    addressPrefix: '10.0.1.0/24'
                                }
                            }
                        ]
                    },
                    tags: {
                        component: component.name
                    }
                }
            ];

        default:
            return [];
    }
}

export function generateARMTemplate(architecture: Architecture, projectName: string, environment: string): ARMTemplateOutput[] {
    const location = '[resourceGroup().location]';

    const template: ARMTemplate = {
        $schema: 'https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#',
        contentVersion: '1.0.0.0',
        parameters: {
            adminUsername: {
                type: 'string',
                metadata: {
                    description: 'Admin username for VMs'
                }
            },
            adminPassword: {
                type: 'securestring',
                metadata: {
                    description: 'Admin password for VMs'
                }
            },
            dbAdminUsername: {
                type: 'string',
                defaultValue: 'dbadmin',
                metadata: {
                    description: 'Database admin username'
                }
            },
            dbAdminPassword: {
                type: 'securestring',
                metadata: {
                    description: 'Database admin password'
                }
            },
            environment: {
                type: 'string',
                defaultValue: environment,
                allowedValues: ['dev', 'staging', 'prod'],
                metadata: {
                    description: 'Environment name'
                }
            }
        },
        variables: {
            vnetName: `${sanitizeName(projectName)}-vnet`,
            location: '[resourceGroup().location]'
        },
        resources: [],
        outputs: {}
    };

    // Generate resources for each component
    for (const component of architecture.components) {
        const resources = getResourceForComponent(component, location);
        template.resources.push(...resources);
    }

    // Add outputs
    let outputIndex = 0;
    for (const component of architecture.components) {
        const name = sanitizeName(component.name);
        template.outputs[`${name}ResourceId`] = {
            type: 'string',
            value: `[resourceId('Microsoft.Resources/resourceGroups', resourceGroup().name)]`
        };
        outputIndex++;
    }

    const outputs: ARMTemplateOutput[] = [];

    // Main template
    outputs.push({
        filename: `${projectName.toLowerCase()}-${architecture.variant}.arm.json`,
        content: JSON.stringify(template, null, 2),
        language: 'json'
    });

    // Parameters file
    const parametersFile = {
        $schema: 'https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#',
        contentVersion: '1.0.0.0',
        parameters: {
            adminUsername: {
                value: 'azureuser'
            },
            adminPassword: {
                value: 'CHANGE_ME_SECURE_PASSWORD'
            },
            dbAdminUsername: {
                value: 'dbadmin'
            },
            dbAdminPassword: {
                value: 'CHANGE_ME_DB_PASSWORD'
            },
            environment: {
                value: environment
            }
        }
    };

    outputs.push({
        filename: `${projectName.toLowerCase()}-${architecture.variant}.parameters.json`,
        content: JSON.stringify(parametersFile, null, 2),
        language: 'json'
    });

    // Deployment script
    const deployScript = `#!/bin/bash
# Deployment script for ${architecture.name}
# Generated by SolsArch

RESOURCE_GROUP="${projectName.toLowerCase()}-rg"
LOCATION="eastus"
TEMPLATE_FILE="${projectName.toLowerCase()}-${architecture.variant}.arm.json"
PARAMETERS_FILE="${projectName.toLowerCase()}-${architecture.variant}.parameters.json"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Deploy template
az deployment group create \\
  --resource-group $RESOURCE_GROUP \\
  --template-file $TEMPLATE_FILE \\
  --parameters @$PARAMETERS_FILE

echo "Deployment complete!"
`;

    outputs.push({
        filename: 'deploy.sh',
        content: deployScript,
        language: 'bash'
    });

    return outputs;
}
