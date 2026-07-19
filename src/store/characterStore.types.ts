import type { CharacterDescription } from "@/src/types/builder";
import type {
  CharacterBuild,
  CharacterBuildPlayState,
  CoinPouch,
} from "@/src/types/characterBuild";
import type { CharacterSpellcastingChoices } from "@/src/types/spells";
import type {
  AsiOrFeatChoice,
  AttributeGenerationMethod,
  CampaignLogEntry,
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
} from "@/src/types/dnd";

export type {
  AsiOrFeatChoice,
  AttributeGenerationMethod,
  CampaignLogEntry,
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
  externalLevelChoiceBaseline: number;
  selectedSpeciesId: string;
  selectedClassId: string;
  selectedSubclassId: string;
  selectedBackgroundId: string;
  inventory: InventoryEntry[];
  equippedItemIds: string[];
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
  spellcasting?: CharacterSpellcastingChoices;
  playState?: CharacterBuildPlayState;
  creationPreferences?: CreationPreferences;
  beginnerMode?: boolean;
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
  toggleEquippedItem: (itemId: string) => void;
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
  setSpellcastingChoices: (choices: CharacterSpellcastingChoices) => void;
  applyDamage: (amount: number) => void;
  heal: (amount: number) => void;
  setTempHp: (amount: number) => void;
  spendSlot: (slotLevel: number) => void;
  useResource: (
    resourceId: string,
    maxUses: number,
    recovery?: CharacterBuildPlayState["resourceRecoveries"][string],
  ) => void;
  setResourceUseCount: (
    resourceId: string,
    used: number,
    maxUses: number,
    recovery?: CharacterBuildPlayState["resourceRecoveries"][string],
  ) => void;
  shortRest: (options?: { hitDiceToSpend?: number }) => void;
  longRest: () => void;
  toggleInspiration: () => void;
  setOverride: (kind: "maxHp" | "armorClass", value: number | null) => void;
  setDeathSaves: (deathSaves: CharacterBuildPlayState["deathSaves"]) => void;
  toggleCondition: (condition: string) => void;
  addCampaignLogEntry: (entry: Omit<CampaignLogEntry, "id">) => void;
  updateCampaignLogEntry: (
    id: string,
    patch: Partial<Omit<CampaignLogEntry, "id">>,
  ) => void;
  removeCampaignLogEntry: (id: string) => void;
  setCreationPreferences: (prefs: CreationPreferences) => void;
  setBeginnerMode: (enabled: boolean) => void;
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
