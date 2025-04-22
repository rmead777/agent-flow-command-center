
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
  Panel,
  Node as FlowNode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AgentNode } from '@/components/flow/AgentNode';
import { ConfigurationPanel } from '@/components/flow/ConfigurationPanel';
import { initialNodes, initialEdges } from '@/data/flowData';
import { validateBeforeExecution } from '@/utils/modelValidation';
import { toast } from '@/components/ui/use-toast';

const nodeTypes = {
  agent: AgentNode,
};

export function FlowView() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (_: React.MouseEvent, node: FlowNode) => {
    setSelectedNode(node.id);
  };

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;

  const updateNodeData = (nodeId: string, updater: (prev: FlowNode) => FlowNode) => {
    setNodes((ns) => ns.map(n => (n.id === nodeId ? updater(n) : n)));
  };

  useEffect(() => {
    const isValid = validateBeforeExecution(nodes);
    setIsValidated(isValid);
  }, [nodes]);

  const handleExecuteFlow = () => {
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
    
    toast({
      title: "Flow Execution",
      description: "Flow validated successfully and ready for execution",
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
                  className={`${isValidated ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600'} text-white px-2 py-1 text-xs rounded`}
                  onClick={handleExecuteFlow}
                >
                  Execute Flow
                </button>
              </div>
            </Panel>
          </ReactFlow>
        </div>
        {selectedNode && selectedNodeData && (
          <ConfigurationPanel 
            node={selectedNodeData}
            onNodeChange={(updater) => updateNodeData(selectedNode, updater)}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}
