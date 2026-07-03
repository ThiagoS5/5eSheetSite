import type {
  BuilderStepSlug,
  CharacterDescription,
  CharacterSheetSummary,
} from "@/types/builder";
import type {
  AttributeBonuses,
  CharacterAttributes,
  Ruleset,
} from "@/types/dnd";

export const CHARACTER_BUILD_SCHEMA_VERSION = 6;

export interface CoinPouch {
  pc: number;
  pp: number;
  pe: number;
  po: number;
  pl: number;
}

export const EMPTY_COIN_POUCH: CoinPouch = { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 };

export type AsiOrFeatChoice =
  | { mode: "asi"; increases: AttributeBonuses }
  | { mode: "feat"; featId: string; asi?: AttributeBonuses };

export type AttributeGenerationMethod =
  | "standard-array"
  | "point-buy"
  | "manual"
  | "roll-4d6";
export type EquipmentAcquisitionMode = "items" | "gold";
export type SkillTrainingLevel = "none" | "half" | "proficient" | "expertise";

export interface InventoryEntry { itemId: string; quantity: number; }

export type EquipmentSourceKey = "class" | "background" | "species";

export interface EquipmentSourceChoice {
  mode: EquipmentAcquisitionMode;
  selectedOptionId: string | null;
}

export type EquipmentChoicesBySource = Partial<
  Record<EquipmentSourceKey, EquipmentSourceChoice>
>;

export interface CharacterBuildDraft {
  currentStepSlug: BuilderStepSlug;
  maxUnlockedStepIndex: number;
  pendingChoiceIds: string[];
  inventory: InventoryEntry[];
  equipmentChoicesBySource: EquipmentChoicesBySource;
  description: CharacterDescription;
}

export type HpRollChoice = number | "average";

export type ProgressionMode = "xp" | "milestone";

export interface CreationPreferences {
  activeSources: string[]; // ex.: ["XPHB"] — default
  progressionMode: ProgressionMode; // default "xp"
}

export const DEFAULT_CREATION_PREFERENCES: CreationPreferences = {
  activeSources: ["XPHB"],
  progressionMode: "xp",
};

export interface CharacterBuildLevelChoiceState {
  asiOrFeat?: AsiOrFeatChoice;
  classFeatureChoices: Record<string, string[]>;
  hpRoll?: HpRollChoice; // NOVO v6 — PV ganho no nível (2..20)
}

export interface CharacterBuildProgression {
  level: number;
  levelChoices: Record<string, CharacterBuildLevelChoiceState>;
}

export interface CharacterBuildChoices {
  ruleset: Ruleset;
  selectedSpeciesId: string;
  selectedClassId: string;
  selectedSubclassId: string;
  selectedBackgroundId: string;
  classSkillProficiencies: string[];
  skillTraining: Record<string, SkillTrainingLevel>;
  classFeatureChoices: Record<string, string[]>;
  speciesChoices: Record<string, string>;
  speciesLanguages: string[];
  attributeGenerationMethod: AttributeGenerationMethod;
  baseAttributes: CharacterAttributes;
  backgroundAbilityBonuses: AttributeBonuses;
  money: CoinPouch;
  moneyTouched: boolean;
  carriedLoadKg: number;
  skillModifierOverrides: Record<string, number>;
  creationPreferences?: CreationPreferences; // NOVO v6 — ausente = defaults
}

export type CharacterBuildDerivedSheet = CharacterSheetSummary;

export interface CharacterBuildExportMetadata {
  schemaVersion: typeof CHARACTER_BUILD_SCHEMA_VERSION;
  saveId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterBuild {
  draft: CharacterBuildDraft;
  progression: CharacterBuildProgression;
  choices: CharacterBuildChoices;
  derivedSheet: CharacterBuildDerivedSheet;
  exportMetadata: CharacterBuildExportMetadata;
}
