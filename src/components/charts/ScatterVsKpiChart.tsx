import {
  CartesianGrid,
  Legend,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { forwardRef } from "react";

import { chartPalette } from "../../constants/colors";
import type { ScatterDataPoint } from "../../types";
import { formatNumber } from "../../utils/formatNumber";
import { ChartShell } from "./ChartShell";

/**
 * Scatter chart: setpoint value (x) vs KPI (y) across scenarios.
 *
 * We render up to three series (one per variable). The ref is used for PDF export.
 */
type Props = {
  /** Series for a specific setpoint/variable (HEX cold fluid temperature). */
  hexCold: ScatterDataPoint[];
  /** Series for a specific setpoint/variable (Fuel temperature). */
  fuelTemp: ScatterDataPoint[];
  /** Series for a specific setpoint/variable (Air temperature). */
  airTemp: ScatterDataPoint[];
};

export const ScatterVsKpiChart = forwardRef<HTMLDivElement | null, Props>(
  function ScatterVsKpiChart({ hexCold, fuelTemp, airTemp }, ref) {
    const hasAnyData =
      hexCold.length > 0 || fuelTemp.length > 0 || airTemp.length > 0;

    return (
      <ChartShell
        ref={ref}
        ariaLabel="Scatter chart showing variable values versus KPI across scenarios"
        hasData={hasAnyData}
      >
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
      </ChartShell>
    );
  },
);

