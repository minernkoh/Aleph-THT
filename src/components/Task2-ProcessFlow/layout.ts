import dagre from "dagre";
import type { Edge, Node } from "reactflow";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 54;

export type LayoutResult = {
  nodes: Node[];
  edges: Edge[];
};

/** Auto-layout nodes left-to-right (keeps manual positions when provided). */
export function layoutLeftToRight(
  nodes: Node[],
  edges: Edge[],
  manualPositions?: Map<string, { x: number; y: number }>,
): LayoutResult {
  // dagre computes a nice graph layout (it doesn't render; it only returns coordinates).
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 40, ranksep: 70 });

  for (const n of nodes)
    g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  for (const e of edges) g.setEdge(e.source, e.target);

  dagre.layout(g);

  const layouted = nodes.map((n) => {
    const p = g.node(n.id) as { x: number; y: number } | undefined;
    const manual = manualPositions?.get(n.id);
    if (!p && !manual) {
      // Extremely defensive: if dagre didn't produce a coordinate (unexpected),
      // keep the existing position rather than crashing.
      return {
        ...n,
        style: { ...(n.style ?? {}), width: NODE_WIDTH, height: NODE_HEIGHT },
      };
    }
    return {
      ...n,
      position: manual
        // If the user dragged a node, keep that position instead of re-laying it out.
        ? manual
        : { x: p!.x - NODE_WIDTH / 2, y: p!.y - NODE_HEIGHT / 2 },
      style: { ...(n.style ?? {}), width: NODE_WIDTH, height: NODE_HEIGHT },
    };
  });

  return { nodes: layouted, edges };
}

