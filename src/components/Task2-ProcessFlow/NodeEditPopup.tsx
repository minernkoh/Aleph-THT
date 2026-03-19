import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { useCallback, useEffect, useRef, useState } from "react";

import type { NodeType } from "./types";

const NODE_TYPES: NodeType[] = ["type1", "type2", "type3"];

const POPUP_OFFSET = 12;
const POPUP_MARGIN = 8;

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
    left: anchor.x + POPUP_OFFSET,
    top: anchor.y - POPUP_OFFSET,
  }));

  useEffect(() => {
    setName(initialName);
    setType(initialType);
  }, [initialName, initialType, nodeId]);

  useEffect(() => {
    setPos({ left: anchor.x + POPUP_OFFSET, top: anchor.y - POPUP_OFFSET });
  }, [anchor.x, anchor.y]);

  useEffect(() => {
    nameRef.current?.focus();
    nameRef.current?.select();
  }, [nodeId]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const parent = (el.offsetParent ?? el.parentElement) as HTMLElement | null;
    if (!parent) return;

    const pRect = parent.getBoundingClientRect();
    const rRect = el.getBoundingClientRect();

    const maxLeft = Math.max(POPUP_MARGIN, pRect.width - rRect.width - POPUP_MARGIN);
    const maxTop = Math.max(POPUP_MARGIN, pRect.height - rRect.height - POPUP_MARGIN);

    const nextLeft = Math.min(Math.max(pos.left, POPUP_MARGIN), maxLeft);
    const nextTop = Math.min(Math.max(pos.top, POPUP_MARGIN), maxTop);

    if (nextLeft !== pos.left || nextTop !== pos.top) {
      setPos({ left: nextLeft, top: nextTop });
    }
  }, [pos.left, pos.top, nodeId]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      if ((e.key === "Enter" || e.key === "NumpadEnter") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onSave({ name: name.trim() || initialName, type });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [name, type, initialName, onCancel, onSave]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      onCancel();
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [onCancel]);

  const handleFocusTrap = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const el = rootRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'input, select, button, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  const title = "Edit node";
  const tipId = `node-edit-tip-${nodeId}`;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      aria-describedby={tipId}
      onKeyDown={handleFocusTrap}
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
          <div id={tipId} className="small text-body-secondary mt-2">
            Tip: <span className="fw-semibold">Ctrl/Cmd+Enter</span> to save,{" "}
            <span className="fw-semibold">Esc</span> to cancel.
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
