
import { ModelAdapter } from "./ModelAdapter";

export class OpenAIAdapter implements ModelAdapter {
  modelName = "gpt-4o";

  buildRequest(input: string, config: any) {
    return {
      model: this.modelName,
      messages: [
        { role: "system", content: config.systemPrompt || "You are helpful." },
        { role: "user", content: input }
      ],
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 512,
    };
  }

  parseResponse(response: any) {
    return {
      output: response.choices?.[0]?.message?.content || "",
      usage: response.usage || {},
    };
  }

  validateConfig(config: any) {
    return typeof config.temperature === "number" && config.maxTokens > 0;
  }
}
