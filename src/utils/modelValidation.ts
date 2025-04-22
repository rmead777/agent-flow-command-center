
import { adapterRegistry, getModelsByProvider } from "../adapters/adapterRegistry";
import { PROVIDERS } from "../pages/api-keys/apiKeyProviders";
import { ModelAdapter } from "../adapters/ModelAdapter";
import { toast } from "@/components/ui/use-toast";

/**
 * Validates that all models in PROVIDERS are registered in adapterRegistry
 * and vice versa
 */
export function validateModelRegistryConsistency(): { 
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Build map of all models from PROVIDERS
  const providerModels = new Map<string, Set<string>>();
  PROVIDERS.forEach(provider => {
    providerModels.set(
      provider.name, 
      new Set(provider.models)
    );
  });
  
  // Check if all models in PROVIDERS are in adapterRegistry
  PROVIDERS.forEach(provider => {
    provider.models.forEach(model => {
      if (!adapterRegistry[model]) {
        errors.push(`Model "${model}" from provider "${provider.name}" is missing in adapter registry`);
      } else if (adapterRegistry[model].providerName !== provider.name) {
        errors.push(`Model "${model}" has inconsistent provider name: "${adapterRegistry[model].providerName}" in registry vs "${provider.name}" in providers list`);
      }
    });
  });
  
  // Check if all models in adapterRegistry are in PROVIDERS
  Object.entries(adapterRegistry).forEach(([modelId, adapter]) => {
    const providerModelsSet = providerModels.get(adapter.providerName);
    if (!providerModelsSet) {
      errors.push(`Model "${modelId}" has provider "${adapter.providerName}" which is not in the PROVIDERS list`);
    } else if (!providerModelsSet.has(modelId)) {
      errors.push(`Model "${modelId}" from provider "${adapter.providerName}" is in adapter registry but missing from PROVIDERS list`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates that all adapters implement the required methods and properties
 */
export function validateAdapterImplementations(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  Object.entries(adapterRegistry).forEach(([modelId, adapter]) => {
    // Check required properties
    if (!adapter.modelName) errors.push(`Model "${modelId}" adapter is missing modelName property`);
    if (!adapter.providerName) errors.push(`Model "${modelId}" adapter is missing providerName property`);
    if (!adapter.supportedFeatures || !Array.isArray(adapter.supportedFeatures)) {
      errors.push(`Model "${modelId}" adapter is missing supportedFeatures array`);
    }
    
    // Check required methods
    if (!adapter.buildRequest || typeof adapter.buildRequest !== 'function') {
      errors.push(`Model "${modelId}" adapter is missing buildRequest method`);
    }
    if (!adapter.parseResponse || typeof adapter.parseResponse !== 'function') {
      errors.push(`Model "${modelId}" adapter is missing parseResponse method`);
    }
    if (!adapter.validateConfig || typeof adapter.validateConfig !== 'function') {
      errors.push(`Model "${modelId}" adapter is missing validateConfig method`);
    }
    if (!adapter.getDefaultConfig || typeof adapter.getDefaultConfig !== 'function') {
      errors.push(`Model "${modelId}" adapter is missing getDefaultConfig method`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates configuration compatibility across same-provider adapters
 */
export function validateConfigurationCompatibility(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Group adapters by provider
  const adaptersByProvider = new Map<string, ModelAdapter[]>();
  
  Object.values(adapterRegistry).forEach(adapter => {
    if (!adaptersByProvider.has(adapter.providerName)) {
      adaptersByProvider.set(adapter.providerName, []);
    }
    adaptersByProvider.get(adapter.providerName)?.push(adapter);
  });
  
  // Check configuration consistency within each provider
  adaptersByProvider.forEach((adapters, providerName) => {
    if (adapters.length <= 1) return; // Skip providers with only one model
    
    const firstAdapter = adapters[0];
    const firstConfig = firstAdapter.getDefaultConfig();
    const firstConfigKeys = Object.keys(firstConfig);
    
    adapters.slice(1).forEach(adapter => {
      const config = adapter.getDefaultConfig();
      const configKeys = Object.keys(config);
      
      // Check for missing keys
      firstConfigKeys.forEach(key => {
        if (!configKeys.includes(key)) {
          warnings.push(`Model "${adapter.modelName}" from "${providerName}" is missing config key "${key}" that other models have`);
        } else if (typeof firstConfig[key] !== typeof config[key]) {
          errors.push(`Model "${adapter.modelName}" from "${providerName}" has config key "${key}" with type ${typeof config[key]}, expected ${typeof firstConfig[key]}`);
        }
      });
      
      // Check for extra keys
      configKeys.forEach(key => {
        if (!firstConfigKeys.includes(key)) {
          warnings.push(`Model "${adapter.modelName}" from "${providerName}" has extra config key "${key}" that other models don't have`);
        }
      });
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Run all validations and return combined results
 */
export function validateModelSystem(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const registryResults = validateModelRegistryConsistency();
  const adapterResults = validateAdapterImplementations();
  const configResults = validateConfigurationCompatibility();
  
  const allErrors = [
    ...registryResults.errors,
    ...adapterResults.errors,
    ...configResults.errors
  ];
  
  const allWarnings = [
    ...configResults.warnings
  ];
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
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

/**
 * Utility function to run validation before flow execution
 */
export function validateBeforeExecution(nodes: any[]): boolean {
  // This function can be called before executing a flow
  let isValid = true;
  const validationErrors: string[] = [];
  
  nodes.forEach(node => {
    if (node.type === 'model' && node.modelId) {
      const nodeValidation = validateFlowNodeConfig(node.modelId, node.config);
      if (!nodeValidation.isValid) {
        isValid = false;
        validationErrors.push(
          `Node "${node.id}" has invalid configuration: ${nodeValidation.errors.join(', ')}`
        );
      }
    }
  });
  
  if (!isValid) {
    validationErrors.forEach(error => {
      toast({
        title: "Flow Validation Error",
        description: error,
        variant: "destructive"
      });
    });
  }
  
  return isValid;
}
