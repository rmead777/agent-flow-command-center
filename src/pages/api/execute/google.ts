
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
    const apiKey = await getApiKey(userId, 'Google Gemini', modelId);
    if (!apiKey) {
      return res.status(404).json({ 
        error: true, 
        message: `No API key found for Google Gemini model: ${modelId}. Please add your API key in the API Keys page.` 
      });
    }
    
    // Make the request to Google Gemini API
    console.log(`Making request to Google Gemini API for model: ${modelId}`);
    
    // Construct Google Gemini API URL
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
    
    // Format the request for Google Gemini API
    const geminiRequest = {
      contents: request.messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'USER' : msg.role === 'system' ? 'SYSTEM' : 'MODEL',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.max_tokens || 1024,
      }
    };
    
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequest)
    });
    
    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      return handleApiError(res, {
        status: geminiResponse.status,
        message: `Google Gemini API error: ${errorData.error?.message || 'Unknown error'}`,
        details: errorData
      });
    }
    
    const data = await geminiResponse.json();
    
    // Convert Google Gemini response format to standardized format
    const formattedResponse = {
      choices: [{
        message: {
          content: data.candidates[0].content.parts[0].text,
          role: 'assistant'
        }
      }],
      usage: data.usageMetadata || {}
    };
    
    return res.status(200).json(formattedResponse);
    
  } catch (error) {
    return handleApiError(res, error);
  }
}
