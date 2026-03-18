import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { forwardRef } from "react";

import { chartPalette } from "../../constants/colors";
import type { SetpointBarRow } from "../../types";
import { formatNumber } from "../../utils/formatNumber";
import { ChartShell } from "./ChartShell";

/**
 * Bar chart: setpoint weightage summary.
 *
 * Used in Task 4 (Dashboard) and Task 3 (Report export). The `forwardRef` allows the
 * PDF exporter to capture this chart as an image.
 */
type Props = {
  /** Pre-formatted rows for the bar chart (label + numeric weightage). */
  data: SetpointBarRow[];
};

export const SetpointBarChart = forwardRef<HTMLDivElement | null, Props>(
  function SetpointBarChart({ data }, ref) {
    return (
      <ChartShell
        ref={ref}
        ariaLabel="Bar chart showing setpoint weightage by equipment and setpoint"
        hasData={data.length > 0}
      >
        <BarChart data={data} margin={{ left: 10, right: 10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            angle={-35}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 11 }}
            interval={0}
          />
          <YAxis tickFormatter={(v) => formatNumber(Number(v))} />
          <Tooltip formatter={(v) => [formatNumber(Number(v)), "Weightage"]} />
          <Legend />
          <Bar dataKey="weightage" name="Weightage" fill={chartPalette[0]} />
        </BarChart>
      </ChartShell>
    );
  },
);

