
import { FlowNode } from "./types";
import { adapterRegistry } from "../adapters/adapterRegistry";

/**
 * Calls the appropriate adapter for a given node.
 */
export async function executeNode(node: FlowNode, input: any): Promise<any> {
  if (!node.modelId) throw new Error("Node missing modelId");
  const adapter = adapterRegistry[node.modelId];
  if (!adapter) throw new Error(\`Missing adapter for model: \${node.modelId}\`);
  if (!adapter.validateConfig(node.config ?? {})) throw new Error("Invalid config");
  
  const requestBody = adapter.buildRequest(input, node.config || {});
  const response = await fetch(\`/api/execute/\${node.modelId}\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });
  const raw = await response.json();
  return adapter.parseResponse(raw);
}
