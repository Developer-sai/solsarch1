import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings2,
  Sparkles,
  Check,
  Zap,
  Brain,
  Globe,
  Server,
  Key
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type LLMProvider = 'google' | 'openai' | 'anthropic' | 'groq' | 'ollama' | 'custom';

interface LLMModel {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  supportsVision?: boolean;
}

interface LLMProviderConfig {
  id: LLMProvider;
  name: string;
  icon: React.ReactNode;
  description: string;
  models: LLMModel[];
  requiresApiKey: boolean;
  isLocal?: boolean;
}

const LLM_PROVIDERS: LLMProviderConfig[] = [
  {
    id: 'google',
    name: 'Google AI',
    icon: <Globe className="w-5 h-5" />,
    description: 'Built-in Google AI with no API key required. Best for most users.',
    requiresApiKey: false,
    models: [
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', description: 'Latest & fastest', contextLength: 1000000, supportsVision: true },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Most capable', contextLength: 2000000, supportsVision: true },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast & efficient', contextLength: 1000000 },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: <Zap className="w-5 h-5" />,
    description: 'Direct OpenAI API access. Requires API key.',
    requiresApiKey: true,
    models: [
      { id: 'gpt-5-2025-08-07', name: 'GPT-5', description: 'Most capable', contextLength: 128000, supportsVision: true },
      { id: 'gpt-5-mini-2025-08-07', name: 'GPT-5 Mini', description: 'Fast & efficient', contextLength: 128000 },
      { id: 'o3-2025-04-16', name: 'O3', description: 'Reasoning model', contextLength: 128000 },
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Legacy multimodal', contextLength: 128000, supportsVision: true },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: <Brain className="w-5 h-5" />,
    description: 'Claude models. Requires API key.',
    requiresApiKey: true,
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Best for coding', contextLength: 200000, supportsVision: true },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful', contextLength: 200000, supportsVision: true },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fast & cheap', contextLength: 200000 },
    ],
  },

  {
    id: 'groq',
    name: 'Groq',
    icon: <Zap className="w-5 h-5" />,
    description: 'Ultra-fast inference. Requires API key.',
    requiresApiKey: true,
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: 'Most capable', contextLength: 128000 },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Fastest', contextLength: 128000 },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'MoE model', contextLength: 32768 },
    ],
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    icon: <Server className="w-5 h-5" />,
    description: 'Run models locally. No API key needed.',
    requiresApiKey: false,
    isLocal: true,
    models: [
      { id: 'llama3.2', name: 'Llama 3.2', description: 'Latest Llama', contextLength: 128000 },
      { id: 'codellama', name: 'Code Llama', description: 'Best for code', contextLength: 16000 },
      { id: 'mistral', name: 'Mistral', description: 'Fast & capable', contextLength: 32000 },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', description: 'Coding specialist', contextLength: 16000 },
    ],
  },
  {
    id: 'custom',
    name: 'Custom Endpoint',
    icon: <Settings2 className="w-5 h-5" />,
    description: 'Any OpenAI-compatible API endpoint.',
    requiresApiKey: true,
    models: [],
  },
];

interface LLMProviderSelectorProps {
  selectedProvider: LLMProvider;
  selectedModel: string;
  onProviderChange: (provider: LLMProvider, model: string) => void;
  compact?: boolean;
}

