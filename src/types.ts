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

export type SimulatedDataRow = {
  scenario: string;
  kpi_value: number;
  equipment: string;
  variable_name: string;
  variable_type: string;
  value: number;
  unit: string;
};

export type ImpactRow = { name: string; weight: number };

export type KpiSeriesRow = { scenario: string; kpi: number };

export type SetpointBarRow = { label: string; weightage: number };
