import { createStore } from "zustand/vanilla";
import { createJSONStorage, persist } from "zustand/middleware";
import type { StateCreator } from "zustand/vanilla";
import { saveCharacter } from "@/src/services/characterService";
import {
  createCharacterBuildFromLegacyState,
  createEmptyCharacterBuild,
  createStoreStateFromBuild,
  getDefaultFlatState,
  normalizeCharacterBuild,
} from "@/src/store/characterBuildModel";
import { deriveStartingGoldPo } from "@/src/store/characterSelectors";
import type {
  AttributeGenerationMethod,
  CharacterBuilderState,
  CharacterBuilderStore,
  FlatCharacterBuilderState,
} from "@/src/store/characterStore.types";
import {
  CHARACTER_BUILD_SCHEMA_VERSION,
  EMPTY_COIN_POUCH,
} from "@/src/types/characterBuild";
import type {
  CharacterBuild,
  CoinPouch,
  CreationPreferences,
  EquipmentChoicesBySource,
  HpRollChoice,
} from "@/src/types/characterBuild";
import type { BuilderStepSlug } from "@/types/builder";

export const initialCharacterState: CharacterBuilderState =
  createStoreStateFromBuild(createEmptyCharacterBuild());

export function createCharacterStore(
  initialState: CharacterBuilderState = initialCharacterState,
) {
  const normalizedInitialState = normalizeInitialState(initialState);

  const storeCreator: StateCreator<CharacterBuilderStore> = (set, get) => ({
    ...normalizedInitialState,
    setLevel: (level) =>
      set((state) => patchCharacterState(state, { level })),
    levelUp: () =>
      set((state) =>
        patchCharacterState(state, { level: Math.min(20, state.level + 1) }),
      ),
    selectSpecies: (selectedSpeciesId) =>
      set((state) =>
        patchCharacterState(state, {
          selectedSpeciesId,
          speciesChoices:
            state.selectedSpeciesId === selectedSpeciesId ? state.speciesChoices : {},
          speciesLanguages:
            state.selectedSpeciesId === selectedSpeciesId
              ? state.speciesLanguages
              : [],
        }),
      ),
    selectClass: (selectedClassId) =>
      set((state) =>
        patchCharacterState(state, {
          selectedClassId,
          classSkillProficiencies:
            state.selectedClassId === selectedClassId
              ? state.classSkillProficiencies
              : [],
          skillTraining:
            state.selectedClassId === selectedClassId ? state.skillTraining : {},
          classFeatureChoices:
            state.selectedClassId === selectedClassId
              ? state.classFeatureChoices
              : {},
          selectedSubclassId:
            state.selectedClassId === selectedClassId ? state.selectedSubclassId : "",
          equipmentChoicesBySource:
            state.selectedClassId === selectedClassId
              ? state.equipmentChoicesBySource
              : omitEquipmentSource(state.equipmentChoicesBySource, "class"),
        }),
      ),
    selectSubclass: (selectedSubclassId) =>
      set((state) => patchCharacterState(state, { selectedSubclassId })),
    setLevelAsiOrFeat: (level, choice) =>
      set((state) => {
        const next = { ...state.asiOrFeatByLevel };
        if (choice) {
          next[String(level)] = choice;
        } else {
          delete next[String(level)];
        }
        return patchCharacterState(state, { asiOrFeatByLevel: next });
      }),
    setLevelHpRoll: (level: number, roll: HpRollChoice | undefined) =>
      set((state) => {
        const next = { ...state.hpRollByLevel };
        if (roll === undefined) {
          delete next[String(level)];
        } else {
          next[String(level)] = roll;
        }
        return patchCharacterState(state, { hpRollByLevel: next });
      }),
    setCreationPreferences: (prefs: CreationPreferences) =>
      set((state) => patchCharacterState(state, { creationPreferences: prefs })),
    setBeginnerMode: (enabled: boolean) =>
      set((state) => patchCharacterState(state, { beginnerMode: enabled })),
    selectBackground: (selectedBackgroundId) =>
      set((state) =>
        patchCharacterState(state, {
          selectedBackgroundId,
          backgroundAbilityBonuses:
            state.selectedBackgroundId === selectedBackgroundId
              ? state.backgroundAbilityBonuses
              : {},
        }),
      ),
    addInventoryItem: (itemId) =>
      set((state) => {
        const existing = state.inventory.find((entry) => entry.itemId === itemId);
        const inventory = existing
          ? state.inventory.map((entry) =>
              entry.itemId === itemId ? { ...entry, quantity: entry.quantity + 1 } : entry,
            )
          : [...state.inventory, { itemId, quantity: 1 }];
        return patchCharacterState(state, { inventory });
      }),
    setInventoryQuantity: (itemId, quantity) =>
      set((state) =>
        patchCharacterState(state, {
          inventory:
            quantity <= 0
              ? state.inventory.filter((entry) => entry.itemId !== itemId)
              : state.inventory.map((entry) =>
                  entry.itemId === itemId ? { ...entry, quantity } : entry,
                ),
        }),
      ),
    removeInventoryItem: (itemId) =>
      set((state) =>
        patchCharacterState(state, {
          inventory: state.inventory.filter((entry) => entry.itemId !== itemId),
        }),
      ),
    setEquipmentSourceMode: (source, mode) =>
      set((state) =>
        patchCharacterState(state, {
          equipmentChoicesBySource: {
            ...state.equipmentChoicesBySource,
            [source]: {
              mode,
              selectedOptionId:
                mode === "gold"
                  ? null
                  : state.equipmentChoicesBySource[source]?.selectedOptionId ?? null,
            },
          },
        }),
      ),
    setEquipmentSourceOption: (source, optionId) =>
      set((state) =>
        patchCharacterState(state, {
          equipmentChoicesBySource: {
            ...state.equipmentChoicesBySource,
            [source]: { mode: "items", selectedOptionId: optionId },
          },
        }),
      ),
    unlockStep: (stepIndex) =>
      set((state) =>
        patchCharacterState(state, {
          maxUnlockedStepIndex: Math.max(state.maxUnlockedStepIndex, stepIndex),
        }),
      ),
    setPendingChoiceIds: (pendingChoiceIds) =>
      set((state) => patchCharacterState(state, { pendingChoiceIds })),
    setClassSkillProficiencies: (classSkillProficiencies) =>
      set((state) =>
        patchCharacterState(state, {
          classSkillProficiencies,
          skillTraining: classSkillProficiencies.reduce<
            FlatCharacterBuilderState["skillTraining"]
          >(
            (training, skill) => ({
              ...training,
              [skill]: state.skillTraining[skill] ?? "proficient",
            }),
            {},
          ),
        }),
      ),
    setSkillTraining: (skill, level) =>
      set((state) =>
        patchCharacterState(state, {
          skillTraining: {
            ...state.skillTraining,
            [skill]: level,
          },
        }),
      ),
    setSkillOverride: (skill, value) =>
      set((state) => {
        const next = { ...state.skillModifierOverrides };
        if (value === null) {
          delete next[skill];
        } else {
          next[skill] = value;
        }
        return patchCharacterState(state, { skillModifierOverrides: next });
      }),
    setClassFeatureChoice: (choiceId, values) =>
      set((state) =>
        patchCharacterState(state, {
          classFeatureChoices: {
            ...state.classFeatureChoices,
            [choiceId]: values,
          },
        }),
      ),
    setSpeciesChoice: (choiceId, value) =>
      set((state) =>
        patchCharacterState(state, {
          speciesChoices: {
            ...state.speciesChoices,
            [choiceId]: value,
          },
        }),
      ),
    setSpeciesLanguages: (speciesLanguages) =>
      set((state) => patchCharacterState(state, { speciesLanguages })),
    setAttributeGenerationMethod: (attributeGenerationMethod) =>
      set((state) =>
        patchCharacterState(state, {
          attributeGenerationMethod,
          baseAttributes: getAttributesForMethod(
            attributeGenerationMethod,
            state.baseAttributes,
          ),
        }),
      ),
    setBackgroundAbilityBonuses: (backgroundAbilityBonuses) =>
      set((state) =>
        patchCharacterState(state, { backgroundAbilityBonuses }),
      ),
    setDescriptionField: (field, value) =>
      set((state) =>
        patchCharacterState(state, {
          description: {
            ...state.description,
            [field]: value,
          },
        }),
      ),
    setForca: (forca) =>
      set((state) =>
        patchCharacterState(state, {
          baseAttributes: { ...state.baseAttributes, forca },
        }),
      ),
    setDestreza: (destreza) =>
      set((state) =>
        patchCharacterState(state, {
          baseAttributes: { ...state.baseAttributes, destreza },
        }),
      ),
    setConstituicao: (constituicao) =>
      set((state) =>
        patchCharacterState(state, {
          baseAttributes: { ...state.baseAttributes, constituicao },
        }),
      ),
    setInteligencia: (inteligencia) =>
      set((state) =>
        patchCharacterState(state, {
          baseAttributes: { ...state.baseAttributes, inteligencia },
        }),
      ),
    setSabedoria: (sabedoria) =>
      set((state) =>
        patchCharacterState(state, {
          baseAttributes: { ...state.baseAttributes, sabedoria },
        }),
      ),
    setCarisma: (carisma) =>
      set((state) =>
        patchCharacterState(state, {
          baseAttributes: { ...state.baseAttributes, carisma },
        }),
      ),
    adjustCoin: (kind, delta) =>
      set((state) => {
        const basePouch: CoinPouch = state.moneyTouched
          ? state.money
          : { ...EMPTY_COIN_POUCH, po: deriveStartingGoldPo(state) };
        const nextValue = Math.max(0, basePouch[kind] + delta);
        return patchCharacterState(state, {
          money: { ...basePouch, [kind]: nextValue },
          moneyTouched: true,
        });
      }),
    setCoin: (kind, value) =>
      set((state) => {
        const basePouch: CoinPouch = state.moneyTouched
          ? state.money
          : { ...EMPTY_COIN_POUCH, po: deriveStartingGoldPo(state) };
        const nextValue = Math.max(0, value);
        return patchCharacterState(state, {
          money: { ...basePouch, [kind]: nextValue },
          moneyTouched: true,
        });
      }),
    setCarriedLoadKg: (value) =>
      set((state) =>
        patchCharacterState(state, { carriedLoadKg: Math.max(0, value) }),
      ),
    resetStore: () => {
      const build = createEmptyCharacterBuild();

      set(createStoreStateFromBuild(build));

      return build;
    },
    loadCharacterBuild: (build) => {
      set(createStoreStateFromBuild(normalizeCharacterBuild(build)));
    },
    commitCurrentBuild: async (nextStepSlug, nextStepIndex) => {
      const currentState = get();
      const build = createCommittedBuild(currentState, nextStepSlug, nextStepIndex);
      const savedBuild = await saveCharacter(build);

      set(createStoreStateFromBuild(savedBuild));

      return savedBuild;
    },
  });

  if (typeof window === "undefined") {
    return createStore<CharacterBuilderStore>()(storeCreator);
  }

  return createStore<CharacterBuilderStore>()(
    persist(storeCreator, {
      name: "ficha-5e-builder",
      storage: createJSONStorage(() => sessionStorage),
      version: CHARACTER_BUILD_SCHEMA_VERSION,
      migrate: (persistedState) => migratePersistedState(persistedState),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...migratePersistedState(persistedState),
      }),
      partialize: (state) => ({
        characterBuild: state.characterBuild,
      }),
    }),
  );
}

