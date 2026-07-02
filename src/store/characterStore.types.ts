import type { CharacterDescription } from "@/types/builder";
import type { CharacterBuild, CoinPouch } from "@/src/types/characterBuild";
import type {
  AsiOrFeatChoice,
  AttributeGenerationMethod,
  CreationPreferences,
  EquipmentAcquisitionMode,
  EquipmentChoicesBySource,
  EquipmentSourceKey,
  HpRollChoice,
  InventoryEntry,
  SkillTrainingLevel,
} from "@/src/types/characterBuild";
import type {
  AttributeBonuses,
  CharacterAttributes,
  Ruleset,
} from "@/types/dnd";

export type {
  AsiOrFeatChoice,
  AttributeGenerationMethod,
  CreationPreferences,
  EquipmentAcquisitionMode,
  EquipmentChoicesBySource,
  EquipmentSourceKey,
  HpRollChoice,
  InventoryEntry,
  SkillTrainingLevel,
} from "@/src/types/characterBuild";

export interface FlatCharacterBuilderState {
  ruleset: Ruleset;
  level: number;
  selectedSpeciesId: string;
  selectedClassId: string;
  selectedSubclassId: string;
  selectedBackgroundId: string;
  inventory: InventoryEntry[];
  equipmentChoicesBySource: EquipmentChoicesBySource;
  maxUnlockedStepIndex: number;
  pendingChoiceIds: string[];
  classSkillProficiencies: string[];
  skillTraining: Record<string, SkillTrainingLevel>;
  classFeatureChoices: Record<string, string[]>;
  asiOrFeatByLevel: Record<string, AsiOrFeatChoice>;
  speciesChoices: Record<string, string>;
  speciesLanguages: string[];
  attributeGenerationMethod: AttributeGenerationMethod;
  baseAttributes: CharacterAttributes;
  backgroundAbilityBonuses: AttributeBonuses;
  description: CharacterDescription;
  money: CoinPouch;
  moneyTouched: boolean;
  carriedLoadKg: number;
  skillModifierOverrides: Record<string, number>;
  hpRollByLevel: Record<string, HpRollChoice>;
  creationPreferences?: CreationPreferences;
}

export interface CharacterBuilderState extends FlatCharacterBuilderState {
  characterBuild?: CharacterBuild;
}

export interface CharacterBuilderActions {
  setLevel: (level: number) => void;
  levelUp: () => void;
  selectSpecies: (speciesId: string) => void;
  selectClass: (classId: string) => void;
  selectSubclass: (subclassId: string) => void;
  selectBackground: (backgroundId: string) => void;
  addInventoryItem: (itemId: string) => void;
  setInventoryQuantity: (itemId: string, quantity: number) => void;
  removeInventoryItem: (itemId: string) => void;
  setEquipmentSourceMode: (
    source: EquipmentSourceKey,
    mode: EquipmentAcquisitionMode,
  ) => void;
  setEquipmentSourceOption: (
    source: EquipmentSourceKey,
    optionId: string,
  ) => void;
  unlockStep: (stepIndex: number) => void;
  setPendingChoiceIds: (choiceIds: string[]) => void;
  setClassSkillProficiencies: (skills: string[]) => void;
  setSkillTraining: (skill: string, level: SkillTrainingLevel) => void;
  setSkillOverride: (skill: string, value: number | null) => void;
  setClassFeatureChoice: (choiceId: string, values: string[]) => void;
  setLevelAsiOrFeat: (level: number, choice: AsiOrFeatChoice | undefined) => void;
  setLevelHpRoll: (level: number, roll: HpRollChoice | undefined) => void;
  setCreationPreferences: (prefs: CreationPreferences) => void;
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
  adjustCoin: (kind: keyof CoinPouch, delta: number) => void;
  setCoin: (kind: keyof CoinPouch, value: number) => void;
  setCarriedLoadKg: (value: number) => void;
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
