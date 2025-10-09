// Utility helpers to normalize and safely resolve nested analysis/detail fields.
// Centralizes the fallback chains previously inline in table components.

export function resolveFirst<T = any>(sources: Array<any>, keys: string[]): T | undefined {
  // Intentionally treats: undefined, null, empty string, and numeric 0 as "empty" for fallback purposes
  // because many analyzer fields use 0 as a placeholder rather than a meaningful value.
  // If numeric 0 should be considered a valid result in the future, adjust the condition below
  // and update related unit tests accordingly.
  for (const src of sources) {
    if (!src) continue;
    for (const key of keys) {
      const value = src[key];
      if (value !== undefined && value !== null && value !== '' && value !== 0) {
        return value as T;
      }
    }
  }
  return undefined;
}

export function formatCidr(raw: any): string | undefined {
  if (raw === 0) return "/0";
  if (!raw && raw !== 0) return undefined;
  return `/${raw}`;
}

export function dashIfEmpty(val: any): string | number {
  if (val === 0) return 0; // allow zero
  if (val === undefined || val === null || val === "") return "—";
  return val;
}

export function localeNumber(val: any): string | number {
  if (val === undefined || val === null) return "—";
  if (typeof val === "number") return val.toLocaleString();
  return val;
}
