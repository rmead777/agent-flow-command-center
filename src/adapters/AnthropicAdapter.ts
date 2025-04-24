
import { ModelAdapter } from "./ModelAdapter";

export class AnthropicAdapter implements ModelAdapter {
  modelName: string;
  providerName = "Anthropic";
  supportedFeatures = ["text"];

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  buildRequest(input: string, config: any) {
    // Create request object following Anthropic's API format
    return {
      model: this.modelName,
      messages: [
        { role: "system", content: config.systemPrompt || "You are Claude, a helpful AI assistant." },
        { role: "user", content: input }
      ],
      max_tokens: config.maxTokens ?? 1024,
      temperature: config.temperature ?? 0.7
    };
  }

  parseResponse(response: any) {
    return {
      output: response.content?.[0]?.text || "",
      usage: response.usage || {},
      raw: response
    };
  }

  validateConfig(config: any) {
    return (
      typeof config === 'object' && 
      (config.temperature === undefined || (typeof config.temperature === "number" && config.temperature >= 0 && config.temperature <= 1)) &&
      (config.maxTokens === undefined || (typeof config.maxTokens === "number" && config.maxTokens > 0))
    );
  }

  getDefaultConfig() {
    return {
      temperature: 0.7,
      maxTokens: 1024,
      systemPrompt: "You are Claude, a helpful AI assistant."
    };
  }
}
