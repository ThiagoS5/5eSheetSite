/**
 * Truncate display text to a character limit, appending an ellipsis.
 * Empty/whitespace values render the em dash placeholder.
 */
export function truncate(text: string | undefined | null, limit: number): string {
  if (!text || text.trim() === "") return "—";
  if (text.length <= limit) return text;
  return text.slice(0, limit).trimEnd() + "…";
}
