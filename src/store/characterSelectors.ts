import {
  getBuilderBackgrounds,
  getBuilderClasses,
  getBuilderSpecies,
} from "@/src/services/ruleService";
import { getItemCatalog } from "@/src/services/itemCatalogService";
import { validateBuilderStep } from "@/rules/builderValidation";
import {
  calculateArmorClass,
  calculateFinalAttributes,
  calculateMaxHitPoints,
  getAbilityModifier,
  getProficiencyBonus,
} from "@/src/adapters/characterDerivedAdapter";
import {
  collectAsiBonuses,
  getActiveSubclassFeatures,
  getUnresolvedLevelChoices,
} from "@/src/store/levelChoiceResolver";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import type {
  BuilderStepSlug,
  CharacterSheetSummary,
  SheetAttribute,
  SheetFeature,
  SheetSavingThrow,
  SheetSkill,
  SheetWeapon,
} from "@/types/builder";
import { ATTRIBUTE_LABELS } from "@/types/dnd";
import type { AttributeKey } from "@/types/dnd";

const ATTRIBUTE_KEYS: AttributeKey[] = [
  "forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma",
];

const ATTRIBUTE_ABBR: Record<AttributeKey, string> = {
  forca: "FOR", destreza: "DES", constituicao: "CON",
  inteligencia: "INT", sabedoria: "SAB", carisma: "CAR",
};

const SKILL_DISPLAY: Record<string, string> = {
  "Acrobatics": "Acrobacia", "Animal Handling": "Trato c/ Animais",
  "Arcana": "Arcanismo", "Athletics": "Atletismo", "Deception": "Enganação",
  "History": "História", "Insight": "Intuição", "Intimidation": "Intimidação",
  "Investigation": "Investigação", "Medicine": "Medicina", "Nature": "Natureza",
  "Perception": "Percepção", "Performance": "Atuação", "Persuasion": "Persuasão",
  "Religion": "Religião", "Sleight of Hand": "Prestidigitação",
  "Stealth": "Furtividade", "Survival": "Sobrevivência",
};

const SKILL_ATTRIBUTE: Record<string, AttributeKey> = {
  "Athletics": "forca",
  "Acrobatics": "destreza", "Sleight of Hand": "destreza", "Stealth": "destreza",
  "Arcana": "inteligencia", "History": "inteligencia", "Investigation": "inteligencia",
  "Nature": "inteligencia", "Religion": "inteligencia",
  "Animal Handling": "sabedoria", "Insight": "sabedoria", "Medicine": "sabedoria",
  "Perception": "sabedoria", "Survival": "sabedoria",
  "Deception": "carisma", "Intimidation": "carisma", "Performance": "carisma",
  "Persuasion": "carisma",
};

const ALL_SKILLS = Object.keys(SKILL_DISPLAY);

// Standard 5e XP-by-level table (XP required to reach each level).
const XP_BY_LEVEL: number[] = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
];

function xpForLevel(level: number): number {
  const index = Math.min(Math.max(level, 1), XP_BY_LEVEL.length) - 1;
  return XP_BY_LEVEL[index];
}

function xpThresholdForNextLevel(level: number): number {
  const index = Math.min(Math.max(level, 1), XP_BY_LEVEL.length - 1);
  return XP_BY_LEVEL[index];
}

// D&D PT-BR usa 1 pé ≈ 0,3 m (30 ft → 9 m).
function feetToMeters(feet: number): number {
  return Math.round(feet * 0.3);
}

function computeSkills(
  finalAttributes: Record<AttributeKey, number>,
  classSkillProficiencies: string[],
  skillTraining: Record<string, string>,
  profBonus: number,
): SheetSkill[] {
  const profSet = new Set(classSkillProficiencies);
  return ALL_SKILLS.map((name) => {
    const attrKey = SKILL_ATTRIBUTE[name] ?? "inteligencia";
    const attrScore = finalAttributes[attrKey];
    const baseMod = getAbilityModifier(attrScore);
    const training = skillTraining[name] ?? (profSet.has(name) ? "proficient" : "none");
    const isProficient = training === "proficient" || training === "expertise";
    const isExpert = training === "expertise";
    const profMod = isExpert ? profBonus * 2 : isProficient ? profBonus : 0;
    const halfMod = training === "half" ? Math.floor(profBonus / 2) : 0;
    return {
      name,
      label: SKILL_DISPLAY[name] ?? name,
      attributeKey: attrKey,
      modifier: baseMod + profMod + halfMod,
      isProficient,
      isExpert,
    };
  });
}

