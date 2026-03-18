/**
 * Task 2 (Process Flow) domain types.
 *
 * The process-flow editor stores nodes/edges in a simple normalized shape.
 * Both the tables and the canvas read/write these same objects.
 */
export type NodeType = "type1" | "type2" | "type3";

/** A single node in the process flow (id + display name + type). */
export type ProcessNode = {
  id: string;
  name: string;
  type: NodeType;
};

/** A directed edge (connection) between two nodes, by id. */
export type ProcessEdge = {
  id: string;
  upstreamNodeId: string;
  downstreamNodeId: string;
};

