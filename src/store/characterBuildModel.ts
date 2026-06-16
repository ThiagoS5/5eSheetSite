import { builderStepNavigation } from "@/src/components/templates/builderStepNavigation";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import type {
  FlatCharacterBuilderState,
  CharacterBuilderState,
} from "@/src/store/characterStore.types";
import {
  CHARACTER_BUILD_SCHEMA_VERSION,
  type CharacterBuild,
  type EquipmentAcquisitionMode,
  type EquipmentChoicesBySource,
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
    selectedBackgroundId: build.choices?.selectedBackgroundId,
    selectedEquipmentIds: build.draft?.selectedEquipmentIds,
    equipmentChoicesBySource:
      build.draft?.equipmentChoicesBySource ?? legacyEquipmentChoices(build.draft),
    maxUnlockedStepIndex: build.draft?.maxUnlockedStepIndex,
    pendingChoiceIds: build.draft?.pendingChoiceIds,
    classSkillProficiencies: build.choices?.classSkillProficiencies,
    skillTraining: build.choices?.skillTraining,
    classFeatureChoices: build.choices?.classFeatureChoices,
    speciesChoices: build.choices?.speciesChoices,
    speciesLanguages: build.choices?.speciesLanguages,
    attributeGenerationMethod: build.choices?.attributeGenerationMethod,
    baseAttributes: build.choices?.baseAttributes,
    backgroundAbilityBonuses: build.choices?.backgroundAbilityBonuses,
    description: build.draft?.description,
  };
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
    selectedBackgroundId: "",
    selectedEquipmentIds: [],
    equipmentChoicesBySource: {},
    maxUnlockedStepIndex: 0,
    pendingChoiceIds: [],
    classSkillProficiencies: [],
    skillTraining: {},
    classFeatureChoices: {},
    speciesChoices: {},
    speciesLanguages: [],
    attributeGenerationMethod: "standard-array",
    baseAttributes: { ...defaultCharacterAttributes },
    backgroundAbilityBonuses: {},
    description: { ...emptyCharacterDescription },
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
  const currentLevelChoices =
    Object.keys(normalizedState.classFeatureChoices).length > 0
      ? {
          [String(normalizedState.level)]: {
            classFeatureChoices: normalizedState.classFeatureChoices,
          },
        }
      : {};
  const levelChoices = {
    ...(previousBuild?.progression?.levelChoices ?? {}),
    ...currentLevelChoices,
  };
  const buildWithoutDerived = {
    draft: {
      currentStepSlug: metadata.currentStepSlug,
      maxUnlockedStepIndex: normalizedState.maxUnlockedStepIndex,
      pendingChoiceIds: normalizedState.pendingChoiceIds,
      selectedEquipmentIds: normalizedState.selectedEquipmentIds,
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
      selectedBackgroundId: normalizedState.selectedBackgroundId,
      classSkillProficiencies: normalizedState.classSkillProficiencies,
      skillTraining: normalizedState.skillTraining,
      classFeatureChoices: normalizedState.classFeatureChoices,
      speciesChoices: normalizedState.speciesChoices,
      speciesLanguages: normalizedState.speciesLanguages,
      attributeGenerationMethod: normalizedState.attributeGenerationMethod,
      baseAttributes: normalizedState.baseAttributes,
      backgroundAbilityBonuses: normalizedState.backgroundAbilityBonuses,
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
    selectedBackgroundId:
      state.selectedBackgroundId ?? defaults.selectedBackgroundId,
    selectedEquipmentIds:
      state.selectedEquipmentIds ?? defaults.selectedEquipmentIds,
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
  };
}
