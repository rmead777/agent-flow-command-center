
import { FlowNode } from "./types";
import { getAdapter } from "../adapters/adapterRegistry";
import { toast } from "@/components/ui/use-toast";
import { validateFlowNodeConfig } from "../utils/modelValidation";
import { supabase } from "@/integrations/supabase/client";
import { executeModel } from "@/api/executeApi";

/**
 * Calls the appropriate adapter for a given node.
 */
export async function executeNode(node: FlowNode, input: any): Promise<any> {
  // Handle InputPrompt node type
  if (node.type === "inputPrompt") {
    console.log("Executing input prompt node with prompt:", node.prompt);
    // Return the prompt directly so it can be used by downstream nodes
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
    
    // Handle complex objects and array inputs
    if (Array.isArray(input)) {
      // Safely map over array items and handle each one
      processedInput = input.map(item => {
        if (item && typeof item === 'object') {
          // If the object has an output property, use that
          if ('output' in item && item.output !== undefined) {
            return typeof item.output === 'string' ? item.output : JSON.stringify(item.output);
          }
          // Otherwise stringify the whole object
          return JSON.stringify(item);
        }
        return String(item || "");
      }).filter(Boolean).join("\n");
    } else if (input && typeof input === 'object') {
      // If the object has an output property, use that
      if ('output' in input && input.output !== undefined) {
        processedInput = typeof input.output === 'string' ? input.output : JSON.stringify(input.output);
      } else {
        // Otherwise stringify the whole object
        processedInput = JSON.stringify(input);
      }
    } else if (processedInput === undefined || processedInput === null) {
      processedInput = "";
    } else if (typeof processedInput !== 'string') {
      // Convert to string if not already
      processedInput = String(processedInput);
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
    
    // Execute the model using our API functions
    const providerName = adapter.providerName;
    console.log(`Executing ${providerName} model: ${node.modelId}`);
    
    const response = await executeModel(providerName, node.modelId, requestBody);
    
    // Handle API errors
    if (response.error) {
      const errorMessage = response.message || 'Unknown API error';
      console.error(`Error from API:`, errorMessage);
      
      toast({
        title: "API Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw new Error(errorMessage);
    }
    
    // Handle potential empty response
    if (!response) {
      throw new Error("Empty response from API");
    }
    
    console.log(`Got response from ${providerName}:`, response);
    
    // Parse the response using the adapter
    return adapter.parseResponse(response);
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
