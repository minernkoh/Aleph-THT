import { forwardRef } from "react";
import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";
import { ResponsiveContainer } from "recharts";
import { chartPalette } from "../../constants/colors";
import type { ImpactRow } from "../../types";

type Props = {
  data: ImpactRow[];
};

export const ImpactPieChart = forwardRef<HTMLDivElement | null, Props>(
  function ImpactPieChart({ data }, ref) {
    return (
      <div
        ref={ref}
        role="img"
        aria-label="Pie chart showing the top variable impact weights"
        style={{ width: "100%", height: "100%" }}
      >
        {data.length === 0 ? (
          <div className="h-100 d-flex align-items-center justify-content-center text-body-secondary">
            No data available
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie
              data={data}
              dataKey="weight"
              nameKey="name"
              outerRadius={110}
              label
            >
              {data.map((_, idx) => (
                <Cell
                  key={idx}
                  fill={chartPalette[idx % chartPalette.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        )}
      </div>
    );
  },
);
