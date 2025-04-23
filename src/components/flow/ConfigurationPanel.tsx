
import { X, Play, Pause, Trash, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { PROVIDERS } from '@/pages/api-keys/apiKeyProviders';
import { getAdapter, getModelsByProvider } from '@/adapters/adapterRegistry';
import { useState, useEffect } from 'react';
import { Node as ReactFlowNode } from '@xyflow/react';

// Define a proper type for the node data
interface AgentNodeData extends Record<string, unknown> {
  label: string;
  type: string;
  status?: 'active' | 'idle' | 'error';
  metrics?: {
    tasksProcessed: number;
    latency: number;
    errorRate: number;
  };
  modelId?: string;
  config?: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    streamResponse?: boolean;
    retryOnError?: boolean;
    [key: string]: any;
  };
}

interface ConfigurationPanelProps {
  node: ReactFlowNode<AgentNodeData>;
  onNodeChange: (updater: (prev: ReactFlowNode<AgentNodeData>) => ReactFlowNode<AgentNodeData>) => void;
  onClose: () => void;
}

export function ConfigurationPanel({ node, onNodeChange, onClose }: ConfigurationPanelProps) {
  const data = node.data || {} as AgentNodeData;
  const [tempProvider, setTempProvider] = useState<string>("");

  // Helper: Get full models by provider mapping
  const modelsByProvider = getModelsByProvider();

  // Initialize tempProvider when component mounts or node changes
  useEffect(() => {
    if (data.modelId && getAdapter(data.modelId)) {
      setTempProvider(getAdapter(data.modelId)!.providerName);
    }
  }, [data.modelId]);

  // Controlled fields: always use node-prop as source of truth. Local state only for slider, but write-through.
  const selectedProvider = tempProvider;
  const selectedModel = data.modelId || "";
  const availableModels = selectedProvider ? modelsByProvider[selectedProvider] || [] : [];

  // System Prompt, Temperature slider are controlled directly and update node immediately
  const systemPrompt = data.config?.systemPrompt || "";
  const temperature = data.config?.temperature ?? 0.7;
  const streamResponse = data.config?.streamResponse ?? true;
  const retryOnError = data.config?.retryOnError ?? true;
  const agentName = data.label || "";
  const agentType = data.type || "";

  // Immediate node-updating handlers for all fields
  const updateConfig = (key: string, value: any) => {
    onNodeChange(prev => ({
      ...prev,
      data: {
        ...prev.data,
        config: {
          ...(prev.data?.config || {}),
          [key]: value
        }
      }
    }));
  };

  const updateLabel = (value: string) => {
    onNodeChange(prev => ({
      ...prev,
      data: {
        ...prev.data,
        label: value
      }
    }));
  };

  const updateAgentType = (value: string) => {
    onNodeChange(prev => ({
      ...prev,
      data: {
        ...prev.data,
        type: value
      }
    }));
  };

  const updateProvider = (provider: string) => {
    // Update local state first
    setTempProvider(provider);
    
    // Clear modelId, user must re-select model for provider
    onNodeChange(prev => ({
      ...prev,
      data: {
        ...prev.data,
        modelId: "",
        config: {
          ...(prev.data?.config || {}), // can keep config
        }
      }
    }));
  };

  const updateModel = (modelId: string) => {
    onNodeChange(prev => ({
      ...prev,
      data: {
        ...prev.data,
        modelId
      }
    }));
  };

  // Simple helper for numeric slider
  const handleTemperature = (value: number[]) => {
    updateConfig("temperature", value[0]);
  };

  if (!node) return null;

  const isRunning = data.status === 'active';

  return (
    <div className="h-full w-80 flex-shrink-0 overflow-auto border-l border-gray-800 bg-gray-900 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Configure Agent</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">{agentName}</span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
            data.status === 'active' 
              ? 'bg-green-900/40 text-green-400' 
              : data.status === 'error'
              ? 'bg-red-900/40 text-red-400'
              : 'bg-yellow-900/40 text-yellow-400'
          }`}>
            {data.status}
          </span>
        </div>
        <div className="text-xs text-gray-400">ID: {node.id}</div>
      </div>

      <Separator className="my-4 bg-gray-800" />

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Agent Name</label>
          <Input 
            value={agentName}
            onChange={(e) => updateLabel(e.target.value)}
            className="border-gray-700 bg-gray-800 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Agent Type</label>
          <Select value={agentType} onValueChange={updateAgentType}>
            <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-gray-900 text-white">
              <SelectItem value="input">Input</SelectItem>
              <SelectItem value="model">Model</SelectItem>
              <SelectItem value="action">Action</SelectItem>
              <SelectItem value="output">Output</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">System Prompt</label>
          <Textarea 
            rows={4}
            className="border-gray-700 bg-gray-800 text-white"
            value={systemPrompt}
            onChange={(e) => updateConfig("systemPrompt", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">AI Provider</label>
          <Select 
            value={selectedProvider}
            onValueChange={updateProvider}
          >
            <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-gray-900 text-white">
              {Object.keys(modelsByProvider).map(provider => (
                <SelectItem key={provider} value={provider}>
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Model</label>
          <Select 
            value={selectedModel}
            onValueChange={updateModel}
            disabled={!selectedProvider}
          >
            <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-gray-900 text-white">
              {availableModels.map(model => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Temperature</label>
            <span className="text-xs text-gray-400">{temperature}</span>
          </div>
          <Slider 
            value={[temperature]} 
            onValueChange={handleTemperature} 
            max={1} 
            step={0.1} 
            className="py-4" 
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Stream Response</label>
          <Switch 
            checked={streamResponse}
            onCheckedChange={val => updateConfig("streamResponse", val)}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Retry on Error</label>
          <Switch 
            checked={retryOnError}
            onCheckedChange={val => updateConfig("retryOnError", val)}  
          />
        </div>
      </div>

      <Separator className="my-4 bg-gray-800" />

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className={`flex-1 gap-2 ${isRunning ? 'border-amber-700 text-amber-400' : 'border-emerald-700 text-emerald-400'}`}
        >
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </Button>

        <Button variant="outline" className="flex-1 gap-2 border-red-700 text-red-400">
          <Trash className="h-4 w-4" />
          <span>Delete</span>
        </Button>
      </div>

      {data.status === 'error' && (
        <div className="mt-4 rounded-md bg-red-900/30 p-3 text-sm text-red-300">
          <div className="mb-1 flex items-center gap-1 font-medium">
            <AlertTriangle className="h-4 w-4" />
            <span>Error encountered</span>
          </div>
          <p className="text-xs">
            Agent failed to process the last request due to a timeout. Check API keys or adjust timeout settings.
          </p>
        </div>
      )}
    </div>
  );
}
