/**
 * Scenario label parsing utilities.
 *
 * Scenario names in the dataset are human-readable strings like "Scenario 1".
 * For sorting/charting, we often want the numeric portion.
 *
 * Parses a scenario label like "Scenario 1" to a numeric value for sorting.
 * Returns 0 if the result is not a finite number.
 */
export function parseScenarioNumber(label: string): number {
  const n = Number(label.replace("Scenario ", ""));
  return Number.isFinite(n) ? n : 0;
}
