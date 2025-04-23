
import { Request, Response } from 'express';
import { supabase } from "@/integrations/supabase/client";

export async function getApiKey(userId: string, provider: string, model: string): Promise<string | null> {
  try {
    console.log(`Fetching API key for user ${userId}, provider ${provider}, model ${model}`);
    
    // Query the api_keys table
    const { data, error } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('model', model)
      .single();
    
    if (error) {
      console.error('Error fetching API key:', error);
      return null;
    }
    
    if (!data) {
      console.log('No API key found');
      return null;
    }
    
    return data.api_key;
  } catch (error) {
    console.error('Unexpected error fetching API key:', error);
    return null;
  }
}

export function handleApiError(res: Response, error: any) {
  console.error('API request error:', error);
  const status = error.status || 500;
  const message = error.message || 'Unknown error occurred';
  
  return res.status(status).json({
    error: true,
    message,
    details: error.details || null
  });
}
