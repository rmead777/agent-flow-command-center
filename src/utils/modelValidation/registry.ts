
import { modelRegistry } from "../../adapters/modelRegistryV2";
import { PROVIDERS } from "../../pages/api-keys/apiKeyProviders";

export function validateModelRegistryConsistency(): { 
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Build map of all models from PROVIDERS (case-insensitive)
  const providerModels = new Map<string, Map<string, string>>();
  
  PROVIDERS.forEach(provider => {
    if (!providerModels.has(provider.name)) {
      providerModels.set(provider.name, new Map());
    }
    
    const modelsMap = providerModels.get(provider.name)!;
    provider.models.forEach(model => {
      modelsMap.set(model.toLowerCase(), model);
    });
  });
  
  // Check if all models in modelRegistry are in PROVIDERS
  Object.entries(modelRegistry).forEach(([modelId, descriptor]) => {
    const providerModelsMap = providerModels.get(descriptor.provider);
    
    if (!providerModelsMap) {
      errors.push(`Model "${modelId}" has provider "${descriptor.provider}" which is not in the PROVIDERS list`);
    } else {
      const modelLowerCase = modelId.toLowerCase();
      if (!providerModelsMap.has(modelLowerCase)) {
        errors.push(`Model "${modelId}" from provider "${descriptor.provider}" is in registry but missing from PROVIDERS list`);
      }
    }
  });
  
  // Check if all models in PROVIDERS are in modelRegistry
  PROVIDERS.forEach(provider => {
    provider.models.forEach(model => {
      if (!modelRegistry[model as keyof typeof modelRegistry]) {
        const matchFound = Object.keys(modelRegistry).some(
          regModel => regModel.toLowerCase() === model.toLowerCase() && 
                      modelRegistry[regModel as keyof typeof modelRegistry].provider === provider.name
        );
        
        if (!matchFound) {
          errors.push(`Model "${model}" from provider "${provider.name}" is missing in registry`);
        }
      } else if (modelRegistry[model as keyof typeof modelRegistry].provider !== provider.name) {
        errors.push(`Model "${model}" has inconsistent provider name`);
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
