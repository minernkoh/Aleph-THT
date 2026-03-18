import type {
  CellValueChangedEvent,
  ColDef,
  RowClickedEvent,
  ValueFormatterParams,
} from "ag-grid-community";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Stack from "react-bootstrap/Stack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";

import { TableComponent } from "../Task1-PaginatedTable";
import { makeId } from "./id";
import type { NodeType, ProcessNode } from "./types";

const NODE_TYPES: NodeType[] = ["type1", "type2", "type3"];

export type NodeTableProps = {
  nodes: ProcessNode[];
  onChange: (nextNodes: ProcessNode[]) => void;
};

export function NodeTable({ nodes, onChange }: NodeTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const nextNodeNumberRef = useRef<number>(1);

  function handleConfirmRemove() {
    if (!selectedId) return;
    onChange(nodes.filter((n) => n.id !== selectedId));
    setSelectedId(null);
    setShowRemoveConfirm(false);
  }

  useEffect(() => {
    // Initialize based on existing "Node N" names to avoid duplicates.
    const max = nodes.reduce((acc, n) => {
      const m = /^Node\s+(\d+)$/.exec(n.name.trim());
      const v = m ? Number(m[1]) : 0;
      return Number.isFinite(v) ? Math.max(acc, v) : acc;
    }, 0);
    nextNodeNumberRef.current = Math.max(nextNodeNumberRef.current, max + 1);
  }, [nodes]);

  const columnDefs = useMemo<ColDef<ProcessNode>[]>(
    () => [
      {
        headerName: "Name",
        field: "name",
        editable: true,
      },
      {
        headerName: "Type",
        field: "type",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: NODE_TYPES },
        valueFormatter: (p: ValueFormatterParams<ProcessNode, NodeType>) =>
          p.value ?? "",
      },
    ],
    [],
  );

  const onCellValueChanged = useCallback(
    (e: CellValueChangedEvent<ProcessNode, string | NodeType>) => {
      if (!e.data) return;
      const next = e.data;
      onChange(nodes.map((n) => (n.id === next.id ? next : n)));
    },
    [nodes, onChange],
  );

  const onRowClicked = useCallback(
    (e: RowClickedEvent<ProcessNode>) => {
      setSelectedId(e.data?.id ?? null);
    },
    [],
  );

  const gridOptions = useMemo(
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
    const rows = Math.max(1, nodes.length);
    return Math.min(maxPx, Math.max(minPx, headerPx + rows * rowPx));
  }, [nodes.length]);

  return (
    <Card>
      <Card.Header>
        <Stack direction="horizontal" className="justify-content-between">
          <div className="fw-semibold">Nodes</div>
          <Stack direction="horizontal" gap={2}>
            <Button
              size="sm"
              className="touch-target-min"
              variant="outline-primary"
              onClick={() => {
                const n = nextNodeNumberRef.current++;
                onChange([
                  ...nodes,
                  { id: makeId("node"), name: `Node ${n}`, type: "type1" },
                ]);
              }}
            >
              <span className="d-inline-flex align-items-center gap-1">
                <PlusIcon size={16} aria-hidden="true" />
                Add node
              </span>
            </Button>
            <Button
              size="sm"
              className="touch-target-min"
              variant="outline-danger"
              disabled={!selectedId}
              onClick={() => setShowRemoveConfirm(true)}
              title="Removes the selected node"
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
          {nodes.length === 0 ? (
            <div className="mb-3 text-body-secondary">
              No nodes yet. Click <span className="fw-semibold">Add node</span> to
              get started.
            </div>
          ) : null}
        </div>

        <Modal
          show={showRemoveConfirm}
          onHide={() => setShowRemoveConfirm(false)}
          aria-labelledby="remove-node-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="remove-node-title">Remove node?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            This cannot be undone. The selected node will be removed from the
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

        <TableComponent<ProcessNode>
          columnDefs={columnDefs}
          rowData={nodes}
          getRowId={(p) => p.data.id}
          gridOptions={gridOptions}
          onCellValueChanged={onCellValueChanged}
          onRowClicked={onRowClicked}
          height={tableHeight}
        />
      </Card.Body>
    </Card>
  );
}

