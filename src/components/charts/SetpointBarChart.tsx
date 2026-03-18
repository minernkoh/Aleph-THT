import { forwardRef } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { chartPalette } from "../../constants/colors";
import type { SetpointBarRow } from "../../types";
import { formatNumber } from "../../utils/formatNumber";

type Props = {
  data: SetpointBarRow[];
};

export const SetpointBarChart = forwardRef<HTMLDivElement | null, Props>(
  function SetpointBarChart({ data }, ref) {
    return (
      <div
        ref={ref}
        role="img"
        aria-label="Bar chart showing setpoint weightage by equipment and setpoint"
        style={{ width: "100%", height: "100%" }}
      >
        {data.length === 0 ? (
          <div className="h-100 d-flex align-items-center justify-content-center text-body-secondary">
            No data available
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
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
        </ResponsiveContainer>
        )}
      </div>
    );
  },
);

