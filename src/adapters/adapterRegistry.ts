
import { ModelAdapter } from "./ModelAdapter";
import { OpenAIAdapter } from "./OpenAIAdapter";
// Add future adapters here (import ...)

export const adapterRegistry: Record<string, ModelAdapter> = {
  "gpt-4o": new OpenAIAdapter(),
  // Example:
  // "grok-3-beta": new GrokAdapter(),
  // "claude-3-7": new ClaudeAdapter(),
};