export function getAttributeMethodLabel(method: AttributeGenerationMethod): string {
  if (method === "standard-array") {
    return "Standard Array";
  }

  if (method === "point-buy") {
    return "Point Buy";
  }

  if (method === "roll-4d6") {
    return "Roll 4d6 (drop lowest)";
  }

  return "Manual";
}

function patchCharacterState(
  state: CharacterBuilderStore,
  patch: Partial<FlatCharacterBuilderState>,
) {
  const flatState = {
    ...extractFlatState(state),
    ...patch,
  };
  const build = createCharacterBuildFromLegacyState(
    {
      ...flatState,
      characterBuild: state.characterBuild,
    },
    {
      createdAt: state.characterBuild.exportMetadata.createdAt,
      currentStepSlug: state.characterBuild.draft.currentStepSlug,
      saveId: state.characterBuild.exportMetadata.saveId,
      updatedAt: new Date().toISOString(),
    },
  );

  return createStoreStateFromBuild(build);
}

function omitEquipmentSource(
  choices: EquipmentChoicesBySource,
  source: keyof EquipmentChoicesBySource,
): EquipmentChoicesBySource {
  const next = { ...choices };
  delete next[source];
  return next;
}

function createCommittedBuild(
  state: CharacterBuilderStore,
  nextStepSlug: BuilderStepSlug,
  nextStepIndex: number,
): CharacterBuild {
  const maxUnlockedStepIndex = Math.max(
    state.maxUnlockedStepIndex,
    nextStepIndex,
  );

  return createCharacterBuildFromLegacyState(
    {
      ...extractFlatState(state),
      maxUnlockedStepIndex,
      characterBuild: state.characterBuild,
    },
    {
      createdAt: state.characterBuild.exportMetadata.createdAt,
      currentStepSlug: nextStepSlug,
      saveId: state.characterBuild.exportMetadata.saveId,
      updatedAt: new Date().toISOString(),
    },
  );
}

