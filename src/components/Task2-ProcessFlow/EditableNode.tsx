import { Handle, Position, type NodeProps } from "reactflow";

import type { NodeType } from "./types";

export type EditableNodeData = {
  name: string;
  type: NodeType;
  onRequestEdit: (nodeId: string) => void;
};

export function EditableNode({
  id,
  data,
  selected,
}: NodeProps<EditableNodeData>) {
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
          ? "2px solid color-mix(in oklab, var(--bs-primary), white 20%)"
          : "1px solid var(--color-node-border)",
        background: "var(--color-node-bg)",
        padding: "10px 12px",
        fontSize: "var(--text-xs)",
        minWidth: 180,
        height: 54,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        textAlign: "center",
        boxShadow: selected
          ? "0 0 0 3px color-mix(in oklab, var(--bs-primary), transparent 75%)"
          : "none",
        cursor: "default",
        userSelect: "none",
      }}
      aria-label={`Node ${data.name}, type ${data.type}. Double click to edit.`}
      title="Double-click to edit"
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 10,
          height: 10,
          border: "1px solid var(--color-node-border)",
          background: "color-mix(in oklab, var(--color-node-bg), black 15%)",
        }}
      />

      <div style={{ display: "grid", gap: 4 }}>
        <div
          style={{
            fontSize: 11,
            color: "var(--bs-secondary-color)",
            lineHeight: 1,
          }}
        >
          {data.type}
        </div>
        <div style={{ fontWeight: 600, lineHeight: 1.15 }}>{data.name}</div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 10,
          height: 10,
          border: "1px solid var(--color-node-border)",
          background: "color-mix(in oklab, var(--color-node-bg), black 15%)",
        }}
      />
    </div>
  );
}

