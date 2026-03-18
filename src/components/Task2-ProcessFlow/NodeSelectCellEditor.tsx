import type { ICellEditorParams } from "ag-grid-community";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import type { ProcessNode } from "./types";

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
  const validValue =
    value && nodeIds.includes(value) ? value : "";
  const [selectedId, setSelectedId] = useState<string>(validValue);
  const selectRef = useRef<HTMLSelectElement>(null);

  useImperativeHandle(ref, () => ({
    getValue: () => selectedId,
  }));

  useEffect(() => {
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
