
import { adapterRegistry } from "../adapters/adapterRegistry";
import { FlowNode } from "./types";
import { resolveDAG } from "./resolveDAG";
import { FlowOutput } from "@/components/flow/FlowOutputPanel";

/**
 * Simulates flow execution across nodes using adapters (MockAdapter if unavailable).
 * @param flowNodes The nodes describing the computation flow.
 * @param inputs The initial input context, keyed by node id.
 * @returns Object containing final node outputs as a context object and an array of all outputs.
 */
export async function runSimulatedFlow(
  flowNodes: FlowNode[],
  inputs: Record<string, any>
): Promise<{
  context: Record<string, any>;
  outputs: FlowOutput[];
}> {
  const dagLevels = resolveDAG(flowNodes);
  const context: Record<string, any> = { ...inputs };
  const outputs: FlowOutput[] = [];

  for (const level of dagLevels) {
    for (const node of level) {
      const startTime = performance.now();
      
      // Gather inputs from previous nodes
      const inputData = (node.inputNodeIds || []).map(id => context[id]);
      
      // Get correct adapter or fallback to mock
      const adapter =
        (node.modelId && adapterRegistry[node.modelId]) ||
        adapterRegistry["mock-model"];
      
      // Build the request and process it
      const request = adapter.buildRequest(inputData, node.config || {});
      const fakeResponse = adapter.parseResponse({
        input: JSON.stringify(inputData)
      });
      
      // Store the result in context for next nodes
      context[node.id] = fakeResponse.output;
      
      // Calculate execution time
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);
      
      // Find the label for this node
      const nodeInfo = flowNodes.find(fn => fn.id === node.id);
      
      // Track the output for UI display
      outputs.push({
        nodeId: node.id,
        nodeName: nodeInfo?.config?.label || `Node ${node.id}`,
        nodeType: node.type,
        modelId: node.modelId,
        timestamp: new Date().toISOString(),
        input: inputData,
        output: fakeResponse.output,
        executionTime
      });
    }
  }

  return { context, outputs };
}
