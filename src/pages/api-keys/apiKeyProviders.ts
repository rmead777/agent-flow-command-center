
export const PROVIDERS = [
  {
    name: 'OpenAI',
    models: [
      'gpt-4o', 
      'gpt-4.1', 
      'gpt-4o-mini', 
      'gpt-4.5-preview',
      'gpt-4.1-mini-2025-04-14',
      'o3', 
      'o3-mini', 
      'o4-mini',
      // Newly added
      'gpt-4o-2024-08-06',
      'gpt-4.1-2025-04-14',
      'gpt-5-2025-08-07',
      'gpt-5-mini-2025-08-07',
    ]
  },
  {
    name: 'Anthropic',
    models: [
      'claude-3-7-sonnet-20250219',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-3-opus-20240229',
      // Newly added
      'claude-opus-4-20250514',
      'claude-opus-4-1-20250805',
      'claude-sonnet-4-20250514',
    ]
  },
  {
    name: 'Google Gemini',
    models: [
      'gemini-2.5-flash-preview-04-17', 
      'gemini-2.5-pro-preview-03-25', 
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.5-pro',
      // Newly added
      'gemini-2.5-pro',
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
      'grok-3-mini-beta',
      'Grok-3-beta',
      'Grok-3-mini-beta',
      // Newly added
      'grok-4',
      'grok-4-0709',
      'grok-4-latest',
    ]
  },
  {
    name: 'DeepSeek',
    models: [
      'deepseek-r1',
      'deepseek-v3-0324',
      'DeepSeek-R1',
      'DeepSeek-V3-0324'
    ]
  },
  {
    name: 'Mock',
    models: [
      'mock-model'
    ]
  },
  {
    name: 'Perplexity',
    models: [
      'sonar-pro',
      'sonar-deep-research'
    ]
  },
  {
    name: 'Together AI',
    models: [
      'llama-4-maverick-instruct',
      'llama-4-scout-instruct'
    ]
  },
];
