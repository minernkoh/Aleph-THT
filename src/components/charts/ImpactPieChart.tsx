import { forwardRef } from "react";
import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";
import { useChartPalette } from "../../hooks";
import type { ImpactRow } from "../../types";
import { ChartShell } from "./ChartShell";

/**
 * Pie chart: top-impact weights.
 *
 * The ref is used by the PDF exporter to capture the rendered chart.
 */
type Props = {
  /** Rows of `{ name, weight }` already sorted/filtered for display. */
  data: ImpactRow[];
};

export const ImpactPieChart = forwardRef<HTMLDivElement | null, Props>(
  function ImpactPieChart({ data }, ref) {
    const palette = useChartPalette();
    return (
      <ChartShell
        ref={ref}
        ariaLabel="Pie chart showing the top variable impact weights"
        hasData={data.length > 0}
        dataSummary={
          data.length > 0
            ? `Top impacts: ${data.slice(0, 3).map((d) => `${d.name} (${(d.weight * 100).toFixed(1)}%)`).join(", ")}.`
            : undefined
        }
      >
        <PieChart>
          <Tooltip />
          <Legend />
          <Pie data={data} dataKey="weight" nameKey="name" outerRadius="80%" label>
            {data.map((_, idx) => (
              <Cell key={idx} fill={palette[idx % palette.length]} />
            ))}
          </Pie>
        </PieChart>
      </ChartShell>
    );
  },
);
