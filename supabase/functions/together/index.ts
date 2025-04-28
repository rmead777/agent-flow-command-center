
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface TogetherRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { model, messages, temperature = 0.2, top_p = 0.9, max_tokens = 2048 } = await req.json() as TogetherRequest;
    
    // Get the API key from environment variables (set in Supabase)
    const apiKey = Deno.env.get("TOGETHER_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Determine the correct endpoint based on the model
    let endpoint;
    if (model === 'llama-4-scout-instruct') {
      endpoint = 'https://api.together.xyz/v1/chat/llama-4-scout-instruct';
    } else if (model === 'llama-4-maverick-instruct') {
      endpoint = 'https://api.together.xyz/v1/chat/llama-4-maverick-instruct';
    } else {
      endpoint = `https://api.together.xyz/v1/chat/${model}`;
    }
    
    // Make request to Together AI API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages,
        temperature,
        top_p,
        max_tokens
      })
    });
    
    // Parse the response
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Unknown API error');
    }
    
    // Transform the response to our standard format
    const result = {
      content: data.choices[0].message.content,
      usage: data.usage || {},
      raw: data
    };
    
    // Return the response
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    // Return error response
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
