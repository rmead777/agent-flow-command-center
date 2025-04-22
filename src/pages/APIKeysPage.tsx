
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Predefined list of providers
const PROVIDERS = [
  'OpenAI',
  'Anthropic',
  'Google Gemini',
  'Mistral',
  'Cohere'
];

interface APIKey {
  id: string;
  provider: string;
  created_at: string;
}

const APIKeysPage = () => {
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [apiKey, setAPIKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      setUserId(currentUserId);
      
      // Only fetch API keys if we have a user ID
      if (currentUserId) {
        fetchAPIKeys();
      } else {
        // If not authenticated, redirect to login or show message
        toast({
          title: "Authentication Required",
          description: "Please sign in to manage your API keys",
          variant: "destructive"
        });
      }
    };
    
    getUser();
  }, []);

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const newUserId = session?.user?.id;
        setUserId(newUserId);
        
        if (newUserId) {
          fetchAPIKeys();
        } else {
          setAPIKeys([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch existing API keys
  const fetchAPIKeys = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, provider, created_at')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      setAPIKeys(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching API keys",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  // Add a new API key
  const handleAddAPIKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add API keys",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedProvider || !apiKey.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a provider and enter an API key",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('api_keys')
        .upsert({
          user_id: userId,
          provider: selectedProvider,
          api_key: apiKey
        });
      
      if (error) throw error;
      
      toast({ title: "API Key Added", description: `Key for ${selectedProvider} successfully saved` });
      
      // Reset form
      setSelectedProvider('');
      setAPIKey('');
      
      // Refresh list
      fetchAPIKeys();
    } catch (error: any) {
      toast({
        title: "Error Adding API Key",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  // Delete an API key
  const handleDeleteAPIKey = async (id: string) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast({ title: "API Key Deleted", description: "Key successfully removed" });
      fetchAPIKeys();
    } catch (error: any) {
      toast({
        title: "Error Deleting API Key",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  if (!userId) {
    return (
      <div className="max-w-2xl mx-auto mt-10 px-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Manage API Keys</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-lg mb-4">You need to be signed in to manage your API keys.</p>
            <Button onClick={() => window.location.href = "/auth"}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Manage API Keys</h1>
      
      <form 
        onSubmit={handleAddAPIKey} 
        className="mb-8 bg-white dark:bg-gray-900 rounded-lg p-4 shadow flex flex-col gap-2"
      >
        <select
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={loading}
        >
          <option value="">Select Provider</option>
          {PROVIDERS.map(provider => (
            <option key={provider} value={provider}>{provider}</option>
          ))}
        </select>
        
        <Input
          type="password"
          placeholder="Enter API Key"
          value={apiKey}
          onChange={(e) => setAPIKey(e.target.value)}
          disabled={loading}
        />
        
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Add API Key"}
        </Button>
      </form>
      
      <div className="space-y-4">
        {apiKeys.length === 0 && (
          <div className="text-gray-500 text-center">No API keys added yet</div>
        )}
        
        {apiKeys.map((key) => (
          <Card key={key.id} className="flex justify-between items-center p-4">
            <div>
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-lg">{key.provider}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-sm text-gray-500">
                Added on {new Date(key.created_at).toLocaleString()}
              </CardContent>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleDeleteAPIKey(key.id)}
              disabled={loading}
            >
              Delete
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default APIKeysPage;
