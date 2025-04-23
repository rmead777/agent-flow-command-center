import { ModelAdapter } from "./ModelAdapter";
import { OpenAIAdapter } from "./OpenAIAdapter";
import { AnthropicAdapter } from "./AnthropicAdapter";
import { GoogleAdapter } from "./GoogleAdapter";
import { MistralAdapter } from "./MistralAdapter";
import { CohereAdapter } from "./CohereAdapter";
import { XAIAdapter } from "./XAIAdapter";
import { DeepSeekAdapter } from "./DeepSeekAdapter";
import { MockAdapter } from "./MockAdapter";
import { PerplexityAdapter } from "./PerplexityAdapter";

// Register all provider models
export const adapterRegistry: Record<string, ModelAdapter> = {
  // OpenAI Models
  "gpt-4o": new OpenAIAdapter("gpt-4o"),
  "gpt-4.1": new OpenAIAdapter("gpt-4.1"),
  "gpt-4o-mini": new OpenAIAdapter("gpt-4o-mini"),
  "gpt-4.5-preview": new OpenAIAdapter("gpt-4.5-preview"),
  // OpenAI o-models with normalized IDs
  "o3": new OpenAIAdapter("o3"),
  "o3-mini": new OpenAIAdapter("o3-mini"),
  "o4-mini": new OpenAIAdapter("o4-mini"),

  // Anthropic Models
  "claude-3.7-sonnet": new AnthropicAdapter("claude-3.7-sonnet"),
  "claude-3.7-opus": new AnthropicAdapter("claude-3.7-opus"),
  "claude-3.5-sonnet": new AnthropicAdapter("claude-3.5-sonnet"),
  "claude-3.7-sonnet-reasoning": new AnthropicAdapter("claude-3.7-sonnet"), // Same model, reasoning toggled via config
  
  // Google Models
  "gemini-2.5-flash": new GoogleAdapter("gemini-2.5-flash"),
  "gemini-2.5-pro": new GoogleAdapter("gemini-2.5-pro"),
  "gemini-1.5-flash": new GoogleAdapter("gemini-1.5-flash"),
  "gemini-2.5-flash-preview-04-17": new GoogleAdapter("gemini-2.5-flash-preview-04-17"),
  "gemini-2.5-pro-preview": new GoogleAdapter("gemini-2.5-pro-preview"),
  
  // Mistral Models
  "mistral-large": new MistralAdapter("mistral-large"),
  "mistral-medium": new MistralAdapter("mistral-medium"),
  "mistral-small": new MistralAdapter("mistral-small"),
  
  // Cohere Models
  "command-r": new CohereAdapter("command-r"),
  "command-r-plus": new CohereAdapter("command-r-plus"),
  "command-light": new CohereAdapter("command-light"),

  // XAI Models normalized to lowercase
  "grok-3-beta": new XAIAdapter("grok-3-beta"),
  "grok-3-mini-beta": new XAIAdapter("grok-3-mini-beta"),
  // Keep legacy uppercase versions for backward compatibility
  "Grok-3-beta": new XAIAdapter("grok-3-beta"),
  "Grok-3-mini-beta": new XAIAdapter("grok-3-mini-beta"),

  // DeepSeek Models normalized
  "deepseek-r1": new DeepSeekAdapter("deepseek-r1"),
  "deepseek-v3-0324": new DeepSeekAdapter("deepseek-v3-0324"),
  // Keep legacy versions for backward compatibility
  "DeepSeek-R1": new DeepSeekAdapter("deepseek-r1"),
  "DeepSeek-V3-0324": new DeepSeekAdapter("deepseek-v3-0324"),
  
  // Mock Model
  "mock-model": new MockAdapter(),
  
  // Perplexity Models
  "sonar-pro": new PerplexityAdapter("sonar-pro"),
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
