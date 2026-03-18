import { useMemo } from "react";
import { mockResults } from "../data/mockResults";
import { parseScenarioNumber } from "../utils/scenario";

export type ScatterDataPoint = { x: number; y: number; scenario: number };

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

export function useScatterData(): {
  hexCold: ScatterDataPoint[];
  fuelTemp: ScatterDataPoint[];
  airTemp: ScatterDataPoint[];
} {
  return useMemo(() => {
    const scenarios = mockResults.data.simulated_summary.simulated_data;
    const hexCold = scenarios
      .map((s) => {
        const x = pickSetpointValue(s, "HEX-100", "cold_fluid_temperature");
        return x == null ? null : { x, y: s.kpi_value, scenario: parseScenarioNumber(s.scenario) };
      })
      .filter((r): r is ScatterDataPoint => r != null);
    const fuelTemp = scenarios
      .map((s) => {
        const x = pickSetpointValue(s, "Fuel", "temperature");
        return x == null ? null : { x, y: s.kpi_value, scenario: parseScenarioNumber(s.scenario) };
      })
      .filter((r): r is ScatterDataPoint => r != null);
    const airTemp = scenarios
      .map((s) => {
        const x = pickSetpointValue(s, "Air", "temperature");
        return x == null ? null : { x, y: s.kpi_value, scenario: parseScenarioNumber(s.scenario) };
      })
      .filter((r): r is ScatterDataPoint => r != null);
    return { hexCold, fuelTemp, airTemp };
  }, []);
}
