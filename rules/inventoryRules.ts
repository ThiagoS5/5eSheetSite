import { getItemCatalog } from "@/src/services/itemCatalogService";
import { getBuilderBackgrounds } from "@/src/services/ruleService";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import type {
  BuilderBackground,
  BuilderClass,
  BuilderEquipmentPackageItem,
  BuilderEquipmentOption,
} from "@/src/types/builder";

export interface CarriedEquipmentEntry {
  item: BuilderEquipmentOption;
  quantity: number;
}

export function deriveCarriedEquipment(input: {
  state: CharacterBuilderState;
  characterClass?: BuilderClass;
  background?: BuilderBackground;
}): CarriedEquipmentEntry[] {
  const background = input.background ?? getBuilderBackgrounds().find(
    (entry) => entry.id === input.state.selectedBackgroundId,
  );
  const classKitItems = getClassKitItems(input.state, input.characterClass).filter(
    (item) => !isGoldPackageItem(item),
  );
  const backgroundKitItems = getBackgroundKitItems(input.state, background).filter(
    (item) => !isGoldPackageItem(item),
  );
  const classKitItemIdSet = new Set(classKitItems.map((item) => item.id));
  const backgroundKitItemIdSet = new Set(backgroundKitItems.map((item) => item.id));
  const quantitiesById = new Map<string, number>();

  for (const entry of input.state.inventory) {
    quantitiesById.set(
      entry.itemId,
      (quantitiesById.get(entry.itemId) ?? 0) + entry.quantity,
    );
  }
  for (const entry of [...classKitItems, ...backgroundKitItems]) {
    quantitiesById.set(
      entry.id,
      (quantitiesById.get(entry.id) ?? 0) + entry.quantity,
    );
  }

  const catalogById = new Map(getItemCatalog().map((item) => [item.id, item]));

  return [...quantitiesById.entries()].map(([itemId, quantity]) => {
    const catalogItem = catalogById.get(itemId);
    const sourceType = resolveSourceType(itemId, classKitItemIdSet, backgroundKitItemIdSet);

    return {
      item: catalogItem
        ? mapCatalogItemToEquipmentOption(catalogItem, sourceType)
        : mapPackageItemToEquipmentOption(
            [...classKitItems, ...backgroundKitItems].find((entry) => entry.id === itemId),
            sourceType,
          ),
      quantity,
    };
  });
}

export function deriveSelectedEquipment(input: {
  state: CharacterBuilderState;
  carriedEquipment: CarriedEquipmentEntry[];
}): BuilderEquipmentOption[] {
  const equippedItemIds = new Set(input.state.equippedItemIds);
  return input.carriedEquipment
    .filter((entry) => equippedItemIds.has(entry.item.id))
    .map((entry) => entry.item);
}

export function deriveCarriedLoadKg(carriedEquipment: CarriedEquipmentEntry[]): number {
  const total = carriedEquipment.reduce(
    (sum, entry) => sum + (entry.item.weightKg ?? 0) * entry.quantity,
    0,
  );
  return Math.round(total * 100) / 100;
}

function mapCatalogItemToEquipmentOption(
  item: ReturnType<typeof getItemCatalog>[number],
  sourceType: BuilderEquipmentOption["sourceType"],
): BuilderEquipmentOption {
  return {
    id: item.id,
    name: item.name,
    source: item.source,
    sourceType,
    category: item.category,
    type: item.type,
    weightKg: item.weightKg,
    armorClass: item.armorClass,
    armorType: item.armorType,
    armor: item.armor,
    shieldBonus: item.shieldBonus,
    weaponCategory: item.weaponCategory,
    weaponRangeType: item.weaponRangeType,
    weaponProperties: item.weaponProperties,
    damageDice: item.damageDice,
    damageType: item.damageType,
    range: item.range,
    value: item.value,
  };
}

function mapPackageItemToEquipmentOption(
  item: BuilderEquipmentPackageItem | undefined,
  sourceType: BuilderEquipmentOption["sourceType"],
): BuilderEquipmentOption {
  const label = item?.label ?? "Unknown Item";

  return {
    id: item?.id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: label,
    source: sourceType === "class" ? "Class" : sourceType === "background" ? "Background" : "Manual",
    sourceType,
    category: "Other Gear",
    value: item?.value,
  };
}

function getClassKitItems(
  state: CharacterBuilderState,
  characterClass: BuilderClass | undefined,
): BuilderEquipmentPackageItem[] {
  const classChoice = state.equipmentChoicesBySource.class;
  if (classChoice?.mode !== "items" || !classChoice.selectedOptionId) {
    return [];
  }
  return characterClass?.startingEquipmentPackages.find(
    (entry) => entry.id === classChoice.selectedOptionId,
  )?.items ?? [];
}

function getBackgroundKitItems(
  state: CharacterBuilderState,
  background: BuilderBackground | undefined,
): BuilderEquipmentPackageItem[] {
  const backgroundChoice = state.equipmentChoicesBySource.background;
  if (backgroundChoice?.mode !== "items" || !backgroundChoice.selectedOptionId) {
    return [];
  }
  return background?.equipmentItemsA ?? [];
}

function resolveSourceType(
  itemId: string,
  classKitItemIds: Set<string>,
  backgroundKitItemIds: Set<string>,
): BuilderEquipmentOption["sourceType"] {
  if (classKitItemIds.has(itemId)) return "class";
  if (backgroundKitItemIds.has(itemId)) return "background";
  return "manual";
}

function isGoldPackageItem(item: BuilderEquipmentPackageItem): boolean {
  return item.label.toLowerCase() === "gold" || item.id.startsWith("gold");
}
