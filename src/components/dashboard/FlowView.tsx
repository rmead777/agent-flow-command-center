
import { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
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
  NodeMouseHandler,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AgentNode } from '@/components/flow/AgentNode';
import { ConfigurationPanel } from '@/components/flow/ConfigurationPanel';
import { initialNodes, initialEdges } from '@/data/flowData';
import { validateBeforeExecution } from '@/utils/modelValidation';
import { toast } from '@/components/ui/use-toast';
import { runSimulatedFlow } from '@/flow/MockRunner';
import { FlowNode } from '@/flow/types';
import { Plus, Save, Play, Code, Settings } from 'lucide-react';

// Define the AgentNodeData type
interface AgentNodeData {
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
  [key: string]: any;
}

// enable parent ref actions (for DashboardHeader or other)
export interface FlowViewHandle {
  runFlow: () => void;
  saveFlow: () => void;
  showSettings: () => void;
  showCode: () => void;
}

const nodeTypes = {
  agent: AgentNode,
};

export const FlowView = forwardRef<FlowViewHandle>((props, ref) => {
  // convert initial to correct format
  const typedInitialNodes: Node<AgentNodeData>[] = initialNodes.map(node => ({
    ...node,
    data: {
      ...node.data,
    } as AgentNodeData,
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<AgentNodeData>>(typedInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // --- Flow actions for DashboardHeader via ref
  useImperativeHandle(ref, () => ({
    runFlow: () => handleExecuteFlow(),
    saveFlow: handleSaveFlow,
    showSettings: () => {
      toast({
        title: 'Settings Info',
        description: 'Settings are not yet implemented. (Soon!)',
      });
    },
    showCode: () => {
      toast({
        title: 'Code View',
        description: 'Viewing code is not yet implemented. (Soon!)',
      });
    }
  }));

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick: NodeMouseHandler<Node<AgentNodeData>> = useCallback((_, node) => {
    setSelectedNode(node.id);
  }, []);

  const selectedNodeData = selectedNode 
    ? nodes.find(n => n.id === selectedNode) 
    : null;

  const updateNodeData = useCallback((nodeId: string, updater: (n: Node<AgentNodeData>) => Node<AgentNodeData>) => {
    setNodes((ns) => ns.map(n => (n.id === nodeId ? updater(n) : n)));
  }, [setNodes]);

  useEffect(() => {
    const isValid = validateBeforeExecution(nodes);
    setIsValidated(isValid);
  }, [nodes]);

  // ---- BUTTON: ADD AGENT NODE ----
  const handleAddNode = () => {
    // Find a good id
    const newId = `node-${Date.now()}`;
    // Smart default: just offset from last node or at (100,100)
    const last = nodes.length ? nodes[nodes.length - 1] : null;
    const pos =
      last && last.position
        ? { x: last.position.x + 80, y: last.position.y + 60 }
        : { x: 100, y: 100 + nodes.length * 40 };

    setNodes((nds) => [
      ...nds,
      {
        id: newId,
        type: 'agent',
        position: pos,
        data: {
          label: 'New Agent',
          type: 'model',
          status: 'idle',
          config: {
            systemPrompt: '',
            temperature: 0.7,
            streamResponse: true,
            retryOnError: true,
          }
        }
      }
    ]);
    toast({
      title: "Agent Node Added",
      description: `New agent node '${newId}' created.`,
    });
  };

  // ---- BUTTON: SAVE FLOW ----
  function handleSaveFlow() {
    toast({
      title: 'Flow Saved',
      description: 'Your AI workflow was saved successfully.',
    });
    // (future: push to backend/db!)
  }

  // ---- BUTTON: EXECUTE / RUN FLOW ----
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
    setIsExecuting(true);

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
      const hasMockModel = nodes.some(node =>
        (node.data as AgentNodeData)?.modelId === 'mock-model'
      );

      if (hasMockModel) {
        const flowNodes: FlowNode[] = nodes.map(node => {
          const nodeData = node.data as AgentNodeData;
          return {
            id: node.id,
            type: nodeData.type as "input" | "model" | "action" | "output",
            modelId: nodeData.modelId || undefined,
            config: nodeData.config,
            inputNodeIds: edges
              .filter(edge => edge.target === node.id)
              .map(edge => edge.source)
          };
        });

        const mockInput = { 'node-1': 'Test input data' };
        await runSimulatedFlow(flowNodes, mockInput)
          .then(results => {
            console.log("Flow execution results:", results);
            setNodes(currentNodes => 
              currentNodes.map(node => ({
                ...node,
                data: {
                  ...(node.data as AgentNodeData),
                  status: 'idle'
                }
              }))
            );
            toast({
              title: "Flow Execution Completed",
              description: "Mock simulation has finished successfully",
            });
          })
          .catch(error => {
            console.error("Flow execution error:", error);
            setNodes(currentNodes => 
              currentNodes.map(node => ({
                ...node,
                data: {
                  ...(node.data as AgentNodeData),
                  status: 'error'
                }
              }))
            );
            toast({
              title: "Flow Execution Error",
              description: error.message || "An error occurred during flow execution",
              variant: "destructive"
            });
          });
      } else {
        toast({
          title: "Flow Validated",
          description: "Flow validated successfully. Connection to real models requires additional setup.",
        });
        setTimeout(() => {
          setNodes(currentNodes =>
            currentNodes.map(node => ({
              ...node,
              data: {
                ...(node.data as AgentNodeData),
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
      setNodes(currentNodes =>
        currentNodes.map(node => ({
          ...node,
          data: {
            ...(node.data as AgentNodeData),
            status: 'error'
          }
        }))
      );
    } finally {
      setIsExecuting(false);
    }
  };

  // ---- BUTTON: DELETE NODE (also exposed to config panel) ----
  const handleDeleteNode = (nodeId: string) => {
    setNodes(ns => ns.filter(n => n.id !== nodeId));
    setEdges(es => es.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    toast({
      title: "Node Deleted",
      description: `Agent node '${nodeId}' deleted.`,
    });
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
                const nodeData = node.data as AgentNodeData;
                switch (nodeData.type) {
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
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 text-xs rounded flex items-center gap-1"
                  onClick={handleAddNode}
                  title="Add Node"
                >
                  <Plus size={16} className="inline" />
                  Add Node
                </button>
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 text-xs rounded flex items-center gap-1"
                  onClick={() => toast({ title: "Auto Layout", description: "This will be implemented soon!" })}
                  title="Auto Layout"
                >
                  {/* Could use an icon here as well if needed */}
                  Auto Layout
                </button>
                <button 
                  className={`${isValidated ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600'} 
                    text-white px-2 py-1 text-xs rounded flex items-center gap-1 ${isExecuting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleExecuteFlow}
                  disabled={isExecuting}
                  title="Run Flow"
                >
                  <Play size={16} className="inline" />
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
});
FlowView.displayName = "FlowView";
