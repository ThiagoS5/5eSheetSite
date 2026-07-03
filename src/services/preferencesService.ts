import {
  DEFAULT_CREATION_PREFERENCES,
  type CreationPreferences,
} from "@/src/types/characterBuild";

// Own, versioned storage key (master plan §26.1-B #4): components must never
// touch localStorage directly — only this service reads/writes global
// creation preference defaults.
const STORAGE_KEY = "forge-fate-preferences:v1";

export interface GlobalPreferences {
  creationDefaults: CreationPreferences;
}

const DEFAULT_GLOBAL_PREFERENCES: GlobalPreferences = {
  creationDefaults: DEFAULT_CREATION_PREFERENCES,
};

export function readGlobalPreferences(): GlobalPreferences {
  if (typeof localStorage === "undefined") {
    return DEFAULT_GLOBAL_PREFERENCES;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_GLOBAL_PREFERENCES;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<GlobalPreferences> | null;
    if (!isValidCreationPreferences(parsed?.creationDefaults)) {
      return DEFAULT_GLOBAL_PREFERENCES;
    }
    return { creationDefaults: parsed!.creationDefaults! };
  } catch {
    return DEFAULT_GLOBAL_PREFERENCES;
  }
}

export function writeGlobalPreferences(prefs: GlobalPreferences): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function isValidCreationPreferences(
  value: unknown,
): value is CreationPreferences {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<CreationPreferences>;
  return (
    Array.isArray(candidate.activeSources) &&
    candidate.activeSources.every((source) => typeof source === "string") &&
    (candidate.progressionMode === "xp" || candidate.progressionMode === "milestone")
  );
}
