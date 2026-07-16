import type {
  AttributeBonuses,
  AttributeKey,
  CharacterAttributes,
  Ruleset,
} from "@/src/types/dnd";
import type { CoinPouch } from "@/src/types/characterBuild";
import type { RulesTextNode } from "@/src/types/rulesText";
import type { CharacterSpellcastingSummary } from "@/src/types/spells";

export type BuilderStepSlug =
  | "classe"
  | "recursos-classe"
  | "subclasse"
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
  blocks?: RulesTextNode[];
  grantsSubclass?: boolean;
}

export interface BuilderSubclass {
  id: string;
  name: string;
  shortName: string;
  source: string;
  features: BuilderFeature[];
}


export interface BuilderClassImage {
  src: string;
  alt: string;
  credit?: string;

  cardBackgroundSize?: string;
  cardBackgroundPosition?: string;
}

export interface BuilderClassProgressionRow {
  level: number;
  proficiencyBonus: string;
  features: string[];
  spellSlots: string[];
}

export interface BuilderSpellcastingProgression {
  casterProgression?: string;
  cantripsKnown: number[];
  knownSpells: number[];
  preparedSpells: number[];
  pactMagicSlots?: number[];
  pactMagicSlotLevels?: number[];
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
  descriptionBlocks: RulesTextNode[];
  image?: BuilderClassImage;
  size: string;
  speed: number;
  traits: BuilderFeature[];
  abilityBonuses: AttributeBonuses[];
  choiceGroups: BuilderChoiceGroup[];
  senses: SheetSense[];
  /** Fixed damage resistances plus choice-based ones (e.g. Draconic Ancestry). */
  resistances: SpeciesDamageResistance[];
  immunities: string[];
  vulnerabilities: string[];
  detail: string;
}

export type SpeciesDamageResistance = string | { chooseFrom: string[] };

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
  descriptionBlocks: RulesTextNode[];
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
  descriptionBlocks: RulesTextNode[];
  primaryAbility: string[];
  savingThrows: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  spellcastingAbility?: string;
  spellcastingProgression?: BuilderSpellcastingProgression;
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
  subclasses: BuilderSubclass[];
}

export type ItemCategory =
  | "Armor" | "Potion" | "Ring" | "Rod" | "Scroll"
  | "Staff" | "Wand" | "Weapon" | "Wondrous" | "Other Gear";

export type ArmorType = "light" | "medium" | "heavy" | "shield";
export type WeaponRangeType = "melee" | "ranged";
export type InventoryItemType =
  | "weapon"
  | "armor"
  | "shield"
  | "tool"
  | "pack"
  | "gear"
  | "consumable";

export interface InventoryArmorProfile {
  baseAC: number;
  category: Exclude<ArmorType, "shield">;
  maxDexBonus?: number;
  strengthMin?: number;
  stealthDisadvantage?: boolean;
}

export interface CatalogItem {
  id: string;
  name: string;
  source: string;
  category: ItemCategory;
  type?: InventoryItemType;
  isMagical: boolean;
  isCommon: boolean;
  isContainer: boolean;
  weightKg?: number;
  armorClass?: number;
  armorClassBonus?: number;
  armorType?: ArmorType;
  armor?: InventoryArmorProfile;
  shieldBonus?: number;
  savingThrowBonus?: number;
  weaponBonus?: number;
  resistances?: string[];
  attunementRequired?: boolean;
  weaponCategory?: string;
  weaponRangeType?: WeaponRangeType;
  weaponProperties?: string[];
  damageDice?: string;
  damageType?: string;
  range?: string;
  value?: number;
}

