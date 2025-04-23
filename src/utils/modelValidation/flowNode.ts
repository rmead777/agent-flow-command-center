
import { adapterRegistry } from "../../adapters/adapterRegistry";

/**
 * Attempts to find an adapter for a model ID in a case-insensitive way
 */
function findAdapterForModel(modelId: string) {
  // Try direct lookup first
  let adapter = adapterRegistry[modelId];
  
  // If not found, try case-insensitive lookup
  if (!adapter) {
    const normalizedSearchId = modelId.toLowerCase();
    const matchingKey = Object.keys(adapterRegistry).find(
      key => key.toLowerCase() === normalizedSearchId
    );
    
    if (matchingKey) {
      adapter = adapterRegistry[matchingKey];
    }
  }
  
  return adapter;
}

/**
 * Validate a flow node's configuration against its model adapter
 */
export function validateFlowNodeConfig(
  modelId: string | undefined, 
  config: Record<string, any> | undefined
): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  if (!modelId) {
    errors.push("Flow node is missing modelId");
    return { isValid: false, errors };
  }
  
  const adapter = findAdapterForModel(modelId);
  
  if (!adapter) {
    errors.push(`Flow node has invalid modelId: "${modelId}"`);
    return { isValid: false, errors };
  }
  
  if (!config) {
    // Config is optional, will use defaults
    return { isValid: true, errors: [] };
  }
  
  if (!adapter.validateConfig(config)) {
    errors.push(`Configuration is invalid for model "${modelId}"`);
    
    // Add more specific validation errors if possible
    const defaultConfig = adapter.getDefaultConfig();
    Object.entries(config).forEach(([key, value]) => {
      if (key in defaultConfig) {
        const defaultValue = defaultConfig[key];
        if (typeof value !== typeof defaultValue) {
          errors.push(`Config property "${key}" has wrong type: expected ${typeof defaultValue}, got ${typeof value}`);
        }
      } else {
        errors.push(`Config has unknown property "${key}" for model "${modelId}"`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
