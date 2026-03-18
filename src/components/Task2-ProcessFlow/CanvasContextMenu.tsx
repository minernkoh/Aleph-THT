import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Stack from "react-bootstrap/Stack";
import { useEffect, useRef } from "react";

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

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      onClose();
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      role="menu"
      aria-label="Canvas context menu"
      style={{
        position: "absolute",
        left: anchor.x,
        top: anchor.y,
        zIndex: 30,
        width: 200,
      }}
    >
      <Card
        style={{
          border: "1px solid color-mix(in oklab, var(--color-node-border), black 15%)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
        }}
      >
        <Card.Body className="p-2">
          <Stack gap={1}>
            {target.kind === "pane" ? (
              <Button
                size="sm"
                variant="outline-primary"
                className="text-start"
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
                  className="text-start"
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
                  className="text-start"
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
                className="text-start"
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

