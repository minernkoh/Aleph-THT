export type NodeType = "type1" | "type2" | "type3";

export type ProcessNode = {
  id: string;
  name: string;
  type: NodeType;
};

export type ProcessEdge = {
  id: string;
  upstreamNodeId: string;
  downstreamNodeId: string;
};

