import { toSlug } from "@/src/adapters/fiveEToolsAdapter";
import type {
  ArmorType,
  CatalogItem,
  InventoryArmorProfile,
  InventoryItemType,
  ItemCategory,
} from "@/src/types/builder";
import type { Raw5eItem } from "@/src/types/fiveETools";

const TYPE_TO_CATEGORY: Record<string, ItemCategory> = {
  M: "Weapon", R: "Weapon",
  LA: "Armor", MA: "Armor", HA: "Armor", S: "Armor",
  P: "Potion", RG: "Ring", RD: "Rod", SC: "Scroll", WD: "Wand", ST: "Staff",
};

function resolveCategory(rawItem: Raw5eItem): ItemCategory {
  const code = (rawItem.type ?? "").split("|")[0];
  if (TYPE_TO_CATEGORY[code]) {
    return TYPE_TO_CATEGORY[code];
  }
  if (rawItem.staff) {
    return "Staff";
  }
  if (rawItem.wondrous) {
    return "Wondrous";
  }
  return "Other Gear";
}

function resolveArmorType(rawItem: Raw5eItem): ArmorType | undefined {
  const code = (rawItem.type ?? "").split("|")[0];
  if (code === "LA") return "light";
  if (code === "MA") return "medium";
  if (code === "HA") return "heavy";
  if (code === "S") return "shield";
  return undefined;
}

function resolveInventoryType(rawItem: Raw5eItem): InventoryItemType {
  const code = (rawItem.type ?? "").split("|")[0];
  if (code === "M" || code === "R") return "weapon";
  if (code === "S") return "shield";
  if (code === "LA" || code === "MA" || code === "HA") return "armor";
  if (code === "P") return "consumable";
  if (code === "T" || code === "INS" || code === "AT") return "tool";
  if (code === "PACK") return "pack";
  return "gear";
}

function resolveArmorProfile(rawItem: Raw5eItem): InventoryArmorProfile | undefined {
  const armorType = resolveArmorType(rawItem);
  if (!armorType || armorType === "shield" || rawItem.ac === undefined) {
    return undefined;
  }

  return {
    baseAC: rawItem.ac,
    category: armorType,
    ...(armorType === "medium" ? { maxDexBonus: 2 } : {}),
    ...(parseStrengthMinimum(rawItem.strength) !== undefined
      ? { strengthMin: parseStrengthMinimum(rawItem.strength) }
      : {}),
    ...(rawItem.stealth ? { stealthDisadvantage: true } : {}),
  };
}

function normalizeWeaponProperties(properties: Raw5eItem["property"]): string[] {
  return (properties ?? [])
    .filter((property): property is string => typeof property === "string")
    .map((property) => property.split("|")[0]);
}

function poundsToKg(weight: number | undefined): number | undefined {
  if (typeof weight !== "number" || !Number.isFinite(weight)) {
    return undefined;
  }
  return Math.round(weight * 0.45359237 * 100) / 100;
}

function parseStrengthMinimum(value: Raw5eItem["strength"]): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  const match = value.match(/\d+/);
  if (!match) {
    return undefined;
  }
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseSignedBonus(value: string | number | undefined): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  const match = value.match(/[+-]?\d+/);
  if (!match) {
    return undefined;
  }
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeDamageModifiers(values: unknown[] | undefined): string[] {
  return (values ?? [])
    .flatMap((value) => {
      if (typeof value === "string") {
        return value;
      }
      if (typeof value === "object" && value !== null && "resist" in value) {
        const nested = (value as { resist?: unknown }).resist;
        return Array.isArray(nested) ? normalizeDamageModifiers(nested) : [];
      }
      return [];
    })
    .map((value) => value.trim())
    .filter(Boolean);
}

export function normalizeCatalogItem(rawItem: Raw5eItem): CatalogItem {
  const rarity = rawItem.rarity;
  const code = (rawItem.type ?? "").split("|")[0];

  return {
    id: toSlug(rawItem.name, rawItem.source),
    name: rawItem.name,
    source: rawItem.source,
    category: resolveCategory(rawItem),
    type: resolveInventoryType(rawItem),
    isMagical: Boolean(rarity) && rarity !== "none",
    isCommon: rarity === "common",
    isContainer: rawItem.containerCapacity != null,
    weightKg: poundsToKg(rawItem.weight),
    armorClass: rawItem.ac,
    armorClassBonus: parseSignedBonus(rawItem.bonusAc),
    armorType: resolveArmorType(rawItem),
    armor: resolveArmorProfile(rawItem),
    shieldBonus: resolveArmorType(rawItem) === "shield" ? rawItem.ac : undefined,
    savingThrowBonus: parseSignedBonus(rawItem.bonusSavingThrow),
    weaponBonus: parseSignedBonus(rawItem.bonusWeapon),
    resistances: normalizeDamageModifiers(rawItem.resist),
    attunementRequired: rawItem.reqAttune !== undefined,
    weaponCategory: rawItem.weaponCategory,
    weaponRangeType: code === "R" ? "ranged" : code === "M" ? "melee" : undefined,
    weaponProperties: normalizeWeaponProperties(rawItem.property),
    damageDice: rawItem.dmg1,
    damageType: rawItem.dmgType,
    range: rawItem.range,
    value: rawItem.value,
  };
}
