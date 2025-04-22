
import { adapterRegistry } from "../adapters/adapterRegistry";
import { FlowNode } from "./types";
import { resolveDAG } from "./resolveDAG";

/**
 * Simulates flow execution across nodes using adapters (MockAdapter if unavailable).
 * @param flowNodes The nodes describing the computation flow.
 * @param inputs The initial input context, keyed by node id.
 * @returns Final node outputs as a context object.
 */
export async function runSimulatedFlow(
  flowNodes: FlowNode[],
  inputs: Record<string, any>
) {
  const dagLevels = resolveDAG(flowNodes);
  const context: Record<string, any> = { ...inputs };

  for (const level of dagLevels) {
    for (const node of level) {
      const inputData = (node.inputNodeIds || []).map(id => context[id]);
      const adapter =
        (node.modelId && adapterRegistry[node.modelId]) ||
        adapterRegistry["mock-model"];
      const fakeResponse = adapter.parseResponse({
        input: JSON.stringify(inputData)
      });
      context[node.id] = fakeResponse.output;
    }
  }

  return context;
}
