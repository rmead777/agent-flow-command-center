
import { ModelAdapter } from "./ModelAdapter";

export class GoogleAdapter implements ModelAdapter {
  modelName: string;
  providerName = "Google Gemini";
  supportedFeatures = ["text", "images"];

  constructor(modelName = "gemini-2.5-pro") {
    this.modelName = modelName;
  }

  buildRequest(input: string, config: any) {
    return {
      model: this.modelName,
      contents: [
        { role: "user", parts: [{ text: input }] }
      ],
      systemInstruction: {
        parts: [{ text: config.systemPrompt || "You are a helpful AI assistant." }]
      },
      generationConfig: {
        temperature: config.temperature ?? 0.7,
        maxOutputTokens: config.maxTokens ?? 512,
      }
    };
  }

  parseResponse(response: any) {
    return {
      output: response.candidates?.[0]?.content?.parts?.[0]?.text || "",
      usage: response.usageMetadata || {},
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
      systemPrompt: "You are Gemini, a helpful AI assistant."
    };
  }
}
