import { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useNodesState, useEdgesState, addEdge, Connection, NodeMouseHandler, Node } from '@xyflow/react';
import { FlowToolbar } from './FlowToolbar';
import { FlowGraph } from './FlowGraph';
import { ConfigurationPanel } from '@/components/flow/ConfigurationPanel';
import { FlowOutputPanel, FlowOutput } from '@/components/flow/FlowOutputPanel';
import { initialNodes, initialEdges } from '@/data/flowData';
import { validateBeforeExecution } from '@/utils/modelValidation';
import { toast } from '@/components/ui/use-toast';
import { runSimulatedFlow } from '@/flow/MockRunner';
import { FlowNode } from '@/flow/types';
import { addFlowOutputsToHistory } from '@/data/logData';
import { loadFromLocalStorage } from './helpers';
import { SaveAsWorkflowDialog } from "./SaveAsWorkflowDialog";
import { LoadWorkflowDialog } from "./LoadWorkflowDialog";
import { saveUserFlow, loadUserFlow } from "@/data/workflowStorage";
import { Button } from "@/components/ui/button";

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

interface InputPromptNodeData {
  prompt?: string;
  onPromptChange?: (prompt: string) => void;
  label: string;
  type: string;
  status?: 'active' | 'idle' | 'error';
  [key: string]: any;
}

type FlowNodeData = AgentNodeData | InputPromptNodeData;

export interface FlowViewHandle {
  runFlow: () => void;
  saveFlow: () => void;
  showSettings: () => void;
  showCode: () => void;
}

const LOCALSTORAGE_NODES_KEY = "ai_flow_nodes";
const LOCALSTORAGE_EDGES_KEY = "ai_flow_edges";
const LOCALSTORAGE_OUTPUTS_KEY = "ai_flow_last_outputs";

