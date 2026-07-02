import { builderStepNavigation } from "@/src/components/templates/builderStepNavigation";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import type {
  FlatCharacterBuilderState,
  CharacterBuilderState,
} from "@/src/store/characterStore.types";
import {
  CHARACTER_BUILD_SCHEMA_VERSION,
  EMPTY_COIN_POUCH,
  type AsiOrFeatChoice,
  type CharacterBuild,
  type EquipmentAcquisitionMode,
  type EquipmentChoicesBySource,
  type InventoryEntry,
} from "@/src/types/characterBuild";
import type {
  BuilderStepSlug,
  CharacterDescription,
  CharacterSheetSummary,
} from "@/types/builder";
import type { CharacterAttributes } from "@/types/dnd";

export const defaultCharacterAttributes: CharacterAttributes = {
  forca: 8,
  destreza: 8,
  constituicao: 8,
  inteligencia: 8,
  sabedoria: 8,
  carisma: 8,
};

export const emptyCharacterDescription: CharacterDescription = {
  nome: "",
  alinhamento: "",
  faith: "",
  lifestyle: "",
  age: "",
  height: "",
  weight: "",
  eyes: "",
  skin: "",
  hair: "",
  gender: "",
  aparencia: "",
  personalidade: "",
  tracos: "",
  notas: "",
};

export interface CreateCharacterBuildOptions {
  now?: string;
  saveId?: string;
}

export function createEmptyCharacterBuild(
  options: CreateCharacterBuildOptions = {},
): CharacterBuild {
  const now = options.now ?? new Date().toISOString();
  const saveId = options.saveId ?? createSaveId();
  const flatState = getDefaultFlatState();
  const build = createBuildFromFlatState(flatState, {
    createdAt: now,
    currentStepSlug: "classe",
    saveId,
    updatedAt: now,
  });

  return build;
}

export function createCharacterBuildFromLegacyState(
  state: Partial<FlatCharacterBuilderState> & {
    characterBuild?: CharacterBuild;
  },
  options: CreateCharacterBuildOptions & {
    createdAt?: string;
    currentStepSlug?: BuilderStepSlug;
    updatedAt?: string;
  } = {},
): CharacterBuild {
  const previousBuild = state.characterBuild;
  const now = options.now ?? new Date().toISOString();
  const maxUnlockedStepIndex =
    state.maxUnlockedStepIndex ??
    previousBuild?.draft.maxUnlockedStepIndex ??
    getDefaultFlatState().maxUnlockedStepIndex;
  const currentStepSlug =
    options.currentStepSlug ??
    previousBuild?.draft.currentStepSlug ??
    getStepSlugByIndex(maxUnlockedStepIndex);
  const flatState = normalizeFlatState({
    ...getDefaultFlatState(),
    ...flattenCharacterBuild(previousBuild),
    ...state,
    maxUnlockedStepIndex,
  });

  return createBuildFromFlatState(
    flatState,
    {
      createdAt:
        options.createdAt ?? previousBuild?.exportMetadata.createdAt ?? now,
      currentStepSlug,
      saveId:
        options.saveId ?? previousBuild?.exportMetadata.saveId ?? createSaveId(),
      updatedAt:
        options.updatedAt ?? previousBuild?.exportMetadata.updatedAt ?? now,
    },
    previousBuild,
  );
}

export function normalizeCharacterBuild(
  build: Partial<CharacterBuild>,
): CharacterBuild {
  return createCharacterBuildFromLegacyState(
    {
      ...flattenCharacterBuild(build),
      characterBuild: build as CharacterBuild,
    },
    {
      createdAt: build.exportMetadata?.createdAt,
      currentStepSlug: build.draft?.currentStepSlug,
      saveId: build.exportMetadata?.saveId,
      updatedAt: build.exportMetadata?.updatedAt,
    },
  );
}

export function createStoreStateFromBuild(
  build: CharacterBuild,
): CharacterBuilderState & { characterBuild: CharacterBuild } {
  return {
    ...getDefaultFlatState(),
    ...flattenCharacterBuild(build),
    characterBuild: build,
  };
}

