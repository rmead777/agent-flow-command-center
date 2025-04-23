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
  const [showMenu, setShowMenu] = React.useState(false);
  const [menuPos, setMenuPos] = React.useState<{ x: number; y: number } | null>(null);

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const handleDelete = () => {
    setShowMenu(false);
    setEdges((edges: Edge[]) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <g onContextMenu={onContextMenu}>
        <path
          className="react-flow__edge-path"
          d={`
            M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}
          `}
          markerEnd={markerEnd}
          style={style}
        />
      </g>
      {showMenu && menuPos && (
        <div
          style={{
            position: "fixed",
            top: menuPos.y,
            left: menuPos.x,
            zIndex: 9999,
            background: "#222",
            borderRadius: "0.375rem",
            padding: "0.5rem 1rem",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
          }}
          onClick={handleDelete}
          onMouseLeave={() => setShowMenu(false)}
        >
          Delete Connection
        </div>
      )}
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
