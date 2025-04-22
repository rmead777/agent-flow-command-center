
import React, { useState } from "react";
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
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [apiKey, setAPIKey] = useState("");

  const availableModels =
    PROVIDERS.find((p) => p.name === selectedProvider)?.models || [];
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
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 bg-white dark:bg-gray-900 rounded-lg p-4 shadow flex flex-col gap-2"
    >
      <div>
        <Select
          value={selectedProvider}
          onValueChange={(value) => {
            setSelectedProvider(value);
            setSelectedModel("");
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
        <Select
          value={selectedModel}
          onValueChange={setSelectedModel}
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
              <SelectItem value="" disabled>
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
          loading || !selectedProvider || !selectedModel || !apiKey
        }
      >
        {loading ? "Saving..." : "Add API Key"}
      </Button>
    </form>
  );
};

export default APIKeyForm;
