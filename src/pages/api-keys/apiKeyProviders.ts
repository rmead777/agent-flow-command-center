
import { getModelsByProvider, getAllProviders } from "../../adapters/modelRegistryV2";

// Generate providers dynamically from Registry V2
const modelsByProvider = getModelsByProvider();

export const PROVIDERS = getAllProviders().map(providerName => ({
  name: providerName,
  models: modelsByProvider[providerName] || []
}));
