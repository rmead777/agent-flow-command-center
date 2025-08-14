
/**
 * Type-safe foundation for the AI model router system
 */

/** A standard, provider-agnostic request format */
export interface StandardRequest {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  enableWebSearch?: boolean;
  tools?: any[];
}

/** A standard, provider-agnostic response format */
export interface StandardResponse {
  output: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  citations?: any[];
  raw: any;
}

/** Model capabilities */
export interface ModelCapabilities {
  text: boolean;
  images: boolean;
  web_search: boolean;
}

/** Model descriptor in the registry */
export interface ModelDescriptor {
  provider: string;
  capabilities: ModelCapabilities;
  defaultConfig: {
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    enableWebSearch: boolean;
    [key: string]: any;
  };
  apiModelId?: string; // For cases where registry ID differs from API ID
}

/** Error types for better handling */
export class APIKeyMissingError extends Error {
  constructor(provider: string) {
    super(`API key for provider '${provider}' is missing.`);
    this.name = 'APIKeyMissingError';
  }
}

export class ProviderHTTPError extends Error {
  constructor(provider: string, status: number, message: string) {
    super(`[${provider}] HTTP Error ${status}: ${message}`);
    this.name = 'ProviderHTTPError';
  }
}

export class ModelNotFoundError extends Error {
  constructor(modelId: string) {
    super(`Model '${modelId}' not found in registry.`);
    this.name = 'ModelNotFoundError';
  }
}
