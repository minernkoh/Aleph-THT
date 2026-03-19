import type {
  CellValueChangedEvent,
  ColDef,
  GetRowIdParams,
  SelectionChangedEvent,
  ValueFormatterParams,
} from "ag-grid-community";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Stack from "react-bootstrap/Stack";
import { useCallback, useMemo, useState } from "react";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";

import { NODE_TYPE_COLORS } from "../../constants/colors";
import { TableComponent } from "../Task1-PaginatedTable";
import { makeId } from "./id";
import { NodeSelectCellEditor } from "./NodeSelectCellEditor";
import type { ProcessEdge, ProcessNode } from "./types";

const TABLE_HEIGHT = 280;
const getEdgeRowId = (p: GetRowIdParams<ProcessEdge>) => p.data.id;

export type EdgeTableProps = {
  nodes: ProcessNode[];
  edges: ProcessEdge[];
  onChange: (nextEdges: ProcessEdge[]) => void;
};

/** Editable table for managing process-flow edges. */
export function EdgeTable({ nodes, edges, onChange }: EdgeTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const nodeNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const n of nodes) m.set(n.id, n.name);
    return m;
  }, [nodes]);

  const nodeTypeById = useMemo(() => {
    const m = new Map<string, ProcessNode["type"]>();
    for (const n of nodes) m.set(n.id, n.type);
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

      // Validation rule 1: no self-loops.
      if (next.upstreamNodeId === next.downstreamNodeId) {
        setValidationError("Upstream and downstream nodes must be different.");
        const field = e.colDef.field;
        if (field === "upstreamNodeId" || field === "downstreamNodeId") {
          // Roll back the just-edited cell to its previous value.
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

      // Validation rule 2: prevent duplicate edges between the same two nodes.
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
          // Roll back the edit so the table stays in a valid state.
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

  const onSelectionChanged = useCallback(
    (e: SelectionChangedEvent<ProcessEdge>) => {
      const selected = e.api.getSelectedRows().map((r) => r.id);
      setSelectedIds(selected);
    },
    [],
  );

  const gridOptionsWithEditor = useMemo(
    () => ({
      stopEditingWhenCellsLoseFocus: true,
      rowSelection: { mode: "multiRow" as const },
      getRowStyle: (params: { data?: ProcessEdge | null }) => {
        const upType = params.data?.upstreamNodeId
          ? nodeTypeById.get(params.data.upstreamNodeId)
          : undefined;
        const downType = params.data?.downstreamNodeId
          ? nodeTypeById.get(params.data.downstreamNodeId)
          : undefined;
        const leftColor = upType ? NODE_TYPE_COLORS[upType] : undefined;
        const rightColor = downType ? NODE_TYPE_COLORS[downType] : undefined;
        if (!leftColor && !rightColor) return undefined;
        return {
          ...(leftColor ? { borderLeft: `3px solid ${leftColor}` } : {}),
          ...(rightColor ? { borderRight: `3px solid ${rightColor}` } : {}),
        };
      },
    }),
    [nodeTypeById],
  );

  function handleConfirmRemove() {
    if (selectedIds.length === 0) return;
    const selectedIdSet = new Set(selectedIds);
    // Remove the selected edges from the shared edges array.
    onChange(edges.filter((e) => !selectedIdSet.has(e.id)));
    setSelectedIds([]);
    setShowRemoveConfirm(false);
  }

  return (
    <Card className="h-100 d-flex flex-column">
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
            {selectedIds.length > 0 ? (
              <Button
                size="sm"
                className="touch-target-min"
                variant="outline-danger"
                onClick={() => setShowRemoveConfirm(true)}
                title={
                  selectedIds.length === 1
                    ? "Removes the selected edge"
                    : "Removes the selected edges"
                }
              >
                <span className="d-inline-flex align-items-center gap-1">
                  <TrashIcon size={16} aria-hidden="true" />
                  Remove
                </span>
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Card.Header>
      <Card.Body className="p-0" style={{ flex: 1, minHeight: 0 }}>
        {edges.length === 0 || validationError ? (
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
        ) : null}

        <Modal
          show={showRemoveConfirm}
          onHide={() => setShowRemoveConfirm(false)}
          aria-labelledby="remove-edge-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="remove-edge-title">Remove edge?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            This cannot be undone.{" "}
            {selectedIds.length === 1
              ? "The selected edge will be removed from the process flow."
              : `The ${selectedIds.length} selected edges will be removed from the process flow.`}
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
          getRowId={getEdgeRowId}
          gridOptions={gridOptionsWithEditor}
          onCellValueChanged={onCellValueChanged}
          onSelectionChanged={onSelectionChanged}
          height={TABLE_HEIGHT}
        />
      </Card.Body>
    </Card>
  );
}