export const FlowView = forwardRef<FlowViewHandle>((props, ref) => {
  const typedInitialNodes: Node<FlowNodeData>[] = initialNodes.map(node => ({
    ...node,
    data: {
      ...node.data,
    } as FlowNodeData,
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowNodeData>>(
    loadFromLocalStorage<Node<FlowNodeData>[]>(LOCALSTORAGE_NODES_KEY, typedInitialNodes)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    loadFromLocalStorage(LOCALSTORAGE_EDGES_KEY, initialEdges)
  );
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [flowOutputs, setFlowOutputs] = useState<FlowOutput[]>([]);
  const [showOutputPanel, setShowOutputPanel] = useState(false);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<{ name: string; id: string } | null>(null);
  const [workflowPrompt, setWorkflowPrompt] = useState<string>("");

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

  const onNodeClick: NodeMouseHandler<Node<FlowNodeData>> = useCallback((_, node) => {
    setSelectedNode(node.id);
  }, []);

  const selectedNodeData = selectedNode
    ? nodes.find(n => n.id === selectedNode)
    : null;

  const updateNodeData = useCallback((nodeId: string, updater: (n: Node<FlowNodeData>) => Node<FlowNodeData>) => {
    setNodes((ns) => ns.map(n => (n.id === nodeId ? updater(n) : n)));
  }, [setNodes]);

  useEffect(() => {
    const isValid = validateBeforeExecution(nodes);
    setIsValidated(isValid);
  }, [nodes]);

  useEffect(() => {
    try {
      const savedOutputs = localStorage.getItem(LOCALSTORAGE_OUTPUTS_KEY);
      if (savedOutputs) {
        setFlowOutputs(JSON.parse(savedOutputs));
      }
    } catch (error) {
      console.error("Failed to load saved outputs:", error);
    }
  }, []);

  function handleSaveFlow() {
    setWorkflowDialogOpen(true);
  }

  async function doSaveWorkflow(name: string) {
    setSaving(true);
    const { success, error, id } = await saveUserFlow(name, nodes, edges, activeWorkflow?.id);
    setSaving(false);
    if (success) {
      setActiveWorkflow({ name, id: id! });
      toast({
        title: "Workflow Saved",
        description: `Your workflow "${name}" was saved.`
      });
    } else {
      toast({
        title: "Save Failed",
        description: error || "Failed to save workflow.",
        variant: "destructive"
      });
    }
  }

  const handleLoadWorkflow = () => setLoadDialogOpen(true);

  async function onLoadWorkflow(flow: any) {
    setNodes(flow.nodes);
    setEdges(flow.edges);
    setActiveWorkflow({ name: flow.name, id: flow.id });
    toast({
      title: "Workflow Loaded",
      description: `Loaded "${flow.name}".`
    });
  }

  const handleAddNode = (typeOverride?: string) => {
    const newId = `node-${Date.now()}`;
    const last = nodes.length ? nodes[nodes.length - 1] : null;
    const pos =
      last && last.position
        ? { x: last.position.x + 80, y: last.position.y + 60 }
        : { x: 100, y: 100 + nodes.length * 40 };

    if (typeOverride === "inputPrompt") {
      setNodes((nds) => [
        ...nds,
        {
          id: newId,
          type: "inputPrompt",
          position: pos,
          data: {
            label: "User Prompt",
            type: "input",
            status: "idle",
            prompt: workflowPrompt,
            onPromptChange: (p: string) => setWorkflowPrompt(p)
          } as InputPromptNodeData
        }
      ]);
      toast({
        title: "Prompt Node Added",
        description: `User prompt node '${newId}' created.`,
      });
      return;
    }

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
          metrics: {
            tasksProcessed: 0,
            latency: 0,
            errorRate: 0
          },
          config: {
            systemPrompt: '',
            temperature: 0.7,
            streamResponse: true,
            retryOnError: true,
          }
        } as AgentNodeData
      }
    ]);
    toast({
      title: "Agent Node Added",
      description: `New agent node '${newId}' created.`,
    });
  };

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
    setFlowOutputs([]); // Clear previous outputs

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
      const promptNode = nodes.find(
        n => n.type === "inputPrompt"
      );
      const initialPrompt = promptNode && promptNode.data && "prompt" in promptNode.data
        ? String(promptNode.data.prompt ?? "")
        : "";

      const hasMockModel = nodes.some(node =>
        (node.data as AgentNodeData)?.modelId === 'mock-model'
      );

      if (hasMockModel) {
        const flowNodes: FlowNode[] = nodes.map(node => {
          const nodeData = node.data as AgentNodeData;
          return {
            id: node.id,
            type: nodeData.type as "input" | "model" | "action" | "output" | "inputPrompt",
            modelId: nodeData.modelId || undefined,
            config: {
              ...nodeData.config,
              label: nodeData.label // Add label to config for reference
            },
            inputNodeIds: edges
              .filter(edge => edge.target === node.id)
              .map(edge => edge.source),
            prompt: (node.type === "inputPrompt" && "prompt" in node.data)
              ? String((node.data as any).prompt ?? "")
              : undefined
          };
        });

        const nodeMap: Record<string, FlowNode> = {};
        flowNodes.forEach(node => { nodeMap[node.id] = node; });

        const rootNodes = flowNodes.filter(n => !n.inputNodeIds || n.inputNodeIds.length === 0);

        const mockResults: { outputs: any[] } = { outputs: [] };
        const nodeOutputs: Record<string, any> = {};

        async function executeNodeAndDependents(node: FlowNode) {
          let input;
          if (node.type === "inputPrompt") {
            input = node.prompt ?? "";
            nodeOutputs[node.id] = input;
            mockResults.outputs.push({
              nodeId: node.id,
              output: input,
              executionTime: 1,
              error: null
            });
          } else if (!node.inputNodeIds || node.inputNodeIds.length === 0) {
            input = initialPrompt;
          } else {
            input = node.inputNodeIds.map(pid => nodeOutputs[pid]).join("\n");
          }

          if (node.modelId === "mock-model") {
            await new Promise(res => setTimeout(res, 2));
            const output = `[Simulated output for: ${input}]`;
            nodeOutputs[node.id] = output;
            mockResults.outputs.push({
              nodeId: node.id,
              output,
              executionTime: 3,
              error: null
            });
          }

          const dependents = flowNodes.filter(n => n.inputNodeIds && n.inputNodeIds.includes(node.id));
          for (const dep of dependents) {
            await executeNodeAndDependents(dep);
          }
        }

        for (const root of rootNodes) {
          await executeNodeAndDependents(root);
        }

        const outputsUnique = Array.from(
          new Map(mockResults.outputs.map(o => [o.nodeId, o])).values()
        );

        setNodes(currentNodes =>
          currentNodes.map(node => {
            const nodeOutput = outputsUnique.find(output => output.nodeId === node.id);
            return {
              ...node,
              data: {
                ...(node.data as AgentNodeData),
                status: 'idle',
                metrics: {
                  ...(node.data as AgentNodeData).metrics,
                  tasksProcessed: ((node.data as AgentNodeData).metrics?.tasksProcessed || 0) + (nodeOutput ? 1 : 0),
                  latency: nodeOutput?.executionTime || 0,
                  errorRate: 0
                }
              }
            };
          })
        );

        setFlowOutputs(outputsUnique);
        setShowOutputPanel(true);

        addFlowOutputsToHistory(outputsUnique);
        localStorage.setItem(LOCALSTORAGE_OUTPUTS_KEY, JSON.stringify(outputsUnique));

        toast({
          title: "Flow Execution Completed",
          description: "Mock simulation has finished successfully",
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

  const handleDeleteNode = (nodeId: string) => {
    setNodes(ns => ns.filter(n => n.id !== nodeId));
    setEdges(es => es.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    toast({
      title: "Node Deleted",
      description: `Agent node '${nodeId}' deleted.`,
    });
  };

  useEffect(() => {
    if (!localStorage.getItem(LOCALSTORAGE_NODES_KEY)) {
      localStorage.setItem(LOCALSTORAGE_NODES_KEY, JSON.stringify(nodes));
    }
    if (!localStorage.getItem(LOCALSTORAGE_EDGES_KEY)) {
      localStorage.setItem(LOCALSTORAGE_EDGES_KEY, JSON.stringify(edges));
    }
  }, []);

  const toggleOutputPanel = () => {
    setShowOutputPanel(!showOutputPanel);
  };

  const handleAutoLayout = () =>
    toast({ title: "Auto Layout", description: "This will be implemented soon!" });

  return (
    <div className="h-full w-full rounded-lg border border-gray-800 bg-gray-900 flex flex-col relative">
      <div className="flex-1 relative min-h-0">
        <FlowGraph
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
        >
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <FlowToolbar
              onAddNode={() => handleAddNode()}
              onAutoLayout={handleAutoLayout}
              onExecuteFlow={handleExecuteFlow}
              onSaveFlow={handleSaveFlow}
              onShowCode={() =>
                toast({ title: "Code View", description: "Code export not implemented yet." })
              }
              onShowSettings={() =>
                toast({ title: "Settings", description: "Settings panel not implemented yet." })
              }
              onToggleOutputPanel={toggleOutputPanel}
              isValidated={isValidated}
              isExecuting={isExecuting}
              showOutputPanel={showOutputPanel}
              flowOutputsLength={flowOutputs.length}
            />
            <Button
              variant="outline"
              className="text-blue-300 px-3 py-1 border-blue-400"
              onClick={() => handleAddNode("inputPrompt")}
              title="Add User Prompt Node"
            >
              Add Prompt Node
            </Button>
            <Button variant="outline" className="text-gray-300 px-3 py-1" onClick={handleLoadWorkflow}>
              Load Workflow
            </Button>
          </div>
        </FlowGraph>

        {selectedNode && selectedNodeData && (
          <>
            <aside
              className="fixed top-0 right-0 z-40 h-full w-[350px] max-w-[95vw] border-l border-gray-800 bg-gray-900 shadow-lg transition-transform duration-200"
              style={{ boxShadow: ' -8px 0 28px -8px rgba(0,0,0,0.36)' }}
              tabIndex={-1}
            >
              <ConfigurationPanel
                node={selectedNodeData as Node<AgentNodeData>}
                onNodeChange={(updater) => updateNodeData(selectedNode, updater)}
                onClose={() => setSelectedNode(null)}
                onDeleteNode={handleDeleteNode}
              />
            </aside>
            <div
              className="fixed inset-0 z-30 bg-black/40 md:hidden"
              onClick={() => setSelectedNode(null)}
            />
          </>
        )}
      </div>

      <FlowOutputPanel
        outputs={flowOutputs}
        isVisible={showOutputPanel}
        onClose={() => setShowOutputPanel(false)}
      />

      <SaveAsWorkflowDialog
        open={workflowDialogOpen}
        onClose={() => setWorkflowDialogOpen(false)}
        onSave={doSaveWorkflow}
        defaultName={activeWorkflow?.name || "My Workflow"}
      />
      <LoadWorkflowDialog
        open={loadDialogOpen}
        onClose={() => setLoadDialogOpen(false)}
        onLoad={onLoadWorkflow}
      />
    </div>
  );
});
FlowView.displayName = "FlowView";
