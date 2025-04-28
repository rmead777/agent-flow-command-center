
import { ModelAdapter } from "./ModelAdapter";

export class TogetherAdapter implements ModelAdapter {
  modelName: string;
  providerName = "Together AI";
  supportedFeatures = ["text"];
  baseUrl = "https://api.together.xyz/v1";

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  buildRequest(input: string, config: any) {
    return {
      messages: [
        { role: "system", content: config.systemPrompt || "You are a helpful AI assistant." },
        { role: "user", content: input }
      ],
      temperature: config.temperature ?? 0.2,
      top_p: config.top_p ?? 0.9,
      max_tokens: config.maxTokens ?? 2048,
    };
  }

  parseResponse(response: any) {
    // First check if response is already in our standardized format
    if (response.choices && response.choices[0]?.message?.content) {
      return {
        output: response.choices[0].message.content,
        usage: response.usage || {},
        raw: response
      };
    }

    // Handle potential error responses
    if (response.error) {
      throw new Error(`Together API Error: ${response.error.message || 'Unknown error'}`);
    }

    return {
      output: response.choices?.[0]?.message?.content || "",
      usage: response.usage || {},
      raw: response
    };
  }

  validateConfig(config: any) {
    return (
      typeof config === 'object' && 
      (config.temperature === undefined || (typeof config.temperature === "number" && config.temperature >= 0 && config.temperature <= 1)) &&
      (config.maxTokens === undefined || (typeof config.maxTokens === "number" && config.maxTokens > 0)) &&
      (config.top_p === undefined || (typeof config.top_p === "number" && config.top_p >= 0 && config.top_p <= 1))
    );
  }

  getDefaultConfig() {
    return {
      temperature: 0.2,
      maxTokens: 2048,
      top_p: 0.9,
      systemPrompt: "You are a helpful AI assistant."
    };
  }
}
