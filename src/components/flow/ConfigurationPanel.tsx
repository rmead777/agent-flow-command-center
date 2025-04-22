
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
import { initialNodes } from '@/data/flowData';
import { PROVIDERS } from '@/pages/api-keys/apiKeyProviders';
import { getAdapter } from '@/adapters/adapterRegistry';
import { useState, useEffect } from 'react';

interface ConfigurationPanelProps {
  nodeId: string;
  onClose: () => void;
}

export function ConfigurationPanel({ nodeId, onClose }: ConfigurationPanelProps) {
  const node = initialNodes.find(n => n.id === nodeId);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [systemPrompt, setSystemPrompt] = useState<string>("You are an AI assistant that helps users find information. Be concise and accurate in your responses.");
  const [temperature, setTemperature] = useState<number[]>([0.7]);
  const [streamResponse, setStreamResponse] = useState<boolean>(true);
  const [retryOnError, setRetryOnError] = useState<boolean>(true);
  
  useEffect(() => {
    if (node?.data?.modelId) {
      const adapter = getAdapter(node.data.modelId);
      if (adapter) {
        setSelectedProvider(adapter.providerName);
        setSelectedModel(node.data.modelId);
        
        // Load other config if available
        if (node.data.config) {
          setSystemPrompt(node.data.config.systemPrompt || systemPrompt);
          setTemperature([node.data.config.temperature || 0.7]);
          setStreamResponse(node.data.config.streamResponse !== undefined ? node.data.config.streamResponse : true);
          setRetryOnError(node.data.config.retryOnError !== undefined ? node.data.config.retryOnError : true);
        }
      }
    }
  }, [node]);
  
  if (!node) {
    return null;
  }
  
  const isRunning = node.data.status === 'active';
  const availableModels = PROVIDERS.find(p => p.name === selectedProvider)?.models || [];
  
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
          <span className="text-sm font-medium text-gray-300">{node.data.label}</span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
            node.data.status === 'active' 
              ? 'bg-green-900/40 text-green-400' 
              : node.data.status === 'error'
              ? 'bg-red-900/40 text-red-400'
              : 'bg-yellow-900/40 text-yellow-400'
          }`}>
            {node.data.status}
          </span>
        </div>
        <div className="text-xs text-gray-400">ID: {nodeId}</div>
      </div>
      
      <Separator className="my-4 bg-gray-800" />
      
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Agent Name</label>
          <Input 
            defaultValue={node.data.label}
            className="border-gray-700 bg-gray-800 text-white"
          />
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium">Agent Type</label>
          <Select defaultValue={node.data.type}>
            <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-gray-900 text-white">
              <SelectItem value="input">Input</SelectItem>
              <SelectItem value="action">Action</SelectItem>
              <SelectItem value="response">Response</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium">System Prompt</label>
          <Textarea 
            rows={4}
            className="border-gray-700 bg-gray-800 text-white"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium">AI Provider</label>
          <Select 
            value={selectedProvider} 
            onValueChange={(value) => {
              setSelectedProvider(value);
              setSelectedModel("");
            }}
          >
            <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-gray-900 text-white">
              {PROVIDERS.map(provider => (
                <SelectItem key={provider.name} value={provider.name}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium">Model</label>
          <Select 
            value={selectedModel}
            onValueChange={setSelectedModel}
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
            <span className="text-xs text-gray-400">{temperature[0]}</span>
          </div>
          <Slider 
            value={temperature} 
            onValueChange={setTemperature} 
            max={1} 
            step={0.1} 
            className="py-4" 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Stream Response</label>
          <Switch 
            checked={streamResponse}
            onCheckedChange={setStreamResponse}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Retry on Error</label>
          <Switch 
            checked={retryOnError}
            onCheckedChange={setRetryOnError}  
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
      
      {node.data.status === 'error' && (
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
