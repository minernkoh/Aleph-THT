import { Handle, Position, type NodeProps } from "reactflow";

import { NODE_TYPE_COLORS } from "../../constants/colors";
import type { NodeType } from "./types";

export type EditableNodeData = {
  name: string;
  type: NodeType;
  onRequestEdit: (nodeId: string) => void;
};

/** React Flow node renderer with inline edit affordance. */
export function EditableNode({ id, data, selected }: NodeProps<EditableNodeData>) {
  const nodeBorderColor = NODE_TYPE_COLORS[data.type] ?? "var(--color-node-border)";

  const handleStyle = {
    width: "var(--size-handle)",
    height: "var(--size-handle)",
    border: `var(--border-width) solid ${nodeBorderColor}`,
    background: "color-mix(in oklab, var(--color-node-bg), black 15%)",
  } as const;

  return (
    <div
      role="button"
      tabIndex={0}
      onDoubleClick={() => data.onRequestEdit(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter") data.onRequestEdit(id);
      }}
      style={{
        borderRadius: "var(--radius-sm)",
        border: selected
          ? "var(--border-width-thick) solid color-mix(in oklab, var(--bs-primary), white 20%)"
          : `var(--border-width) solid ${nodeBorderColor}`,
        background: "var(--color-node-bg)",
        color: "var(--text)",
        padding: "var(--space-3) var(--space-3)",
        fontSize: "var(--text-xs)",
        minWidth: "var(--size-node-min-width)",
        height: "var(--size-node-height)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-3)",
        textAlign: "center",
        boxShadow: selected ? "var(--shadow-focus)" : "none",
        cursor: "grab",
        userSelect: "none",
      }}
      aria-label={`Node ${data.name}, type ${data.type}. Double click to edit.`}
      title="Double-click to edit"
    >
      <Handle
        type="target"
        position={Position.Left}
        style={handleStyle}
      />

      <div style={{ display: "grid", gap: "var(--space-1)" }}>
        <div
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--bs-secondary-color)",
            lineHeight: "var(--leading-tight)",
          }}
        >
          {data.type}
        </div>
        <div style={{ fontWeight: 600, lineHeight: "var(--leading-tight)" }}>
          {data.name}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
      />
    </div>
  );
}
