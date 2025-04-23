import type { Request, Response } from 'express';
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
    const apiKey = await getApiKey(userId, 'Cohere', modelId);
    if (!apiKey) {
      return res.status(404).json({ 
        error: true, 
        message: `No API key found for Cohere model: ${modelId}. Please add your API key in the API Keys page.` 
      });
    }
    
    // Make the request to Cohere API
    console.log(`Making request to Cohere API for model: ${modelId}`);
    
    const cohereResponse = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        message: request.message,
        preamble: request.preamble,
        max_tokens: request.max_tokens || 1024,
        temperature: request.temperature || 0.7
      })
    });
    
    if (!cohereResponse.ok) {
      const errorData = await cohereResponse.json();
      return handleApiError(res, {
        status: cohereResponse.status,
        message: `Cohere API error: ${errorData.error?.message || 'Unknown error'}`,
        details: errorData
      });
    }
    
    const data = await cohereResponse.json();
    return res.status(200).json(data);
    
  } catch (error) {
    return handleApiError(res, error);
  }
}
