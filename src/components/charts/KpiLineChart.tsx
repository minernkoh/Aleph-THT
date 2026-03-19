import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { forwardRef } from "react";

import { useChartPalette } from "../../hooks";
import type { KpiSeriesRow } from "../../types";
import { formatNumber } from "../../utils/formatNumber";
import { ChartShell } from "./ChartShell";

/**
 * Line chart: KPI value across scenarios.
 *
 * Used in the dashboard and in the report export. The optional `angledLabels`
 * mode makes long scenario names fit better in narrow layouts.
 */
type Props = {
  data: KpiSeriesRow[];
  /** When true, use angled X-axis labels and extra bottom margin (e.g. for report layout) */
  angledLabels?: boolean;
};

export const KpiLineChart = forwardRef<HTMLDivElement | null, Props>(
  function KpiLineChart({ data, angledLabels = false }, ref) {
    const palette = useChartPalette();
    return (
      <ChartShell
        ref={ref}
        ariaLabel="Line chart showing KPI across scenarios"
        hasData={data.length > 0}
        dataSummary={
          data.length > 0
            ? `${data.length} scenarios. KPI range: ${formatNumber(Math.min(...data.map((d) => d.kpi)))} to ${formatNumber(Math.max(...data.map((d) => d.kpi)))}.`
            : undefined
        }
      >
        <LineChart data={data} margin={angledLabels ? { bottom: 50 } : undefined}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="scenario"
            interval="preserveStartEnd"
            {...(angledLabels
              ? {
                  angle: -35,
                  textAnchor: "end",
                  height: 50,
                  tick: { fontSize: 10 },
                }
              : {})}
          />
          <YAxis tickFormatter={(v) => formatNumber(Number(v))} />
          <Tooltip formatter={(v) => [formatNumber(Number(v)), "KPI"]} />
          <Legend />
          <Line
            type="monotone"
            dataKey="kpi"
            name="KPI"
            strokeWidth={2}
            stroke={palette[0]}
          />
        </LineChart>
      </ChartShell>
    );
  },
);
