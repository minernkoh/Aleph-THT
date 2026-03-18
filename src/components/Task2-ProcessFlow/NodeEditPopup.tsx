import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { useEffect, useRef, useState } from "react";

import type { NodeType } from "./types";

const NODE_TYPES: NodeType[] = ["type1", "type2", "type3"];

export type NodeEditPopupProps = {
  nodeId: string;
  initialName: string;
  initialType: NodeType;
  anchor: { x: number; y: number };
  onCancel: () => void;
  onSave: (updates: { name: string; type: NodeType }) => void;
};

/** Small popup dialog for editing a node's name and type. */
export function NodeEditPopup({
  nodeId,
  initialName,
  initialType,
  anchor,
  onCancel,
  onSave,
}: NodeEditPopupProps) {
  const [name, setName] = useState(initialName);
  const [type, setType] = useState<NodeType>(initialType);
  const rootRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState(() => ({
    left: anchor.x + 12,
    top: anchor.y - 12,
  }));

  useEffect(() => {
    setName(initialName);
    setType(initialType);
  }, [initialName, initialType, nodeId]);

  useEffect(() => {
    setPos({ left: anchor.x + 12, top: anchor.y - 12 });
  }, [anchor.x, anchor.y]);

  useEffect(() => {
    // Autofocus without stealing focus from other interactions too aggressively.
    nameRef.current?.focus();
    nameRef.current?.select();
  }, [nodeId]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // Ensure the popup stays within its positioned parent (FlowCanvas Card.Body).
    const parent = (el.offsetParent ?? el.parentElement) as HTMLElement | null;
    if (!parent) return;

    const pRect = parent.getBoundingClientRect();
    const rRect = el.getBoundingClientRect();

    const margin = 8;
    const maxLeft = Math.max(margin, pRect.width - rRect.width - margin);
    const maxTop = Math.max(margin, pRect.height - rRect.height - margin);

    const nextLeft = Math.min(Math.max(pos.left, margin), maxLeft);
    const nextTop = Math.min(Math.max(pos.top, margin), maxTop);

    if (nextLeft !== pos.left || nextTop !== pos.top) {
      setPos({ left: nextLeft, top: nextTop });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos.left, pos.top, nodeId]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      // Support "save" without leaving the keyboard: Ctrl/Cmd+Enter.
      if ((e.key === "Enter" || e.key === "NumpadEnter") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onSave({ name: name.trim() || initialName, type });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [name, type, initialName, onCancel, onSave]);

  useEffect(() => {
    // Click outside closes the popup (like a dropdown/menu).
    function onPointerDown(e: PointerEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      onCancel();
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [onCancel]);

  const title = "Edit node";

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label={title}
      style={{
        position: "absolute",
        left: pos.left,
        top: pos.top,
        zIndex: 20,
        width: "var(--size-popup-width)",
      }}
    >
      <Card
        style={{
          border:
            "var(--border-width) solid color-mix(in oklab, var(--color-node-border), black 15%)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <Card.Body className="p-3">
          <div className="fw-semibold mb-2">{title}</div>

          <Form.Group className="mb-2" controlId="node-edit-name">
            <Form.Label className="small text-body-secondary">Name</Form.Label>
            <Form.Control
              ref={nameRef}
              size="sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Node name"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="node-edit-type">
            <Form.Label className="small text-body-secondary">Type</Form.Label>
            <Form.Select
              size="sm"
              value={type}
              onChange={(e) => setType(e.target.value as NodeType)}
            >
              {NODE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Stack direction="horizontal" gap={2} className="justify-content-end">
            <Button
              size="sm"
              variant="outline-secondary"
              className="touch-target-min"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="touch-target-min"
              onClick={() => onSave({ name: name.trim() || initialName, type })}
              title="Ctrl/Cmd+Enter to save"
            >
              Save
            </Button>
          </Stack>
          <div className="small text-body-secondary mt-2">
            Tip: <span className="fw-semibold">Ctrl/Cmd+Enter</span> to save,{" "}
            <span className="fw-semibold">Esc</span> to cancel.
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

