import type {
  AttributeBonuses,
  AttributeKey,
  CharacterAttributes,
  Ruleset,
} from "@/types/dnd";

export type BuilderStepSlug =
  | "classe"
  | "recursos-classe"
  | "antecedente"
  | "especie"
  | "detalhes-especie"
  | "atributos"
  | "equipamento"
  | "descricao"
  | "conclusao";

export interface BuilderFeature {
  name: string;
  description: string;
  level?: number;
  blocks?: BuilderFeatureBlock[];
  grantsSubclass?: boolean;
}

export type BuilderFeatureBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    };

export interface BuilderClassImage {
  src: string;
  alt: string;
  credit?: string;
}

export interface BuilderClassProgressionRow {
  level: number;
  proficiencyBonus: string;
  features: string[];
  spellSlots: string[];
}

export interface BuilderChoiceOption {
  label: string;
  value: string;
  description?: string;
}

export interface BuilderChoiceGroup {
  id: string;
  label: string;
  required: boolean;
  options: BuilderChoiceOption[];
}

export interface BuilderClassFeatureChoiceGroup {
  id: string;
  featureName: string;
  label: string;
  description: string;
  count: number;
  options: BuilderChoiceOption[];
}

export interface BuilderSpecies {
  id: string;
  name: string;
  source: string;
  ruleset: Ruleset;
  summary: string;
  description: string;
  descriptionBlocks: BuilderFeatureBlock[];
  image?: BuilderClassImage;
  size: string;
  speed: number;
  traits: BuilderFeature[];
  abilityBonuses: AttributeBonuses[];
  choiceGroups: BuilderChoiceGroup[];
  detail: string;
}

export interface BuilderAbilityOption {
  mode: "+2/+1" | "+1/+1/+1";
  attributes: AttributeKey[];
}

export interface BuilderBackground {
  id: string;
  name: string;
  source: string;
  ruleset: Ruleset;
  summary: string;
  description: string;
  descriptionBlocks: BuilderFeatureBlock[];
  image?: BuilderClassImage;
  abilityOptions: BuilderAbilityOption[];
  originFeat: string;
  skillProficiencies: string[];
  toolProficiencies: string[];
  languageChoiceCount: number;
  equipmentSummary: string;
  equipmentGold?: string;
  equipmentItemsA?: BuilderEquipmentPackageItem[];
  rewardSummary: string[];
  detail: string;
}

export interface BuilderEquipmentPackageItem {
  id: string;
  label: string;
  quantity: number;
  value?: number;
}

export interface BuilderEquipmentPackage {
  id: string;
  label: string;
  items: BuilderEquipmentPackageItem[];
  goldValue: number;
  summary: string;
}

export interface BuilderClass {
  id: string;
  name: string;
  source: string;
  ruleset: Ruleset;
  level: number;
  hitDie: number;
  summary: string;
  description: string;
  descriptionBlocks: BuilderFeatureBlock[];
  primaryAbility: string[];
  savingThrows: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  spellcastingAbility?: string;
  image?: BuilderClassImage;
  progressionRows: BuilderClassProgressionRow[];
  skillChoices: {
    chooseFrom: string[];
    count: number;
  };
  languageChoiceCount: number;
  featureChoiceGroups: BuilderClassFeatureChoiceGroup[];
  levelOneFeatures: BuilderFeature[];
  allFeatures: BuilderFeature[];
  startingEquipment: string[];
  startingEquipmentGold: string;
  startingEquipmentPackages: BuilderEquipmentPackage[];
  detail: string;
}

export type ItemCategory =
  | "Armor" | "Potion" | "Ring" | "Rod" | "Scroll"
  | "Staff" | "Wand" | "Weapon" | "Wondrous" | "Other Gear";

export interface CatalogItem {
  id: string;
  name: string;
  source: string;
  category: ItemCategory;
  isMagical: boolean;
  isCommon: boolean;
  isContainer: boolean;
  armorClass?: number;
  value?: number;
}

export interface BuilderEquipmentOption {
  id: string;
  name: string;
  source: string;
  sourceType: "class" | "background" | "manual";
  armorClass?: number;
  value?: number;
}

export interface BuilderLanguage {
  name: string;
  type: "standard" | "rare" | "exotic" | "secret" | "unknown";
  source: string;
}

export interface DataSourceAuditEntry {
  step: string;
  files: string[];
  purpose: string;
}

export interface CharacterDescription {
  nome: string;
  alinhamento: string;
  faith: string;
  lifestyle: string;
  age: string;
  height: string;
  weight: string;
  eyes: string;
  skin: string;
  hair: string;
  gender: string;
  aparencia: string;
  personalidade: string;
  tracos: string;
  notas: string;
}

export interface SheetAttribute {
  key: AttributeKey;
  label: string;   // "Força"
  abbr: string;    // "FOR"
  score: number;
  modifier: number;
}

export interface SheetSkill {
  name: string;          // "Acrobatics" (canonical key for lookups)
  label: string;         // "Acrobacia" (display, Portuguese)
  attributeKey: AttributeKey;
  modifier: number;
  isProficient: boolean;
  isExpert: boolean;
}

export interface SheetSavingThrow {
  attributeKey: AttributeKey;
  label: string;         // "Força"
  abbr: string;          // "FOR"
  modifier: number;
  isProficient: boolean;
}

export interface SheetSense {
  name: string;
  rangeFeet?: number;
}

export interface SheetFeature {
  name: string;
  description: string;
  source: "class" | "species" | "background";
}

export interface SheetWeapon {
  name: string;
  attackBonus: string;  // "+5" or "—"
  damage: string;       // "1d6+3 Cortante"
  notes: string;        // "Versátil (1d8)"
}

export interface CharacterSheetSummary {
  // — existing fields (unchanged) —
  ruleset: Ruleset;
  level: number;
  speciesId: string;
  classId: string;
  backgroundId: string;
  originFeat: string;
  baseAttributes: CharacterAttributes;
  backgroundAbilityBonuses: AttributeBonuses;
  finalAttributes: CharacterAttributes;
  proficiencyBonus: number;
  hitPoints: number;
  armorClass: number;
  selectedEquipment: BuilderEquipmentOption[];
  selectedTraits: BuilderFeature[];
  classFeatures: BuilderFeature[];
  classSkillProficiencies: string[];
  skillTraining: Record<string, "none" | "half" | "proficient" | "expertise">;
  classFeatureChoices: Record<string, string[]>;
  speciesChoices: Record<string, string>;
  speciesLanguages: string[];
  validationMessages: string[];

  // — new fields —
  name: string;
  className: string;
  speciesName: string;
  backgroundName: string;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  hitDice: string;
  initiative: number;
  speedFeet: number;
  speedMeters: number;
  xp: number;
  xpThreshold: number;
  isSpellcaster: boolean;
  attributes: SheetAttribute[];
  skills: SheetSkill[];
  savingThrows: SheetSavingThrow[];
  passives: { perception: number; investigation: number; insight: number };
  senses: SheetSense[];
  languages: string[];
  resistances: string[];
  immunities: string[];
  vulnerabilities: string[];
  features: SheetFeature[];
  weapons: SheetWeapon[];
}
