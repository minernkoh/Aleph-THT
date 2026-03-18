import type { ProcessEdge } from "./types";

/**
 * Returns true if the directed graph formed by the given edges (restricted to
 * validNodeIds) contains a cycle. Uses DFS with recursion stack.
 */
export function hasCycle(
  edges: ProcessEdge[],
  validNodeIds: Set<string>,
): boolean {
  const adj = new Map<string, string[]>();
  for (const id of validNodeIds) adj.set(id, []);
  for (const e of edges) {
    if (!validNodeIds.has(e.upstreamNodeId) || !validNodeIds.has(e.downstreamNodeId)) continue;
    adj.get(e.upstreamNodeId)!.push(e.downstreamNodeId);
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();

  function visit(id: string): boolean {
    if (inStack.has(id)) return true;
    if (visited.has(id)) return false;
    visited.add(id);
    inStack.add(id);
    for (const to of adj.get(id) ?? []) {
      if (visit(to)) return true;
    }
    inStack.delete(id);
    return false;
  }

  for (const id of validNodeIds) {
    if (visit(id)) return true;
  }
  return false;
}
