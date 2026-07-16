export interface SourceTaggedEntry {
  id: string;
  source: string;
}

const DEFAULT_ACTIVE_SOURCES = ["XPHB"];

export function normalizeSourceCode(source: string): string {
  return source.trim().toUpperCase();
}

export function getActiveSourceSet(activeSources: readonly string[] | undefined): ReadonlySet<string> {
  const sources = activeSources?.length ? activeSources : DEFAULT_ACTIVE_SOURCES;

  return new Set(sources.map(normalizeSourceCode));
}

export function isSourceActive(
  source: string | undefined,
  activeSources: readonly string[] | undefined,
): boolean {
  if (!source) {
    return true;
  }

  return getActiveSourceSet(activeSources).has(normalizeSourceCode(source));
}

export function filterByActiveSources<T extends SourceTaggedEntry>(
  entries: readonly T[],
  activeSources: readonly string[] | undefined,
  preservedIds: readonly string[] = [],
): T[] {
  const activeSourceSet = getActiveSourceSet(activeSources);
  const preservedIdSet = new Set(preservedIds.filter(Boolean));

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

  return entries.filter((entry) => !activeSourceSet.has(normalizeSourceCode(entry.source)));
}
