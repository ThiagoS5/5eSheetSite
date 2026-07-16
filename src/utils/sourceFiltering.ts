export interface SourceTaggedEntry {
  id: string;
  source: string;
}

export const BASE_SOURCE_CODE = "XPHB";

export function normalizeSourceCode(source: string): string {
  return source.trim().toUpperCase();
}

export function getActiveSourceSet(
  activeSources: readonly string[] | undefined,
): ReadonlySet<string> | undefined {
  if (!activeSources) {
    return undefined;
  }

  const sourceSet = new Set(activeSources.map(normalizeSourceCode));
  sourceSet.add(BASE_SOURCE_CODE);

  return sourceSet;
}

export function isSourceActive(
  source: string | undefined,
  activeSources: readonly string[] | undefined,
): boolean {
  if (!source) {
    return true;
  }

  const activeSourceSet = getActiveSourceSet(activeSources);

  return !activeSourceSet || activeSourceSet.has(normalizeSourceCode(source));
}

export function filterByActiveSources<T extends SourceTaggedEntry>(
  entries: readonly T[],
  activeSources: readonly string[] | undefined,
  preservedIds: readonly string[] = [],
): T[] {
  const activeSourceSet = getActiveSourceSet(activeSources);
  const preservedIdSet = new Set(preservedIds.filter(Boolean));

  if (!activeSourceSet) {
    return [...entries];
  }

  return entries.filter(
    (entry) =>
      activeSourceSet.has(normalizeSourceCode(entry.source)) || preservedIdSet.has(entry.id),
  );
}

export function getInactiveSourceEntries<T extends SourceTaggedEntry>(
  entries: readonly T[],
  activeSources: readonly string[] | undefined,
): T[] {
  const activeSourceSet = getActiveSourceSet(activeSources);

  if (!activeSourceSet) {
    return [];
  }

  return entries.filter((entry) => !activeSourceSet.has(normalizeSourceCode(entry.source)));
}
