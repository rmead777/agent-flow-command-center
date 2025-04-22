
export interface FlowNode {
  id: string;
  type: "input" | "model" | "action" | "output";
  modelId?: string;
  config?: object;
  inputNodeIds?: string[];
}
