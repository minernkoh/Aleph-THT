import { useMemo } from "react";
import { mockResults } from "../data/mockResults";
import { parseScenarioNumber } from "../utils/scenario";
import type { KpiSeriesRow } from "../types";

/**
 * KPI value per scenario, sorted numerically by scenario label.
 *
 * We sort scenarios numerically (Scenario 2 comes before Scenario 10) so the line chart reads naturally.
 */
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
