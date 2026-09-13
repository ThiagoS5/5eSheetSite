/** Resolve the unmodified _copy records used by local class catalogs. */
export function resolve5eInheritance<T extends { name: string; source: string }>(records: T[]): T[] {
  const resolved = new Map<T, T>();
  const resolving = new Set<T>();

  function resolve(record: T): T {
    const cached = resolved.get(record);
    if (cached) return cached;
    const copy = (record as T & { _copy?: Record<string, unknown> })._copy;
    if (!copy) return record;
    if (resolving.has(record)) throw new Error(`Circular 5etools inheritance: ${record.name}`);
    if (copy._mod) throw new Error(`Unsupported 5etools copy modifications: ${record.name}`);
    const identity = Object.entries(copy).filter(([key]) => !key.startsWith("_"));
    const parent = records.find((candidate) => candidate !== record && identity.every(([key, value]) => {
      const actual = (candidate as unknown as Record<string, unknown>)[key];
      return typeof actual === "string" && typeof value === "string"
        ? actual.toLowerCase() === value.toLowerCase()
        : actual === value;
    }));
    if (!parent) throw new Error(`Missing 5etools inheritance target: ${record.name} (${record.source})`);
    resolving.add(record);
    const result = { ...resolve(parent), ...record };
    delete (result as T & { _copy?: unknown })._copy;
    resolving.delete(record);
    resolved.set(record, result);
    return result;
  }

  return records.map(resolve);
}
