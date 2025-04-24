
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
    console.log('Raw Anthropic response:', response);
    
    // Check for the new response format structure
    if (response?.choices?.[0]?.message?.content) {
      const content = response.choices[0].message.content;
      console.log('Parsed content from choices format:', content);
      return {
        output: content,
        usage: response.usage || {},
        raw: response
      };
    }
    
    // Check for the alternative content array format
    if (response?.content && Array.isArray(response.content)) {
      const textContent = response.content.find(item => item.type === 'text');
      const content = textContent?.text || "";
      console.log('Parsed content from content array format:', content);
      return {
        output: content,
        usage: response.usage || {},
        raw: response
      };
    }
    
    console.error('Invalid Anthropic response structure:', response);
    return {
      output: "",
      usage: {},
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
