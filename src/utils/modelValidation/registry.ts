
import { adapterRegistry } from "../../adapters/adapterRegistry";
import { PROVIDERS } from "../../pages/api-keys/apiKeyProviders";

// Helper function to normalize model ID for comparison
function normalizeModelId(modelId: string): string {
  return modelId.toLowerCase();
}

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
      new Set(provider.models.map(normalizeModelId))
    );
  });
  
  // Check if all models in PROVIDERS are in adapterRegistry
  PROVIDERS.forEach(provider => {
    provider.models.forEach(model => {
      const normalizedModel = normalizeModelId(model);
      
      // Find the model in the adapter registry (case-insensitive)
      const foundInRegistry = Object.keys(adapterRegistry).some(
        registryModel => normalizeModelId(registryModel) === normalizedModel
      );
      
      if (!foundInRegistry) {
        errors.push(`Model "${model}" from provider "${provider.name}" is missing in adapter registry`);
      } else {
        // Check provider consistency
        // Find the corresponding adapter
        const registryKey = Object.keys(adapterRegistry).find(
          key => normalizeModelId(key) === normalizedModel
        );
        
        if (registryKey && adapterRegistry[registryKey].providerName !== provider.name) {
          errors.push(
            `Model "${model}" has inconsistent provider name: "${adapterRegistry[registryKey].providerName}" in registry vs "${provider.name}" in providers list`
          );
        }
      }
    });
  });
  
  // Check if all models in adapterRegistry are in PROVIDERS
  Object.entries(adapterRegistry).forEach(([modelId, adapter]) => {
    const normalizedModel = normalizeModelId(modelId);
    const providerModelsSet = providerModels.get(adapter.providerName);
    
    if (!providerModelsSet) {
      errors.push(`Model "${modelId}" has provider "${adapter.providerName}" which is not in the PROVIDERS list`);
    } else {
      const foundInProviders = Array.from(providerModelsSet).some(
        providerModel => providerModel === normalizedModel
      );
      
      if (!foundInProviders) {
        errors.push(`Model "${modelId}" from provider "${adapter.providerName}" is in adapter registry but missing from PROVIDERS list`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
