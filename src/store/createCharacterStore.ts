import { createStore } from "zustand/vanilla";
import { createJSONStorage, persist } from "zustand/middleware";
import type { StateCreator } from "zustand/vanilla";
import { saveCharacter } from "@/src/services/characterService";
import { getBuilderClasses } from "@/src/services/ruleService";
import { deriveCarriedEquipment } from "@/rules/inventoryRules";
import {
  createCharacterBuildFromLegacyState,
  createEmptyCharacterBuild,
  createStoreStateFromBuild,
  getDefaultFlatState,
  normalizeCharacterBuild,
} from "@/src/store/characterBuildModel";
import { deriveStartingGoldPo } from "@/src/store/characterSelectors";
import {
  applyDamageToPlayState,
  applyHealingToPlayState,
  applyLongRestToPlayState,
  applyShortRestToPlayState,
  createDefaultPlayState,
  setTemporaryHitPointsInPlayState,
  spendSpellSlotInPlayState,
  toggleConditionInPlayState,
} from "@/rules/restRules";
import { getSpellSlots } from "@/rules/spellcastingRules";
import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
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
  CampaignLogEntry,
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
      set((state) => resetPlayStateToMaxHp(patchCharacterState(state, { level }))),
    levelUp: () =>
      set((state) =>
        resetPlayStateToMaxHp(
          patchCharacterState(state, { level: Math.min(20, state.level + 1) }),
        ),
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
        resetPlayStateToMaxHp(
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
          spellcasting:
            state.selectedClassId === selectedClassId ? state.spellcasting : undefined,
          }),
        ),
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
        return resetPlayStateToMaxHp(
          patchCharacterState(state, { hpRollByLevel: next }),
        );
      }),
    setSpellcastingChoices: (spellcasting) =>
      set((state) => patchCharacterState(state, { spellcasting })),
    applyDamage: (amount) =>
      set((state) => {
        const summary = state.characterBuild.derivedSheet;
        return patchCharacterState(state, {
          playState: applyDamageToPlayState(getPlayState(state), {
            amount,
            maxHp: summary.maxHp,
          }),
        });
      }),
    heal: (amount) =>
      set((state) => {
        const summary = state.characterBuild.derivedSheet;
        return patchCharacterState(state, {
          playState: applyHealingToPlayState(getPlayState(state), {
            amount,
            maxHp: summary.maxHp,
          }),
        });
      }),
    setTempHp: (amount) =>
      set((state) => {
        const summary = state.characterBuild.derivedSheet;
        return patchCharacterState(state, {
          playState: setTemporaryHitPointsInPlayState(getPlayState(state), {
            amount,
            maxHp: summary.maxHp,
          }),
        });
      }),
    spendSlot: (slotLevel) =>
      set((state) => {
        const availableSlots = Object.fromEntries(
          getSpellSlots(
            getClassForState(state),
            state.level,
            {},
          ).map((slot) => [slot.level, slot.total]),
        );
        return patchCharacterState(state, {
          playState: spendSpellSlotInPlayState(getPlayState(state), {
            slotLevel,
            availableSlots,
          }),
        });
      }),
    useResource: (resourceId, maxUses, recovery = "longRest") =>
      set((state) => {
        const playState = getPlayState(state);
        const current = playState.resourceUses[resourceId] ?? 0;
        return patchCharacterState(state, {
          playState: {
            ...playState,
            resourceUses: {
              ...playState.resourceUses,
              [resourceId]: Math.min(Math.max(0, maxUses), current + 1),
            },
            resourceRecoveries: {
              ...playState.resourceRecoveries,
              [resourceId]: recovery,
            },
          },
        });
      }),
    setResourceUseCount: (resourceId, used, maxUses, recovery = "longRest") =>
      set((state) => {
        const playState = getPlayState(state);
        const nextUses = { ...playState.resourceUses };
        const nextUsed = Math.min(Math.max(0, maxUses), Math.max(0, used));
        if (nextUsed === 0) delete nextUses[resourceId];
        else nextUses[resourceId] = nextUsed;

        return patchCharacterState(state, {
          playState: {
            ...playState,
            resourceUses: nextUses,
            resourceRecoveries: {
              ...playState.resourceRecoveries,
              [resourceId]: recovery,
            },
          },
        });
      }),
    shortRest: (options) =>
      set((state) => {
        const summary = state.characterBuild.derivedSheet;
        return patchCharacterState(state, {
          playState: applyShortRestToPlayState(getPlayState(state), {
            maxHp: summary.maxHp,
            hitDieValue: getClassForState(state)?.hitDie ?? 6,
            constitutionModifier: getAbilityModifier(summary.finalAttributes.constituicao),
            hitDiceToSpend: options?.hitDiceToSpend ?? 0,
            totalHitDice: state.level,
            recoverSpellSlots:
              getClassForState(state)?.spellcastingProgression?.casterProgression === "pact",
          }),
        });
      }),
    longRest: () =>
      set((state) => {
        const summary = state.characterBuild.derivedSheet;
        return patchCharacterState(state, {
          playState: applyLongRestToPlayState(getPlayState(state), {
            maxHp: summary.maxHp,
          }),
        });
      }),
    toggleInspiration: () =>
      set((state) =>
        patchCharacterState(state, {
          playState: {
            ...getPlayState(state),
            inspiration: !getPlayState(state).inspiration,
          },
        }),
      ),
    setOverride: (kind, value) =>
      set((state) => {
        const playState = getPlayState(state);
        const overrides = { ...playState.overrides };
        if (value === null) delete overrides[kind];
        else overrides[kind] = value;
        return patchCharacterState(state, {
          playState: { ...playState, overrides },
        });
      }),
    setDeathSaves: (deathSaves) =>
      set((state) =>
        patchCharacterState(state, {
          playState: { ...getPlayState(state), deathSaves },
        }),
      ),
    toggleCondition: (condition) =>
      set((state) =>
        patchCharacterState(state, {
          playState: toggleConditionInPlayState(getPlayState(state), condition),
        }),
      ),
    addCampaignLogEntry: (entry) =>
      set((state) => {
        const playState = getPlayState(state);
        const newEntry = { id: crypto.randomUUID(), ...entry };
        return patchCharacterState(state, {
          playState: { ...playState, campaignLog: [...playState.campaignLog, newEntry] },
        });
      }),
    updateCampaignLogEntry: (id, patch) =>
      set((state) => {
        const playState = getPlayState(state);
        return patchCharacterState(state, {
          playState: {
            ...playState,
            campaignLog: playState.campaignLog.map((e) =>
              e.id === id ? { ...e, ...patch } : e,
            ),
          },
        });
      }),
    removeCampaignLogEntry: (id) =>
      set((state) =>
        patchCharacterState(state, {
          playState: {
            ...getPlayState(state),
            campaignLog: getPlayState(state).campaignLog.filter((e) => e.id !== id),
          },
        }),
      ),
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
          equippedItemIds:
            quantity <= 0
              ? state.equippedItemIds.filter((id) => id !== itemId)
              : state.equippedItemIds,
        }),
      ),
    removeInventoryItem: (itemId) =>
      set((state) =>
        patchCharacterState(state, {
          inventory: state.inventory.filter((entry) => entry.itemId !== itemId),
          equippedItemIds: state.equippedItemIds.filter((id) => id !== itemId),
        }),
      ),
    toggleEquippedItem: (itemId) =>
      set((state) => {
        const isCarried = deriveCarriedEquipment({
          state,
          characterClass: getClassForState(state),
        }).some((entry) => entry.item.id === itemId);
        if (!isCarried) {
          return patchCharacterState(state, { equippedItemIds: state.equippedItemIds });
        }
        const equipped = new Set(state.equippedItemIds);
        if (equipped.has(itemId)) {
          equipped.delete(itemId);
        } else {
          equipped.add(itemId);
        }
        return patchCharacterState(state, { equippedItemIds: [...equipped] });
      }),
    setEquipmentSourceMode: (source, mode) =>
      set((state) =>
        patchCharacterState(state, {
          equipmentChoicesBySource: {
            ...state.equipmentChoicesBySource,
            [source]: {
              mode,
              // A seleção é preservada ao alternar para "gold": as regras de
              // inventário só a consomem quando mode === "items", e assim o
              // usuário não perde a escolha ao voltar.
              selectedOptionId:
                state.equipmentChoicesBySource[source]?.selectedOptionId ?? null,
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

  return preserveUnchangedReferences(state, createStoreStateFromBuild(build));
}

/**
 * A reconstrução do build recria todas as fatias do estado plano, o que fazia
 * toda assinatura zustand disparar em qualquer mutação. Reusar as referências
 * anteriores para fatias sem mudança de valor mantém os selectors estáveis.
 * `characterBuild` fica de fora: ele sempre muda (updatedAt/derivedSheet).
 */
function preserveUnchangedReferences<T extends object>(prev: object, next: T): T {
  const result = { ...next } as Record<string, unknown>;
  const prevRecord = prev as Record<string, unknown>;
  for (const key of Object.keys(result)) {
    if (key === "characterBuild") continue;
    const prevValue = prevRecord[key];
    const nextValue = result[key];
    if (prevValue !== nextValue && isDeepEqualValue(prevValue, nextValue)) {
      result[key] = prevValue;
    }
  }
  return result as T;
}

function isDeepEqualValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => isDeepEqualValue(item, b[i]));
  }
  if (Array.isArray(a) || Array.isArray(b)) return false;
  if (isRecord(a) && isRecord(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    return (
      aKeys.length === bKeys.length &&
      aKeys.every((key) => isDeepEqualValue(a[key], b[key]))
    );
  }
  return false;
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
    equippedItemIds: [...state.equippedItemIds],
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
    spellcasting: state.spellcasting
      ? {
          cantripIds: [...state.spellcasting.cantripIds],
          knownSpellIds: [...state.spellcasting.knownSpellIds],
          preparedSpellIds: [...state.spellcasting.preparedSpellIds],
        }
      : undefined,
    playState: {
      ...getPlayState(state),
      usedSpellSlots: { ...getPlayState(state).usedSpellSlots },
      resourceUses: { ...getPlayState(state).resourceUses },
      resourceRecoveries: { ...getPlayState(state).resourceRecoveries },
      deathSaves: { ...getPlayState(state).deathSaves },
      conditions: [...getPlayState(state).conditions],
      campaignLog: [...getPlayState(state).campaignLog],
      overrides: { ...getPlayState(state).overrides },
    },
    creationPreferences: state.creationPreferences
      ? { ...state.creationPreferences }
      : undefined,
    beginnerMode: state.beginnerMode ?? false,
  };
}

function resetPlayStateToMaxHp(
  state: CharacterBuilderState & { characterBuild: CharacterBuild },
): CharacterBuilderState & { characterBuild: CharacterBuild } {
  const summary = state.characterBuild.derivedSheet;
  return patchCharacterState(state as CharacterBuilderStore, {
    playState: createDefaultPlayState(summary.maxHp),
  });
}

function getClassForState(state: Pick<FlatCharacterBuilderState, "selectedClassId">) {
  return getBuilderClasses().find((entry) => entry.id === state.selectedClassId);
}

function getPlayState(state: Pick<FlatCharacterBuilderState, "playState">) {
  return state.playState ?? createDefaultPlayState(0);
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
