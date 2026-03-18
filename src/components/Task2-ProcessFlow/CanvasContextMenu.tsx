import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Stack from "react-bootstrap/Stack";
import { useEffect, useRef, useState } from "react";

export type CanvasContextMenuTarget =
  | { kind: "node"; id: string }
  | { kind: "edge"; id: string }
  | { kind: "pane" };

export type CanvasContextMenuProps = {
  open: boolean;
  target: CanvasContextMenuTarget;
  anchor: { x: number; y: number };
  onClose: () => void;
  onEditNode: (nodeId: string) => void;
  onDeleteNodes: (nodeIds: string[]) => void;
  onDeleteEdges: (edgeIds: string[]) => void;
  onAddNodeHere: () => void;
};

/** Right-click menu for nodes/edges/the canvas. */
export function CanvasContextMenu({
  open,
  target,
  anchor,
  onClose,
  onEditNode,
  onDeleteNodes,
  onDeleteEdges,
  onAddNodeHere,
}: CanvasContextMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(() => ({ left: anchor.x, top: anchor.y }));

  useEffect(() => {
    if (!open) return;
    // Let users close the menu quickly with Esc (common context menu behavior).
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    // Close the menu when clicking/tapping outside of it.
    function onPointerDown(e: PointerEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      onClose();
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setPos({ left: anchor.x, top: anchor.y });
  }, [open, anchor.x, anchor.y]);

  useEffect(() => {
    if (!open) return;
    const el = rootRef.current;
    if (!el) return;
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
  }, [open, pos.left, pos.top, target.kind]);

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      role="menu"
      aria-label="Canvas context menu"
      style={{
        position: "absolute",
        left: pos.left,
        top: pos.top,
        zIndex: 30,
        width: "var(--size-menu-width)",
      }}
    >
      <Card
        style={{
          border:
            "var(--border-width) solid color-mix(in oklab, var(--color-node-border), black 15%)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <Card.Body className="p-2">
          <Stack gap={1}>
            {target.kind === "pane" ? (
              <Button
                size="sm"
                variant="outline-primary"
                className="text-start touch-target-min"
                onClick={() => {
                  onAddNodeHere();
                  onClose();
                }}
              >
                Add node here
              </Button>
            ) : null}

            {target.kind === "node" ? (
              <>
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="text-start touch-target-min"
                  onClick={() => {
                    onEditNode(target.id);
                    onClose();
                  }}
                >
                  Edit…
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  className="text-start touch-target-min"
                  onClick={() => {
                    onDeleteNodes([target.id]);
                    onClose();
                  }}
                >
                  Delete node
                </Button>
              </>
            ) : null}

            {target.kind === "edge" ? (
              <Button
                size="sm"
                variant="outline-danger"
                className="text-start touch-target-min"
                onClick={() => {
                  onDeleteEdges([target.id]);
                  onClose();
                }}
              >
                Delete edge
              </Button>
            ) : null}
          </Stack>
        </Card.Body>
      </Card>
    </div>
  );
}

