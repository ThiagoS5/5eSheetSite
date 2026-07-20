import type {
  ChoiceLimits,
  CreationPreferences,
  FoundryDnd5eProfile,
} from "@/src/types/characterBuild";
import {
  getDefaultCreationPreferences,
  isLegacyBaseOnlySourceSelection,
  normalizeActiveSourceSelection,
} from "@/src/services/sourcePreferenceService";

const STORAGE_KEY = "forge-fate-preferences:v1";
export const CURRENT_GLOBAL_PREFERENCES_VERSION = 4;

export interface GlobalPreferences {
  preferencesVersion?: number;
  creationDefaults: CreationPreferences;
  beginnerMode?: boolean;
  foundryExportProfile?: FoundryDnd5eProfile;
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
    const choiceLimits: ChoiceLimits =
      parsed.creationDefaults.choiceLimits === "flexible" ? "flexible" : "rules";
    const creationDefaults =
      parsed.preferencesVersion === undefined &&
      isLegacyBaseOnlySourceSelection(parsed.creationDefaults.activeSources)
        ? getDefaultCreationPreferences(progressionMode, choiceLimits)
        : {
            activeSources: normalizeActiveSourceSelection(
              parsed.creationDefaults.activeSources,
            ),
            progressionMode,
            choiceLimits,
          };

    return {
      preferencesVersion: CURRENT_GLOBAL_PREFERENCES_VERSION,
      creationDefaults,
      beginnerMode:
        typeof parsed?.beginnerMode === "boolean" ? parsed.beginnerMode : undefined,
      foundryExportProfile:
        parsed?.foundryExportProfile === "dnd5e-5.2" ||
        parsed?.foundryExportProfile === "dnd5e-5.3"
          ? parsed.foundryExportProfile
          : "dnd5e-5.3",
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
        choiceLimits:
          prefs.creationDefaults.choiceLimits === "flexible" ? "flexible" : "rules",
      },
      beginnerMode: prefs.beginnerMode,
      foundryExportProfile: prefs.foundryExportProfile ?? "dnd5e-5.3",
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
    foundryExportProfile: "dnd5e-5.3",
  };
}
