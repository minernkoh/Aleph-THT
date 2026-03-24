import { z } from "zod";

/**
 * Request-body schema for `POST /api/generate-narrative`.
 *
 * The frontend sends a compact JSON payload (summary text + tables + KPI stats)
 * that the backend forwards to Gemini. We validate the request up-front so the
 * server can return a helpful 400 error for malformed input.
 */
const shortStr = z.string().max(200);

const equipmentSpecSchema = z
  .array(
    z.object({
      equipment: shortStr,
      variables: z
        .array(
          z.object({
            name: shortStr,
            type: shortStr,
            value: z.union([z.string().max(500), z.number()]),
            unit: shortStr,
          }),
        )
        .max(50),
    }),
  )
  .max(20);

export const NarrativeRequestSchema = z
  .object({
    main_summary_text: z.string().max(5000),
    top_summary_text: z.string().max(5000),
    top_impact: z.record(z.string().max(200), z.number()),
    top_variables: z
      .array(
        z.object({
          equipment: shortStr,
          type: shortStr,
          name: shortStr,
          value: z.union([z.string().max(500), z.number()]),
          unit: shortStr,
        }),
      )
      .max(50),
    impact_summary_text: z.string().max(5000),
    setpoint_impact_summary: z
      .array(
        z.object({
          equipment: shortStr,
          setpoint: shortStr,
          weightage: z.number(),
          unit: shortStr,
        }),
      )
      .max(50),
    condition_impact_summary: z
      .array(
        z.object({
          equipment: shortStr,
          condition: shortStr,
          weightage: z.number(),
          unit: shortStr,
        }),
      )
      .max(50)
      .default([]),
    kpi_stats: z.object({
      min: z.number(),
      max: z.number(),
      avg: z.number(),
      n: z.number().int().positive(),
    }),
    scenarios_sample: z
      .array(
        z.object({
          scenario: shortStr,
          kpi: shortStr,
          kpi_value: z.number(),
          equipment_specification: equipmentSpecSchema,
        }),
      )
      .max(20),
  })
  .strict();

/** TypeScript type derived from the Zod schema. */
export type NarrativeRequest = z.infer<typeof NarrativeRequestSchema>;

