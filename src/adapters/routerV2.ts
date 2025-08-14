
import { supabase } from "@/integrations/supabase/client";
import { StandardRequest, StandardResponse, ModelNotFoundError } from './types';
import { modelRegistry, ModelId, isValidModelId } from './modelRegistryV2';

/**
 * Router V2 - Centralized AI model execution system
 * Routes all model calls through the secure ai-router edge function
 */
export class RouterV2 {
  
  /**
   * Execute a model request through the centralized router
   */
  public async execute(args: {
    modelId: string;
    input: StandardRequest;
    userId?: string;
  }): Promise<StandardResponse> {
    const { modelId, input, userId } = args;
    
    console.log(`RouterV2: Executing request for model: ${modelId}`);
    
    // Validate model ID
    if (!isValidModelId(modelId)) {
      throw new ModelNotFoundError(modelId);
    }
    
    // Get current user session if not provided
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required. Please sign in to execute AI models.');
      }
      currentUserId = session.user.id;
    }
    
    // Call the centralized ai-router edge function
    const { data, error } = await supabase.functions.invoke('ai-router', {
      body: {
        modelId,
        request: input,
        userId: currentUserId
      }
    });
    
    if (error) {
      console.error('Router V2 error:', error);
      throw new Error(`Router error: ${error.message || 'Unknown error'}`);
    }
    
    // Handle API errors returned in the response
    if (data?.error) {
      throw new Error(data.message || 'API execution error');
    }
    
    console.log(`RouterV2: Execution complete for model: ${modelId}`);
    return data as StandardResponse;
  }
  
  /**
   * Get model descriptor from registry
   */
  public getModelDescriptor(modelId: string) {
    if (!isValidModelId(modelId)) {
      throw new ModelNotFoundError(modelId);
    }
    return modelRegistry[modelId];
  }
  
  /**
   * Get default configuration for a model
   */
  public getDefaultConfig(modelId: string) {
    const descriptor = this.getModelDescriptor(modelId);
    return descriptor.defaultConfig;
  }
  
  /**
   * Check if a model supports a specific capability
   */
  public hasCapability(modelId: string, capability: keyof typeof modelRegistry[ModelId]['capabilities']): boolean {
    const descriptor = this.getModelDescriptor(modelId);
    return descriptor.capabilities[capability];
  }
}

// Export singleton instance
export const aiRouter = new RouterV2();
