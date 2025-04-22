import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// Enhanced providers configuration with models
const PROVIDERS = [
  {
    name: 'OpenAI',
    models: [
      'gpt-4o', 
      'gpt-4.1', 
      'gpt-4o-mini', 
      'gpt-4.5-preview'
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
  }
];

interface APIKey {
  id: string;
  provider: string;
  model: string;
  created_at: string;
}

const APIKeysPage = () => {
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [apiKey, setAPIKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      setUserId(currentUserId);

      if (currentUserId) {
        fetchAPIKeys();
      } else {
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

  // Fetch existing API keys with model information
  const fetchAPIKeys = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, provider, model, created_at')
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

  // Add API key with model support
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

    if (!selectedProvider || !selectedModel || !apiKey.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a provider, model, and enter an API key",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('api_keys')
        .upsert(
          {
            user_id: userId,
            provider: selectedProvider,
            model: selectedModel,
            api_key: apiKey,
            model_config: {} // Optional model-specific configuration
          }, 
          { 
            onConflict: 'user_id,provider,model' 
          }
        );

      if (error) throw error;

      toast({ 
        title: "API Key Saved", 
        description: `API key for ${selectedProvider} - ${selectedModel} saved.` 
      });
      
      setSelectedProvider('');
      setSelectedModel('');
      setAPIKey('');
      fetchAPIKeys();
    } catch (error: any) {
      toast({
        title: "Error Saving API Key",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  // Enhance delete to support model-specific keys
  const handleDeleteAPIKey = async (provider: string, model: string) => {
    if (!userId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('user_id', userId)
        .eq('provider', provider)
        .eq('model', model);

      if (error) throw error;

      toast({ 
        title: "API Key Deleted", 
        description: `${provider} - ${model} API key removed.` 
      });
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

  // Determine available models based on selected provider
  const availableModels = PROVIDERS
    .find(p => p.name === selectedProvider)?.models || [];

  // Disable models that already have keys
  const availableModelOptions = availableModels.filter(
    model => !apiKeys.some(key => 
      key.provider === selectedProvider && key.model === model)
  );

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
        {/* Provider Select */}
        <div>
          <Select
            value={selectedProvider}
            onValueChange={(value) => {
              setSelectedProvider(value);
              setSelectedModel(''); // Reset model when provider changes
            }}
            disabled={loading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Provider" />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map(provider => (
                <SelectItem key={provider.name} value={provider.name}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Select (dynamically populated) */}
        <div>
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
            disabled={!selectedProvider || loading || availableModelOptions.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              {availableModelOptions.length === 0 ? (
                <SelectItem value="" disabled>
                  No available models
                </SelectItem>
              ) : (
                availableModelOptions.map(model => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <Input
          type="password"
          placeholder="Enter API Key"
          value={apiKey}
          onChange={(e) => setAPIKey(e.target.value)}
          disabled={loading || !selectedProvider || !selectedModel}
        />

        <Button 
          type="submit" 
          disabled={
            loading || 
            !selectedProvider || 
            !selectedModel || 
            !apiKey
          }
        >
          {loading ? "Saving..." : "Add API Key"}
        </Button>
      </form>

      {/* Providers with keys */}
      <div className="space-y-4">
        {apiKeys.length === 0 && (
          <div className="text-gray-500 text-center">No API keys added yet</div>
        )}

        {apiKeys.map((key) => (
          <Card key={key.id} className="flex justify-between items-center p-4">
            <div>
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-lg">
                  {key.provider} - {key.model}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-sm text-gray-500">
                Key added on {new Date(key.created_at).toLocaleString()}
              </CardContent>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteAPIKey(key.provider, key.model)}
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
