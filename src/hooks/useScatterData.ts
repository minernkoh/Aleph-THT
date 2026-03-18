import { useMemo } from "react";
import { mockResults } from "../data/mockResults";
import { parseScenarioNumber } from "../utils/scenario";
import type { ScatterDataPoint } from "../types";

/**
 * Find a numeric setpoint value inside a nested scenario structure.
 *
 * The mock data stores variables under each equipment. For the scatter plot we
 * pick a single setpoint (by a substring match on its name) and treat it as the
 * X axis value.
 */
function pickSetpointValue(
  scenario: (typeof mockResults.data.simulated_summary.simulated_data)[number],
  equipment: string,
  includesName: string,
): number | null {
  for (const spec of scenario.equipment_specification) {
    if (spec.equipment !== equipment) continue;
    for (const v of spec.variables) {
      if (v.type !== "Setpoint") continue;
      if (String(v.name).toLowerCase().includes(includesName.toLowerCase())) {
        return v.value;
      }
    }
  }
  return null;
}

/** Scatter plot datasets (setpoints vs KPI) for the dashboard. */
export function useScatterData(): {
  hexCold: ScatterDataPoint[];
  fuelTemp: ScatterDataPoint[];
  airTemp: ScatterDataPoint[];
} {
  return useMemo(() => {
    const scenarios = mockResults.data.simulated_summary.simulated_data;
    const buildSeries = (equipment: string, includesName: string): ScatterDataPoint[] =>
      scenarios
        .map((s) => {
          const x = pickSetpointValue(s, equipment, includesName);
          return x == null
            ? null
            : { x, y: s.kpi_value, scenario: parseScenarioNumber(s.scenario) };
        })
        .filter((r): r is ScatterDataPoint => r != null);

    // Build three scatter series by picking a different equipment/setpoint for each.
    const hexCold = buildSeries("HEX-100", "cold_fluid_temperature");
    const fuelTemp = buildSeries("Fuel", "temperature");
    const airTemp = buildSeries("Air", "temperature");
    return { hexCold, fuelTemp, airTemp };
  }, []);
}
