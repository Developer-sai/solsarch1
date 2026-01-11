import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, XCircle, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentWorkflow, AgentStep, AgentStatus, AGENT_METADATA } from '@/types/agents';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';

interface AgentStatusPanelProps {
  workflow: AgentWorkflow | null;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export function AgentStatusPanel({ workflow, isMinimized, onToggleMinimize }: AgentStatusPanelProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  if (!workflow) return null;

  const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
  const totalSteps = workflow.steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'waiting':
        return <Circle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getDuration = () => {
    if (workflow.totalDuration) {
      return `${(workflow.totalDuration / 1000).toFixed(1)}s`;
    }
    if (workflow.startedAt) {
      const elapsed = Date.now() - workflow.startedAt.getTime();
      return `${(elapsed / 1000).toFixed(1)}s`;
    }
    return '';
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg cursor-pointer hover:bg-card transition-colors"
        onClick={onToggleMinimize}
      >
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{workflow.name}</span>
        <Progress value={progress} className="w-24 h-1.5" />
        <span className="text-xs text-muted-foreground">{completedSteps}/{totalSteps}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-card border border-border rounded-xl overflow-hidden shadow-lg"
    >
      {/* Header */}
      <div 
        className="px-4 py-3 bg-gradient-to-r from-primary/10 to-transparent border-b border-border cursor-pointer"
        onClick={onToggleMinimize}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{workflow.name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{getDuration()}</span>
            {workflow.status === 'completed' && (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
          </div>
        </div>
        <Progress value={progress} className="mt-2 h-1" />
      </div>

      {/* Steps */}
      <div className="max-h-[300px] overflow-y-auto">
        <AnimatePresence>
          {workflow.steps.map((step, index) => (
            <AgentStepItem
              key={step.id}
              step={step}
              isExpanded={expandedSteps.has(step.id)}
              onToggle={() => toggleStep(step.id)}
              isLast={index === workflow.steps.length - 1}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface AgentStepItemProps {
  step: AgentStep;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}

function AgentStepItem({ step, isExpanded, onToggle, isLast }: AgentStepItemProps) {
  const metadata = AGENT_METADATA[step.agentType];
  const hasSubSteps = step.subSteps && step.subSteps.length > 0;

  const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground/50" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "px-4 py-3 border-b border-border/50 last:border-0",
        step.status === 'running' && "bg-primary/5"
      )}
    >
      <div 
        className="flex items-center gap-3 cursor-pointer"
        onClick={hasSubSteps ? onToggle : undefined}
      >
        {/* Status indicator */}
        {getStatusIcon(step.status)}
        
        {/* Agent icon */}
        <span className="text-lg">{metadata.icon}</span>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium", metadata.color)}>
              {metadata.name}
            </span>
            {step.status === 'running' && (
              <span className="text-xs text-primary animate-pulse">Running...</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{step.description}</p>
        </div>

        {/* Expand toggle */}
        {hasSubSteps && (
          <button className="p-1 hover:bg-secondary rounded">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        )}
      </div>

      {/* Sub-steps */}
      <AnimatePresence>
        {isExpanded && hasSubSteps && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 ml-11 space-y-1 overflow-hidden"
          >
            {step.subSteps?.map(subStep => (
              <div key={subStep.id} className="flex items-center gap-2 py-1">
                {getStatusIcon(subStep.status)}
                <span className="text-xs text-muted-foreground">{subStep.title}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
