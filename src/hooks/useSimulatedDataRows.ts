import { useMemo } from "react";
import { mockResults } from "../data/mockResults";
import type { SimulatedDataRow } from "../types";

export function useSimulatedDataRows(): SimulatedDataRow[] {
  return useMemo<SimulatedDataRow[]>(() => {
    const rows: SimulatedDataRow[] = [];
    const data = mockResults.data.simulated_summary.simulated_data;
    for (const s of data) {
      for (const spec of s.equipment_specification) {
        for (const v of spec.variables) {
          rows.push({
            scenario: s.scenario,
            kpi_value: s.kpi_value,
            equipment: spec.equipment,
            variable_name: v.name,
            variable_type: v.type,
            value: v.value,
            unit: v.unit,
          });
        }
      }
    }
    return rows;
  }, []);
}
