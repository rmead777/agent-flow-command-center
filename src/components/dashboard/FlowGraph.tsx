
import React from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Panel,
  Connection,
  NodeMouseHandler,
  Node,
  Edge,
  useReactFlow,
  EdgeProps,
  EdgeLabelRenderer,
  useStore,
} from "@xyflow/react";
import { AgentNode } from "@/components/flow/AgentNode";
import { InputPromptNode } from "@/components/flow/InputPromptNode";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { X } from "lucide-react";

import "@xyflow/react/dist/style.css";

interface BaseNodeData {
  label: string;
  type: string;
  status?: "active" | "idle" | "error";
  [key: string]: any;
}

interface AgentNodeData extends BaseNodeData {
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

interface InputPromptNodeData extends BaseNodeData {
  prompt?: string;
  onPromptChange?: (prompt: string) => void;
}

type FlowNodeData = AgentNodeData | InputPromptNodeData;

const nodeTypes = {
  agent: AgentNode,
  inputPrompt: InputPromptNode,
};

interface FlowGraphProps {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (params: Connection) => void;
  onNodeClick: NodeMouseHandler<Node<FlowNodeData>>;
  onDeleteEdge: (edgeId: string) => void;
  children?: React.ReactNode;
}

function DeletableEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, style } = props;
  const { setEdges } = useReactFlow();
  
  const edgePath = `M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`;
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  const handleDelete = () => {
    setEdges((edges: Edge[]) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <path
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={style}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${midX}px,${midY}px)`,
            pointerEvents: 'all',
            zIndex: 1000
          }}
        >
          <button
            className="flex items-center justify-center w-5 h-5 bg-gray-700 text-white rounded-full border border-gray-500 hover:bg-red-600 transition-colors"
            onClick={handleDelete}
          >
            <X size={12} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const edgeTypes = {
  deletable: DeletableEdge,
};

export const FlowGraph: React.FC<FlowGraphProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onDeleteEdge,
  children,
}) => {
  const mappedEdges = edges.map((edge) => ({
    ...edge,
    type: "deletable",
  }));

  return (
    <ReactFlow
      nodes={nodes}
      edges={mappedEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      className="bg-[#0F0F1A]"
      defaultEdgeOptions={{ animated: true }}
    >
      <Controls className="bg-gray-800 text-white" />
      <MiniMap
        nodeColor={(node) => {
          const nodeData = node.data as FlowNodeData;
          switch (nodeData.type) {
            case "input":
              return "#6366f1";
            case "action":
              return "#8b5cf6";
            case "response":
              return "#10b981";
            case "inputPrompt":
              return "#3b82f6";
            default:
              return "#64748b";
          }
        }}
        maskColor="rgba(15, 15, 26, 0.8)"
        className="bg-gray-800"
      />
      <Background color="#333" gap={16} />
      {children}
    </ReactFlow>
  );
};