function legacyEquipmentChoices(
  draft?: Partial<CharacterBuild["draft"]>,
): EquipmentChoicesBySource | undefined {
  // Backward-compat: schema v1 stored a single global `equipmentAcquisitionMode`.
  // Map it onto the class source so an in-progress save keeps its gold/items choice.
  const legacyMode = (draft as { equipmentAcquisitionMode?: EquipmentAcquisitionMode } | undefined)
    ?.equipmentAcquisitionMode;

  if (!legacyMode) {
    return undefined;
  }

  return { class: { mode: legacyMode, selectedOptionId: null } };
}

function legacyInventory(
  draft?: Partial<CharacterBuild["draft"]>,
): InventoryEntry[] | undefined {
  const legacyIds = (draft as { selectedEquipmentIds?: string[] } | undefined)?.selectedEquipmentIds;
  return legacyIds?.map((itemId) => ({ itemId, quantity: 1 }));
}

export function flattenCharacterBuild(
  build?: Partial<CharacterBuild>,
): Partial<FlatCharacterBuilderState> {
  if (!build) {
    return {};
  }

  return {
    ruleset: build.choices?.ruleset,
    level: build.progression?.level,
    selectedSpeciesId: build.choices?.selectedSpeciesId,
    selectedClassId: build.choices?.selectedClassId,
    selectedSubclassId: build.choices?.selectedSubclassId,
    selectedBackgroundId: build.choices?.selectedBackgroundId,
    inventory: build.draft?.inventory ?? legacyInventory(build.draft),
    equipmentChoicesBySource:
      build.draft?.equipmentChoicesBySource ?? legacyEquipmentChoices(build.draft),
    maxUnlockedStepIndex: build.draft?.maxUnlockedStepIndex,
    pendingChoiceIds: build.draft?.pendingChoiceIds,
    classSkillProficiencies: build.choices?.classSkillProficiencies,
    skillTraining: build.choices?.skillTraining,
    classFeatureChoices: build.choices?.classFeatureChoices,
    asiOrFeatByLevel: extractAsiOrFeatByLevel(build.progression?.levelChoices),
    speciesChoices: build.choices?.speciesChoices,
    speciesLanguages: build.choices?.speciesLanguages,
    attributeGenerationMethod: build.choices?.attributeGenerationMethod,
    baseAttributes: build.choices?.baseAttributes,
    backgroundAbilityBonuses: build.choices?.backgroundAbilityBonuses,
    description: build.draft?.description,
    money: build.choices?.money,
    moneyTouched: build.choices?.moneyTouched,
    carriedLoadKg: build.choices?.carriedLoadKg,
    skillModifierOverrides: build.choices?.skillModifierOverrides,
  };
}

function extractAsiOrFeatByLevel(
  levelChoices: CharacterBuild["progression"]["levelChoices"] | undefined,
): Record<string, AsiOrFeatChoice> {
  const result: Record<string, AsiOrFeatChoice> = {};
  for (const [level, state] of Object.entries(levelChoices ?? {})) {
    if (state.asiOrFeat) result[level] = state.asiOrFeat;
  }
  return result;
}

export function createCharacterBuildFromFlatState(
  state: FlatCharacterBuilderState,
  previousBuild?: CharacterBuild,
): CharacterBuild {
  return createCharacterBuildFromLegacyState(
    {
      ...state,
      characterBuild: previousBuild,
    },
    {
      createdAt: previousBuild?.exportMetadata.createdAt,
      currentStepSlug: previousBuild?.draft.currentStepSlug,
      saveId: previousBuild?.exportMetadata.saveId,
      updatedAt: previousBuild?.exportMetadata.updatedAt,
    },
  );
}

export function getDefaultFlatState(): FlatCharacterBuilderState {
  return {
    ruleset: "2024",
    level: 1,
    selectedSpeciesId: "",
    selectedClassId: "",
    selectedSubclassId: "",
    selectedBackgroundId: "",
    inventory: [],
    equipmentChoicesBySource: {},
    maxUnlockedStepIndex: 0,
    pendingChoiceIds: [],
    classSkillProficiencies: [],
    skillTraining: {},
    classFeatureChoices: {},
    asiOrFeatByLevel: {},
    speciesChoices: {},
    speciesLanguages: [],
    attributeGenerationMethod: "standard-array",
    baseAttributes: { ...defaultCharacterAttributes },
    backgroundAbilityBonuses: {},
    description: { ...emptyCharacterDescription },
    money: { ...EMPTY_COIN_POUCH },
    moneyTouched: false,
    carriedLoadKg: 0,
    skillModifierOverrides: {},
  };
}

