/**
 * Number formatting helpers (UI display only).
 *
 * We centralize formatting so charts/tables consistently use the user's locale
 * and the same rounding rules.
 */
const numberFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

/**
 * Formats a number for display using the user's locale.
 */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}
