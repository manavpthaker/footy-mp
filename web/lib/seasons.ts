/** Understat uses 2425; ESPN uses 2024-25. Compare the same season identity. */
export function normalizeSeason(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^\d{4}$/.test(value)) {
    const start = Number(value.slice(0, 2));
    const end = Number(value.slice(2));
    if (start >= 21 && end === start + 1) return `20${value.slice(0, 2)}-${value.slice(2)}`;
  }
  return value;
}
