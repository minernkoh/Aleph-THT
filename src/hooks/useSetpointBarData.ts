import { useMemo } from "react";
import { mockResults } from "../data/mockResults";
import type { SetpointBarRow } from "../types";

/**
 * Setpoint impact rows formatted for the bar chart.
 */
export function useSetpointBarData(): SetpointBarRow[] {
  return useMemo<SetpointBarRow[]>(
    () =>
      mockResults.data.setpoint_impact_summary.map((r) => ({
        label: `${r.equipment}.${r.setpoint}`,
        weightage: r.weightage,
      })),
    [],
  );
}