export function getStepHref(step: BuilderStepSlug): string {
  return (
    builderStepNavigation.find((entry) => entry.slug === step)?.href ??
    "/builder/classe"
  );
}

export function getStepSlugByIndex(stepIndex: number): BuilderStepSlug {
  return builderStepNavigation[stepIndex]?.slug ?? "classe";
}

export function getStepIndexBySlug(step: BuilderStepSlug): number {
  return builderStepNavigation.findIndex((entry) => entry.slug === step);
}

export function createSaveId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `save-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createBuildFromFlatState(
  state: FlatCharacterBuilderState,
  metadata: {
    createdAt: string;
    currentStepSlug: BuilderStepSlug;
    saveId: string;
    updatedAt: string;
  },
  previousBuild?: Partial<CharacterBuild>,
): CharacterBuild {
  const normalizedState = normalizeFlatState(state);
  const levelChoices: CharacterBuild["progression"]["levelChoices"] = {
    ...(previousBuild?.progression?.levelChoices ?? {}),
  };
  if (Object.keys(normalizedState.classFeatureChoices).length > 0) {
    const key = String(normalizedState.level);
    levelChoices[key] = {
      ...levelChoices[key],
      classFeatureChoices: normalizedState.classFeatureChoices,
    };
  }
  for (const [level, choice] of Object.entries(normalizedState.asiOrFeatByLevel)) {
    levelChoices[level] = {
      classFeatureChoices: levelChoices[level]?.classFeatureChoices ?? {},
      asiOrFeat: choice,
    };
  }
  const buildWithoutDerived = {
    draft: {
      currentStepSlug: metadata.currentStepSlug,
      maxUnlockedStepIndex: normalizedState.maxUnlockedStepIndex,
      pendingChoiceIds: normalizedState.pendingChoiceIds,
      inventory: normalizedState.inventory,
      equipmentChoicesBySource: normalizedState.equipmentChoicesBySource,
      description: normalizedState.description,
    },
    progression: {
      level: normalizedState.level,
      levelChoices,
    },
    choices: {
      ruleset: normalizedState.ruleset,
      selectedSpeciesId: normalizedState.selectedSpeciesId,
      selectedClassId: normalizedState.selectedClassId,
      selectedSubclassId: normalizedState.selectedSubclassId,
      selectedBackgroundId: normalizedState.selectedBackgroundId,
      classSkillProficiencies: normalizedState.classSkillProficiencies,
      skillTraining: normalizedState.skillTraining,
      classFeatureChoices: normalizedState.classFeatureChoices,
      speciesChoices: normalizedState.speciesChoices,
      speciesLanguages: normalizedState.speciesLanguages,
      attributeGenerationMethod: normalizedState.attributeGenerationMethod,
      baseAttributes: normalizedState.baseAttributes,
      backgroundAbilityBonuses: normalizedState.backgroundAbilityBonuses,
      money: normalizedState.money,
      moneyTouched: normalizedState.moneyTouched,
      carriedLoadKg: normalizedState.carriedLoadKg,
      skillModifierOverrides: normalizedState.skillModifierOverrides,
    },
    derivedSheet: createEmptyDerivedSheet(normalizedState),
    exportMetadata: {
      schemaVersion: CHARACTER_BUILD_SCHEMA_VERSION,
      saveId: metadata.saveId,
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt,
    },
  } satisfies CharacterBuild;

  return {
    ...buildWithoutDerived,
    derivedSheet: deriveSheet(buildWithoutDerived),
  };
}

function normalizeFlatState(
  state: Partial<FlatCharacterBuilderState>,
): FlatCharacterBuilderState {
  const defaults = getDefaultFlatState();

  return {
    ruleset: state.ruleset ?? defaults.ruleset,
    level: state.level ?? defaults.level,
    selectedSpeciesId: state.selectedSpeciesId ?? defaults.selectedSpeciesId,
    selectedClassId: state.selectedClassId ?? defaults.selectedClassId,
    selectedSubclassId: state.selectedSubclassId ?? defaults.selectedSubclassId,
    selectedBackgroundId:
      state.selectedBackgroundId ?? defaults.selectedBackgroundId,
    inventory: state.inventory ?? defaults.inventory,
    equipmentChoicesBySource:
      state.equipmentChoicesBySource ?? defaults.equipmentChoicesBySource,
    maxUnlockedStepIndex:
      state.maxUnlockedStepIndex ?? defaults.maxUnlockedStepIndex,
    pendingChoiceIds: state.pendingChoiceIds ?? defaults.pendingChoiceIds,
    classSkillProficiencies:
      state.classSkillProficiencies ?? defaults.classSkillProficiencies,
    skillTraining: state.skillTraining ?? defaults.skillTraining,
    classFeatureChoices:
      state.classFeatureChoices ?? defaults.classFeatureChoices,
    asiOrFeatByLevel: state.asiOrFeatByLevel ?? defaults.asiOrFeatByLevel,
    speciesChoices: state.speciesChoices ?? defaults.speciesChoices,
    speciesLanguages: state.speciesLanguages ?? defaults.speciesLanguages,
    attributeGenerationMethod:
      state.attributeGenerationMethod ?? defaults.attributeGenerationMethod,
    baseAttributes: {
      ...defaults.baseAttributes,
      ...state.baseAttributes,
    },
    backgroundAbilityBonuses:
      state.backgroundAbilityBonuses ?? defaults.backgroundAbilityBonuses,
    description: {
      ...defaults.description,
      ...state.description,
    },
    money: state.money ?? defaults.money,
    moneyTouched: state.moneyTouched ?? defaults.moneyTouched,
    carriedLoadKg: state.carriedLoadKg ?? defaults.carriedLoadKg,
    skillModifierOverrides:
      state.skillModifierOverrides ?? defaults.skillModifierOverrides,
  };
}

function deriveSheet(build: CharacterBuild): CharacterSheetSummary {
  const state = createStoreStateFromBuild(build);

  return selectCharacterSheetSummary(state);
}

function createEmptyDerivedSheet(
  state: FlatCharacterBuilderState,
): CharacterSheetSummary {
  return {
    ruleset: state.ruleset,
    level: state.level,
    speciesId: state.selectedSpeciesId,
    classId: state.selectedClassId,
    backgroundId: state.selectedBackgroundId,
    originFeat: "",
    baseAttributes: state.baseAttributes,
    backgroundAbilityBonuses: state.backgroundAbilityBonuses,
    finalAttributes: state.baseAttributes,
    proficiencyBonus: 2,
    hitPoints: 0,
    armorClass: 10,
    selectedEquipment: [],
    selectedTraits: [],
    classFeatures: [],
    classSkillProficiencies: state.classSkillProficiencies,
    skillTraining: state.skillTraining,
    classFeatureChoices: state.classFeatureChoices,
    speciesChoices: state.speciesChoices,
    speciesLanguages: state.speciesLanguages,
    validationMessages: [],
    // new fields
    name: state.description.nome,
    className: "",
    speciesName: "",
    backgroundName: "",
    currentHp: 0,
    maxHp: 0,
    tempHp: 0,
    hitDice: `${state.level}d6`,
    initiative: 0,
    speedFeet: 30,
    speedMeters: 9,
    xp: 0,
    xpThreshold: 300,
    isSpellcaster: false,
    attributes: [],
    skills: [],
    savingThrows: [],
    passives: { perception: 10, investigation: 10, insight: 10 },
    senses: [],
    languages: state.speciesLanguages,
    resistances: [],
    immunities: [],
    vulnerabilities: [],
    features: [],
    weapons: [],
    money: { ...EMPTY_COIN_POUCH },
    carry: { currentKg: 0, maxKg: 0 },
  };
}
