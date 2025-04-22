
import { ModelAdapter } from "./ModelAdapter";
import { OpenAIAdapter } from "./OpenAIAdapter";
import { AnthropicAdapter } from "./AnthropicAdapter";
import { GoogleAdapter } from "./GoogleAdapter";
import { MistralAdapter } from "./MistralAdapter";
import { CohereAdapter } from "./CohereAdapter";

// Register all provider models
export const adapterRegistry: Record<string, ModelAdapter> = {
  // OpenAI Models
  "gpt-4o": new OpenAIAdapter("gpt-4o"),
  "gpt-4.1": new OpenAIAdapter("gpt-4.1"),
  "gpt-4o-mini": new OpenAIAdapter("gpt-4o-mini"),
  "gpt-4.5-preview": new OpenAIAdapter("gpt-4.5-preview"),
  
  // Anthropic Models
  "claude-3.7-sonnet": new AnthropicAdapter("claude-3.7-sonnet"),
  "claude-3.7-opus": new AnthropicAdapter("claude-3.7-opus"),
  "claude-3.5-sonnet": new AnthropicAdapter("claude-3.5-sonnet"),
  
  // Google Models
  "gemini-2.5-flash": new GoogleAdapter("gemini-2.5-flash"),
  "gemini-2.5-pro": new GoogleAdapter("gemini-2.5-pro"),
  "gemini-1.5-flash": new GoogleAdapter("gemini-1.5-flash"),
  
  // Mistral Models
  "mistral-large": new MistralAdapter("mistral-large"),
  "mistral-medium": new MistralAdapter("mistral-medium"),
  "mistral-small": new MistralAdapter("mistral-small"),
  
  // Cohere Models
  "command-r": new CohereAdapter("command-r"),
  "command-r-plus": new CohereAdapter("command-r-plus"),
  "command-light": new CohereAdapter("command-light")
};

// Utility function to get all available models by provider
export function getModelsByProvider(): Record<string, string[]> {
  const providers: Record<string, string[]> = {};
  
  Object.entries(adapterRegistry).forEach(([modelId, adapter]) => {
    if (!providers[adapter.providerName]) {
      providers[adapter.providerName] = [];
    }
    providers[adapter.providerName].push(modelId);
  });
  
  return providers;
}

// Get an adapter by model ID
export function getAdapter(modelId: string): ModelAdapter | undefined {
  return adapterRegistry[modelId];
}

// Get all adapters by provider name
export function getAdaptersByProvider(providerName: string): ModelAdapter[] {
  return Object.values(adapterRegistry).filter(adapter => 
    adapter.providerName === providerName
  );
}
