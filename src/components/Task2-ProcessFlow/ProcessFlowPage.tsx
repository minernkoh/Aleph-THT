import { useEffect, useMemo, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import { EdgeTable } from "./EdgeTable";
import { FlowCanvas } from "./FlowCanvas";
import { NodeTable } from "./NodeTable";
import { hasCycle } from "./cycleDetection";
import { makeId } from "./id";
import type { ProcessEdge, ProcessNode } from "./types";

const INITIAL_NODES: ProcessNode[] = [
  { id: makeId("node"), name: "Feed", type: "type1" },
  { id: makeId("node"), name: "Heater", type: "type2" },
  { id: makeId("node"), name: "Outlet", type: "type3" },
];

export function ProcessFlowPage() {
  const [nodes, setNodes] = useState<ProcessNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<ProcessEdge[]>(() => [
    {
      id: makeId("edge"),
      upstreamNodeId: INITIAL_NODES[0]!.id,
      downstreamNodeId: INITIAL_NODES[1]!.id,
    },
    {
      id: makeId("edge"),
      upstreamNodeId: INITIAL_NODES[1]!.id,
      downstreamNodeId: INITIAL_NODES[2]!.id,
    },
  ]);

  const nodeIdSet = useMemo(() => new Set(nodes.map((n) => n.id)), [nodes]);
  const cycleDetected = useMemo(
    () => hasCycle(edges, nodeIdSet),
    [edges, nodeIdSet],
  );

  useEffect(() => {
    setEdges((prev) =>
      prev.filter((e) => {
        const upValid =
          e.upstreamNodeId === "" || nodeIdSet.has(e.upstreamNodeId);
        const downValid =
          e.downstreamNodeId === "" || nodeIdSet.has(e.downstreamNodeId);
        return upValid && downValid;
      }),
    );
  }, [nodeIdSet]);

  const handleAddNode = (node: ProcessNode) => {
    setNodes((prev) => [...prev, node]);
  };

  const handleAddEdge = (upstreamId: string, downstreamId: string) => {
    if (upstreamId === downstreamId) return;
    setEdges((prev) => {
      const isDup = prev.some(
        (e) =>
          e.upstreamNodeId === upstreamId && e.downstreamNodeId === downstreamId,
      );
      if (isDup) return prev;
      return [
        ...prev,
        {
          id: makeId("edge"),
          upstreamNodeId: upstreamId,
          downstreamNodeId: downstreamId,
        },
      ];
    });
  };

  const handleDeleteNodes = (nodeIds: string[]) => {
    const idSet = new Set(nodeIds);
    setNodes((prev) => prev.filter((n) => !idSet.has(n.id)));
  };

  const handleDeleteEdges = (edgeIds: string[]) => {
    const idSet = new Set(edgeIds);
    setEdges((prev) => prev.filter((e) => !idSet.has(e.id)));
  };

  const handleNodeUpdate = (
    nodeId: string,
    updates: Partial<Pick<ProcessNode, "name" | "type">>,
  ) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
    );
  };

  return (
    <Container className="py-4">
      <div className="mb-3">
        <h1 className="page-title mb-1">2. Process Flow</h1>
        <div className="text-body-secondary">
          Edit nodes and edges via the tables or directly on the canvas.
        </div>
      </div>

      {cycleDetected ? (
        <Alert variant="info" className="mb-3" role="status" aria-live="polite">
          This flow contains a cycle. Some process flows (e.g. recycle loops) use
          cycles intentionally.
        </Alert>
      ) : null}

      <Row className="g-3">
        <Col lg={6}>
          <NodeTable nodes={nodes} onChange={setNodes} />
        </Col>
        <Col lg={6}>
          <EdgeTable nodes={nodes} edges={edges} onChange={setEdges} />
        </Col>
        <Col lg={12}>
          <FlowCanvas
            nodes={nodes}
            edges={edges}
            onAddNode={handleAddNode}
            onAddEdge={handleAddEdge}
            onDeleteNodes={handleDeleteNodes}
            onDeleteEdges={handleDeleteEdges}
            onNodeUpdate={handleNodeUpdate}
          />
        </Col>
      </Row>
    </Container>
  );
}

