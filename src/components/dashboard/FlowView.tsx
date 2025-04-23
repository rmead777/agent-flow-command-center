
import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node as ReactFlowNode,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AgentNode } from '@/components/flow/AgentNode';
import { ConfigurationPanel } from '@/components/flow/ConfigurationPanel';
import { initialNodes, initialEdges } from '@/data/flowData';
import { validateBeforeExecution } from '@/utils/modelValidation';
import { toast } from '@/components/ui/use-toast';
import { runSimulatedFlow } from '@/flow/MockRunner';

// Import the AgentNodeData interface
import { FlowNode as FlowNodeType } from '@/flow/types';

// Define the AgentNodeData type to match the one in ConfigurationPanel
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

const nodeTypes = {
  agent: AgentNode,
};

export function FlowView() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AgentNodeData>(initialNodes as ReactFlowNode<AgentNodeData>[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (_: React.MouseEvent, node: ReactFlowNode<AgentNodeData>) => {
    setSelectedNode(node.id);
  };

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;

  const updateNodeData = (nodeId: string, updater: (n: ReactFlowNode<AgentNodeData>) => ReactFlowNode<AgentNodeData>) => {
    setNodes((ns) => ns.map(n => (n.id === nodeId ? updater(n) : n)));
  };

  useEffect(() => {
    const isValid = validateBeforeExecution(nodes);
    setIsValidated(isValid);
  }, [nodes]);

  const handleExecuteFlow = async () => {
    if (!isValidated) {
      const isValid = validateBeforeExecution(nodes);
      setIsValidated(isValid);
      if (!isValid) {
        toast({
          title: "Validation Failed",
          description: "Please fix validation errors before executing flow",
          variant: "destructive"
        });
        return;
      }
    }

    // Execute the flow
    setIsExecuting(true);
    
    // Update all nodes to show processing status
    setNodes(currentNodes => 
      currentNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          status: 'active'
        }
      }))
    );

    toast({
      title: "Flow Execution Started",
      description: "Running the flow simulation...",
    });

    try {
      // Check if we have mock models to run
      const hasMockModel = nodes.some(node => 
        node.data.modelId === 'mock-model'
      );

      if (hasMockModel) {
        // Run the simulated flow for mock models
        await runSimulatedFlow(nodes, (nodeId, status, message) => {
          // Update node status based on the callback
          updateNodeData(nodeId, (node) => ({
            ...node,
            data: {
              ...node.data,
              status: status as 'active' | 'idle' | 'error'
            }
          }));
          
          // Show toast message if provided
          if (message) {
            toast({
              title: `Node ${nodeId} ${status === 'error' ? 'Error' : 'Update'}`,
              description: message,
              variant: status === 'error' ? 'destructive' : 'default'
            });
          }
        });
        
        toast({
          title: "Flow Execution Completed",
          description: "Mock simulation has finished",
        });
      } else {
        // For non-mock models, show appropriate message
        toast({
          title: "Flow Validated",
          description: "Flow validated successfully. Connection to real models requires additional setup.",
        });
        
        // Reset nodes to idle after a delay
        setTimeout(() => {
          setNodes(currentNodes => 
            currentNodes.map(node => ({
              ...node,
              data: {
                ...node.data,
                status: 'idle'
              }
            }))
          );
        }, 2000);
      }
    } catch (error) {
      console.error("Flow execution error:", error);
      toast({
        title: "Flow Execution Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      
      // Mark nodes as error state
      setNodes(currentNodes => 
        currentNodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            status: 'error'
          }
        }))
      );
    } finally {
      setIsExecuting(false);
    }
  };

  // Node DELETION
  const handleDeleteNode = (nodeId: string) => {
    // Remove the node and any connected edges
    setNodes(ns => ns.filter(n => n.id !== nodeId));
    setEdges(es => es.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  };

  return (
    <div className="h-full w-full rounded-lg border border-gray-800 bg-gray-900">
      <div className="flex h-full">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[#0F0F1A]"
            defaultEdgeOptions={{ animated: true }}
          >
            <Controls className="bg-gray-800 text-white" />
            <MiniMap 
              nodeColor={(node) => {
                switch (node.data.type) {
                  case 'input':
                    return '#6366f1';
                  case 'action':
                    return '#8b5cf6';
                  case 'response':
                    return '#10b981';
                  default:
                    return '#64748b';
                }
              }}
              maskColor="rgba(15, 15, 26, 0.8)"
              className="bg-gray-800"
            />
            <Background color="#333" gap={16} />
            <Panel position="top-right" className="bg-gray-900/80 backdrop-blur-sm p-2 rounded-md border border-gray-800">
              <div className="flex gap-2">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 text-xs rounded">
                  Add Node
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 text-xs rounded">
                  Auto Layout
                </button>
                <button 
                  className={`${isValidated ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600'} 
                    text-white px-2 py-1 text-xs rounded ${isExecuting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleExecuteFlow}
                  disabled={isExecuting}
                >
                  {isExecuting ? 'Executing...' : 'Execute Flow'}
                </button>
              </div>
            </Panel>
          </ReactFlow>
        </div>
        {selectedNode && selectedNodeData && (
          <ConfigurationPanel 
            node={selectedNodeData as ReactFlowNode<AgentNodeData>}
            onNodeChange={(updater) => updateNodeData(selectedNode, updater)}
            onClose={() => setSelectedNode(null)}
            onDeleteNode={handleDeleteNode}
          />
        )}
      </div>
    </div>
  );
}

