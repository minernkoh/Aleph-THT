import { z } from "zod";

export const NarrativeRequestSchema = z
  .object({
    main_summary_text: z.string(),
    top_summary_text: z.string(),
    top_impact: z.record(z.string(), z.number()),
    top_variables: z.array(
      z.object({
        equipment: z.string(),
        type: z.string(),
        name: z.string(),
        value: z.union([z.string(), z.number()]),
        unit: z.string(),
      }),
    ),
    impact_summary_text: z.string(),
    setpoint_impact_summary: z.array(
      z.object({
        equipment: z.string(),
        setpoint: z.string(),
        weightage: z.number(),
        unit: z.string(),
      }),
    ),
    condition_impact_summary: z
      .array(
        z.object({
          equipment: z.string(),
          condition: z.string(),
          weightage: z.number(),
          unit: z.string(),
        }),
      )
      .default([]),
    kpi_stats: z.object({
      min: z.number(),
      max: z.number(),
      avg: z.number(),
      n: z.number().int().positive(),
    }),
    scenarios_sample: z.array(
      z.object({
        scenario: z.string(),
        kpi: z.string(),
        kpi_value: z.number(),
        equipment_specification: z.unknown(),
      }),
    ),
  })
  .strict();

export type NarrativeRequest = z.infer<typeof NarrativeRequestSchema>;

