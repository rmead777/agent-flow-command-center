
import { adapterRegistry } from "../../adapters/adapterRegistry";
import { PROVIDERS } from "../../pages/api-keys/apiKeyProviders";

// 1. Registry Consistency  
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
