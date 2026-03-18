import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import { EdgeTable } from "../components/Task2-ProcessFlow/EdgeTable";
import { FlowCanvas } from "../components/Task2-ProcessFlow/FlowCanvas";
import { NodeTable } from "../components/Task2-ProcessFlow/NodeTable";
import { hasCycle } from "../components/Task2-ProcessFlow/cycleDetection";
import { makeId } from "../components/Task2-ProcessFlow/id";
import type { ProcessEdge, ProcessNode } from "../components/Task2-ProcessFlow/types";

const INITIAL_NODES: ProcessNode[] = [
  { id: makeId("node"), name: "Feed", type: "type1" },
  { id: makeId("node"), name: "Heater", type: "type2" },
  { id: makeId("node"), name: "Outlet", type: "type3" },
];

/** Task 2: edit a process flow in tables and on a canvas. */
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
  const cycleDetected = useMemo(() => hasCycle(edges, nodeIdSet), [edges, nodeIdSet]);

  const nextNodeNumberRef = useRef<number>(1);

  useEffect(() => {
    // Initialize based on existing "Node N" names to avoid duplicates across the app
    // (both the table and the canvas can create nodes).
    const max = nodes.reduce((acc, n) => {
      const m = /^Node\s+(\d+)$/.exec(n.name.trim());
      const v = m ? Number(m[1]) : 0;
      return Number.isFinite(v) ? Math.max(acc, v) : acc;
    }, 0);
    nextNodeNumberRef.current = Math.max(nextNodeNumberRef.current, max + 1);
  }, [nodes]);

  const createDefaultNode = useCallback((): ProcessNode => {
    const n = nextNodeNumberRef.current++;
    return { id: makeId("node"), name: `Node ${n}`, type: "type1" };
  }, []);

  useEffect(() => {
    // When nodes are deleted, edges that reference those nodes become invalid.
    // We clean them up so both the tables and the canvas stay consistent.
    setEdges((prev) =>
      prev.filter((e) => {
        const upValid = e.upstreamNodeId === "" || nodeIdSet.has(e.upstreamNodeId);
        const downValid = e.downstreamNodeId === "" || nodeIdSet.has(e.downstreamNodeId);
        return upValid && downValid;
      })
    );
  }, [nodeIdSet]);

  const handleAddNode = (node: ProcessNode) => {
    // Add the new node; other components will re-render from the shared state.
    setNodes((prev) => [...prev, node]);
  };

  const handleAddEdge = (upstreamId: string, downstreamId: string) => {
    // Guard against self-loops. (Some flows can be cyclic overall, but a single
    // edge from a node to itself is almost always accidental in this UI.)
    if (upstreamId === downstreamId) return;
    setEdges((prev) => {
      // Prevent duplicate edges so the graph stays readable.
      const isDup = prev.some(
        (e) => e.upstreamNodeId === upstreamId && e.downstreamNodeId === downstreamId
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
    // The edge cleanup effect will run automatically after nodes change.
    const idSet = new Set(nodeIds);
    setNodes((prev) => prev.filter((n) => !idSet.has(n.id)));
  };

  const handleDeleteEdges = (edgeIds: string[]) => {
    const idSet = new Set(edgeIds);
    setEdges((prev) => prev.filter((e) => !idSet.has(e.id)));
  };

  const handleNodeUpdate = (
    nodeId: string,
    updates: Partial<Pick<ProcessNode, "name" | "type">>
  ) => {
    // Small updates (name/type) come from the tables or inline canvas edits.
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)));
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
          This flow contains a cycle. Some process flows (e.g. recycle loops) use cycles
          intentionally.
        </Alert>
      ) : null}

      <Row className="g-3">
        <Col lg={6}>
          <NodeTable nodes={nodes} onChange={setNodes} createDefaultNode={createDefaultNode} />
        </Col>
        <Col lg={6}>
          <EdgeTable nodes={nodes} edges={edges} onChange={setEdges} />
        </Col>
        <Col lg={12}>
          <FlowCanvas
            nodes={nodes}
            edges={edges}
            createDefaultNode={createDefaultNode}
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
