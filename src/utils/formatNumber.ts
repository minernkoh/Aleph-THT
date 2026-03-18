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
