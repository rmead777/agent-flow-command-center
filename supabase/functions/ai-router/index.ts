import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Provider-specific executors
async function executeOpenAI(modelId: string, request: any, apiKey: string) {
  console.log(`Executing OpenAI model: ${modelId}`);
  
  // Handle special models that use max_completion_tokens
  const useCompletionTokens = ['o3', 'o3-mini', 'o4-mini'].includes(modelId);
  
  const payload: any = {
    model: modelId,
    messages: request.messages,
  };
  
  if (useCompletionTokens) {
    payload.max_completion_tokens = request.maxTokens || 512;
    // These models don't support temperature
  } else {
    payload.max_tokens = request.maxTokens || 512;
    payload.temperature = request.temperature ?? 0.7;
  }
  
  // Add web search tool if enabled
  if (request.enableWebSearch && ['gpt-4.1', 'gpt-4.1-mini-2025-04-14'].includes(modelId)) {
    payload.tools = [{
      type: "function",
      function: {
        name: "web_search",
        description: "Search the web for relevant information",
        parameters: { type: "object", properties: {}, required: [] }
      }
    }];
  }
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
  }
  
  return response.json();
}

async function executeAnthropic(modelId: string, request: any, apiKey: string) {
  console.log(`Executing Anthropic model: ${modelId}`);
  
  // Handle system prompt separately for Anthropic
  const systemPrompt = request.systemPrompt || request.messages.find((m: any) => m.role === 'system')?.content;
  const messages = request.messages.filter((m: any) => m.role !== 'system');
  
  const payload = {
    model: modelId,
    system: systemPrompt || 'You are Claude, a helpful AI assistant.',
    messages,
    max_tokens: Math.min(request.maxTokens || 4096, 16384), // Safe limit
    temperature: request.temperature ?? 0.7
  };
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Anthropic API error: ${errorData.error?.message || 'Unknown error'}`);
  }
  
  return response.json();
}

async function executeGoogle(modelId: string, request: any, apiKey: string) {
  console.log(`Executing Google model: ${modelId}`);
  
  const systemPrompt = request.systemPrompt || request.messages.find((m: any) => m.role === 'system')?.content;
  const contents = request.messages
    .filter((m: any) => m.role !== 'system')
    .map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
  
  const payload: any = {
    contents,
    generationConfig: {
      temperature: request.temperature ?? 0.7,
      maxOutputTokens: request.maxTokens || 512,
    }
  };
  
  if (systemPrompt) {
    payload.systemInstruction = { parts: [{ text: systemPrompt }] };
  }
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Google API error: ${errorData.error?.message || 'Unknown error'}`);
  }
  
  return response.json();
}

async function executeMistral(modelId: string, request: any, apiKey: string) {
  console.log(`Executing Mistral model: ${modelId}`);
  
  const payload = {
    model: modelId,
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens || 512,
  };
  
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Mistral API error: ${errorData.error?.message || 'Unknown error'}`);
  }
  
  return response.json();
}

async function executeCohere(modelId: string, request: any, apiKey: string) {
  console.log(`Executing Cohere model: ${modelId}`);
  
  // Cohere uses a different format
  const userMessage = request.messages.find((m: any) => m.role === 'user')?.content || '';
  const systemPrompt = request.systemPrompt || request.messages.find((m: any) => m.role === 'system')?.content;
  
  const payload = {
    model: modelId,
    message: userMessage,
    preamble: systemPrompt || 'You are a helpful AI assistant.',
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens || 512,
  };
  
  const response = await fetch('https://api.cohere.ai/v1/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Cohere API error: ${errorData.error?.message || 'Unknown error'}`);
  }
  
  return response.json();
}

async function executeXAI(modelId: string, request: any, apiKey: string) {
  console.log(`Executing XAI model: ${modelId}`);
  
  const payload = {
    model: modelId,
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens || 512,
  };
  
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`XAI API error: ${errorData.error?.message || 'Unknown error'}`);
  }
  
  return response.json();
}

async function executeDeepSeek(modelId: string, request: any, apiKey: string) {
  console.log(`Executing DeepSeek model: ${modelId}`);
  
  const payload = {
    model: modelId.toLowerCase(), // DeepSeek requires lowercase
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens || 512,
  };
  
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`DeepSeek API error: ${errorData.error?.message || 'Unknown error'}`);
  }
  
  return response.json();
}

