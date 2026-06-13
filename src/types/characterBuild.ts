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

export const CHARACTER_BUILD_SCHEMA_VERSION = 1;

export type AttributeGenerationMethod = "standard-array" | "point-buy" | "manual";
export type EquipmentAcquisitionMode = "items" | "gold";
export type SkillTrainingLevel = "none" | "half" | "proficient" | "expertise";

export interface CharacterBuildDraft {
  currentStepSlug: BuilderStepSlug;
  maxUnlockedStepIndex: number;
  pendingChoiceIds: string[];
  selectedEquipmentIds: string[];
  equipmentAcquisitionMode: EquipmentAcquisitionMode;
  description: CharacterDescription;
}

export interface CharacterBuildLevelChoiceState {
  classFeatureChoices: Record<string, string[]>;
}

export interface CharacterBuildProgression {
  level: number;
  levelChoices: Record<string, CharacterBuildLevelChoiceState>;
}

export interface CharacterBuildChoices {
  ruleset: Ruleset;
  selectedSpeciesId: string;
  selectedClassId: string;
  selectedBackgroundId: string;
  classSkillProficiencies: string[];
  skillTraining: Record<string, SkillTrainingLevel>;
  classFeatureChoices: Record<string, string[]>;
  speciesChoices: Record<string, string>;
  speciesLanguages: string[];
  attributeGenerationMethod: AttributeGenerationMethod;
  baseAttributes: CharacterAttributes;
  backgroundAbilityBonuses: AttributeBonuses;
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
