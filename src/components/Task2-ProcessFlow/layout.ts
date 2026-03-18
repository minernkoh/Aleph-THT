import dagre from "dagre";
import type { Edge, Node } from "reactflow";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 54;

export type LayoutResult = {
  nodes: Node[];
  edges: Edge[];
};

export function layoutLeftToRight(
  nodes: Node[],
  edges: Edge[],
  manualPositions?: Map<string, { x: number; y: number }>,
): LayoutResult {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 40, ranksep: 70 });

  for (const n of nodes)
    g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  for (const e of edges) g.setEdge(e.source, e.target);

  dagre.layout(g);

  const layouted = nodes.map((n) => {
    const p = g.node(n.id) as { x: number; y: number };
    const manual = manualPositions?.get(n.id);
    return {
      ...n,
      position: manual
        ? manual
        : { x: p.x - NODE_WIDTH / 2, y: p.y - NODE_HEIGHT / 2 },
      style: { ...(n.style ?? {}), width: NODE_WIDTH, height: NODE_HEIGHT },
    };
  });

  return { nodes: layouted, edges };
}