export interface BuilderEquipmentOption {
  id: string;
  name: string;
  source: string;
  sourceType: "class" | "background" | "manual";
  category: ItemCategory;
  type?: InventoryItemType;
  weightKg?: number;
  armorClass?: number;
  armorClassBonus?: number;
  armorType?: ArmorType;
  armor?: InventoryArmorProfile;
  shieldBonus?: number;
  savingThrowBonus?: number;
  weaponBonus?: number;
  resistances?: string[];
  attunementRequired?: boolean;
  weaponCategory?: string;
  weaponRangeType?: WeaponRangeType;
  weaponProperties?: string[];
  damageDice?: string;
  damageType?: string;
  range?: string;
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

export type FeatCategory = "origin" | "general" | "fighting-style" | "epic-boon";

export interface FeatAbilityBonus {
  fixed?: Partial<Record<AttributeKey, number>>;
  choose?: { from: AttributeKey[]; amount: number };
}

export interface FeatPrerequisite {
  level?: number;
  abilities?: Partial<Record<AttributeKey, number>>;
  feat?: string[];
}

export interface FeatChoiceRequirement {
  kind: "ability" | "skill" | "tool" | "language";
  count: number;
  options?: string[];
}

export interface FeatStructuredEffects {
  abilityBonuses?: AttributeBonuses;
  initiativeBonus?: number;
  /** 5e 2024 (ex.: Alert): soma o bônus de proficiência à iniciativa. */
  initiativeAddsProficiencyBonus?: boolean;
  speedBonusFeet?: number;
  skillProficiencies?: string[];
  toolProficiencies?: string[];
  languageProficiencies?: string[];
  choiceRequirements?: FeatChoiceRequirement[];
}

export interface BuilderFeat {
  id: string;
  name: string;
  source: string;
  category: FeatCategory;
  prerequisites: FeatPrerequisite[];
  abilityBonus?: FeatAbilityBonus;
  effects?: FeatStructuredEffects;
  repeatable: boolean;
  description: string;
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
  /** Prosa de história prévia (aba Notas → Backstory). */
  historia: string;
  /** Id de retrato da galeria local (src/data/portraits.ts); "" = sem retrato. */
  portraitId: string;
}

export interface SheetAttribute {
  key: AttributeKey;
  label: string;
  abbr: string;
  score: number;
  modifier: number;
}

export interface SheetSkill {
  name: string;
  label: string;
  attributeKey: AttributeKey;
  modifier: number;
  isProficient: boolean;
  isExpert: boolean;
  isOverridden: boolean;
}

export interface SheetSavingThrow {
  attributeKey: AttributeKey;
  label: string;
  abbr: string;
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
  source: "class" | "species" | "background" | "feat";
}

export interface SheetWeapon {
  name: string;
  attackBonus: string;
  damage: string;
  notes: string;
  abilityKey?: AttributeKey;
  isProficient?: boolean;
  damageBreakdown?: Array<{ label: string; value: string }>;
}

export interface SheetInventoryItem {
  item: BuilderEquipmentOption;
  quantity: number;
}

export interface Pendency {
  id: string;
  stepSlug: BuilderStepSlug;
  label: string;
  severity: "blocking" | "warning";
}

export interface BreakdownPart {
  label: string;
  value: number;
}

export type ArmorClassBreakdownPart = BreakdownPart;

export interface CharacterSheetSummary {

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
  armorClassBreakdown?: ArmorClassBreakdownPart[];
  selectedEquipment: BuilderEquipmentOption[];
  inventory: SheetInventoryItem[];
  selectedTraits: BuilderFeature[];
  classFeatures: BuilderFeature[];
  classSkillProficiencies: string[];
  skillTraining: Record<string, "none" | "half" | "proficient" | "expertise">;
  classFeatureChoices: Record<string, string[]>;
  speciesChoices: Record<string, string>;
  speciesLanguages: string[];
  validationMessages: string[];
  pendencies?: Pendency[];


  name: string;
  className: string;
  speciesName: string;
  backgroundName: string;
  currentHp: number;
  maxHp: number;
  maxHpBreakdown?: BreakdownPart[];
  tempHp: number;
  hitDice: string;
  initiative: number;
  speedFeet: number;
  speedMeters: number;
  xp: number;
  xpThreshold: number;
  progressionMode?: "xp" | "milestone";
  isSpellcaster: boolean;
  spellcasting?: CharacterSpellcastingSummary;
  attributes: SheetAttribute[];
  skills: SheetSkill[];
  savingThrows: SheetSavingThrow[];
  passives: { perception: number; investigation: number; insight: number };
  senses: SheetSense[];
  languages: string[];
  toolProficiencies: string[];
  resistances: string[];
  immunities: string[];
  vulnerabilities: string[];
  features: SheetFeature[];
  weapons: SheetWeapon[];
  money: CoinPouch;
  carry: { currentKg: number; maxKg: number };
}
