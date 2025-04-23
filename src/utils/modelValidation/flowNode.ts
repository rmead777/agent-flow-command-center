
import { adapterRegistry } from "../../adapters/adapterRegistry";

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
  
  const adapter = adapterRegistry[modelId];
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
