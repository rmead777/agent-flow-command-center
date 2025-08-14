
import { FlowNode } from "./types";
import { toast } from "@/components/ui/use-toast";
import { aiRouter } from "../adapters/routerV2";
import { StandardRequest } from "../adapters/types";

/**
 * Execute a flow node using Router V2
 */
export async function executeNode(node: FlowNode, input: any): Promise<any> {
  console.log(`Starting execution of node ${node.id} of type ${node.type} with input:`, input);

  // Handle InputPrompt node type
  if (node.type === "inputPrompt") {
    console.log("Executing input prompt node with prompt:", node.prompt);
    return node.prompt || "";
  }

  if (!node.modelId) {
    throw new Error("Node missing modelId");
  }

  try {
    // Get model descriptor and default config
    const modelDescriptor = aiRouter.getModelDescriptor(node.modelId);
    const defaultConfig = aiRouter.getDefaultConfig(node.modelId);
    
    // Merge default config with node config
    const config = { ...defaultConfig, ...(node.config || {}) };
    
    console.log(`Executing node ${node.id} with model: ${node.modelId}`);
    console.log(`Node config:`, config);
    
    // Process input - ensure it's a string
    let processedInput = input;
    
    if (Array.isArray(input)) {
      processedInput = input.map(item => {
        if (item && typeof item === 'object') {
          if ('output' in item && item.output !== undefined) {
            return typeof item.output === 'string' ? item.output : JSON.stringify(item.output);
          }
          return JSON.stringify(item);
        }
        return String(item || "");
      }).filter(Boolean).join("\n");
    } else if (input && typeof input === 'object') {
      if ('output' in input && input.output !== undefined) {
        processedInput = typeof input.output === 'string' ? input.output : JSON.stringify(input.output);
      } else {
        processedInput = JSON.stringify(input);
      }
    } else if (processedInput === undefined || processedInput === null) {
      processedInput = "";
    } else if (typeof processedInput !== 'string') {
      processedInput = String(processedInput);
    }
    
    // Build standard request
    const standardRequest: StandardRequest = {
      messages: [
        { role: 'system', content: config.systemPrompt || 'You are a helpful assistant.' },
        { role: 'user', content: processedInput }
      ],
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      enableWebSearch: config.enableWebSearch || false
    };
    
    // Execute through Router V2
    const response = await aiRouter.execute({
      modelId: node.modelId,
      input: standardRequest
    });
    
    console.log(`Got response from ${modelDescriptor.provider}:`, response.output);
    
    // Return the parsed response directly
    return response;
    
  } catch (error: any) {
    console.error(`Execution error for node ${node.id}:`, error);
    
    toast({
      title: "Execution Error",
      description: error.message || "Unknown execution error",
      variant: "destructive"
    });
    
    throw error;
  }
}
