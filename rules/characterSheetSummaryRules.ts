import {
  getBuilderBackgrounds,
  getBuilderClasses,
  getFeats,
  getBuilderSpecies,
} from "@/src/services/ruleService";
import { getItemCatalog } from "@/src/services/itemCatalogService";
import { deriveAttacks } from "@/rules/attackRules";
import { deriveArmorClass } from "@/rules/armorClassRules";
import { deriveBuilderPendencies } from "@/rules/pendencyRules";
import { computePassives, computeSkills } from "@/rules/skillRules";
import {
  computeSavingThrows,
  normalizeSavingThrowAttributes,
} from "@/rules/savingThrowRules";
import {
  calculateFinalAttributes,
  getAbilityModifier,
  getProficiencyBonus,
} from "@/src/adapters/characterDerivedAdapter";
import {
  calculateMaxHitPointsWithRolls,
  getHitPointsBreakdown,
} from "@/rules/hitPointRules";
import {
  collectAsiBonuses,
  getActiveSubclassFeatures,
} from "@/src/store/levelChoiceResolver";
import { applyFeatEffects, type AppliedFeatEffects } from "@/src/adapters/featCatalog";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import { EMPTY_COIN_POUCH } from "@/src/types/characterBuild";
import type {
  BuilderFeature,
  CharacterSheetSummary,
  SheetAttribute,
  SheetFeature,
} from "@/types/builder";
import { ATTRIBUTE_LABELS } from "@/types/dnd";
import type { AttributeKey } from "@/types/dnd";

const ATTRIBUTE_KEYS: AttributeKey[] = [
  "forca",
  "destreza",
  "constituicao",
  "inteligencia",
  "sabedoria",
  "carisma",
];

const ATTRIBUTE_ABBR: Record<AttributeKey, string> = {
  forca: "FOR",
  destreza: "DES",
  constituicao: "CON",
  inteligencia: "INT",
  sabedoria: "SAB",
  carisma: "CAR",
};

const XP_BY_LEVEL = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
];

export function deriveStartingGoldPo(state: CharacterBuilderState): number {
  const characterClass = getBuilderClasses().find(
    (entry) => entry.id === state.selectedClassId,
  );
  const background = getBuilderBackgrounds().find(
    (entry) => entry.id === state.selectedBackgroundId,
  );
  const goldLabelBySource: Partial<Record<string, string | undefined>> = {
    class: characterClass?.startingEquipmentGold,
    background: background?.equipmentGold,
  };

  return Object.entries(state.equipmentChoicesBySource).reduce((total, [key, choice]) => {
    if (choice?.mode !== "gold") return total;
    return total + parseLeadingGoldInteger(goldLabelBySource[key]);
  }, 0);
}

