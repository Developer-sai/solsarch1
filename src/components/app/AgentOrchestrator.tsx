import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  XCircle,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AGENT_METADATA, AgentType, AgentStatus } from '@/types/agents';

interface AgentNode {
  id: string;
  type: AgentType;
  status: AgentStatus;
  progress: number;
  output?: string;
  duration?: number;
  connections: string[];
}

interface AgentOrchestratorProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  currentWorkflow?: string;
}

export function AgentOrchestrator({ 
  isRunning, 
  onStart, 
  onPause, 
  onReset,
  currentWorkflow 
}: AgentOrchestratorProps) {
  const [agents, setAgents] = useState<AgentNode[]>([
    { id: 'orch', type: 'orchestrator', status: 'idle', progress: 0, connections: ['req'] },
    { id: 'req', type: 'requirements', status: 'idle', progress: 0, connections: ['design', 'cost', 'security'] },
    { id: 'design', type: 'design', status: 'idle', progress: 0, connections: ['iac'] },
    { id: 'cost', type: 'cost', status: 'idle', progress: 0, connections: ['iac'] },
    { id: 'security', type: 'security', status: 'idle', progress: 0, connections: ['iac'] },
    { id: 'iac', type: 'iac', status: 'idle', progress: 0, connections: ['deploy'] },
    { id: 'deploy', type: 'deployment', status: 'idle', progress: 0, connections: ['monitor'] },
    { id: 'monitor', type: 'monitoring', status: 'idle', progress: 0, connections: [] },
  ]);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set(['orch']));

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/20 border-green-500/30';
      case 'running': return 'text-primary bg-primary/20 border-primary/30';
      case 'error': return 'text-red-500 bg-red-500/20 border-red-500/30';
      case 'waiting': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'running': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'waiting': return <Circle className="w-4 h-4 animate-pulse" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedAgents(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const completedCount = agents.filter(a => a.status === 'completed').length;
  const totalProgress = (completedCount / agents.length) * 100;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Agent Orchestrator
            {currentWorkflow && (
              <Badge variant="secondary" className="text-xs font-normal">
                {currentWorkflow}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onReset}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={isRunning ? "secondary" : "default"}
              size="sm"
              className="h-7 gap-1.5"
              onClick={isRunning ? onPause : onStart}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Start
                </>
              )}
            </Button>
          </div>
        </div>
        <Progress value={totalProgress} className="h-1.5 mt-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{completedCount}/{agents.length} agents completed</span>
          <span>{Math.round(totalProgress)}%</span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Agent Flow Visualization */}
        <div className="p-4 space-y-2">
          {agents.map((agent, index) => {
            const metadata = AGENT_METADATA[agent.type];
            const isExpanded = expandedAgents.has(agent.id);
            const hasConnections = agent.connections.length > 0;

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className={cn(
                    "p-3 rounded-lg border transition-all cursor-pointer",
                    getStatusColor(agent.status),
                    agent.status === 'running' && "ring-2 ring-primary/20"
                  )}
                  onClick={() => toggleExpand(agent.id)}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(agent.status)}
                    <span className="text-lg">{metadata.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{metadata.name}</span>
                        {agent.status === 'running' && (
                          <span className="text-xs animate-pulse">Processing...</span>
                        )}
                      </div>
                      <p className="text-xs opacity-70 truncate">{metadata.description}</p>
                    </div>
                    
                    {agent.status === 'running' && (
                      <div className="w-16">
                        <Progress value={agent.progress} className="h-1" />
                      </div>
                    )}
                    
                    {agent.duration && (
                      <span className="text-xs opacity-70">{agent.duration}ms</span>
                    )}

                    {hasConnections && (
                      <button className="p-1">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {isExpanded && hasConnections && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 pt-3 border-t border-current/10"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <span className="opacity-70">Outputs to:</span>
                          <div className="flex flex-wrap gap-1">
                            {agent.connections.map(connId => {
                              const target = agents.find(a => a.id === connId);
                              if (!target) return null;
                              const targetMeta = AGENT_METADATA[target.type];
                              return (
                                <Badge 
                                  key={connId} 
                                  variant="outline" 
                                  className="text-[10px] py-0 gap-1"
                                >
                                  <span>{targetMeta.icon}</span>
                                  {targetMeta.name}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                        
                        {agent.output && (
                          <div className="mt-2 p-2 rounded bg-background/50 text-xs font-mono">
                            {agent.output}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Connection line to next agent */}
                {index < agents.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowRight className="w-4 h-4 text-border rotate-90" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
