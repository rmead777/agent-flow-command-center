
import { FlowNode } from "./types";
import { getAdapter } from "../adapters/adapterRegistry";
import { toast } from "@/components/ui/use-toast";
import { validateFlowNodeConfig } from "../utils/modelValidation";
import { supabase } from "@/integrations/supabase/client";

/**
 * Calls the appropriate adapter for a given node.
 */
export async function executeNode(node: FlowNode, input: any): Promise<any> {
  // Handle InputPrompt node type
  if (node.type === "inputPrompt") {
    console.log("Executing input prompt node with prompt:", node.prompt);
    return node.prompt || "";
  }

  if (!node.modelId) {
    throw new Error("Node missing modelId");
  }
  
  // Try to get adapter with original model ID first
  let adapter = getAdapter(node.modelId);
  
  // If not found, try normalized version (lowercase)
  if (!adapter && typeof node.modelId === 'string') {
    const normalizedModelId = node.modelId.toLowerCase();
    adapter = getAdapter(normalizedModelId);
    
    if (adapter) {
      console.log(`Found adapter using normalized model ID: ${normalizedModelId}`);
    }
  }
  
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
    console.log(`Executing node ${node.id} with input:`, input);
    
    // Process input - ensure it's a string
    let processedInput = input;
    if (Array.isArray(input)) {
      // Join array inputs with newlines
      processedInput = input.filter(Boolean).join("\n");
    } else if (typeof input !== 'string') {
      // Convert to string if not already
      processedInput = String(input || "");
    }
    
    // Build the request using the adapter
    const requestBody = adapter.buildRequest(processedInput, config);
    
    // For mock model, simulate a response
    if (node.modelId === 'mock-model') {
      console.log("Using mock model for", node.id);
      return `[Mock response for node ${node.id}: ${processedInput}]`;
    }
    
    // Check for user authentication before making API call
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Authentication required. Please sign in to execute real model calls.");
    }
    
    // Check if API endpoint exists before making call
    const providerName = adapter.providerName.toLowerCase();
    const endpointUrl = `/api/execute/${providerName}`;
    
    console.log(`Making API call to ${endpointUrl} for model ${node.modelId}`);
    
    // Make the API call to our edge function
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modelId: node.modelId,
        request: requestBody
      })
    });
    
    if (!response.ok) {
      let errorMessage = `API error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse the error, use the default message
      }
      
      console.error(`Error response from ${endpointUrl}:`, errorMessage);
      
      toast({
        title: "API Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw new Error(errorMessage);
    }
    
    const rawResponse = await response.json();
    
    // Handle potential empty response
    if (!rawResponse) {
      throw new Error("Empty response from API");
    }
    
    console.log(`Got response from ${endpointUrl}:`, rawResponse);
    
    // Parse the response using the adapter
    return adapter.parseResponse(rawResponse);
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
