import {
  createSaveId,
  getStepHref,
  normalizeCharacterBuild,
} from "@/src/store/characterBuildModel";
import {
  getBuilderBackgrounds,
  getBuilderClasses,
  getBuilderSpecies,
} from "@/src/services/ruleService";
import { getPortraitById } from "@/src/data/portraits";
import type { CharacterBuild } from "@/src/types/characterBuild";
import type { Character } from "@/types/Character";

const STORAGE_KEY = "forge-fate-character-saves:v1";
export const CHARACTER_SAVES_CHANGED_EVENT = "forge-fate-character-saves:changed";

type CharacterSaveMap = Record<string, CharacterBuild>;

const memoryStorage = new Map<string, string>();
let cachedCharactersRawValue: string | null | undefined;
let cachedCharacters: readonly Character[] = [];

export function listCharactersSync(): readonly Character[] {
  const rawValue = getStorageItem(STORAGE_KEY);

  if (rawValue === cachedCharactersRawValue) {
    return cachedCharacters;
  }

  const saves = parseSaveMap(rawValue);

  cachedCharactersRawValue = rawValue;
  cachedCharacters = Object.values(saves)
    .sort(
      (first, second) =>
        Date.parse(second.exportMetadata.updatedAt) -
        Date.parse(first.exportMetadata.updatedAt),
    )
    .map(toDashboardCharacter);

  return cachedCharacters;
}

export async function listCharacters(): Promise<readonly Character[]> {
  return listCharactersSync();
}

export async function getCharacters(): Promise<readonly Character[]> {
  return listCharacters();
}

export async function getCharacter(saveId: string): Promise<CharacterBuild | null> {
  return readSaveMap()[saveId] ?? null;
}

export async function saveCharacter(character: CharacterBuild): Promise<CharacterBuild> {
  const now = new Date().toISOString();
  const normalizedCharacter = normalizeCharacterBuild({
    ...character,
    exportMetadata: {
      ...character.exportMetadata,
      updatedAt: now,
    },
  });
  const saves = readSaveMap();

  saves[normalizedCharacter.exportMetadata.saveId] = normalizedCharacter;
  writeSaveMap(saves);

  return normalizedCharacter;
}

export async function duplicateCharacter(
  saveId: string,
): Promise<CharacterBuild | null> {
  const saves = readSaveMap();
  const original = saves[saveId];

  if (!original) {
    return null;
  }

  const now = new Date().toISOString();
  const duplicate = normalizeCharacterBuild({
    ...original,
    draft: {
      ...original.draft,
      description: {
        ...original.draft.description,
        nome: createDuplicateName(original.draft.description.nome),
      },
    },
    exportMetadata: {
      schemaVersion: original.exportMetadata.schemaVersion,
      saveId: createSaveId(),
      createdAt: now,
      updatedAt: now,
    },
  });

  saves[duplicate.exportMetadata.saveId] = duplicate;
  writeSaveMap(saves);

  return duplicate;
}

export async function deleteCharacter(saveId: string): Promise<void> {
  const saves = readSaveMap();

  delete saves[saveId];
  writeSaveMap(saves);
}

function readSaveMap(): CharacterSaveMap {
  return parseSaveMap(getStorageItem(STORAGE_KEY));
}

function parseSaveMap(rawValue: string | null): CharacterSaveMap {
  if (!rawValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!isRecord(parsedValue)) {
      return {};
    }

    return Object.entries(parsedValue).reduce<CharacterSaveMap>(
      (saves, [saveId, value]) => {
        if (isRecord(value)) {
          const character = normalizeCharacterBuild(value as Partial<CharacterBuild>);

          saves[saveId] = character;
        }

        return saves;
      },
      {},
    );
  } catch {
    return {};
  }
}

function writeSaveMap(saves: CharacterSaveMap) {
  const serializedSaves = JSON.stringify(saves);

  setStorageItem(STORAGE_KEY, serializedSaves);
  cachedCharactersRawValue = serializedSaves;
  cachedCharacters = Object.values(saves)
    .sort(
      (first, second) =>
        Date.parse(second.exportMetadata.updatedAt) -
        Date.parse(first.exportMetadata.updatedAt),
    )
    .map(toDashboardCharacter);
  notifyCharacterSavesChanged();
}

function toDashboardCharacter(character: CharacterBuild): Character {
  const characterClass = getBuilderClasses().find(
    (entry) => entry.id === character.choices.selectedClassId,
  );
  const species = getBuilderSpecies().find(
    (entry) => entry.id === character.choices.selectedSpeciesId,
  );
  const background = getBuilderBackgrounds().find(
    (entry) => entry.id === character.choices.selectedBackgroundId,
  );
  const sheet = character.derivedSheet;

  return {
    id: character.exportMetadata.saveId,
    nome: character.draft.description.nome || "Unnamed Character",
    classe: sheet.className || characterClass?.name || "Class pending",
    species: sheet.speciesName || species?.name || "Species pending",
    background: sheet.backgroundName || background?.name || "Background pending",
    level: character.progression.level,
    hitPoints: sheet.maxHp || sheet.hitPoints,
    armorClass: sheet.armorClass,
    updatedAt: character.exportMetadata.updatedAt,
    validationMessages: sheet.validationMessages,
    pendencies: sheet.pendencies,
    currentStepHref: getStepHref(character.draft.currentStepSlug),
    atributos: character.derivedSheet.finalAttributes,
    portraitUrl: getPortraitById(character.draft.description.portraitId)?.src,
  };
}

function createDuplicateName(name: string): string {
  return `${name || "Unnamed Character"} (Copy)`;
}

function getStorageItem(key: string): string | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage.getItem(key);
  }

  return memoryStorage.get(key) ?? null;
}

function setStorageItem(key: string, value: string) {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(key, value);
    return;
  }

  memoryStorage.set(key, value);
}

function notifyCharacterSavesChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHARACTER_SAVES_CHANGED_EVENT));
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
