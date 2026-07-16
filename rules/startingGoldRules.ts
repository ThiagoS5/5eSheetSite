import {
  getBuilderBackgrounds,
  getBuilderClasses,
} from "@/src/services/ruleService";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";

const BACKGROUND_KIT_OPTION_ID = "background-kit";

export function deriveStartingGoldPo(state: CharacterBuilderState): number {
  const characterClass = getBuilderClasses().find(
    (entry) => entry.id === state.selectedClassId,
  );
  const background = getBuilderBackgrounds().find(
    (entry) => entry.id === state.selectedBackgroundId,
  );
  const goldLabelBySource: Partial<Record<string, string | undefined>> = {
    class: characterClass?.startingEquipmentGold,
    background: background?.equipmentGold,
  };

  return Object.entries(state.equipmentChoicesBySource).reduce((total, [key, choice]) => {
    if (!choice) return total;
    if (choice.mode === "gold") {
      return total + parseLeadingGoldInteger(goldLabelBySource[key]);
    }
    if (choice.mode !== "items") return total;
    if (key === "class") {
      const selectedPackage = characterClass?.startingEquipmentPackages.find(
        (entry) => entry.id === choice.selectedOptionId,
      );
      return total + copperToGold(selectedPackage?.goldValue ?? 0);
    }
    if (key === "background" && choice.selectedOptionId === BACKGROUND_KIT_OPTION_ID) {
      return total + copperToGold(
        (background?.equipmentItemsA ?? []).reduce(
          (sum, item) => sum + (isGoldPackageItem(item) ? item.value ?? 0 : 0),
          0,
        ),
      );
    }
    return total;
  }, 0);
}

function parseLeadingGoldInteger(label: string | undefined): number {
  const match = label?.match(/-?\d+/);
  if (!match) return 0;
  const parsed = parseInt(match[0], 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function copperToGold(value: number): number {
  return value / 100;
}

function isGoldPackageItem(item: { id: string; label: string }): boolean {
  return item.label.toLowerCase() === "gold" || item.id.startsWith("gold");
}
