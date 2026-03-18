import { useMemo } from "react";
import { mockResults } from "../data/mockResults";
import type { SetpointBarRow } from "../types";

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
