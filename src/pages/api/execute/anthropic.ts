
import { Request, Response } from 'express';
import { getApiKey, handleApiError } from './index';
import { supabase } from "@/integrations/supabase/client";

export default async function handler(req: Request, res: Response) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: true, message: 'Method not allowed' });
  }

  try {
    const { modelId, request } = req.body;
    
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: true, message: 'Unauthorized' });
    }
    
    const userId = session.user.id;
    
    // Get API key from database
    const apiKey = await getApiKey(userId, 'Anthropic', modelId);
    if (!apiKey) {
      return res.status(404).json({ 
        error: true, 
        message: `No API key found for Anthropic model: ${modelId}. Please add your API key in the API Keys page.` 
      });
    }
    
    // Make the request to Anthropic API
    console.log(`Making request to Anthropic API for model: ${modelId}`);
    
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: modelId,
        messages: request.messages,
        max_tokens: request.max_tokens || 1024,
        temperature: request.temperature || 0.7
      })
    });
    
    if (!anthropicResponse.ok) {
      const errorData = await anthropicResponse.json();
      return handleApiError(res, {
        status: anthropicResponse.status,
        message: `Anthropic API error: ${errorData.error?.message || 'Unknown error'}`,
        details: errorData
      });
    }
    
    const data = await anthropicResponse.json();
    
    // Convert Anthropic response format to standardized format
    const formattedResponse = {
      choices: [{
        message: {
          content: data.content[0].text,
          role: 'assistant'
        }
      }],
      usage: data.usage || {}
    };
    
    return res.status(200).json(formattedResponse);
    
  } catch (error) {
    return handleApiError(res, error);
  }
}
