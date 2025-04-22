
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
  const [selectedProvider, setSelectedProvider] = useState<string>('');
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

  // Add or update an API key for a provider
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
      // Upsert allows updating the provider's key if it already exists
      // Only one key per provider per user
      const { error } = await supabase
        .from('api_keys')
        .upsert({
          user_id: userId,
          provider: selectedProvider,
          api_key: apiKey
        }, { onConflict: ['user_id', 'provider'] });

      if (error) throw error;

      toast({ title: "API Key Saved", description: `API key for ${selectedProvider} saved.` });
      setSelectedProvider('');
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

  // Delete an API key
  const handleDeleteAPIKey = async (provider: string) => {
    if (!userId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('user_id', userId)
        .eq('provider', provider);

      if (error) throw error;

      toast({ title: "API Key Deleted", description: "API key removed." });
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

  // Providers the user already has keys for
  const existingProviders = apiKeys.map((key) => key.provider);

  // Only allow adding for providers without existing keys
  const availableProviders = PROVIDERS.filter(
    provider => !existingProviders.includes(provider)
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
        {/* Provider Select (shadcn/ui version for consistent style) */}
        <div>
          <Select
            value={selectedProvider}
            onValueChange={setSelectedProvider}
            disabled={loading || availableProviders.length === 0}
          >
            <SelectTrigger
              className="w-full bg-white text-black dark:bg-white dark:text-black placeholder:text-gray-400"
              aria-label="Provider"
            >
              <SelectValue placeholder="Select Provider" />
            </SelectTrigger>
            <SelectContent
              className="bg-white text-black dark:bg-white dark:text-black z-[999]"
              style={{ color: 'black' }}
            >
              {availableProviders.length === 0 && (
                <SelectItem value="" disabled>
                  All providers added
                </SelectItem>
              )}
              {availableProviders.map(provider => (
                <SelectItem
                  key={provider}
                  value={provider}
                  className="text-black bg-white hover:bg-gray-100"
                >
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Input
          type="password"
          placeholder="Enter API Key"
          value={apiKey}
          onChange={(e) => setAPIKey(e.target.value)}
          disabled={loading || !selectedProvider}
        />

        <Button type="submit" disabled={loading || !selectedProvider || !apiKey}>
          {loading ? "Saving..." : "Add API Key"}
        </Button>
      </form>

      {/* Providers with keys */}
      <div className="space-y-4">
        {apiKeys.length === 0 && (
          <div className="text-gray-500 text-center">No API keys added yet</div>
        )}

        {/* Show only the provider name and info, no actual key value */}
        {apiKeys.map((key) => (
          <Card key={key.id} className="flex justify-between items-center p-4">
            <div>
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-lg">{key.provider}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-sm text-gray-500">
                Key added on {new Date(key.created_at).toLocaleString()}
              </CardContent>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteAPIKey(key.provider)}
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
