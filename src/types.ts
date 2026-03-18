/**
 * Shared TypeScript types used across pages/components/hooks.
 *
 * These types describe the (validated) shape of our mock results data and the
 * smaller “view model” rows that we derive for tables/charts.
 */
export type MockResults = {
  data: {
    main_summary_text: string;
    top_summary_text: string;
    top_impact: Record<string, number>;
    top_variables: Array<{
      equipment: string;
      type: "Setpoint" | "Condition" | string;
      name: string;
      value: number;
      unit: string;
    }>;
    impact_summary_text: string;
    setpoint_impact_summary: Array<{
      equipment: string;
      setpoint: string;
      weightage: number;
      unit: string;
    }>;
    condition_impact_summary: Array<{
      equipment: string;
      condition: string;
      weightage: number;
      unit: string;
    }>;
    simulated_summary: {
      simulated_data: Array<{
        scenario: string;
        equipment_specification: Array<{
          equipment: string;
          variables: Array<{
            name: string;
            type: "Setpoint" | "Condition" | string;
            value: number;
            unit: string;
          }>;
        }>;
        kpi: string;
        kpi_value: number;
      }>;
    };
  };
};

/**
 * Flattened row used by Task 1 / Task 4 tables (scenario + equipment variable).
 * This is derived from `MockResults.data.simulated_summary.simulated_data`.
 */
export type SimulatedDataRow = {
  scenario: string;
  kpi_value: number;
  equipment: string;
  variable_name: string;
  variable_type: string;
  value: number;
  unit: string;
};

/** A single “name → weight” item, used in pie charts and summary lists. */
export type ImpactRow = { name: string; weight: number };

/** KPI time/sequence series point (one KPI value per scenario). */
export type KpiSeriesRow = { scenario: string; kpi: number };

/** Bar chart row for setpoint impacts (“label” is typically equipment + setpoint). */
export type SetpointBarRow = { label: string; weightage: number };

/** Scatter plot point used in the dashboard/report scatter chart. */
export type ScatterDataPoint = { x: number; y: number; scenario: number };
