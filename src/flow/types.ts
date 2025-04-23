
export interface FlowNode {
  id: string;
  type: "input" | "model" | "action" | "output" | "inputPrompt";
  modelId?: string;
  config?: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    streamResponse?: boolean;
    retryOnError?: boolean;
    [key: string]: any;
  };
  inputNodeIds?: string[];
  prompt?: string;
}
