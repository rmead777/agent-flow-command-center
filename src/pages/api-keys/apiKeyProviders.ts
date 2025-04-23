
export const PROVIDERS = [
  {
    name: 'OpenAI',
    models: [
      'gpt-4o', 
      'gpt-4.1', 
      'gpt-4o-mini', 
      'gpt-4.5-preview',
      'o3', 
      'o3-mini', 
      'o4-mini',
    ]
  },
  {
    name: 'Anthropic',
    models: [
      'claude-3.7-sonnet', 
      'claude-3.7-opus', 
      'claude-3.5-sonnet',
      'claude-3.7-sonnet-reasoning'
    ]
  },
  {
    name: 'Google Gemini',
    models: [
      'gemini-2.5-flash', 
      'gemini-2.5-pro', 
      'gemini-1.5-flash',
      'gemini-2.5-flash-preview-04-17',
      'gemini-2.5-pro-preview'
    ]
  },
  {
    name: 'Mistral',
    models: [
      'mistral-large', 
      'mistral-medium', 
      'mistral-small'
    ]
  },
  {
    name: 'Cohere',
    models: [
      'command-r', 
      'command-r-plus', 
      'command-light'
    ]
  },
  {
    name: 'XAI',
    models: [
      'grok-3-beta',
      'grok-3-mini-beta'
    ]
  },
  {
    name: 'DeepSeek',
    models: [
      'deepseek-r1',
      'deepseek-v3-0324'
    ]
  },
  // Add Mock provider for simulation/testing
  {
    name: 'Mock',
    models: [
      'mock-model'
    ]
  },
];
