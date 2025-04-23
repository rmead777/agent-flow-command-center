
import { ModelAdapter } from "./ModelAdapter";

export class AnthropicAdapter implements ModelAdapter {
  modelName: string;
  providerName = "Anthropic";
  supportedFeatures = ["text"];
  isReasoningMode: boolean;

  constructor(modelName = "claude-3.7-sonnet") {
    // Check if this is the reasoning variant
    this.isReasoningMode = modelName.includes("-reasoning");
    
    // Store the base model name without the reasoning suffix
    this.modelName = modelName.replace("-reasoning", "");
  }

  buildRequest(input: string, config: any) {
    // Enable reasoning mode either through the model name or config
    const useReasoning = this.isReasoningMode || config.enableReasoning;
    
    // Create standard request object
    const request = {
      model: this.modelName,
      messages: [
        { role: "system", content: config.systemPrompt || "You are Claude, a helpful AI assistant." },
        { role: "user", content: input }
      ],
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 512,
    };
    
    // Add reasoning flag if needed
    if (useReasoning) {
      return {
        ...request,
        reasoning: true, // Enable Claude's reasoning capability
      };
    }
    
    return request;
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
    const baseConfig = {
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: "You are Claude, a helpful AI assistant."
    };
    
    // Add enableReasoning flag for the reasoning variant
    if (this.isReasoningMode) {
      return {
        ...baseConfig,
        enableReasoning: true
      };
    }
    
    return baseConfig;
  }
}
