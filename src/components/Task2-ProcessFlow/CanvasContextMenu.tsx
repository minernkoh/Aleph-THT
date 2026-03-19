import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Stack from "react-bootstrap/Stack";
import { useEffect, useMemo, useRef, useState } from "react";

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

function getCssPxVar(name: string, fallbackPx: number) {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!v) return fallbackPx;
    const n = Number.parseFloat(v.replace("px", ""));
    return Number.isFinite(n) ? n : fallbackPx;
  } catch {
    return fallbackPx;
  }
}

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
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [pos, setPos] = useState(() => ({ left: anchor.x, top: anchor.y }));
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => {
    type Item = {
      id: string;
      label: string;
      variant: "outline-primary" | "outline-danger";
      onSelect: () => void;
    };

    const out: Item[] = [];
    if (target.kind === "pane") {
      out.push({
        id: "add-node-here",
        label: "Add node here",
        variant: "outline-primary",
        onSelect: () => {
          onAddNodeHere();
          onClose();
        },
      });
    }

    if (target.kind === "node") {
      out.push({
        id: "edit-node",
        label: "Edit…",
        variant: "outline-primary",
        onSelect: () => {
          onEditNode(target.id);
          onClose();
        },
      });
      out.push({
        id: "delete-node",
        label: "Delete node",
        variant: "outline-danger",
        onSelect: () => {
          onDeleteNodes([target.id]);
          onClose();
        },
      });
    }

    if (target.kind === "edge") {
      out.push({
        id: "delete-edge",
        label: "Delete edge",
        variant: "outline-danger",
        onSelect: () => {
          onDeleteEdges([target.id]);
          onClose();
        },
      });
    }

    return out;
  }, [onAddNodeHere, onClose, onDeleteEdges, onDeleteNodes, onEditNode, target]);

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
    setActiveIndex(0);
    // Focus first item for keyboard users.
    queueMicrotask(() => itemRefs.current[0]?.focus());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, target.kind, target.kind === "node" ? target.id : "", target.kind === "edge" ? target.id : ""]);

  useEffect(() => {
    if (!open) return;
    const el = rootRef.current;
    if (!el) return;
    const parent = (el.offsetParent ?? el.parentElement) as HTMLElement | null;
    if (!parent) return;

    const pRect = parent.getBoundingClientRect();
    const rRect = el.getBoundingClientRect();

    const margin = getCssPxVar("--space-2", 8);
    const maxLeft = Math.max(margin, pRect.width - rRect.width - margin);
    const maxTop = Math.max(margin, pRect.height - rRect.height - margin);

    const nextLeft = Math.min(Math.max(pos.left, margin), maxLeft);
    const nextTop = Math.min(Math.max(pos.top, margin), maxTop);

    if (nextLeft !== pos.left || nextTop !== pos.top) {
      setPos({ left: nextLeft, top: nextTop });
    }
  }, [open, pos.left, pos.top, target.kind]);

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      role="menu"
      aria-label="Canvas context menu"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (items.length === 0) return;
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const next = (activeIndex + 1) % items.length;
          setActiveIndex(next);
          itemRefs.current[next]?.focus();
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          const next = (activeIndex - 1 + items.length) % items.length;
          setActiveIndex(next);
          itemRefs.current[next]?.focus();
          return;
        }
        if (e.key === "Home") {
          e.preventDefault();
          setActiveIndex(0);
          itemRefs.current[0]?.focus();
          return;
        }
        if (e.key === "End") {
          e.preventDefault();
          const last = items.length - 1;
          setActiveIndex(last);
          itemRefs.current[last]?.focus();
          return;
        }
      }}
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
            {items.map((it, idx) => (
              <Button
                key={it.id}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                size="sm"
                variant={it.variant}
                className="text-start touch-target-min"
                role="menuitem"
                tabIndex={idx === activeIndex ? 0 : -1}
                onFocus={() => setActiveIndex(idx)}
                onClick={it.onSelect}
              >
                {it.label}
              </Button>
            ))}
          </Stack>
        </Card.Body>
      </Card>
    </div>
  );
}

