import { Architecture, ArchitectureComponent } from '@/types/architecture';

export interface KubernetesOutput {
    filename: string;
    content: string;
    language: string;
}

interface K8sManifest {
    apiVersion: string;
    kind: string;
    metadata: {
        name: string;
        labels?: Record<string, string>;
        namespace?: string;
        annotations?: Record<string, string>;
    };
    spec?: unknown;
    data?: unknown;
}

function sanitizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function getDeploymentForComponent(component: ArchitectureComponent, namespace: string): K8sManifest[] {
    const serviceType = component.serviceType.toLowerCase();
    const name = sanitizeName(component.name);

    const commonLabels = {
        app: name,
        component: serviceType,
        'managed-by': 'solsarch'
    };

    switch (serviceType) {
        case 'compute':
            return [
                {
                    apiVersion: 'apps/v1',
                    kind: 'Deployment',
                    metadata: {
                        name: `${name}-deployment`,
                        namespace,
                        labels: commonLabels
                    },
                    spec: {
                        replicas: 2,
                        selector: {
                            matchLabels: { app: name }
                        },
                        template: {
                            metadata: {
                                labels: { app: name }
                            },
                            spec: {
                                containers: [
                                    {
                                        name,
                                        image: `${name}:latest`,
                                        ports: [{ containerPort: 8080 }],
                                        resources: {
                                            requests: {
                                                cpu: '100m',
                                                memory: '128Mi'
                                            },
                                            limits: {
                                                cpu: '500m',
                                                memory: '512Mi'
                                            }
                                        },
                                        livenessProbe: {
                                            httpGet: {
                                                path: '/health',
                                                port: 8080
                                            },
                                            initialDelaySeconds: 30,
                                            periodSeconds: 10
                                        },
                                        readinessProbe: {
                                            httpGet: {
                                                path: '/ready',
                                                port: 8080
                                            },
                                            initialDelaySeconds: 5,
                                            periodSeconds: 5
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                {
                    apiVersion: 'v1',
                    kind: 'Service',
                    metadata: {
                        name: `${name}-service`,
                        namespace,
                        labels: commonLabels
                    },
                    spec: {
                        selector: { app: name },
                        ports: [
                            {
                                protocol: 'TCP',
                                port: 80,
                                targetPort: 8080
                            }
                        ],
                        type: 'ClusterIP'
                    }
                },
                {
                    apiVersion: 'autoscaling/v2',
                    kind: 'HorizontalPodAutoscaler',
                    metadata: {
                        name: `${name}-hpa`,
                        namespace,
                        labels: commonLabels
                    },
                    spec: {
                        scaleTargetRef: {
                            apiVersion: 'apps/v1',
                            kind: 'Deployment',
                            name: `${name}-deployment`
                        },
                        minReplicas: 2,
                        maxReplicas: 10,
                        metrics: [
                            {
                                type: 'Resource',
                                resource: {
                                    name: 'cpu',
                                    target: {
                                        type: 'Utilization',
                                        averageUtilization: 70
                                    }
                                }
                            }
                        ]
                    }
                }
            ];

        case 'database':
            return [
                {
                    apiVersion: 'v1',
                    kind: 'PersistentVolumeClaim',
                    metadata: {
                        name: `${name}-pvc`,
                        namespace,
                        labels: commonLabels
                    },
                    spec: {
                        accessModes: ['ReadWriteOnce'],
                        resources: {
                            requests: {
                                storage: '10Gi'
                            }
                        }
                    }
                },
                {
                    apiVersion: 'apps/v1',
                    kind: 'StatefulSet',
                    metadata: {
                        name: `${name}-statefulset`,
                        namespace,
                        labels: commonLabels
                    },
                    spec: {
                        serviceName: `${name}-service`,
                        replicas: 1,
                        selector: {
                            matchLabels: { app: name }
                        },
                        template: {
                            metadata: {
                                labels: { app: name }
                            },
                            spec: {
                                containers: [
                                    {
                                        name: 'postgres',
                                        image: 'postgres:14',
                                        ports: [{ containerPort: 5432 }],
                                        env: [
                                            {
                                                name: 'POSTGRES_PASSWORD',
                                                valueFrom: {
                                                    secretKeyRef: {
                                                        name: `${name}-secret`,
                                                        key: 'password'
                                                    }
                                                }
                                            },
                                            {
                                                name: 'POSTGRES_DB',
                                                value: name
                                            }
                                        ],
                                        volumeMounts: [
                                            {
                                                name: 'data',
                                                mountPath: '/var/lib/postgresql/data'
                                            }
                                        ],
                                        resources: {
                                            requests: {
                                                cpu: '250m',
                                                memory: '256Mi'
                                            },
                                            limits: {
                                                cpu: '1',
                                                memory: '1Gi'
                                            }
                                        }
                                    }
                                ],
                                volumes: [
                                    {
                                        name: 'data',
                                        persistentVolumeClaim: {
                                            claimName: `${name}-pvc`
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                {
                    apiVersion: 'v1',
                    kind: 'Service',
                    metadata: {
                        name: `${name}-service`,
                        namespace,
                        labels: commonLabels
                    },
                    spec: {
                        selector: { app: name },
                        ports: [
                            {
                                protocol: 'TCP',
                                port: 5432,
                                targetPort: 5432
                            }
                        ],
                        type: 'ClusterIP'
                    }
                },
                {
                    apiVersion: 'v1',
                    kind: 'Secret',
                    metadata: {
                        name: `${name}-secret`,
                        namespace,
                        labels: commonLabels
                    },
                    data: {
                        password: 'Q0hBTkdFX01FX1NFQ1VSRV9QQVNTV09SRA==' // base64: CHANGE_ME_SECURE_PASSWORD
                    }
                }
            ];

        case 'cache':
            return [
                {
                    apiVersion: 'apps/v1',
                    kind: 'Deployment',
                    metadata: {
                        name: `${name}-deployment`,
                        namespace,
                        labels: commonLabels
                    },
                    spec: {
                        replicas: 1,
                        selector: {
                            matchLabels: { app: name }
                        },
                        template: {
                            metadata: {
                                labels: { app: name }
                            },
                            spec: {
                                containers: [
                                    {
                                        name: 'redis',
                                        image: 'redis:7-alpine',
                                        ports: [{ containerPort: 6379 }],
                                        resources: {
                                            requests: {
                                                cpu: '100m',
                                                memory: '128Mi'
                                            },
                                            limits: {
                                                cpu: '500m',
                                                memory: '512Mi'
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                {
                    apiVersion: 'v1',
                    kind: 'Service',
                    metadata: {
                        name: `${name}-service`,
                        namespace,
                        labels: commonLabels
                    },
                    spec: {
                        selector: { app: name },
                        ports: [
                            {
                                protocol: 'TCP',
                                port: 6379,
                                targetPort: 6379
                            }
                        ],
                        type: 'ClusterIP'
                    }
                }
            ];

        case 'queue':
            return [
                {
                    apiVersion: 'apps/v1',
                    kind: 'Deployment',
                    metadata: {
                        name: `${name}-deployment`,
                        namespace,
                        labels: commonLabels
                    },
                    spec: {
                        replicas: 1,
                        selector: {
                            matchLabels: { app: name }
                        },
                        template: {
                            metadata: {
                                labels: { app: name }
                            },
                            spec: {
                                containers: [
                                    {
                                        name: 'rabbitmq',
                                        image: 'rabbitmq:3-management-alpine',
                                        ports: [
                                            { containerPort: 5672, name: 'amqp' },
                                            { containerPort: 15672, name: 'management' }
                                        ],
                                        resources: {
                                            requests: {
                                                cpu: '200m',
                                                memory: '256Mi'
                                            },
                                            limits: {
                                                cpu: '500m',
                                                memory: '512Mi'
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                {
                    apiVersion: 'v1',
                    kind: 'Service',
                    metadata: {
                        name: `${name}-service`,
                        namespace,
                        labels: commonLabels
                    },
                    spec: {
                        selector: { app: name },
                        ports: [
                            {
                                name: 'amqp',
                                protocol: 'TCP',
                                port: 5672,
                                targetPort: 5672
                            },
                            {
                                name: 'management',
                                protocol: 'TCP',
                                port: 15672,
                                targetPort: 15672
                            }
                        ],
                        type: 'ClusterIP'
                    }
                }
            ];

        case 'networking':
            return [
                {
                    apiVersion: 'networking.k8s.io/v1',
                    kind: 'Ingress',
                    metadata: {
                        name: `${name}-ingress`,
                        namespace,
                        labels: commonLabels,
                        annotations: {
                            'kubernetes.io/ingress.class': 'nginx',
                            'cert-manager.io/cluster-issuer': 'letsencrypt-prod'
                        }
                    },
                    spec: {
                        tls: [
                            {
                                hosts: ['example.com'],
                                secretName: `${name}-tls`
                            }
                        ],
                        rules: [
                            {
                                host: 'example.com',
                                http: {
                                    paths: [
                                        {
                                            path: '/',
                                            pathType: 'Prefix',
                                            backend: {
                                                service: {
                                                    name: 'app-service',
                                                    port: { number: 80 }
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    apiVersion: 'networking.k8s.io/v1',
                    kind: 'NetworkPolicy',
                    metadata: {
                        name: `${name}-network-policy`,
                        namespace,
                        labels: commonLabels
                    },
                    spec: {
                        podSelector: {},
                        policyTypes: ['Ingress', 'Egress'],
                        ingress: [
                            {
                                from: [
                                    {
                                        namespaceSelector: {
                                            matchLabels: {
                                                name: namespace
                                            }
                                        }
                                    }
                                ]
                            }
                        ],
                        egress: [
                            {
                                to: [
                                    {
                                        namespaceSelector: {}
                                    }
                                ]
                            }
                        ]
                    }
                }
            ];

        default:
            return [];
    }
}

function manifestToYaml(manifest: K8sManifest): string {
    return `---
apiVersion: ${manifest.apiVersion}
kind: ${manifest.kind}
metadata:
  name: ${manifest.metadata.name}
${manifest.metadata.namespace ? `  namespace: ${manifest.metadata.namespace}` : ''}
${manifest.metadata.labels ? `  labels:\n${Object.entries(manifest.metadata.labels).map(([k, v]) => `    ${k}: "${v}"`).join('\n')}` : ''}
${manifest.spec ? `spec:\n  # See JSON version for full spec` : ''}
${manifest.data ? `data:\n  # See JSON version for data` : ''}
`;
}

export function generateKubernetes(architecture: Architecture, projectName: string, environment: string): KubernetesOutput[] {
    const namespace = `${sanitizeName(projectName)}-${environment}`;
    const outputs: KubernetesOutput[] = [];

    // Namespace manifest
    const namespaceManifest: K8sManifest = {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
            name: namespace,
            labels: {
                name: namespace,
                environment,
                'managed-by': 'solsarch'
            }
        }
    };

    // Collect all manifests
    const allManifests: K8sManifest[] = [namespaceManifest];

    for (const component of architecture.components) {
        const manifests = getDeploymentForComponent(component, namespace);
        allManifests.push(...manifests);
    }

    // Combined YAML file
    let combinedYaml = `# Kubernetes manifests for ${architecture.name}
# Generated by SolsArch - ${new Date().toISOString()}
# Environment: ${environment}
# Namespace: ${namespace}
#
# Deploy with: kubectl apply -f ${projectName.toLowerCase()}-${architecture.variant}.yaml
`;

    for (const manifest of allManifests) {
        combinedYaml += '\n' + manifestToYaml(manifest);
    }

    outputs.push({
        filename: `${projectName.toLowerCase()}-${architecture.variant}.yaml`,
        content: combinedYaml,
        language: 'yaml'
    });

    // JSON version with full specs
    outputs.push({
        filename: `${projectName.toLowerCase()}-${architecture.variant}.json`,
        content: JSON.stringify(allManifests, null, 2),
        language: 'json'
    });

    // Kustomization file
    const kustomization = `# Kustomization for ${architecture.name}
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: ${namespace}

resources:
  - ${projectName.toLowerCase()}-${architecture.variant}.yaml

commonLabels:
  app.kubernetes.io/name: ${sanitizeName(projectName)}
  app.kubernetes.io/environment: ${environment}
  app.kubernetes.io/managed-by: solsarch

# Uncomment to add resource limits
# patches:
#   - patch: |-
#       - op: add
#         path: /spec/template/spec/containers/0/resources
#         value:
#           limits:
#             cpu: "1"
#             memory: "1Gi"
#     target:
#       kind: Deployment
`;

    outputs.push({
        filename: 'kustomization.yaml',
        content: kustomization,
        language: 'yaml'
    });

    return outputs;
}
