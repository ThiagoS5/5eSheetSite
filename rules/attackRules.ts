import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import type {
  BuilderEquipmentOption,
  SheetWeapon,
  WeaponRangeType,
} from "@/types/builder";
import type { AttributeKey, CharacterAttributes } from "@/types/dnd";

type AttackWeapon = Pick<
  BuilderEquipmentOption,
  | "id"
  | "name"
  | "source"
  | "category"
  | "weaponCategory"
  | "weaponRangeType"
  | "weaponProperties"
  | "damageDice"
  | "damageType"
  | "range"
>;

const DAMAGE_TYPE_LABELS: Record<string, string> = {
  B: "Bludgeoning",
  P: "Piercing",
  S: "Slashing",
};

const PROPERTY_LABELS: Record<string, string> = {
  A: "Ammunition",
  F: "Finesse",
  H: "Heavy",
  L: "Light",
  T: "Thrown",
  V: "Versatile",
  "2H": "Two-Handed",
};

export function deriveAttacks(input: {
  finalAttributes: CharacterAttributes;
  proficiencyBonus: number;
  weaponProficiencies: string[];
  weapons: AttackWeapon[];
}): SheetWeapon[] {
  const unarmed = deriveUnarmedAttack(input.finalAttributes, input.proficiencyBonus);
  const weaponAttacks = input.weapons
    .filter((weapon) => weapon.category === "Weapon")
    .map((weapon) => deriveWeaponAttack(weapon, input));

  return [unarmed, ...weaponAttacks];
}

function deriveUnarmedAttack(
  finalAttributes: CharacterAttributes,
  proficiencyBonus: number,
): SheetWeapon {
  const strengthModifier = getAbilityModifier(finalAttributes.forca);

  return {
    name: "Unarmed Strike",
    attackBonus: formatSigned(strengthModifier + proficiencyBonus),
    damage: `1${formatSigned(strengthModifier)} Bludgeoning`,
    notes: "STR, proficient, Melee",
    abilityKey: "forca",
    isProficient: true,
    damageBreakdown: [
      { label: "Base damage", value: "1" },
      { label: "STR", value: formatSigned(strengthModifier) },
    ],
  };
}

function deriveWeaponAttack(
  weapon: AttackWeapon,
  input: {
    finalAttributes: CharacterAttributes;
    proficiencyBonus: number;
    weaponProficiencies: string[];
  },
): SheetWeapon {
  const abilityKey = chooseAttackAbility(weapon, input.finalAttributes);
  const abilityModifier = getAbilityModifier(input.finalAttributes[abilityKey]);
  const isProficient = hasWeaponProficiency(weapon, input.weaponProficiencies);
  const proficiencyModifier = isProficient ? input.proficiencyBonus : 0;
  const damageDice = weapon.damageDice ?? "1";
  const propertyNotes = (weapon.weaponProperties ?? [])
    .map((property) => PROPERTY_LABELS[property] ?? property)
    .filter(Boolean);

  return {
    name: weapon.name,
    attackBonus: formatSigned(abilityModifier + proficiencyModifier),
    damage: `${damageDice}${formatSigned(abilityModifier)} ${formatDamageType(weapon.damageType)}`,
    notes: [
      abilityLabel(abilityKey),
      isProficient ? "proficient" : "not proficient",
      ...propertyNotes,
      weapon.range ? `range ${weapon.range}` : undefined,
    ].filter((note): note is string => Boolean(note)).join(", "),
    abilityKey,
    isProficient,
    damageBreakdown: [
      { label: "Weapon die", value: damageDice },
      { label: abilityLabel(abilityKey), value: formatSigned(abilityModifier) },
    ],
  };
}

function chooseAttackAbility(
  weapon: Pick<AttackWeapon, "weaponRangeType" | "weaponProperties">,
  finalAttributes: CharacterAttributes,
): AttributeKey {
  if (weapon.weaponRangeType === "ranged") return "destreza";

  if ((weapon.weaponProperties ?? []).includes("F")) {
    return getAbilityModifier(finalAttributes.destreza) >
      getAbilityModifier(finalAttributes.forca)
      ? "destreza"
      : "forca";
  }

  return "forca";
}

function hasWeaponProficiency(
  weapon: Pick<AttackWeapon, "name" | "weaponCategory">,
  proficiencies: string[],
): boolean {
  const normalized = new Set(proficiencies.map((proficiency) => proficiency.toLowerCase()));
  const category = weapon.weaponCategory?.toLowerCase();

  return (
    normalized.has("simple") && category === "simple" ||
    normalized.has("martial") && category === "martial" ||
    normalized.has(weapon.name.toLowerCase())
  );
}

function formatDamageType(damageType: string | undefined): string {
  return damageType ? DAMAGE_TYPE_LABELS[damageType] ?? damageType : "Damage";
}

function abilityLabel(abilityKey: AttributeKey): string {
  return abilityKey === "destreza" ? "DEX" : "STR";
}

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

export type { WeaponRangeType };
