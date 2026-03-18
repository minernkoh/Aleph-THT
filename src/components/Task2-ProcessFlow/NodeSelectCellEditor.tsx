import type { ICellEditorParams } from "ag-grid-community";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import type { ProcessNode } from "./types";

/**
 * AG Grid cell editor for selecting a node by id.
 *
 * In the Edge table, edges store `upstreamNodeId`/`downstreamNodeId`, but the UI
 * should display node names. This editor provides a simple `<select>` dropdown
 * to choose a node and returns the selected id back to the grid.
 */
export type NodeSelectCellEditorParams = ICellEditorParams & {
  nodes: ProcessNode[];
  /** Default off: avoid unexpected focus jumps during grid editing. */
  autoFocus?: boolean;
};

export const NodeSelectCellEditor = forwardRef<
  { getValue: () => string },
  NodeSelectCellEditorParams
>(function NodeSelectCellEditor(props, ref) {
  const { value, nodes, autoFocus = false } = props;
  const nodeIds = nodes.map((n) => n.id);
  // If the current value no longer exists (e.g. node deleted), fall back to empty.
  const validValue = value && nodeIds.includes(value) ? value : "";
  const [selectedId, setSelectedId] = useState<string>(validValue);
  const selectRef = useRef<HTMLSelectElement>(null);

  useImperativeHandle(ref, () => ({
    getValue: () => selectedId,
  }));

  useEffect(() => {
    // Keep the editor state in sync when the node list changes.
    if (!value || !nodeIds.includes(value)) {
      setSelectedId("");
    } else {
      setSelectedId(value);
    }
  }, [value, nodes]);

  useEffect(() => {
    if (autoFocus) selectRef.current?.focus();
  }, [autoFocus]);

  return (
    <select
      ref={selectRef}
      className="form-select form-select-sm w-100 h-100 border-0 rounded-0"
      style={{ minHeight: 28 }}
      name="node"
      autoComplete="off"
      value={selectedId}
      onChange={(e) => setSelectedId(e.target.value)}
    >
      <option value="">Select node…</option>
      {nodes.map((n) => (
        <option key={n.id} value={n.id}>
          {n.name}
        </option>
      ))}
    </select>
  );
});
