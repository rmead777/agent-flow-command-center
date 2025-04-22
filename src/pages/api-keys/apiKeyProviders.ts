
export const PROVIDERS = [
  {
    name: 'OpenAI',
    models: [
      'gpt-4o', 
      'gpt-4.1', 
      'gpt-4o-mini', 
      'gpt-4.5-preview',
      // ADDED below:
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
      'claude-3.5-sonnet'
    ]
  },
  {
    name: 'Google Gemini',
    models: [
      'gemini-2.5-flash', 
      'gemini-2.5-pro', 
      'gemini-1.5-flash'
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
      'Grok-3-beta',
      'Grok-3-mini-beta'
    ]
  },
  {
    name: 'DeepSeek',
    models: [
      'DeepSeek-R1',
      'DeepSeek-V3-0324'
    ]
  },
];
