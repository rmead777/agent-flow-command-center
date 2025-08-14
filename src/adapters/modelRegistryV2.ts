
import { ModelDescriptor } from './types';

/**
 * Registry V2 - Single source of truth for all AI models
 * This replaces the old adapterRegistry system
 */
export const modelRegistry = {
  // --- OpenAI Models ---
  'gpt-4o': {
    provider: 'OpenAI',
    capabilities: { text: true, images: true, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.',
      enableWebSearch: false
    }
  },
  'gpt-4.1': {
    provider: 'OpenAI',
    capabilities: { text: true, images: true, web_search: true },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.',
      enableWebSearch: false
    }
  },
  'gpt-4o-mini': {
    provider: 'OpenAI',
    capabilities: { text: true, images: true, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.',
      enableWebSearch: false
    }
  },
  'gpt-4.5-preview': {
    provider: 'OpenAI',
    capabilities: { text: true, images: true, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.',
      enableWebSearch: false
    }
  },
  'gpt-4.1-mini-2025-04-14': {
    provider: 'OpenAI',
    capabilities: { text: true, images: true, web_search: true },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.',
      enableWebSearch: false
    }
  },
  'gpt-4o-2024-08-06': {
    provider: 'OpenAI',
    capabilities: { text: true, images: true, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.',
      enableWebSearch: false
    }
  },
  'gpt-4.1-2025-04-14': {
    provider: 'OpenAI',
    capabilities: { text: true, images: true, web_search: true },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.',
      enableWebSearch: false
    }
  },
  'gpt-5-2025-08-07': {
    provider: 'OpenAI',
    capabilities: { text: true, images: true, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.',
      enableWebSearch: false
    }
  },
  'gpt-5-mini-2025-08-07': {
    provider: 'OpenAI',
    capabilities: { text: true, images: true, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.',
      enableWebSearch: false
    }
  },
  'o3': {
    provider: 'OpenAI',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.',
      enableWebSearch: false
    }
  },
  'o3-mini': {
    provider: 'OpenAI',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.',
      enableWebSearch: false
    }
  },
  'o4-mini': {
    provider: 'OpenAI',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.',
      enableWebSearch: false
    }
  },

  // --- Anthropic Models ---
  'claude-3-7-sonnet-20250219': {
    provider: 'Anthropic',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 4096,
      systemPrompt: 'You are Claude, a helpful AI assistant.'
    }
  },
  'claude-opus-4-20250514': {
    provider: 'Anthropic',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 4096,
      systemPrompt: 'You are Claude, a helpful AI assistant.'
    }
  },
  'claude-opus-4-1-20250805': {
    provider: 'Anthropic',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 4096,
      systemPrompt: 'You are Claude, a helpful AI assistant.'
    }
  },
  'claude-sonnet-4-20250514': {
    provider: 'Anthropic',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 4096,
      systemPrompt: 'You are Claude, a helpful AI assistant.'
    }
  },
  // Backward compatibility alias
  'claude-3.7-sonnet': {
    provider: 'Anthropic',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 4096,
      systemPrompt: 'You are Claude, a helpful AI assistant.'
    },
    apiModelId: 'claude-3-7-sonnet-20250219'
  },

  // --- Google Gemini Models ---
  'gemini-2.5-flash-preview-04-17': {
    provider: 'Google Gemini',
    capabilities: { text: true, images: true, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are Gemini, a helpful AI assistant.'
    }
  },
  'gemini-2.5-pro-preview-03-25': {
    provider: 'Google Gemini',
    capabilities: { text: true, images: true, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are Gemini, a helpful AI assistant.'
    }
  },
  'gemini-2.0-flash': {
    provider: 'Google Gemini',
    capabilities: { text: true, images: true, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are Gemini, a helpful AI assistant.'
    }
  },
  'gemini-2.0-flash-lite': {
    provider: 'Google Gemini',
    capabilities: { text: true, images: true, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are Gemini, a helpful AI assistant.'
    }
  },
  'gemini-1.5-flash': {
    provider: 'Google Gemini',
    capabilities: { text: true, images: true, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are Gemini, a helpful AI assistant.'
    }
  },
  'gemini-1.5-flash-8b': {
    provider: 'Google Gemini',
    capabilities: { text: true, images: true, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are Gemini, a helpful AI assistant.'
    }
  },
  'gemini-1.5-pro': {
    provider: 'Google Gemini',
    capabilities: { text: true, images: true, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are Gemini, a helpful AI assistant.'
    }
  },
  'gemini-2.5-pro': {
    provider: 'Google Gemini',
    capabilities: { text: true, images: true, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are Gemini, a helpful AI assistant.'
    }
  },

  // --- Mistral Models ---
  'mistral-large': {
    provider: 'Mistral',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful AI assistant.'
    }
  },
  'mistral-medium': {
    provider: 'Mistral',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful AI assistant.'
    }
  },
  'mistral-small': {
    provider: 'Mistral',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful AI assistant.'
    }
  },

  // --- Cohere Models ---
  'command-r': {
    provider: 'Cohere',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful AI assistant.'
    }
  },
  'command-r-plus': {
    provider: 'Cohere',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful AI assistant.'
    }
  },
  'command-light': {
    provider: 'Cohere',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful AI assistant.'
    }
  },

  // --- XAI Models ---
  'grok-3-beta': {
    provider: 'XAI',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.'
    },
    apiModelId: 'grok-3-latest'
  },
  'grok-3-mini-beta': {
    provider: 'XAI',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.'
    },
    apiModelId: 'grok-3-mini-latest'
  },
  'grok-4': {
    provider: 'XAI',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.'
    },
    apiModelId: 'grok-4-latest'
  },
  'grok-4-0709': {
    provider: 'XAI',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.'
    }
  },
  'grok-4-latest': {
    provider: 'XAI',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.'
    }
  },
  // Legacy uppercase aliases
  'Grok-3-beta': {
    provider: 'XAI',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.'
    },
    apiModelId: 'grok-3-latest'
  },
  'Grok-3-mini-beta': {
    provider: 'XAI',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.'
    },
    apiModelId: 'grok-3-mini-latest'
  },

  // --- DeepSeek Models ---
  'deepseek-r1': {
    provider: 'DeepSeek',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.'
    }
  },
  'deepseek-v3-0324': {
    provider: 'DeepSeek',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.'
    }
  },
  // Legacy uppercase aliases
  'DeepSeek-R1': {
    provider: 'DeepSeek',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.'
    },
    apiModelId: 'deepseek-r1'
  },
  'DeepSeek-V3-0324': {
    provider: 'DeepSeek',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.'
    },
    apiModelId: 'deepseek-v3-0324'
  },

  // --- Perplexity Models ---
  'sonar-pro': {
    provider: 'Perplexity',
    capabilities: { text: true, images: false, web_search: true },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 8000,
      systemPrompt: 'You are a helpful assistant.',
      enableWebSearch: true
    }
  },
  'sonar-deep-research': {
    provider: 'Perplexity',
    capabilities: { text: true, images: false, web_search: true },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 8000,
      systemPrompt: 'You are a helpful assistant.',
      enableWebSearch: true
    }
  },

  // --- Together AI Models ---
  'llama-4-maverick-instruct': {
    provider: 'Together AI',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.2,
      maxTokens: 2048,
      systemPrompt: 'You are a helpful AI assistant.'
    }
  },
  'llama-4-scout-instruct': {
    provider: 'Together AI',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.2,
      maxTokens: 2048,
      systemPrompt: 'You are a helpful AI assistant.'
    }
  },

  // --- Mock Model ---
  'mock-model': {
    provider: 'Mock',
    capabilities: { text: true, images: false, web_search: false },
    defaultConfig: {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: 'You are a helpful assistant.'
    }
  }
} as const satisfies Record<string, ModelDescriptor>;

// Type-safe exports
export type ModelId = keyof typeof modelRegistry;
export type ProviderId = typeof modelRegistry[ModelId]['provider'];

// Utility functions
export function getModelDescriptor(modelId: ModelId): ModelDescriptor {
  return modelRegistry[modelId];
}

export function getModelsByProvider(): Record<string, ModelId[]> {
  const providers: Record<string, ModelId[]> = {};
  
  Object.entries(modelRegistry).forEach(([modelId, descriptor]) => {
    if (!providers[descriptor.provider]) {
      providers[descriptor.provider] = [];
    }
    providers[descriptor.provider].push(modelId as ModelId);
  });
  
  return providers;
}

export function getAllProviders(): string[] {
  return Array.from(new Set(Object.values(modelRegistry).map(d => d.provider)));
}

export function isValidModelId(modelId: string): modelId is ModelId {
  return modelId in modelRegistry;
}
