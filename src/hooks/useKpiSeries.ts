import { useMemo } from "react";
import { mockResults } from "../data/mockResults";
import { parseScenarioNumber } from "../utils/scenario";
import type { KpiSeriesRow } from "../types";

export function useKpiSeries(): KpiSeriesRow[] {
  return useMemo<KpiSeriesRow[]>(() => {
    const rows = mockResults.data.simulated_summary.simulated_data.map((s) => ({
      scenario: s.scenario,
      kpi: s.kpi_value,
    }));
    return rows.sort(
      (a, b) => parseScenarioNumber(a.scenario) - parseScenarioNumber(b.scenario),
    );
  }, []);
}
