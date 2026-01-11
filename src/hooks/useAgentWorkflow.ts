import { useState, useCallback } from 'react';
import { 
  AgentWorkflow, 
  AgentStep, 
  AgentType, 
  AgentStatus,
  WorkflowResult 
} from '@/types/agents';

interface UseAgentWorkflowReturn {
  workflow: AgentWorkflow | null;
  isRunning: boolean;
  currentAgent: AgentType | null;
  startWorkflow: (type: 'architecture' | 'cost' | 'security' | 'iac', context: string) => void;
  cancelWorkflow: () => void;
  getAgentStatus: (agentType: AgentType) => AgentStatus;
}

export function useAgentWorkflow(): UseAgentWorkflowReturn {
  const [workflow, setWorkflow] = useState<AgentWorkflow | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentType | null>(null);

  const createStep = (
    agentType: AgentType, 
    title: string, 
    description: string
  ): AgentStep => ({
    id: `${agentType}-${Date.now()}`,
    agentType,
    title,
    description,
    status: 'idle',
    subSteps: []
  });

  const updateStepStatus = useCallback((stepId: string, status: AgentStatus, result?: any) => {
    setWorkflow(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps.map(step => 
          step.id === stepId 
            ? { 
                ...step, 
                status, 
                result,
                completedAt: status === 'completed' || status === 'error' ? new Date() : undefined
              }
            : step
        )
      };
    });
  }, []);

  const simulateAgentExecution = useCallback(async (
    step: AgentStep,
    delay: number = 1500
  ): Promise<void> => {
    setCurrentAgent(step.agentType);
    updateStepStatus(step.id, 'running');
    
    // Add sub-steps for visual feedback
    const subSteps = getSubStepsForAgent(step.agentType);
    
    for (const subStep of subSteps) {
      setWorkflow(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          steps: prev.steps.map(s => 
            s.id === step.id 
              ? { 
                  ...s, 
                  subSteps: [...(s.subSteps || []), { ...subStep, status: 'running' }]
                }
              : s
          )
        };
      });
      
      await new Promise(resolve => setTimeout(resolve, delay / subSteps.length));
      
      setWorkflow(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          steps: prev.steps.map(s => 
            s.id === step.id 
              ? { 
                  ...s, 
                  subSteps: s.subSteps?.map(ss => 
                    ss.id === subStep.id ? { ...ss, status: 'completed' } : ss
                  )
                }
              : s
          )
        };
      });
    }
    
    updateStepStatus(step.id, 'completed');
  }, [updateStepStatus]);

  const startWorkflow = useCallback(async (
    type: 'architecture' | 'cost' | 'security' | 'iac',
    context: string
  ) => {
    const steps = getWorkflowSteps(type);
    
    const newWorkflow: AgentWorkflow = {
      id: `workflow-${Date.now()}`,
      name: getWorkflowName(type),
      description: `Processing: ${context.slice(0, 100)}...`,
      status: 'running',
      steps,
      startedAt: new Date()
    };

    setWorkflow(newWorkflow);
    setIsRunning(true);

    // Execute steps sequentially
    for (const step of steps) {
      await simulateAgentExecution(step);
    }

    setWorkflow(prev => prev ? {
      ...prev,
      status: 'completed',
      completedAt: new Date(),
      totalDuration: Date.now() - newWorkflow.startedAt.getTime()
    } : prev);
    
    setIsRunning(false);
    setCurrentAgent(null);
  }, [simulateAgentExecution]);

  const cancelWorkflow = useCallback(() => {
    setIsRunning(false);
    setCurrentAgent(null);
    setWorkflow(prev => prev ? { ...prev, status: 'error' } : prev);
  }, []);

  const getAgentStatus = useCallback((agentType: AgentType): AgentStatus => {
    if (!workflow) return 'idle';
    const step = workflow.steps.find(s => s.agentType === agentType);
    return step?.status || 'idle';
  }, [workflow]);

  return {
    workflow,
    isRunning,
    currentAgent,
    startWorkflow,
    cancelWorkflow,
    getAgentStatus
  };
}

