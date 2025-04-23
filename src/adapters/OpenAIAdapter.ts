
import { ModelAdapter } from "./ModelAdapter";

export class OpenAIAdapter implements ModelAdapter {
  modelName: string;
  providerName = "OpenAI";
  supportedFeatures = ["text", "images", "web_search"];

  constructor(modelName = "gpt-4o") {
    this.modelName = modelName;
  }

  buildRequest(input: string, config: any) {
    const request: any = {
      model: this.modelName,
      messages: [
        { role: "system", content: config.systemPrompt || "You are helpful." },
        { role: "user", content: input }
      ],
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 512,
    };

    // Add web search tool if enabled and model supports it
    if (config.enableWebSearch && this.modelName === "gpt-4.1") {
      request.tools = [{
        type: "web_search_preview",
        function: {
          name: "web_search",
          description: "Search the web for relevant information",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        }
      }];
    }

    return request;
  }

  parseResponse(response: any) {
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
      (config.maxTokens === undefined || (typeof config.maxTokens === "number" && config.maxTokens > 0))
    );
  }

  getDefaultConfig() {
    return {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: "You are a helpful assistant.",
      enableWebSearch: false
    };
  }
}
