import { Handle, Position, NodeResizer } from '@xyflow/react';
import { FlowNode } from '@/flow/types';

interface AgentNodeProps {
  data: {
    label: string;
    type: string;
    status: 'active' | 'idle' | 'error';
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
    color?: string;
  };
  selected: boolean;
}

export function AgentNode({ data, selected }: AgentNodeProps) {
  const metrics = data.metrics || { tasksProcessed: 0, latency: 0, errorRate: 0 };

  const getNodeStyle = () => {
    // Use custom color if present
    if (data.color) return `${data.color} text-gray-900`;
    if (data.type === 'input') return 'bg-indigo-900 text-indigo-100';
    if (data.type === 'action') return 'bg-purple-900 text-purple-100';
    if (data.type === 'output' || data.type === 'response') return 'bg-green-900 text-green-100';
    return 'bg-gray-800 text-gray-100';
  };

  const getStatusColor = () => {
    if (data.status === 'active') return 'bg-green-500';
    if (data.status === 'error') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  return (
    <div 
      className={`rounded-md p-4 shadow-md ${getNodeStyle()} ${selected ? 'ring-2 ring-white/50' : ''}`}
      style={data.color ? { background: data.color } : undefined}
    >
      <NodeResizer 
        minWidth={180}
        minHeight={100}
        isVisible={selected}
        lineClassName="border-white"
        handleClassName="h-3 w-3 bg-white border-2 rounded-full"
      />
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-gray-300"
        isConnectable={true}
      />

      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium">{data.label}</div>
        <div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
      </div>

      <div className="flex flex-col gap-1 text-xs opacity-80">
        <div className="flex justify-between">
          <span>Tasks:</span>
          <span>{metrics.tasksProcessed}</span>
        </div>
        <div className="flex justify-between">
          <span>Latency:</span>
          <span>{metrics.latency}ms</span>
        </div>
        <div className="flex justify-between">
          <span>Error Rate:</span>
          <span>{metrics.errorRate}%</span>
        </div>
        {data.modelId && (
          <div className="flex justify-between">
            <span>Model:</span>
            <span className="truncate max-w-[100px]">{data.modelId}</span>
          </div>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-gray-300"
        isConnectable={true}
      />
    </div>
  );
}