function getWorkflowSteps(type: string): AgentStep[] {
  const baseSteps: AgentStep[] = [
    {
      id: 'orch-1',
      agentType: 'orchestrator',
      title: 'Analyzing Request',
      description: 'Determining required agents and workflow',
      status: 'idle'
    },
    {
      id: 'req-1',
      agentType: 'requirements',
      title: 'Validating Requirements',
      description: 'Parsing constraints and validating feasibility',
      status: 'idle'
    }
  ];

  switch (type) {
    case 'architecture':
      return [
        ...baseSteps,
        {
          id: 'design-1',
          agentType: 'design',
          title: 'Designing Architecture',
          description: 'Creating component diagrams and patterns',
          status: 'idle'
        },
        {
          id: 'cost-1',
          agentType: 'cost',
          title: 'Calculating Costs',
          description: 'Fetching real-time pricing across providers',
          status: 'idle'
        },
        {
          id: 'sec-1',
          agentType: 'security',
          title: 'Security Validation',
          description: 'Checking compliance and security posture',
          status: 'idle'
        }
      ];
    case 'cost':
      return [
        ...baseSteps,
        {
          id: 'cost-1',
          agentType: 'cost',
          title: 'Analyzing Current Costs',
          description: 'Reviewing resource utilization and spend',
          status: 'idle'
        },
        {
          id: 'cost-2',
          agentType: 'cost',
          title: 'Finding Optimizations',
          description: 'Identifying savings opportunities',
          status: 'idle'
        }
      ];
    case 'security':
      return [
        ...baseSteps,
        {
          id: 'sec-1',
          agentType: 'security',
          title: 'Threat Modeling',
          description: 'Analyzing attack surface and vectors',
          status: 'idle'
        },
        {
          id: 'sec-2',
          agentType: 'security',
          title: 'Compliance Check',
          description: 'Validating against regulatory frameworks',
          status: 'idle'
        }
      ];
    case 'iac':
      return [
        ...baseSteps,
        {
          id: 'design-1',
          agentType: 'design',
          title: 'Extracting Architecture',
          description: 'Parsing component specifications',
          status: 'idle'
        },
        {
          id: 'iac-1',
          agentType: 'iac',
          title: 'Generating Infrastructure Code',
          description: 'Creating Terraform/CloudFormation templates',
          status: 'idle'
        }
      ];
    default:
      return baseSteps;
  }
}

function getWorkflowName(type: string): string {
  switch (type) {
    case 'architecture': return 'Architecture Generation';
    case 'cost': return 'Cost Optimization';
    case 'security': return 'Security Analysis';
    case 'iac': return 'IaC Generation';
    default: return 'Workflow';
  }
}

function getSubStepsForAgent(agentType: AgentType) {
  switch (agentType) {
    case 'orchestrator':
      return [
        { id: 'orch-sub-1', title: 'Parsing request context', status: 'idle' as AgentStatus },
        { id: 'orch-sub-2', title: 'Determining agent sequence', status: 'idle' as AgentStatus }
      ];
    case 'requirements':
      return [
        { id: 'req-sub-1', title: 'Extracting constraints', status: 'idle' as AgentStatus },
        { id: 'req-sub-2', title: 'Validating budget', status: 'idle' as AgentStatus },
        { id: 'req-sub-3', title: 'Checking feasibility', status: 'idle' as AgentStatus }
      ];
    case 'design':
      return [
        { id: 'design-sub-1', title: 'Selecting architecture patterns', status: 'idle' as AgentStatus },
        { id: 'design-sub-2', title: 'Mapping components', status: 'idle' as AgentStatus },
        { id: 'design-sub-3', title: 'Generating diagrams', status: 'idle' as AgentStatus }
      ];
    case 'cost':
      return [
        { id: 'cost-sub-1', title: 'Fetching live pricing', status: 'idle' as AgentStatus },
        { id: 'cost-sub-2', title: 'Calculating estimates', status: 'idle' as AgentStatus },
        { id: 'cost-sub-3', title: 'Comparing providers', status: 'idle' as AgentStatus }
      ];
    case 'security':
      return [
        { id: 'sec-sub-1', title: 'Analyzing attack surface', status: 'idle' as AgentStatus },
        { id: 'sec-sub-2', title: 'Checking compliance', status: 'idle' as AgentStatus },
        { id: 'sec-sub-3', title: 'Generating recommendations', status: 'idle' as AgentStatus }
      ];
    case 'iac':
      return [
        { id: 'iac-sub-1', title: 'Parsing architecture', status: 'idle' as AgentStatus },
        { id: 'iac-sub-2', title: 'Generating modules', status: 'idle' as AgentStatus },
        { id: 'iac-sub-3', title: 'Validating syntax', status: 'idle' as AgentStatus }
      ];
    default:
      return [];
  }
}
