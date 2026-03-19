/**
 * Chart palette tuned for industrial/process analytics (light backgrounds).
 */
export const chartPalette = [
  "#2563eb", // blue (primary)
  "#0d9488", // teal
  "#c27a1e", // amber
  "#7c3aed", // violet
  "#16a34a", // green
  "#dc2626", // red
  "#1e293b", // ink navy
  "#64748b", // slate
  "#d97706", // gold
  "#0891b2", // cyan
] as const;

/**
 * Desaturated palette for dark backgrounds -- prevents color vibration.
 */
export const chartPaletteDark = [
  "#6ba1ff", // blue (softer)
  "#5eead4", // teal (lifted)
  "#d4a44c", // amber (muted)
  "#a78bfa", // violet (lighter)
  "#4ade80", // green (lifted)
  "#f87171", // red (softer)
  "#94a3b8", // slate (lighter)
  "#cbd5e1", // silver
  "#fbbf24", // gold (lighter)
  "#22d3ee", // cyan (lifted)
] as const;

/**
 * Maps node types to CSS custom properties so colors adapt to dark mode.
 * Actual hex values live in :root in styles.css.
 */
export const NODE_TYPE_COLORS: Record<string, string> = {
  type1: "var(--color-node-type1)",
  type2: "var(--color-node-type2)",
  type3: "var(--color-node-type3)",
};
