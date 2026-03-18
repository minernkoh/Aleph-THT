import { forwardRef } from "react";
import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { chartPalette } from "../../constants/colors";
import type { ScatterDataPoint } from "../../hooks/useScatterData";
import { formatNumber } from "../../utils/formatNumber";

type Props = {
  hexCold: ScatterDataPoint[];
  fuelTemp: ScatterDataPoint[];
  airTemp: ScatterDataPoint[];
};

export const ScatterVsKpiChart = forwardRef<HTMLDivElement | null, Props>(
  function ScatterVsKpiChart({ hexCold, fuelTemp, airTemp }, ref) {
    const hasAnyData =
      hexCold.length > 0 || fuelTemp.length > 0 || airTemp.length > 0;

    return (
      <div
        ref={ref}
        role="img"
        aria-label="Scatter chart showing variable values versus KPI across scenarios"
        style={{ width: "100%", height: "100%" }}
      >
        {!hasAnyData ? (
          <div className="h-100 d-flex align-items-center justify-content-center text-body-secondary">
            No data available
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Setpoint value"
              tickFormatter={(v) => formatNumber(Number(v))}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="KPI"
              tickFormatter={(v) => formatNumber(Number(v))}
            />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />
            <Scatter
              name="HEX-100 cold_fluid_temperature"
              data={hexCold}
              fill={chartPalette[2]}
            />
            <Scatter name="Fuel temperature" data={fuelTemp} fill={chartPalette[7]} />
            <Scatter name="Air temperature" data={airTemp} fill={chartPalette[5]} />
          </ScatterChart>
        </ResponsiveContainer>
        )}
      </div>
    );
  },
);

