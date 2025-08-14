
import React, { useState, useEffect } from "react";
import { PROVIDERS } from "./apiKeyProviders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ModelId } from "@/adapters/modelRegistryV2";

interface APIKey {
  id: string;
  provider: string;
  model: string;
  created_at: string;
}

interface Props {
  loading: boolean;
  apiKeys: APIKey[];
  onSubmit: (provider: string, model: string, apiKey: string) => Promise<void>;
}

const STORAGE_KEY_PROVIDER = "apiKeySelectedProvider";
const STORAGE_KEY_MODEL = "apiKeySelectedModel";

const APIKeyForm: React.FC<Props> = ({ loading, apiKeys, onSubmit }) => {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [apiKey, setAPIKey] = useState("");

  // Load persisted selection on mount
  useEffect(() => {
    const savedProvider = localStorage.getItem(STORAGE_KEY_PROVIDER);
    if (savedProvider) {
      console.log("Restoring saved provider:", savedProvider);
      setSelectedProvider(savedProvider);
      
      // Try to restore the model as well
      const savedModel = localStorage.getItem(STORAGE_KEY_MODEL);
      if (savedModel) {
        console.log("Restoring saved model:", savedModel);
        // Only set the model if it belongs to the provider
        const providerModels = PROVIDERS.find(p => p.name === savedProvider)?.models || [];
        if (providerModels.includes(savedModel as ModelId)) {
          setSelectedModel(savedModel);
        }
      }
    }
  }, []);

  // Update selected model when provider changes
  useEffect(() => {
    if (selectedProvider) {
      localStorage.setItem(STORAGE_KEY_PROVIDER, selectedProvider);
      // If provider changes, clear the model selection
      setSelectedModel("");
      localStorage.removeItem(STORAGE_KEY_MODEL);
    }
  }, [selectedProvider]);

  // Save model selection to localStorage
  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem(STORAGE_KEY_MODEL, selectedModel);
    }
  }, [selectedModel]);

  // Get available models for the selected provider
  const availableModels =
    PROVIDERS.find((p) => p.name === selectedProvider)?.models || [];

  // Filter out models that already have API keys
  const availableModelOptions = availableModels.filter(
    (model) =>
      !apiKeys.some(
        (key) =>
          key.provider === selectedProvider && key.model === model
      )
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProvider || !selectedModel || !apiKey.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a provider, model, and enter an API key",
        variant: "destructive",
      });
      return;
    }

    await onSubmit(selectedProvider, selectedModel, apiKey);
    // Clear the form
    setAPIKey("");
    // Don't clear provider/model selections to make it easier to add multiple keys
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Add New API Key</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Provider</label>
              <Select
                value={selectedProvider}
                onValueChange={(value) => {
                  console.log("Provider selected:", value);
                  setSelectedProvider(value);
                }}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((provider) => (
                    <SelectItem key={provider.name} value={provider.name}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <Select
                value={selectedModel}
                onValueChange={(value) => {
                  console.log("Model selected:", value);
                  setSelectedModel(value);
                }}
                disabled={
                  !selectedProvider ||
                  loading ||
                  availableModelOptions.length === 0
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModelOptions.length === 0 ? (
                    <SelectItem value="no-models-available" disabled>
                      No available models
                    </SelectItem>
                  ) : (
                    availableModelOptions.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <Input
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setAPIKey(e.target.value)}
              disabled={loading || !selectedProvider || !selectedModel}
              className="font-mono"
            />
          </div>

          <Button
            type="submit"
            disabled={
              loading || !selectedProvider || !selectedModel || !apiKey
            }
            className="w-full"
          >
            {loading ? "Adding..." : "Add API Key"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default APIKeyForm;
