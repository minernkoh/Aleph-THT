import type {
  CellValueChangedEvent,
  ColDef,
  RowClickedEvent,
  ValueFormatterParams,
} from "ag-grid-community";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Stack from "react-bootstrap/Stack";
import { useCallback, useMemo, useState } from "react";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";

import { TableComponent } from "../Task1-PaginatedTable";
import { makeId } from "./id";
import { NodeSelectCellEditor } from "./NodeSelectCellEditor";
import type { ProcessEdge, ProcessNode } from "./types";

export type EdgeTableProps = {
  nodes: ProcessNode[];
  edges: ProcessEdge[];
  onChange: (nextEdges: ProcessEdge[]) => void;
};

export function EdgeTable({ nodes, edges, onChange }: EdgeTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const nodeNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const n of nodes) m.set(n.id, n.name);
    return m;
  }, [nodes]);

  const nodeSelectEditorParams = useMemo(() => ({ nodes }), [nodes]);

  const columnDefs = useMemo<ColDef<ProcessEdge>[]>(
    () => [
      {
        headerName: "Upstream node",
        field: "upstreamNodeId",
        editable: true,
        cellEditor: NodeSelectCellEditor,
        cellEditorParams: nodeSelectEditorParams,
        valueFormatter: (
          p: ValueFormatterParams<ProcessEdge, string | undefined>,
        ) => (p.value ? nodeNameById.get(p.value) ?? p.value : ""),
      },
      {
        headerName: "Downstream node",
        field: "downstreamNodeId",
        editable: true,
        cellEditor: NodeSelectCellEditor,
        cellEditorParams: nodeSelectEditorParams,
        valueFormatter: (
          p: ValueFormatterParams<ProcessEdge, string | undefined>,
        ) => (p.value ? nodeNameById.get(p.value) ?? p.value : ""),
      },
    ],
    [nodeNameById, nodeSelectEditorParams],
  );

  const canAdd = nodes.length >= 2;

  const isDuplicateEdge = useMemo(
    () => (upstream: string, downstream: string, excludeId: string) =>
      edges.some(
        (e) =>
          e.id !== excludeId &&
          e.upstreamNodeId === upstream &&
          e.downstreamNodeId === downstream,
      ),
    [edges],
  );

  const onCellValueChanged = useCallback(
    (e: CellValueChangedEvent<ProcessEdge, string | undefined>) => {
      const next = e.data;
      if (!next) return;

      setValidationError(null);

      if (next.upstreamNodeId === next.downstreamNodeId) {
        setValidationError("Upstream and downstream nodes must be different.");
        const field = e.colDef.field;
        if (field === "upstreamNodeId" || field === "downstreamNodeId") {
          onChange(
            edges.map((ed) =>
              ed.id === next.id
                ? {
                    ...ed,
                    [field]: (e.oldValue ?? ed[field]) as string,
                  }
                : ed,
            ),
          );
        }
        return;
      }

      if (
        next.upstreamNodeId &&
        next.downstreamNodeId &&
        isDuplicateEdge(
          next.upstreamNodeId,
          next.downstreamNodeId,
          next.id,
        )
      ) {
        setValidationError(
          "An edge with this upstream and downstream already exists.",
        );
        const field = e.colDef.field;
        if (field === "upstreamNodeId" || field === "downstreamNodeId") {
          onChange(
            edges.map((ed) =>
              ed.id === next.id
                ? {
                    ...ed,
                    [field]: (e.oldValue ?? ed[field]) as string,
                  }
                : ed,
            ),
          );
        }
        return;
      }

      onChange(edges.map((ed) => (ed.id === next.id ? next : ed)));
    },
    [edges, onChange, isDuplicateEdge],
  );

  const onRowClicked = useCallback(
    (e: RowClickedEvent<ProcessEdge>) => {
      setSelectedId(e.data?.id ?? null);
    },
    [],
  );

  const gridOptionsWithEditor = useMemo(
    () => ({
      stopEditingWhenCellsLoseFocus: true,
      rowSelection: { mode: "singleRow" as const },
    }),
    [],
  );

  const tableHeight = useMemo(() => {
    const headerPx = 40;
    const rowPx = 44;
    const minPx = 180;
    const maxPx = 320;
    const rows = Math.max(1, edges.length);
    return Math.min(maxPx, Math.max(minPx, headerPx + rows * rowPx));
  }, [edges.length]);

  function handleConfirmRemove() {
    if (!selectedId) return;
    onChange(edges.filter((e) => e.id !== selectedId));
    setSelectedId(null);
    setShowRemoveConfirm(false);
  }

  return (
    <Card>
      <Card.Header>
        <Stack direction="horizontal" className="justify-content-between">
          <div className="fw-semibold">Edges</div>
          <Stack direction="horizontal" gap={2}>
            <Button
              size="sm"
              className="touch-target-min"
              variant="outline-primary"
              disabled={!canAdd}
              onClick={() => {
                const upstreamNodeId = nodes[0]?.id ?? "";
                onChange([
                  ...edges,
                  {
                    id: makeId("edge"),
                    upstreamNodeId,
                    downstreamNodeId: "",
                  },
                ]);
                setValidationError(null);
              }}
              title={
                canAdd ? "Add edge (choose downstream in the table)" : "Create at least 2 nodes first"
              }
            >
              <span className="d-inline-flex align-items-center gap-1">
                <PlusIcon size={16} aria-hidden="true" />
                Add edge
              </span>
            </Button>
            <Button
              size="sm"
              className="touch-target-min"
              variant="outline-danger"
              disabled={!selectedId}
              onClick={() => setShowRemoveConfirm(true)}
              title="Removes the selected edge"
            >
              <span className="d-inline-flex align-items-center gap-1">
                <TrashIcon size={16} aria-hidden="true" />
                Remove selected
              </span>
            </Button>
          </Stack>
        </Stack>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="p-3 pb-2">
          {edges.length === 0 ? (
            <div className="mb-3 text-body-secondary">
              {nodes.length < 2 ? (
                <>
                  Add at least <span className="fw-semibold">2 nodes</span> to
                  create an edge.
                </>
              ) : (
                <>
                  No edges yet. Click{" "}
                  <span className="fw-semibold">Add edge</span> to connect nodes.
                </>
              )}
            </div>
          ) : null}
          {validationError ? (
            <Alert
              variant="warning"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="mb-3"
            >
              {validationError}
            </Alert>
          ) : null}
        </div>

        <Modal
          show={showRemoveConfirm}
          onHide={() => setShowRemoveConfirm(false)}
          aria-labelledby="remove-edge-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="remove-edge-title">Remove edge?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            This cannot be undone. The selected edge will be removed from the
            process flow.
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setShowRemoveConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmRemove}>
              <span className="d-inline-flex align-items-center gap-1">
                <TrashIcon size={18} aria-hidden="true" />
                Remove
              </span>
            </Button>
          </Modal.Footer>
        </Modal>

        <TableComponent<ProcessEdge>
          columnDefs={columnDefs}
          rowData={edges}
          getRowId={(p) => p.data.id}
          gridOptions={gridOptionsWithEditor}
          onCellValueChanged={onCellValueChanged}
          onRowClicked={onRowClicked}
          height={tableHeight}
        />
      </Card.Body>
    </Card>
  );
}

