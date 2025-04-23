
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
  Edge
} from "@xyflow/react";
import { AgentNode } from "@/components/flow/AgentNode";

interface AgentNodeData {
  label: string;
  type: string;
  status?: "active" | "idle" | "error";
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

const nodeTypes = {
  agent: AgentNode,
};

interface FlowGraphProps {
  nodes: Node<AgentNodeData>[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (params: Connection) => void;
  onNodeClick: NodeMouseHandler<Node<AgentNodeData>>;
  children?: React.ReactNode;
}

export const FlowGraph: React.FC<FlowGraphProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  children,
}) => (
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
          case "input":
            return "#6366f1";
          case "action":
            return "#8b5cf6";
          case "response":
            return "#10b981";
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