export function selectCharacterSheetSummary(
  state: CharacterBuilderState,
): CharacterSheetSummary {
  const species = getBuilderSpecies().find(
    (entry) => entry.id === state.selectedSpeciesId,
  );
  const characterClass = getBuilderClasses().find(
    (entry) => entry.id === state.selectedClassId,
  );
  const background = getBuilderBackgrounds().find(
    (entry) => entry.id === state.selectedBackgroundId,
  );
  const classChoice = state.equipmentChoicesBySource.class;
  const classKitItemIds =
    classChoice?.mode === "items" && classChoice.selectedOptionId
      ? (characterClass?.startingEquipmentPackages.find(
          (entry) => entry.id === classChoice.selectedOptionId,
        )?.items ?? []).map((item) => item.id)
      : [];
  const classKitItemIdSet = new Set(classKitItemIds);
  const inventoryItemIds = state.inventory.map((entry) => entry.itemId);
  const equipmentIds = new Set([...inventoryItemIds, ...classKitItemIds]);
  const selectedEquipment = getItemCatalog()
    .filter((item) => equipmentIds.has(item.id))
    .map((item) => ({
      id: item.id,
      name: item.name,
      source: item.source,
      sourceType: classKitItemIdSet.has(item.id)
        ? ("class" as const)
        : ("manual" as const),
      armorClass: item.armorClass,
      value: item.value,
    }));
  const asiBonuses = collectAsiBonuses(state);
  const mergedBonuses = { ...state.backgroundAbilityBonuses };
  for (const [key, value] of Object.entries(asiBonuses)) {
    mergedBonuses[key as AttributeKey] =
      (mergedBonuses[key as AttributeKey] ?? 0) + (value ?? 0);
  }
  const finalAttributes = calculateFinalAttributes(state.baseAttributes, mergedBonuses);

  const profBonus = getProficiencyBonus(state.level);

  const skills = computeSkills(
    finalAttributes,
    state.classSkillProficiencies,
    state.skillTraining,
    profBonus,
  );

  const sheetAttributes: SheetAttribute[] = ATTRIBUTE_KEYS.map((key) => ({
    key,
    label: ATTRIBUTE_LABELS[key],
    abbr: ATTRIBUTE_ABBR[key],
    score: finalAttributes[key],
    modifier: getAbilityModifier(finalAttributes[key]),
  }));

  const savingThrowProfLabels = new Set(characterClass?.savingThrows ?? []);
  const savingThrows: SheetSavingThrow[] = ATTRIBUTE_KEYS.map((key) => {
    const attrLabel = ATTRIBUTE_LABELS[key];
    const isProficient = savingThrowProfLabels.has(attrLabel);
    const baseMod = getAbilityModifier(finalAttributes[key]);
    return {
      attributeKey: key,
      label: attrLabel,
      abbr: ATTRIBUTE_ABBR[key],
      modifier: baseMod + (isProficient ? profBonus : 0),
      isProficient,
    };
  });

  const findSkillMod = (name: string) =>
    skills.find((s) => s.name === name)?.modifier ?? 0;

  const weapons: SheetWeapon[] = [
    {
      name: "Ataque Desarmado",
      attackBonus: `+${getAbilityModifier(finalAttributes.forca) + profBonus}`,
      damage: `1+${getAbilityModifier(finalAttributes.forca)} Contundente`,
      notes: "Corpo-a-corpo",
    },
    ...getItemCatalog()
      .filter((item) => equipmentIds.has(item.id) && item.category === "Weapon")
      .map((item) => ({
        name: item.name,
        attackBonus: `+${profBonus}`,
        damage: "—",
        notes: item.source,
      })),
  ];

  const classFeaturesUpToLevel = (characterClass?.allFeatures ?? []).filter(
    (feature) => (feature.level ?? 1) <= state.level,
  );

  const features: SheetFeature[] = [
    ...classFeaturesUpToLevel.map((f) => ({
      name: f.name,
      description: f.description ?? "",
      source: "class" as const,
    })),
    ...(characterClass
      ? getActiveSubclassFeatures(state, characterClass).map((f) => ({
          name: f.name,
          description: f.description ?? "",
          source: "class" as const,
        }))
      : []),
    ...(species?.traits ?? []).map((f) => ({
      name: f.name,
      description: f.description ?? "",
      source: "species" as const,
    })),
    ...(background
      ? [{ name: background.originFeat, description: background.equipmentSummary, source: "background" as const }]
      : []),
  ].filter((f) => f.name);

  const maxHitPoints = calculateMaxHitPoints(
    characterClass?.hitDie ?? 6,
    finalAttributes.constituicao,
    state.level,
  );

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
    proficiencyBonus: profBonus,
    hitPoints: maxHitPoints,
    armorClass: calculateArmorClass(finalAttributes.destreza, selectedEquipment),
    selectedEquipment,
    selectedTraits: species?.traits ?? [],
    classFeatures: classFeaturesUpToLevel,
    classSkillProficiencies: state.classSkillProficiencies,
    skillTraining: state.skillTraining,
    classFeatureChoices: state.classFeatureChoices,
    speciesChoices: state.speciesChoices,
    speciesLanguages: state.speciesLanguages,
    validationMessages: [
      ...getAllValidationMessages(state),
      ...(characterClass
        ? getUnresolvedLevelChoices(state, characterClass).map((u) => u.label)
        : []),
    ],
    // new fields
    name: state.description.nome,
    className: characterClass?.name ?? "",
    speciesName: species?.name ?? "",
    backgroundName: background?.name ?? "",
    currentHp: maxHitPoints,
    maxHp: maxHitPoints,
    tempHp: 0,
    hitDice: `${state.level}d${characterClass?.hitDie ?? 6}`,
    initiative: getAbilityModifier(finalAttributes.destreza),
    speedFeet: species?.speed ?? 30,
    speedMeters: feetToMeters(species?.speed ?? 30),
    xp: xpForLevel(state.level),
    xpThreshold: xpThresholdForNextLevel(state.level),
    isSpellcaster: Boolean(characterClass?.spellcastingAbility),
    attributes: sheetAttributes,
    skills,
    savingThrows,
    passives: {
      perception: 10 + findSkillMod("Perception"),
      investigation: 10 + findSkillMod("Investigation"),
      insight: 10 + findSkillMod("Insight"),
    },
    senses: [],
    languages: state.speciesLanguages,
    resistances: [],
    immunities: [],
    vulnerabilities: [],
    features,
    weapons,
  };
}

function getAllValidationMessages(state: CharacterBuilderState): string[] {
  const steps: BuilderStepSlug[] = [
    "classe",
    "recursos-classe",
    "antecedente",
    "especie",
    "detalhes-especie",
    "atributos",
    "equipamento",
    "descricao",
  ];

  return steps.flatMap((step) => validateBuilderStep(step, state));
}
