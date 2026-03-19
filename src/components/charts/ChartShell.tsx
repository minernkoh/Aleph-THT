import type { ReactNode } from "react";
import { forwardRef, useId } from "react";
import { ResponsiveContainer } from "recharts";

type Props = {
  /** Accessible label describing the chart for screen readers. */
  ariaLabel: string;
  /** When false, render a consistent empty-state instead of the chart. */
  hasData: boolean;
  /** Short textual summary of key data points for screen-reader users. */
  dataSummary?: string;
  children: ReactNode;
};

/**
 * Shared chart wrapper for consistent sizing, accessibility, and empty-state UI.
 *
 * Charts are rendered inside a `ResponsiveContainer` so they can be captured by the PDF exporter.
 */
export const ChartShell = forwardRef<HTMLDivElement | null, Props>(function ChartShell(
  { ariaLabel, hasData, dataSummary, children },
  ref
) {
  const descId = useId();
  const hasDesc = Boolean(dataSummary);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={ariaLabel}
      aria-describedby={hasDesc ? descId : undefined}
      style={{ width: "100%", height: "100%" }}
    >
      {hasDesc ? (
        <div id={descId} className="visually-hidden">
          {dataSummary}
        </div>
      ) : null}
      {!hasData ? (
        <div className="h-100 d-flex align-items-center justify-content-center text-body-secondary">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      )}
    </div>
  );
});
