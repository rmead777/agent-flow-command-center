
import { ModelAdapter } from "./ModelAdapter";

export class AnthropicAdapter implements ModelAdapter {
  modelName: string;
  providerName = "Anthropic";
  supportedFeatures = ["text"];

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  buildRequest(input: string, config: any) {
    return {
      model: this.modelName,
      system: config.systemPrompt || "You are Claude, a helpful AI assistant.",
      messages: [
        { role: "user", content: input }
      ],
      max_tokens: config.maxTokens ?? 1024,
      temperature: config.temperature ?? 0.7
    };
  }

  parseResponse(response: any) {
    // Ensure we have a valid response object with the expected structure
    if (!response || !response.content || !Array.isArray(response.content)) {
      console.error('Invalid Anthropic response structure:', response);
      return {
        output: "",
        usage: {},
        raw: response
      };
    }

    // Extract the text content from the first content item
    const content = response.content[0]?.text || "";
    
    console.log('Parsing Anthropic response:', {
      content: content,
      rawResponse: response
    });

    return {
      output: content,
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
