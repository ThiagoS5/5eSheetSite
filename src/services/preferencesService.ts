import type { CreationPreferences } from "@/src/types/characterBuild";
import {
  getDefaultCreationPreferences,
  isLegacyBaseOnlySourceSelection,
  normalizeActiveSourceSelection,
} from "@/src/services/sourcePreferenceService";

const STORAGE_KEY = "forge-fate-preferences:v1";
export const CURRENT_GLOBAL_PREFERENCES_VERSION = 3;

export interface GlobalPreferences {
  preferencesVersion?: number;
  creationDefaults: CreationPreferences;
  beginnerMode?: boolean;
}

export function readGlobalPreferences(): GlobalPreferences {
  if (typeof localStorage === "undefined") {
    return getDefaultGlobalPreferences();
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return getDefaultGlobalPreferences();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<GlobalPreferences> | null;
    if (!isValidCreationPreferences(parsed?.creationDefaults)) {
      return getDefaultGlobalPreferences();
    }

    const progressionMode = parsed.creationDefaults.progressionMode;
    const creationDefaults =
      parsed.preferencesVersion === undefined &&
      isLegacyBaseOnlySourceSelection(parsed.creationDefaults.activeSources)
        ? getDefaultCreationPreferences(progressionMode)
        : {
            activeSources: normalizeActiveSourceSelection(
              parsed.creationDefaults.activeSources,
            ),
            progressionMode,
          };

    return {
      preferencesVersion: CURRENT_GLOBAL_PREFERENCES_VERSION,
      creationDefaults,
      beginnerMode:
        typeof parsed?.beginnerMode === "boolean" ? parsed.beginnerMode : undefined,
    };
  } catch {
    return getDefaultGlobalPreferences();
  }
}

export function writeGlobalPreferences(prefs: GlobalPreferences): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      preferencesVersion: CURRENT_GLOBAL_PREFERENCES_VERSION,
      creationDefaults: {
        activeSources: normalizeActiveSourceSelection(
          prefs.creationDefaults.activeSources,
        ),
        progressionMode: prefs.creationDefaults.progressionMode,
      },
      beginnerMode: prefs.beginnerMode,
    }),
  );
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

function getDefaultGlobalPreferences(): GlobalPreferences {
  return {
    preferencesVersion: CURRENT_GLOBAL_PREFERENCES_VERSION,
    creationDefaults: getDefaultCreationPreferences(),
  };
}
