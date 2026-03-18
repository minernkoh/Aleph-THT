/** Generate a mostly-unique ID for nodes/edges (prefers crypto UUID). */
export function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // Modern browsers: strong uniqueness guarantees.
    return `${prefix}_${crypto.randomUUID()}`;
  }
  // Fallback for older environments (good enough for a demo app).
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

