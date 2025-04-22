
import { ModelAdapter } from "./ModelAdapter";

export class AnthropicAdapter implements ModelAdapter {
  modelName: string;
  providerName = "Anthropic";
  supportedFeatures = ["text"];

  constructor(modelName = "claude-3.7-sonnet") {
    this.modelName = modelName;
  }

  buildRequest(input: string, config: any) {
    return {
      model: this.modelName,
      messages: [
        { role: "system", content: config.systemPrompt || "You are Claude, a helpful AI assistant." },
        { role: "user", content: input }
      ],
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 512,
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
      maxTokens: 512,
      systemPrompt: "You are Claude, a helpful AI assistant."
    };
  }
}