export function selectCharacterSheetSummary(
  state: CharacterBuilderState,
): CharacterSheetSummary {
  const species = getBuilderSpecies().find((entry) => entry.id === state.selectedSpeciesId);
  const characterClass = getBuilderClasses().find((entry) => entry.id === state.selectedClassId);
  const background = getBuilderBackgrounds().find(
    (entry) => entry.id === state.selectedBackgroundId,
  );
  const featEffects = deriveFeatEffects(state, background);
  const selectedEquipment = deriveSelectedEquipment(state, characterClass);
  const finalAttributes = deriveFinalAttributes(state, featEffects.abilityBonuses);
  const proficiencyBonus = getProficiencyBonus(state.level);
  const classAndFeatSkillProficiencies = [
    ...state.classSkillProficiencies,
    ...featEffects.skillProficiencies,
  ];
  const skills = computeSkills({
    finalAttributes,
    classSkillProficiencies: classAndFeatSkillProficiencies,
    skillTraining: state.skillTraining,
    proficiencyBonus,
    skillModifierOverrides: state.skillModifierOverrides,
  });
  const classFeaturesUpToLevel = (characterClass?.allFeatures ?? []).filter(
    (feature) => (feature.level ?? 1) <= state.level,
  );
  const maxHitPoints = calculateMaxHitPointsWithRolls({
    hitDie: characterClass?.hitDie ?? 6,
    constitutionScore: finalAttributes.constituicao,
    level: state.level,
    hpRollByLevel: state.hpRollByLevel ?? {},
  });
  const armorClassResult = deriveArmorClass({
    dexterityScore: finalAttributes.destreza,
    selectedEquipment,
  });
  const pendencies = deriveBuilderPendencies({ state, characterClass });

  return {
    ruleset: state.ruleset,
    level: state.level,
    speciesId: state.selectedSpeciesId,
    classId: state.selectedClassId,
    backgroundId: state.selectedBackgroundId,
    originFeat: background?.originFeat ?? "",
    baseAttributes: state.baseAttributes,
    backgroundAbilityBonuses: state.backgroundAbilityBonuses,
    finalAttributes,
    proficiencyBonus,
    hitPoints: maxHitPoints,
    armorClass: armorClassResult.armorClass,
    armorClassBreakdown: armorClassResult.breakdown,
    selectedEquipment,
    selectedTraits: species?.traits ?? [],
    classFeatures: classFeaturesUpToLevel,
    classSkillProficiencies: classAndFeatSkillProficiencies,
    skillTraining: state.skillTraining,
    classFeatureChoices: state.classFeatureChoices,
    speciesChoices: state.speciesChoices,
    speciesLanguages: state.speciesLanguages,
    validationMessages: pendencies.map((pendency) => pendency.label),
    pendencies,
    name: state.description.nome,
    className: characterClass?.name ?? "",
    speciesName: species?.name ?? "",
    backgroundName: background?.name ?? "",
    currentHp: maxHitPoints,
    maxHp: maxHitPoints,
    maxHpBreakdown: getHitPointsBreakdown({
      hitDie: characterClass?.hitDie ?? 6,
      constitutionScore: finalAttributes.constituicao,
      level: state.level,
      hpRollByLevel: state.hpRollByLevel ?? {},
    }),
    tempHp: 0,
    hitDice: `${state.level}d${characterClass?.hitDie ?? 6}`,
    initiative: getAbilityModifier(finalAttributes.destreza) + featEffects.initiativeBonus,
    speedFeet: (species?.speed ?? 30) + featEffects.speedBonusFeet,
    speedMeters: feetToMeters((species?.speed ?? 30) + featEffects.speedBonusFeet),
    xp: xpForLevel(state.level),
    xpThreshold: xpThresholdForNextLevel(state.level),
    progressionMode: state.creationPreferences?.progressionMode ?? "xp",
    isSpellcaster: Boolean(characterClass?.spellcastingAbility),
    attributes: deriveSheetAttributes(finalAttributes),
    skills,
    savingThrows: computeSavingThrows({
      finalAttributes,
      proficientSaveAttributes: normalizeSavingThrowAttributes(characterClass?.savingThrows),
      proficiencyBonus,
    }),
    passives: computePassives(skills),
    senses: species?.senses ?? [],
    languages: [...state.speciesLanguages, ...featEffects.languageProficiencies],
    resistances: [],
    immunities: [],
    vulnerabilities: [],
    features: deriveFeatures({ classFeaturesUpToLevel, characterClass, state, species, background }),
    weapons: deriveAttacks({
      finalAttributes,
      proficiencyBonus,
      weaponProficiencies: characterClass?.weaponProficiencies ?? [],
      weapons: selectedEquipment.filter((item) => item.category === "Weapon"),
    }),
    money: state.moneyTouched
      ? state.money
      : { ...EMPTY_COIN_POUCH, po: deriveStartingGoldPo(state) },
    carry: {
      currentKg: state.carriedLoadKg,
      maxKg: Math.round(finalAttributes.forca * 7.5),
    },
  };
}

function deriveSelectedEquipment(
  state: CharacterBuilderState,
  characterClass: ReturnType<typeof getBuilderClasses>[number] | undefined,
): CharacterSheetSummary["selectedEquipment"] {
  const classChoice = state.equipmentChoicesBySource.class;
  const classKitItemIds =
    classChoice?.mode === "items" && classChoice.selectedOptionId
      ? (characterClass?.startingEquipmentPackages.find(
          (entry) => entry.id === classChoice.selectedOptionId,
        )?.items ?? []).map((item) => item.id)
      : [];
  const classKitItemIdSet = new Set(classKitItemIds);
  const equipmentIds = new Set([
    ...state.inventory.map((entry) => entry.itemId),
    ...classKitItemIds,
  ]);

  return getItemCatalog()
    .filter((item) => equipmentIds.has(item.id))
    .map((item) => ({
      id: item.id,
      name: item.name,
      source: item.source,
      sourceType: classKitItemIdSet.has(item.id) ? "class" : "manual",
      category: item.category,
      armorClass: item.armorClass,
      armorType: item.armorType,
      weaponCategory: item.weaponCategory,
      weaponRangeType: item.weaponRangeType,
      weaponProperties: item.weaponProperties,
      damageDice: item.damageDice,
      damageType: item.damageType,
      range: item.range,
      value: item.value,
    }));
}

