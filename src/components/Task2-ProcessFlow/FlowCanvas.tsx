import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ReactFlow, {
  Background,
  Controls,
  Panel,
  MarkerType,
  applyEdgeChanges,
  applyNodeChanges,
  useEdgesState,
  useNodesState,
  type Edge,
  type EdgeChange,
  type NodeChange,
  type Node,
  type OnConnect,
  type ReactFlowInstance,
} from "reactflow";

import "reactflow/dist/style.css";

import { CanvasContextMenu, type CanvasContextMenuTarget } from "./CanvasContextMenu";
import { EditableNode, type EditableNodeData } from "./EditableNode";
import { makeId } from "./id";
import { NodeEditPopup } from "./NodeEditPopup";
import type { ProcessEdge, ProcessNode } from "./types";
import { layoutLeftToRight } from "./layout";

export type FlowCanvasProps = {
  nodes: ProcessNode[];
  edges: ProcessEdge[];
  onAddNode: (node: ProcessNode) => void;
  onAddEdge: (upstreamId: string, downstreamId: string) => void;
  onDeleteNodes: (nodeIds: string[]) => void;
  onDeleteEdges: (edgeIds: string[]) => void;
  onNodeUpdate: (
    nodeId: string,
    updates: Partial<Pick<ProcessNode, "name" | "type">>,
  ) => void;
};

function toRfNodes(
  nodes: ProcessNode[],
  onRequestEdit: (nodeId: string) => void,
): Node<EditableNodeData>[] {
  return nodes.map((n) => ({
    id: n.id,
    type: "editable",
    position: { x: 0, y: 0 },
    data: { name: n.name, type: n.type, onRequestEdit },
  }));
}

function toRfEdges(validEdges: ProcessEdge[]): Edge[] {
  return validEdges.map((e) => ({
    id: e.id,
    source: e.upstreamNodeId,
    target: e.downstreamNodeId,
    animated: false,
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { strokeWidth: 2 },
  }));
}

