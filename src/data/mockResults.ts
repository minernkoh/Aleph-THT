/**
 * Loads and validates the local mock dataset.
 *
 * We import `mock_results.json` as raw JSON, then validate it with Zod at startup.
 * If the JSON shape doesn't match what the UI expects, we fail fast with a clear error.
 */
import raw from "./mock_results.json";
import { z } from "zod";
import type { MockResults } from "../types";

// Small schemas composed into the full `mockResultsSchema`.
const variableSchema = z.object({
  name: z.string(),
  type: z.string(),
  value: z.number(),
  unit: z.string(),
});

const equipmentSpecSchema = z.object({
  equipment: z.string(),
  variables: z.array(variableSchema),
});

const simulatedDataItemSchema = z.object({
  scenario: z.string(),
  equipment_specification: z.array(equipmentSpecSchema),
  kpi: z.string(),
  kpi_value: z.number(),
});

const topVariableSchema = z.object({
  equipment: z.string(),
  type: z.string(),
  name: z.string(),
  value: z.number(),
  unit: z.string(),
});

const setpointImpactItemSchema = z.object({
  equipment: z.string(),
  setpoint: z.string(),
  weightage: z.number(),
  unit: z.string(),
});

const conditionImpactItemSchema = z.object({
  equipment: z.string(),
  condition: z.string(),
  weightage: z.number(),
  unit: z.string(),
});

// Full schema for the JSON file (a subset of `MockResults`, focused on the `data` payload).
const mockResultsSchema = z.object({
  data: z.object({
    main_summary_text: z.string(),
    top_summary_text: z.string(),
    top_impact: z.record(z.string(), z.number()),
    top_variables: z.array(topVariableSchema),
    impact_summary_text: z.string(),
    setpoint_impact_summary: z.array(setpointImpactItemSchema),
    condition_impact_summary: z.array(conditionImpactItemSchema),
    simulated_summary: z.object({
      simulated_data: z.array(simulatedDataItemSchema),
    }),
  }),
});

// Validate once at module load so every consumer can assume the data is well-formed.
const parsed = mockResultsSchema.safeParse(raw);
if (!parsed.success) {
  console.error("mock_results.json validation failed:", parsed.error.flatten());
  throw new Error(
    "Invalid mock_results.json shape. Check console for details.",
  );
}

export const mockResults: MockResults = parsed.data;
