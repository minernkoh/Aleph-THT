import type {
  CellValueChangedEvent,
  ColDef,
  GetRowIdParams,
  SelectionChangedEvent,
  ValueFormatterParams,
} from "ag-grid-community";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Stack from "react-bootstrap/Stack";
import { useCallback, useMemo, useState } from "react";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";

import { NODE_TYPE_COLORS } from "../../constants/colors";
import { TableComponent } from "../Task1-PaginatedTable";
import type { NodeType, ProcessNode } from "./types";

const NODE_TYPES: NodeType[] = ["type1", "type2", "type3"];
const TABLE_HEIGHT = 280;
const getNodeRowId = (p: GetRowIdParams<ProcessNode>) => p.data.id;

export type NodeTableProps = {
  nodes: ProcessNode[];
  onChange: (nextNodes: ProcessNode[]) => void;
  createDefaultNode: () => ProcessNode;
};

/** Editable table for managing process-flow nodes. */
export function NodeTable({ nodes, onChange, createDefaultNode }: NodeTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  function handleConfirmRemove() {
    if (selectedIds.length === 0) return;
    const selectedIdSet = new Set(selectedIds);
    // Remove the node from the shared array. (Edges referencing it are cleaned up elsewhere.)
    onChange(nodes.filter((n) => !selectedIdSet.has(n.id)));
    setSelectedIds([]);
    setShowRemoveConfirm(false);
  }

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
      // AG Grid mutates the row object; we replace it in our immutable array.
      onChange(nodes.map((n) => (n.id === next.id ? next : n)));
    },
    [nodes, onChange],
  );

  const onSelectionChanged = useCallback(
    (e: SelectionChangedEvent<ProcessNode>) => {
      const selected = e.api.getSelectedRows().map((r) => r.id);
      setSelectedIds(selected);
    },
    [],
  );

  const gridOptions = useMemo(
    () => ({
      stopEditingWhenCellsLoseFocus: true,
      rowSelection: { mode: "multiRow" as const },
      getRowStyle: (params: { data?: ProcessNode | null }) => {
        const key = params.data?.type;
        const color = key ? NODE_TYPE_COLORS[key] : undefined;
        return color ? { borderLeft: `3px solid ${color}` } : undefined;
      },
    }),
    [],
  );

  return (
    <Card className="h-100 d-flex flex-column">
      <Card.Header>
        <Stack direction="horizontal" className="justify-content-between">
          <div className="fw-semibold">Nodes</div>
          <Stack direction="horizontal" gap={2}>
            <Button
              size="sm"
              className="touch-target-min"
              variant="outline-primary"
              onClick={() => {
                onChange([...nodes, createDefaultNode()]);
              }}
            >
              <span className="d-inline-flex align-items-center gap-1">
                <PlusIcon size={16} aria-hidden="true" />
                Add node
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
                    ? "Removes the selected node"
                    : "Removes the selected nodes"
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
        {nodes.length === 0 ? (
          <div className="p-3 pb-2">
            <div className="mb-3 text-body-secondary">
              No nodes yet. Click <span className="fw-semibold">Add node</span> to
              get started.
            </div>
          </div>
        ) : null}

        <Modal
          show={showRemoveConfirm}
          onHide={() => setShowRemoveConfirm(false)}
          aria-labelledby="remove-node-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="remove-node-title">Remove node?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            This cannot be undone.{" "}
            {selectedIds.length === 1
              ? "The selected node will be removed from the process flow."
              : `The ${selectedIds.length} selected nodes will be removed from the process flow.`}
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
          getRowId={getNodeRowId}
          gridOptions={gridOptions}
          onCellValueChanged={onCellValueChanged}
          onSelectionChanged={onSelectionChanged}
          height={TABLE_HEIGHT}
        />
      </Card.Body>
    </Card>
  );
}

