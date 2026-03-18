import { forwardRef } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ResponsiveContainer } from "recharts";

import { chartPalette } from "../../constants/colors";
import type { KpiSeriesRow } from "../../types";
import { formatNumber } from "../../utils/formatNumber";

type Props = {
  data: KpiSeriesRow[];
  /** When true, use angled X-axis labels and extra bottom margin (e.g. for report layout) */
  angledLabels?: boolean;
};

export const KpiLineChart = forwardRef<HTMLDivElement | null, Props>(
  function KpiLineChart({ data, angledLabels = false }, ref) {
    return (
      <div
        ref={ref}
        role="img"
        aria-label="Line chart showing KPI across scenarios"
        style={{ width: "100%", height: "100%" }}
      >
        {data.length === 0 ? (
          <div className="h-100 d-flex align-items-center justify-content-center text-body-secondary">
            No data available
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={angledLabels ? { bottom: 50 } : undefined}
          >
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
              stroke={chartPalette[0]}
            />
          </LineChart>
        </ResponsiveContainer>
        )}
      </div>
    );
  },
);
