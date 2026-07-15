import type { EquipmentAcquisitionMode, EquipmentChoicesBySource, EquipmentSourceKey } from "@/src/store/characterStore.types";
import type { BuilderBackground, BuilderClass, BuilderSpecies } from "@/src/types/builder";

export interface EquipmentChecklistProps {
  selectedClass?: BuilderClass;
  selectedBackground?: BuilderBackground;
  selectedSpecies?: BuilderSpecies;
  choicesBySource: EquipmentChoicesBySource;
  equippedItemIds?: readonly string[];
  onToggleEquipped?: (itemId: string) => void;
  onSourceModeChange: (source: EquipmentSourceKey, mode: EquipmentAcquisitionMode) => void;
  onSourceOptionChange: (source: EquipmentSourceKey, optionId: string) => void;
}
