
import { FlowNode } from "./types";
import { getAdapter } from "../adapters/adapterRegistry";
import { toast } from "@/components/ui/use-toast";
import { validateFlowNodeConfig } from "../utils/modelValidation";

/**
 * Calls the appropriate adapter for a given node.
 */
export async function executeNode(node: FlowNode, input: any): Promise<any> {
  if (!node.modelId) {
    throw new Error("Node missing modelId");
  }
  
  const adapter = getAdapter(node.modelId);
  if (!adapter) {
    throw new Error(`Missing adapter for model: ${node.modelId}`);
  }
  
  // Use default config if none provided
  const config = node.config ?? adapter.getDefaultConfig();
  
  // Validate config using the validation utility
  const validation = validateFlowNodeConfig(node.modelId, config);
  if (!validation.isValid) {
    const errorMessage = `Invalid configuration: ${validation.errors.join(', ')}`;
    toast({
      title: "Configuration Error",
      description: errorMessage,
      variant: "destructive"
    });
    throw new Error(errorMessage);
  }
  
  try {
    // Build the request using the adapter
    const requestBody = adapter.buildRequest(input, config);
    
    // Make the API call to our edge function
    const response = await fetch(`/api/execute/${adapter.providerName.toLowerCase()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modelId: node.modelId,
        request: requestBody
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error: ${errorData.message || response.statusText}`);
    }
    
    const rawResponse = await response.json();
    
    // Parse the response using the adapter
    return adapter.parseResponse(rawResponse);
  } catch (error: any) {
    toast({
      title: "Execution Error",
      description: error.message,
      variant: "destructive"
    });
    throw error;
  }
}
