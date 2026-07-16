import type {
  BuilderStepSlug,
  CharacterDescription,
  CharacterSheetSummary,
} from "@/src/types/builder";
import type {
  AttributeBonuses,
  CharacterAttributes,
  Ruleset,
} from "@/src/types/dnd";
import type { CharacterSpellcastingChoices } from "@/src/types/spells";

// v13: draft.description ganhou historia; playState ganhou campaignLog (defaulted migration).
// v14: novo step "subclasse" inserido após "recursos-classe"; maxUnlockedStepIndex de builds
//      antigos é deslocado +1 quando já passava do ponto de inserção.
export const CHARACTER_BUILD_SCHEMA_VERSION = 14;

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
  | {
      mode: "feat";
      featId: string;
      asi?: AttributeBonuses;
      skillProficiencies?: string[];
      toolProficiencies?: string[];
      languageProficiencies?: string[];
    };

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
  equippedItemIds: string[];
  equipmentChoicesBySource: EquipmentChoicesBySource;
  description: CharacterDescription;
}

export type HpRollChoice = number | "average";

export type ProgressionMode = "xp" | "milestone";

export interface CreationPreferences {
  activeSources: string[];
  progressionMode: ProgressionMode;
}

export interface CharacterBuildLevelChoiceState {
  asiOrFeat?: AsiOrFeatChoice;
  classFeatureChoices: Record<string, string[]>;
  hpRoll?: HpRollChoice;
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
  spellcasting?: CharacterSpellcastingChoices;
  creationPreferences?: CreationPreferences;
  beginnerMode: boolean;
}

export type CharacterBuildDerivedSheet = CharacterSheetSummary;

export interface CampaignLogEntry {
  id: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  body: string;
}

export interface CharacterBuildPlayState {
  currentHp: number;
  tempHp: number;
  hitDiceSpent: number;
  usedSpellSlots: Record<number, number>;
  resourceUses: Record<string, number>;
  resourceRecoveries: Record<string, "shortRest" | "longRest">;
  deathSaves: { successes: number; failures: number };
  inspiration: boolean;
  conditions: string[];
  campaignLog: CampaignLogEntry[];
  overrides: {
    maxHp?: number;
    armorClass?: number;
  };
}

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
  playState: CharacterBuildPlayState;
  derivedSheet: CharacterBuildDerivedSheet;
  exportMetadata: CharacterBuildExportMetadata;
}