async function executePerplexity(modelId: string, request: any, apiKey: string) {
  console.log(`Executing Perplexity model: ${modelId}`);
  
  const payload = {
    model: modelId,
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens || 8000,
    top_p: 0.9,
    return_images: false,
    return_related_questions: false,
    frequency_penalty: 1,
    presence_penalty: 0
  };
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Perplexity API error: ${errorData.error?.message || 'Unknown error'}`);
  }
  
  return response.json();
}

// Get API key from database
async function getApiKey(supabase: any, userId: string, provider: string, modelId: string): Promise<string | null> {
  try {
    console.log(`Fetching API key for user ${userId}, provider ${provider}, model ${modelId}`);
    
    // Try exact match first
    const { data: exact, error: exactError } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('model', modelId)
      .maybeSingle();

    if (exact?.api_key) {
      return exact.api_key;
    }

    // Fallback to any key for the provider
    const { data: fallback, error: fallbackError } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('user_id', userId)
      .eq('provider', provider)
      .limit(1);

    if (Array.isArray(fallback) && fallback.length > 0) {
      return fallback[0].api_key;
    }

    return null;
  } catch (error) {
    console.error('Error fetching API key:', error);
    return null;
  }
}

// Parse response based on provider
function parseResponse(provider: string, response: any) {
  switch (provider) {
    case 'OpenAI':
      return {
        output: response.choices?.[0]?.message?.content || '',
        usage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0
        },
        raw: response
      };
    
    case 'Anthropic':
      return {
        output: response.content?.[0]?.text || '',
        usage: {
          inputTokens: response.usage?.input_tokens || 0,
          outputTokens: response.usage?.output_tokens || 0
        },
        raw: response
      };
    
    case 'Google Gemini':
      return {
        output: response.candidates?.[0]?.content?.parts?.[0]?.text || '',
        usage: {
          inputTokens: response.usageMetadata?.promptTokenCount || 0,
          outputTokens: response.usageMetadata?.candidatesTokenCount || 0
        },
        raw: response
      };
    
    case 'Mistral':
      return {
        output: response.choices?.[0]?.message?.content || '',
        usage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0
        },
        raw: response
      };
    
    case 'Cohere':
      return {
        output: response.generations?.[0]?.text || '',
        usage: {
          inputTokens: response.meta?.usage?.input_tokens || 0,
          outputTokens: response.meta?.usage?.output_tokens || 0
        },
        raw: response
      };
    
    case 'XAI':
    case 'DeepSeek':
      return {
        output: response.choices?.[0]?.message?.content || '',
        usage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0
        },
        raw: response
      };
    
    case 'Perplexity':
      return {
        output: response.choices?.[0]?.message?.content || '',
        usage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0
        },
        citations: response.citations || [],
        raw: response
      };
    
    case 'Mock':
      return {
        output: `[Mock response for model]`,
        usage: { inputTokens: 10, outputTokens: 10 },
        raw: response
      };
    
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { modelId, request: standardRequest, userId } = await req.json();
    
    console.log(`AI Router - Processing request for model: ${modelId}, user: ${userId}`);
    
    if (!modelId || !standardRequest || !userId) {
      throw new Error('Missing required parameters: modelId, request, or userId');
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Model registry (simplified for edge function)
    const modelRegistry: Record<string, { provider: string; apiModelId?: string }> = {
      // OpenAI
      'gpt-4o': { provider: 'OpenAI' },
      'gpt-4.1': { provider: 'OpenAI' },
      'gpt-4o-mini': { provider: 'OpenAI' },
      'o3': { provider: 'OpenAI' },
      'o3-mini': { provider: 'OpenAI' },
      'o4-mini': { provider: 'OpenAI' },
      // Anthropic
      'claude-3-7-sonnet-20250219': { provider: 'Anthropic' },
      'claude-opus-4-20250514': { provider: 'Anthropic' },
      'claude-opus-4-1-20250805': { provider: 'Anthropic' },
      'claude-sonnet-4-20250514': { provider: 'Anthropic' },
      'claude-3.7-sonnet': { provider: 'Anthropic', apiModelId: 'claude-3-7-sonnet-20250219' },
      // Google
      'gemini-2.0-flash': { provider: 'Google Gemini' },
      'gemini-1.5-pro': { provider: 'Google Gemini' },
      'gemini-2.5-pro': { provider: 'Google Gemini' },
      // XAI
      'grok-3-beta': { provider: 'XAI', apiModelId: 'grok-3-latest' },
      'grok-4': { provider: 'XAI', apiModelId: 'grok-4-latest' },
      'Grok-3-beta': { provider: 'XAI', apiModelId: 'grok-3-latest' },
      // DeepSeek
      'deepseek-r1': { provider: 'DeepSeek' },
      'deepseek-v3-0324': { provider: 'DeepSeek' },
      'DeepSeek-R1': { provider: 'DeepSeek', apiModelId: 'deepseek-r1' },
      // Others
      'mistral-large': { provider: 'Mistral' },
      'command-r-plus': { provider: 'Cohere' },
      'sonar-pro': { provider: 'Perplexity' },
      'mock-model': { provider: 'Mock' }
    };
    
    const modelDescriptor = modelRegistry[modelId];
    if (!modelDescriptor) {
      throw new Error(`Model '${modelId}' not found in registry`);
    }
    
    const { provider, apiModelId } = modelDescriptor;
    const actualModelId = apiModelId || modelId;
    
    // Handle mock model
    if (provider === 'Mock') {
      const mockResponse = parseResponse(provider, { mock: true });
      return new Response(JSON.stringify(mockResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get API key
    const apiKey = await getApiKey(supabase, userId, provider, modelId);
    if (!apiKey) {
      throw new Error(`No API key found for provider '${provider}' and model '${modelId}'`);
    }
    
    // Execute model based on provider
    let response;
    switch (provider) {
      case 'OpenAI':
        response = await executeOpenAI(actualModelId, standardRequest, apiKey);
        break;
      case 'Anthropic':
        response = await executeAnthropic(actualModelId, standardRequest, apiKey);
        break;
      case 'Google Gemini':
        response = await executeGoogle(actualModelId, standardRequest, apiKey);
        break;
      case 'Mistral':
        response = await executeMistral(actualModelId, standardRequest, apiKey);
        break;
      case 'Cohere':
        response = await executeCohere(actualModelId, standardRequest, apiKey);
        break;
      case 'XAI':
        response = await executeXAI(actualModelId, standardRequest, apiKey);
        break;
      case 'DeepSeek':
        response = await executeDeepSeek(actualModelId, standardRequest, apiKey);
        break;
      case 'Perplexity':
        response = await executePerplexity(actualModelId, standardRequest, apiKey);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
    
    // Parse and return standardized response
    const standardResponse = parseResponse(provider, response);
    
    return new Response(JSON.stringify(standardResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('AI Router error:', error);
    return new Response(JSON.stringify({ 
      error: true, 
      message: error.message || 'Unknown error occurred',
      details: error 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