function deriveFinalAttributes(
  state: CharacterBuilderState,
  featAbilityBonuses: Partial<Record<AttributeKey, number>> = {},
) {
  const asiBonuses = collectAsiBonuses(state);
  const mergedBonuses = { ...state.backgroundAbilityBonuses };
  for (const [key, value] of Object.entries(asiBonuses)) {
    mergedBonuses[key as AttributeKey] =
      (mergedBonuses[key as AttributeKey] ?? 0) + (value ?? 0);
  }
  for (const [key, value] of Object.entries(featAbilityBonuses)) {
    mergedBonuses[key as AttributeKey] =
      (mergedBonuses[key as AttributeKey] ?? 0) + (value ?? 0);
  }
  return calculateFinalAttributes(state.baseAttributes, mergedBonuses);
}

function resolveOriginFeat(
  background: ReturnType<typeof getBuilderBackgrounds>[number] | undefined,
) {
  if (!background?.originFeat) return undefined;
  const feats = getFeats();
  const originName = background.originFeat;
  const baseName = originName.replace(/\s*\(.+\)\s*$/, "");
  return (
    feats.find((feat) => feat.name === originName && feat.source === "XPHB") ??
    feats.find((feat) => feat.name === baseName && feat.source === "XPHB") ??
    feats.find((feat) => feat.name === originName) ??
    feats.find((feat) => feat.name === baseName)
  );
}

function deriveFeatEffects(
  state: CharacterBuilderState,
  background: ReturnType<typeof getBuilderBackgrounds>[number] | undefined,
): AppliedFeatEffects {
  const feats = getFeats();
  let effects: AppliedFeatEffects = {
    abilityBonuses: {},
    initiativeBonus: 0,
    speedBonusFeet: 0,
    skillProficiencies: [],
    toolProficiencies: [],
    languageProficiencies: [],
  };

  const originFeat = resolveOriginFeat(background);
  if (originFeat) {
    effects = applyFeatEffects(effects, originFeat);
  }

  for (const [level, choice] of Object.entries(state.asiOrFeatByLevel)) {
    if (Number(level) > state.level || choice.mode !== "feat") continue;
    const feat = feats.find((entry) => entry.id === choice.featId);
    if (!feat) continue;
    const nonAbilityChoice = {
      ...choice,
      asi: undefined,
    };
    effects = applyFeatEffects(effects, feat, nonAbilityChoice);
  }

  return effects;
}

function deriveSheetAttributes(
  finalAttributes: Record<AttributeKey, number>,
): SheetAttribute[] {
  return ATTRIBUTE_KEYS.map((key) => ({
    key,
    label: ATTRIBUTE_LABELS[key],
    abbr: ATTRIBUTE_ABBR[key],
    score: finalAttributes[key],
    modifier: getAbilityModifier(finalAttributes[key]),
  }));
}

function deriveFeatures(input: {
  classFeaturesUpToLevel: BuilderFeature[];
  characterClass: ReturnType<typeof getBuilderClasses>[number] | undefined;
  state: CharacterBuilderState;
  species: ReturnType<typeof getBuilderSpecies>[number] | undefined;
  background: ReturnType<typeof getBuilderBackgrounds>[number] | undefined;
}): SheetFeature[] {
  return [
    ...input.classFeaturesUpToLevel.map((feature) => ({
      name: feature.name,
      description: feature.description ?? "",
      source: "class" as const,
    })),
    ...(input.characterClass
      ? getActiveSubclassFeatures(input.state, input.characterClass).map((feature) => ({
          name: feature.name,
          description: feature.description ?? "",
          source: "class" as const,
        }))
      : []),
    ...(input.species?.traits ?? []).map((feature) => ({
      name: feature.name,
      description: feature.description ?? "",
      source: "species" as const,
    })),
    ...(input.background
      ? [{
          name: input.background.originFeat,
          description: resolveOriginFeat(input.background)?.description ?? "",
          source: "background" as const,
        }]
      : []),
  ].filter((feature) => feature.name);
}

function xpForLevel(level: number): number {
  const index = Math.min(Math.max(level, 1), XP_BY_LEVEL.length) - 1;
  return XP_BY_LEVEL[index];
}

function xpThresholdForNextLevel(level: number): number {
  const index = Math.min(Math.max(level, 1), XP_BY_LEVEL.length - 1);
  return XP_BY_LEVEL[index];
}

function feetToMeters(feet: number): number {
  return Math.round(feet * 0.3);
}

function parseLeadingGoldInteger(label: string | undefined): number {
  const match = label?.match(/-?\d+/);
  if (!match) return 0;
  const parsed = parseInt(match[0], 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}