export function LLMProviderSelector({
  selectedProvider,
  selectedModel,
  onProviderChange,
  compact = false,
}: LLMProviderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [ollamaEndpoint, setOllamaEndpoint] = useState('http://localhost:11434');
  const { toast } = useToast();

  const currentProvider = LLM_PROVIDERS.find(p => p.id === selectedProvider) || LLM_PROVIDERS[0];
  const currentModel = currentProvider.models.find(m => m.id === selectedModel) || currentProvider.models[0];

  const handleProviderSelect = (providerId: LLMProvider) => {
    const provider = LLM_PROVIDERS.find(p => p.id === providerId);
    if (provider && provider.models.length > 0) {
      onProviderChange(providerId, provider.models[0].id);
    } else if (providerId === 'custom') {
      onProviderChange(providerId, '');
    }
  };

  const handleModelSelect = (modelId: string) => {
    onProviderChange(selectedProvider, modelId);
  };

  const handleSaveConfig = () => {
    // In a real app, you'd save the API key securely
    toast({
      title: 'Configuration Saved',
      description: `Using ${currentProvider.name} with ${currentModel?.name || 'custom model'}`,
    });
    setIsOpen(false);
  };

  if (compact) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {currentProvider.icon}
            <span className="hidden sm:inline">{currentProvider.name}</span>
            <Badge variant="secondary" className="text-xs">
              {currentModel?.name || 'Select Model'}
            </Badge>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Provider Settings</DialogTitle>
            <DialogDescription>
              Choose your preferred AI provider and model for architecture generation.
            </DialogDescription>
          </DialogHeader>
          <LLMProviderContent
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onProviderSelect={handleProviderSelect}
            onModelSelect={handleModelSelect}
            apiKey={apiKey}
            setApiKey={setApiKey}
            customEndpoint={customEndpoint}
            setCustomEndpoint={setCustomEndpoint}
            ollamaEndpoint={ollamaEndpoint}
            setOllamaEndpoint={setOllamaEndpoint}
            onSave={handleSaveConfig}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" />
          AI Provider Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LLMProviderContent
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          onProviderSelect={handleProviderSelect}
          onModelSelect={handleModelSelect}
          apiKey={apiKey}
          setApiKey={setApiKey}
          customEndpoint={customEndpoint}
          setCustomEndpoint={setCustomEndpoint}
          ollamaEndpoint={ollamaEndpoint}
          setOllamaEndpoint={setOllamaEndpoint}
          onSave={handleSaveConfig}
        />
      </CardContent>
    </Card>
  );
}

interface LLMProviderContentProps {
  selectedProvider: LLMProvider;
  selectedModel: string;
  onProviderSelect: (provider: LLMProvider) => void;
  onModelSelect: (model: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  customEndpoint: string;
  setCustomEndpoint: (endpoint: string) => void;
  ollamaEndpoint: string;
  setOllamaEndpoint: (endpoint: string) => void;
  onSave: () => void;
}

function LLMProviderContent({
  selectedProvider,
  selectedModel,
  onProviderSelect,
  onModelSelect,
  apiKey,
  setApiKey,
  customEndpoint,
  setCustomEndpoint,
  ollamaEndpoint,
  setOllamaEndpoint,
  onSave,
}: LLMProviderContentProps) {
  const currentProvider = LLM_PROVIDERS.find(p => p.id === selectedProvider) || LLM_PROVIDERS[0];

  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <div className="space-y-3">
        <Label>Provider</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LLM_PROVIDERS.map((provider) => (
            <Button
              key={provider.id}
              variant={selectedProvider === provider.id ? 'default' : 'outline'}
              className="h-auto py-3 flex-col gap-1 relative"
              onClick={() => onProviderSelect(provider.id)}
            >
              {selectedProvider === provider.id && (
                <Check className="w-4 h-4 absolute top-2 right-2" />
              )}
              {provider.icon}
              <span className="text-xs font-medium">{provider.name}</span>
              {provider.isLocal && (
                <Badge variant="secondary" className="text-[10px] px-1">Local</Badge>
              )}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{currentProvider.description}</p>
      </div>

      {/* Model Selection */}
      {currentProvider.models.length > 0 && (
        <div className="space-y-3">
          <Label>Model</Label>
          <Select value={selectedModel} onValueChange={onModelSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {currentProvider.models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <span>{model.name}</span>
                    <span className="text-xs text-muted-foreground">
                      - {model.description}
                    </span>
                    {model.supportsVision && (
                      <Badge variant="outline" className="text-[10px]">Vision</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* API Key Input */}
      {currentProvider.requiresApiKey && selectedProvider !== 'custom' && (
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Key
          </Label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Enter your ${currentProvider.name} API key`}
          />
          <p className="text-xs text-muted-foreground">
            Your API key is stored locally and never sent to our servers.
          </p>
        </div>
      )}

      {/* Ollama Endpoint */}
      {selectedProvider === 'ollama' && (
        <div className="space-y-3">
          <Label>Ollama Endpoint</Label>
          <Input
            value={ollamaEndpoint}
            onChange={(e) => setOllamaEndpoint(e.target.value)}
            placeholder="http://localhost:11434"
          />
          <p className="text-xs text-muted-foreground">
            Make sure Ollama is running locally.
          </p>
        </div>
      )}

      {/* Custom Endpoint */}
      {selectedProvider === 'custom' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label>API Endpoint</Label>
            <Input
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              placeholder="https://api.example.com/v1/chat/completions"
            />
          </div>
          <div className="space-y-3">
            <Label>API Key (optional)</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key if required"
            />
          </div>
        </div>
      )}

      {/* Save Button */}
      <Button onClick={onSave} className="w-full">
        Save Configuration
      </Button>
    </div>
  );
}
