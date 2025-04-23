
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

const APIKeyForm: React.FC<Props> = ({ loading, apiKeys, onSubmit }) => {
  const [selectedProvider, setSelectedProvider] = useState<string>(() => {
    return localStorage.getItem("apiKeySelectedProvider") || "";
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem("apiKeySelectedModel") || "";
  });
  const [apiKey, setAPIKey] = useState("");

  // Update selected model when provider changes
  useEffect(() => {
    setSelectedModel("");
  }, [selectedProvider]);

  // Load persisted selection on mount
  useEffect(() => {
    const maybeSavedProvider = localStorage.getItem("apiKeySelectedProvider");
    const maybeSavedModel = localStorage.getItem("apiKeySelectedModel");
    if (maybeSavedProvider) setSelectedProvider(maybeSavedProvider);
    if (maybeSavedModel) setSelectedModel(maybeSavedModel);
  }, []);

  // Persist selection to localStorage on change
  useEffect(() => {
    if (selectedProvider) localStorage.setItem("apiKeySelectedProvider", selectedProvider);
    if (selectedModel) localStorage.setItem("apiKeySelectedModel", selectedModel);
  }, [selectedProvider, selectedModel]);

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
    setSelectedProvider("");
    setSelectedModel("");
    setAPIKey("");
    localStorage.removeItem("apiKeySelectedProvider");
    localStorage.removeItem("apiKeySelectedModel");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 bg-white dark:bg-gray-900 rounded-lg p-4 shadow flex flex-col gap-4"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Provider</label>
        <Select
          value={selectedProvider || undefined}
          onValueChange={(value) => {
            setSelectedProvider(value);
            localStorage.setItem("apiKeySelectedProvider", value);
          }}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
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

      <div>
        <label className="block text-sm font-medium mb-1">Model</label>
        <Select
          value={selectedModel || undefined}
          onValueChange={(value) => {
            setSelectedModel(value);
            localStorage.setItem("apiKeySelectedModel", value);
          }}
          disabled={
            !selectedProvider ||
            loading ||
            availableModelOptions.length === 0
          }
        >
          <SelectTrigger className="w-full">
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

      <div>
        <label className="block text-sm font-medium mb-1">API Key</label>
        <Input
          type="password"
          placeholder="Enter API Key"
          value={apiKey}
          onChange={(e) => setAPIKey(e.target.value)}
          disabled={loading || !selectedProvider || !selectedModel}
        />
      </div>

      <Button
        type="submit"
        disabled={
          loading || !selectedProvider || !selectedModel || !apiKey
        }
      >
        {loading ? "Saving..." : "Add API Key"}
      </Button>
    </form>
  );
};

export default APIKeyForm;
