import type { CharacterDescription } from "@/types/builder";
import type { CharacterBuild } from "@/src/types/characterBuild";
import type {
  AttributeGenerationMethod,
  EquipmentAcquisitionMode,
  SkillTrainingLevel,
} from "@/src/types/characterBuild";
import type {
  AttributeBonuses,
  CharacterAttributes,
  Ruleset,
} from "@/types/dnd";

export type {
  AttributeGenerationMethod,
  EquipmentAcquisitionMode,
  SkillTrainingLevel,
} from "@/src/types/characterBuild";

export interface FlatCharacterBuilderState {
  ruleset: Ruleset;
  level: number;
  selectedSpeciesId: string;
  selectedClassId: string;
  selectedBackgroundId: string;
  selectedEquipmentIds: string[];
  equipmentAcquisitionMode: EquipmentAcquisitionMode;
  maxUnlockedStepIndex: number;
  pendingChoiceIds: string[];
  classSkillProficiencies: string[];
  skillTraining: Record<string, SkillTrainingLevel>;
  classFeatureChoices: Record<string, string[]>;
  speciesChoices: Record<string, string>;
  speciesLanguages: string[];
  attributeGenerationMethod: AttributeGenerationMethod;
  baseAttributes: CharacterAttributes;
  backgroundAbilityBonuses: AttributeBonuses;
  description: CharacterDescription;
}

export interface CharacterBuilderState extends FlatCharacterBuilderState {
  characterBuild?: CharacterBuild;
}

export interface CharacterBuilderActions {
  setLevel: (level: number) => void;
  selectSpecies: (speciesId: string) => void;
  selectClass: (classId: string) => void;
  selectBackground: (backgroundId: string) => void;
  toggleEquipment: (equipmentId: string) => void;
  setEquipmentAcquisitionMode: (mode: EquipmentAcquisitionMode) => void;
  unlockStep: (stepIndex: number) => void;
  setPendingChoiceIds: (choiceIds: string[]) => void;
  setClassSkillProficiencies: (skills: string[]) => void;
  setSkillTraining: (skill: string, level: SkillTrainingLevel) => void;
  setClassFeatureChoice: (choiceId: string, values: string[]) => void;
  setSpeciesChoice: (choiceId: string, value: string) => void;
  setSpeciesLanguages: (languages: string[]) => void;
  setAttributeGenerationMethod: (method: AttributeGenerationMethod) => void;
  setBackgroundAbilityBonuses: (bonuses: AttributeBonuses) => void;
  setDescriptionField: (field: keyof CharacterDescription, value: string) => void;
  setForca: (forca: number) => void;
  setDestreza: (destreza: number) => void;
  setConstituicao: (constituicao: number) => void;
  setInteligencia: (inteligencia: number) => void;
  setSabedoria: (sabedoria: number) => void;
  setCarisma: (carisma: number) => void;
  resetStore: () => CharacterBuild;
  loadCharacterBuild: (build: CharacterBuild) => void;
  commitCurrentBuild: (
    nextStepSlug: CharacterBuild["draft"]["currentStepSlug"],
    nextStepIndex: number,
  ) => Promise<CharacterBuild>;
}

export type CharacterBuilderStore = CharacterBuilderState & {
  characterBuild: CharacterBuild;
} & CharacterBuilderActions;
