import { useMemo } from "react";
import { mockResults } from "../data/mockResults";
import type { ImpactRow } from "../types";

/**
 * Top non-"Others" impacts, sorted descending by weight.
 *
 * The mock dataset includes an "Others" bucket; for the UI we typically show the
 * named drivers only, sorted from highest → lowest weight.
 */
export function useTopImpact(): ImpactRow[] {
  return useMemo<ImpactRow[]>(() => {
    const d = mockResults.data.top_impact;
    return Object.entries(d)
      .filter(([name]) => name !== "Others")
      .sort((a, b) => b[1] - a[1])
      .map(([name, weight]) => ({ name, weight }));
  }, []);
}