export function FlowCanvas({
  nodes,
  edges,
  onAddNode,
  onAddEdge,
  onDeleteNodes,
  onDeleteEdges,
  onNodeUpdate,
}: FlowCanvasProps) {
  const nodeIdSet = useMemo(() => new Set(nodes.map((n) => n.id)), [nodes]);

  const validEdges = useMemo(
    () =>
      edges.filter(
        (e) =>
          nodeIdSet.has(e.upstreamNodeId) &&
          nodeIdSet.has(e.downstreamNodeId) &&
          e.upstreamNodeId !== "" &&
          e.downstreamNodeId !== "",
      ),
    [edges, nodeIdSet],
  );

  const wrapRef = useRef<HTMLDivElement>(null);
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const manuallyPositionedRef = useRef<Set<string>>(new Set());
  const manualPositionsRef = useRef<Map<string, { x: number; y: number }>>(
    new Map(),
  );

  const [activeEditNodeId, setActiveEditNodeId] = useState<string | null>(null);
  const [editAnchor, setEditAnchor] = useState<{ x: number; y: number } | null>(
    null,
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTarget, setMenuTarget] = useState<CanvasContextMenuTarget>({
    kind: "pane",
  });
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const pendingAddNodeFlowPosRef = useRef<{ x: number; y: number } | null>(null);

  const requestEdit = useCallback(
    (nodeId: string) => {
      const container = wrapRef.current;
      if (!container) return;
      const el = container.querySelector<HTMLElement>(`[data-id="${nodeId}"]`);
      const rect = el?.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      if (rect) {
        setEditAnchor({
          x: rect.right - cRect.left,
          y: rect.top - cRect.top,
        });
      } else {
        setEditAnchor({ x: cRect.width / 2, y: cRect.height / 2 });
      }
      setActiveEditNodeId(nodeId);
      setMenuOpen(false);
      setValidationError(null);
    },
    [],
  );

  const initialRfNodes = useMemo(() => toRfNodes(nodes, requestEdit), [nodes, requestEdit]);
  const initialRfEdges = useMemo(() => toRfEdges(validEdges), [validEdges]);

  const [rfNodes, setRfNodes] = useNodesState<EditableNodeData>([]);
  const [rfEdges, setRfEdges] = useEdgesState([]);

  const applyLayout = useCallback(
    (nextNodes: Node<EditableNodeData>[], nextEdges: Edge[]) => {
      const manual = new Map<string, { x: number; y: number }>();
      for (const id of manuallyPositionedRef.current) {
        const p = manualPositionsRef.current.get(id);
        if (p) manual.set(id, p);
      }
      return layoutLeftToRight(nextNodes, nextEdges, manual);
    },
    [],
  );

  useEffect(() => {
    // Sync from tables -> canvas. Preserve manual positions for dragged nodes.
    const layouted = applyLayout(initialRfNodes, initialRfEdges);
    setRfNodes(layouted.nodes as Node<EditableNodeData>[]);
    setRfEdges(layouted.edges);
  }, [applyLayout, initialRfNodes, initialRfEdges, setRfEdges, setRfNodes]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setRfNodes((nds) => {
        const next = applyNodeChanges(changes, nds);
        for (const c of changes) {
          if (c.type === "position" && "id" in c) {
            const n = next.find((x) => x.id === c.id);
            if (n) {
              manuallyPositionedRef.current.add(n.id);
              manualPositionsRef.current.set(n.id, n.position);
            }
          }
        }
        return next;
      });
    },
    [setRfNodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setRfEdges((eds) => applyEdgeChanges(changes, eds)),
    [setRfEdges],
  );

  const isDuplicateEdge = useMemo(
    () => (upstream: string, downstream: string) =>
      edges.some(
        (e) => e.upstreamNodeId === upstream && e.downstreamNodeId === downstream,
      ),
    [edges],
  );

  const handleConnect = useCallback<OnConnect>(
    (c) => {
      const source = c.source ?? "";
      const target = c.target ?? "";
      if (!source || !target) return;
      if (source === target) {
        setValidationError("Self-loops are not allowed.");
        return;
      }
      if (isDuplicateEdge(source, target)) {
        setValidationError("That edge already exists.");
        return;
      }
      setValidationError(null);
      onAddEdge(source, target);
    },
    [isDuplicateEdge, onAddEdge],
  );

  const handleNodesDelete = useCallback(
    (deleted: Node[]) => {
      if (deleted.length === 0) return;
      onDeleteNodes(deleted.map((n) => n.id));
      for (const n of deleted) {
        manuallyPositionedRef.current.delete(n.id);
        manualPositionsRef.current.delete(n.id);
      }
      setActiveEditNodeId((cur) =>
        cur && deleted.some((n) => n.id === cur) ? null : cur,
      );
      setMenuOpen(false);
    },
    [onDeleteNodes],
  );

  const handleEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      if (deleted.length === 0) return;
      onDeleteEdges(deleted.map((e) => e.id));
      setMenuOpen(false);
    },
    [onDeleteEdges],
  );

  const resetLayout = useCallback(() => {
    manuallyPositionedRef.current.clear();
    manualPositionsRef.current.clear();
    const layouted = layoutLeftToRight(initialRfNodes, initialRfEdges);
    setRfNodes(layouted.nodes as Node<EditableNodeData>[]);
    setRfEdges(layouted.edges);
    setValidationError(null);
    setMenuOpen(false);
  }, [initialRfEdges, initialRfNodes, setRfEdges, setRfNodes]);

  const addNodeAtFlowPos = useCallback(
    (flowPos: { x: number; y: number }) => {
      const node: ProcessNode = {
        id: makeId("node"),
        name: `Node ${nodes.length + 1}`,
        type: "type1",
      };
      manuallyPositionedRef.current.add(node.id);
      manualPositionsRef.current.set(node.id, flowPos);
      onAddNode(node);
      setValidationError(null);
      setMenuOpen(false);
    },
    [nodes.length, onAddNode],
  );

  const addNodeFromToolbar = useCallback(() => {
    // Add near the center of the current viewport.
    const container = wrapRef.current;
    const rf = rfInstanceRef.current;
    if (!rf) return;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const flowPos = rf.screenToFlowPosition({
      x: cRect.left + cRect.width / 2,
      y: cRect.top + cRect.height / 2,
    });
    addNodeAtFlowPos(flowPos);
  }, [addNodeAtFlowPos]);

  return (
    <Card className="card-hover">
      <Card.Header className="d-flex align-items-center justify-content-between gap-3">
        <div className="fw-semibold">Canvas</div>
        <div className="small text-body-secondary">
          Double-click empty space to add • Drag handles to connect • Del/Backspace to
          delete
        </div>
      </Card.Header>
      <Card.Body style={{ height: 420, position: "relative" }}>
        <div
          ref={wrapRef}
          role="img"
          aria-label="Process flow graph showing nodes and directed edges"
          style={{ height: "100%" }}
        >
          {nodes.length === 0 ? (
            <div
              className="h-100 d-flex flex-column align-items-center justify-content-center text-center"
              style={{ padding: "var(--space-4)" }}
            >
              <div className="fw-semibold mb-1">No nodes to display</div>
              <div className="text-body-secondary">
                Add nodes in the table above to see the process flow.
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={rfNodes}
              edges={rfEdges}
              fitView
              nodeTypes={{ editable: EditableNode }}
              nodesDraggable={true}
              nodesConnectable={true}
              elementsSelectable={true}
              deleteKeyCode={["Backspace", "Delete"]}
              onInit={(i) => {
                rfInstanceRef.current = i;
              }}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={handleConnect}
              onNodesDelete={handleNodesDelete}
              onEdgesDelete={handleEdgesDelete}
              onPaneClick={(e) => {
                // React Flow v11 doesn't expose onPaneDoubleClick; use click detail.
                if (e.detail === 2) {
                  const rf = rfInstanceRef.current;
                  if (!rf) return;
                  const flowPos = rf.screenToFlowPosition({
                    x: e.clientX,
                    y: e.clientY,
                  });
                  addNodeAtFlowPos(flowPos);
                  return;
                }

                setMenuOpen(false);
                setValidationError(null);
              }}
              onNodeContextMenu={(e, n) => {
                e.preventDefault();
                const container = wrapRef.current;
                if (!container) return;
                const cRect = container.getBoundingClientRect();
                setMenuAnchor({ x: e.clientX - cRect.left, y: e.clientY - cRect.top });
                setMenuTarget({ kind: "node", id: n.id });
                setMenuOpen(true);
                setValidationError(null);
              }}
              onEdgeContextMenu={(e, ed) => {
                e.preventDefault();
                const container = wrapRef.current;
                if (!container) return;
                const cRect = container.getBoundingClientRect();
                setMenuAnchor({ x: e.clientX - cRect.left, y: e.clientY - cRect.top });
                setMenuTarget({ kind: "edge", id: ed.id });
                setMenuOpen(true);
                setValidationError(null);
              }}
              onPaneContextMenu={(e) => {
                e.preventDefault();
                const rf = rfInstanceRef.current;
                if (!rf) return;
                const container = wrapRef.current;
                if (!container) return;
                const cRect = container.getBoundingClientRect();
                pendingAddNodeFlowPosRef.current = rf.screenToFlowPosition({
                  x: e.clientX,
                  y: e.clientY,
                });
                setMenuAnchor({ x: e.clientX - cRect.left, y: e.clientY - cRect.top });
                setMenuTarget({ kind: "pane" });
                setMenuOpen(true);
                setValidationError(null);
              }}
              onNodeDoubleClick={(e, n) => {
                e.preventDefault();
                requestEdit(n.id);
              }}
            >
              <Background />
              <Controls />
              <Panel position="top-left">
                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={addNodeFromToolbar}
                    title="Add node"
                  >
                    Add node
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={resetLayout}
                    title="Re-layout nodes (clears manual positions)"
                  >
                    Re-layout
                  </Button>
                </div>
              </Panel>
            </ReactFlow>
          )}
        </div>

        {validationError ? (
          <Alert
            variant="warning"
            className="position-absolute"
            style={{ left: 12, bottom: 12, marginBottom: 0, maxWidth: 360 }}
            role="status"
            aria-live="polite"
          >
            {validationError}
          </Alert>
        ) : null}

        {activeEditNodeId && editAnchor ? (
          (() => {
            const n = nodes.find((x) => x.id === activeEditNodeId);
            if (!n) return null;
            return (
              <NodeEditPopup
                nodeId={n.id}
                initialName={n.name}
                initialType={n.type}
                anchor={editAnchor}
                onCancel={() => setActiveEditNodeId(null)}
                onSave={(updates) => {
                  onNodeUpdate(n.id, updates);
                  setActiveEditNodeId(null);
                }}
              />
            );
          })()
        ) : null}

        <CanvasContextMenu
          open={menuOpen}
          target={menuTarget}
          anchor={menuAnchor}
          onClose={() => setMenuOpen(false)}
          onEditNode={(nodeId) => requestEdit(nodeId)}
          onDeleteNodes={onDeleteNodes}
          onDeleteEdges={onDeleteEdges}
          onAddNodeHere={() => {
            const p = pendingAddNodeFlowPosRef.current;
            if (!p) return;
            addNodeAtFlowPos(p);
          }}
        />
      </Card.Body>
    </Card>
  );
}

