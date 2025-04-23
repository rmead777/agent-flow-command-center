
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
    const apiKey = await getApiKey(userId, 'OpenAI', modelId);
    if (!apiKey) {
      return res.status(404).json({ 
        error: true, 
        message: `No API key found for OpenAI model: ${modelId}. Please add your API key in the API Keys page.` 
      });
    }
    
    // Make the request to OpenAI API
    console.log(`Making request to OpenAI API for model: ${modelId}`);
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(request)
    });
    
    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      return handleApiError(res, {
        status: openaiResponse.status,
        message: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}`,
        details: errorData
      });
    }
    
    const data = await openaiResponse.json();
    return res.status(200).json(data);
    
  } catch (error) {
    return handleApiError(res, error);
  }
}
