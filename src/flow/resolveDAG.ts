
import { FlowNode } from "./types";

/**
 * Groups nodes in topological order for DAG execution.
 * Returns an array of levels, each a list of nodes.
 */
export function resolveDAG(flowNodes: FlowNode[]): FlowNode[][] {
  const levels: FlowNode[][] = [];
  const visited = new Set<string>();
  const idToNode: Record<string, FlowNode> = Object.fromEntries(flowNodes.map(n => [n.id, n]));

  function visit(nodeId: string, level = 0) {
    if (!levels[level]) levels[level] = [];
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    levels[level].push(idToNode[nodeId]);

    const dependents = flowNodes.filter(n => n.inputNodeIds?.includes(nodeId));
    for (const dep of dependents) {
      visit(dep.id, level + 1);
    }
  }

  const roots = flowNodes.filter(n => !n.inputNodeIds || n.inputNodeIds.length === 0);
  for (const root of roots) visit(root.id, 0);

  return levels;
}