function normalizeInitialState(
  initialState: CharacterBuilderState,
): CharacterBuilderState & { characterBuild: CharacterBuild } {
  if (initialState.characterBuild) {
    return createStoreStateFromBuild(
      normalizeCharacterBuild(initialState.characterBuild),
    );
  }

  return createStoreStateFromBuild(
    createCharacterBuildFromLegacyState(initialState),
  );
}

function migratePersistedState(
  persistedState: unknown,
): CharacterBuilderState & { characterBuild: CharacterBuild } {
  const persisted = isRecord(persistedState) ? persistedState : {};
  const persistedBuild = persisted.characterBuild;

  if (isRecord(persistedBuild)) {
    return createStoreStateFromBuild(
      normalizeCharacterBuild(persistedBuild as Partial<CharacterBuild>),
    );
  }

  return createStoreStateFromBuild(
    createCharacterBuildFromLegacyState(
      persisted as Partial<FlatCharacterBuilderState>,
    ),
  );
}

function extractFlatState(state: FlatCharacterBuilderState): FlatCharacterBuilderState {
  return {
    ruleset: state.ruleset,
    level: state.level,
    selectedSpeciesId: state.selectedSpeciesId,
    selectedClassId: state.selectedClassId,
    selectedSubclassId: state.selectedSubclassId,
    selectedBackgroundId: state.selectedBackgroundId,
    inventory: state.inventory.map((entry) => ({ ...entry })),
    equipmentChoicesBySource: { ...state.equipmentChoicesBySource },
    maxUnlockedStepIndex: state.maxUnlockedStepIndex,
    pendingChoiceIds: [...state.pendingChoiceIds],
    classSkillProficiencies: [...state.classSkillProficiencies],
    skillTraining: { ...state.skillTraining },
    classFeatureChoices: { ...state.classFeatureChoices },
    asiOrFeatByLevel: { ...state.asiOrFeatByLevel },
    speciesChoices: { ...state.speciesChoices },
    speciesLanguages: [...state.speciesLanguages],
    attributeGenerationMethod: state.attributeGenerationMethod,
    baseAttributes: { ...state.baseAttributes },
    backgroundAbilityBonuses: { ...state.backgroundAbilityBonuses },
    description: { ...state.description },
    money: { ...state.money },
    moneyTouched: state.moneyTouched,
    carriedLoadKg: state.carriedLoadKg,
    skillModifierOverrides: { ...state.skillModifierOverrides },
    hpRollByLevel: { ...state.hpRollByLevel },
    creationPreferences: state.creationPreferences
      ? { ...state.creationPreferences }
      : undefined,
    beginnerMode: state.beginnerMode ?? false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getAttributesForMethod(
  method: AttributeGenerationMethod,
  currentAttributes: FlatCharacterBuilderState["baseAttributes"],
): FlatCharacterBuilderState["baseAttributes"] {
  if (method === "standard-array") {
    return {
      forca: 15,
      destreza: 14,
      constituicao: 13,
      inteligencia: 12,
      sabedoria: 10,
      carisma: 8,
    };
  }

  if (method === "point-buy") {
    return getDefaultFlatState().baseAttributes;
  }

  return currentAttributes;
}
