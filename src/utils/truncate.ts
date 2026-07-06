
export function truncate(text: string | undefined | null, limit: number): string {
  if (!text || text.trim() === "") return "—";
  if (text.length <= limit) return text;
  return text.slice(0, limit).trimEnd() + "…";
}
