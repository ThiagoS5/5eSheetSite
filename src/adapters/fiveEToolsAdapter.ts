import type {
  BuilderAbilityOption,
  BuilderBackground,
  BuilderChoiceGroup,
  BuilderChoiceOption,
  BuilderClass,
  BuilderClassFeatureChoiceGroup,
  BuilderEquipmentOption,
  BuilderEquipmentPackage,
  BuilderEquipmentPackageItem,
  BuilderFeature,
  BuilderLanguage,
  BuilderSpecies,
  BuilderSubclass,
  SpeciesDamageResistance,
} from "@/src/types/builder";
import {
  ATTRIBUTE_ABBREVIATION_MAP,
  ATTRIBUTE_LABELS,
  type AttributeKey,
} from "@/src/types/dnd";
import { applyClassCardFraming } from "@/src/data/classCardArt";
import { astToPlainText, parseRulesText } from "@/src/adapters/rulesTextAst";
import type { RulesTextNode } from "@/src/types/rulesText";
import type {
  Raw5eBackground,
  Raw5eClass,
  Raw5eClassFluff,
  Raw5eFeature,
  Raw5eItem,
  Raw5eLanguage,
  RawPlayerLoreEntry,
  Raw5eRace,
  Raw5eStartingEquipmentItem,
  Raw5eSubclass,
  Raw5eWeightedAbilityChoice,
} from "@/src/types/fiveETools";

const SKILL_LABELS: Record<string, string> = {
  acrobatics: "Acrobatics",
  "animal handling": "Animal Handling",
  arcana: "Arcana",
  athletics: "Athletics",
  deception: "Deception",
  history: "History",
  insight: "Insight",
  intimidation: "Intimidation",
  investigation: "Investigation",
  medicine: "Medicine",
  nature: "Nature",
  perception: "Perception",
  performance: "Performance",
  persuasion: "Persuasion",
  religion: "Religion",
  "sleight of hand": "Sleight of Hand",
  stealth: "Stealth",
  survival: "Survival",
};

export function is2024Source(source: string, edition?: string): boolean {
  return source.toUpperCase() === "XPHB" || edition === "one";
}

export function toSlug(name: string, source: string): string {
  return `${name}-${source}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeSpecies(
  race: Raw5eRace,
  lore?: RawPlayerLoreEntry,
): BuilderSpecies {
  const traits = normalizeEntriesToFeatures(race.entries);
  const detail = stringifyEntries(race.entries);
  const descriptionBlocks = normalizeLoreBlocks(lore, detail);
  const description = blocksToText(descriptionBlocks) || detail || `${race.name} species details.`;

  return {
    id: toSlug(race.name, race.source),
    name: race.name,
    source: race.source,
    ruleset: "2024",
    summary: lore?.summary || normalizeSpeciesDescription(race, traits),
    description,
    descriptionBlocks,
    image: lore?.image ?? normalizeSpeciesImage(race),
    size: race.size?.join(" ou ") ?? "M",
    speed: typeof race.speed === "number" ? race.speed : (race.speed?.walk ?? 30),
    traits,
    abilityBonuses: [],
    choiceGroups: normalizeSpeciesChoiceGroups(race.entries),
    senses:
      typeof race.darkvision === "number" && race.darkvision > 0
        ? [{ name: "Darkvision", rangeFeet: race.darkvision }]
        : [],
    resistances: normalizeDamageModifiers(race.resist),
    immunities: normalizeDamageModifiers(race.immune).filter(
      (entry): entry is string => typeof entry === "string",
    ),
    vulnerabilities: normalizeDamageModifiers(race.vulnerable).filter(
      (entry): entry is string => typeof entry === "string",
    ),
    detail: detail || `${race.name} species details.`,
  };
}

function normalizeDamageModifiers(raw: unknown): SpeciesDamageResistance[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((entry): SpeciesDamageResistance[] => {
    if (typeof entry === "string") return [entry];
    if (!entry || typeof entry !== "object") return [];
    const choose = (entry as { choose?: { from?: unknown[] } }).choose;
    const from = (choose?.from ?? []).filter(
      (value): value is string => typeof value === "string",
    );
    return from.length > 0 ? [{ chooseFrom: from }] : [];
  });
}

export function normalizeBackground(
  background: Raw5eBackground,
  lore?: RawPlayerLoreEntry,
): BuilderBackground {
  const rewardSummary = normalizeBackgroundRewards(background.entries);
  const detail = stringifyEntries(background.entries);
  const descriptionBlocks = normalizeLoreBlocks(lore, detail);
  const description =
    blocksToText(descriptionBlocks) ||
    detail ||
    `${background.name} background details.`;

  return {
    id: toSlug(background.name, background.source),
    name: background.name,
    source: background.source,
    ruleset: "2024",
    summary: lore?.summary || normalizeBackgroundDescription(background),
    description,
    descriptionBlocks,
    image: lore?.image,
    abilityOptions: normalizeAbilityOptions(background.ability ?? []),
    originFeat: normalizeOriginFeat(background.feats?.[0]),
    skillProficiencies: normalizeProficiencyRecord(background.skillProficiencies?.[0]),
    toolProficiencies: normalizeProficiencyRecord(background.toolProficiencies?.[0]),
    languageChoiceCount: normalizeLanguageChoiceCount(background.languageProficiencies),
    equipmentSummary: formatTaggedTextAsPlain(extractEquipmentSummary(background.entries)),
    equipmentGold: extractBackgroundGold(background.startingEquipment),
    equipmentItemsA: extractBackgroundItemsA(background.startingEquipment),
    rewardSummary,
    detail: detail || `${background.name} background details.`,
  };
}

export function normalizeClass(
  rawClass: Raw5eClass,
  classFeatures: Raw5eFeature[],
  classFluff: Raw5eClassFluff[] = [],
  lore?: RawPlayerLoreEntry,
  weaponMasteryOptions: BuilderChoiceOption[] = [],
  rawSubclasses: Raw5eSubclass[] = [],
  subclassFeatures: Raw5eFeature[] = [],
): BuilderClass {
  const skillChoices = normalizeClassSkillChoices(rawClass);
  const allFeatures = (rawClass.classFeatures ?? [])
    .map((feature) => normalizeClassFeature(feature, classFeatures))
    .filter((feature): feature is BuilderFeature => Boolean(feature));
  const spellcastingAbility = rawClass.spellcastingAbility
    ? formatAttributeAbbreviation(rawClass.spellcastingAbility)
    : undefined;
  const detail = allFeatures
    .map((feature) => `Level ${feature.level ?? 1}: ${feature.name}. ${feature.description}`)
    .join("\n\n");
  const descriptionBlocks = normalizeLoreBlocks(lore, detail);

  return {
    id: toSlug(rawClass.name, rawClass.source),
    name: rawClass.name,
    source: rawClass.source,
    ruleset: "2024",
    level: 1,
    hitDie: rawClass.hd?.faces ?? 6,
    summary: lore?.summary || `${rawClass.name} e uma classe jogavel de 2024.`,
    description:
      blocksToText(descriptionBlocks) || `${rawClass.name} class lore details.`,
    descriptionBlocks,
    primaryAbility: normalizePrimaryAbility(rawClass.primaryAbility),
    savingThrows: (rawClass.proficiency ?? []).map(formatAttributeAbbreviation),
    armorProficiencies: rawClass.startingProficiencies?.armor ?? [],
    weaponProficiencies: normalizeWeaponProficiencies(
      rawClass.startingProficiencies?.weapons,
    ),
    toolProficiencies: (rawClass.startingProficiencies?.tools ?? []).map(
      formatTaggedTextAsPlain,
    ),
    spellcastingAbility,
    spellcastingProgression: normalizeSpellcastingProgression(rawClass),
    image: applyClassCardFraming(
      toSlug(rawClass.name, rawClass.source),
      lore?.image ?? normalizeClassImage(rawClass, classFluff),
    ),
    progressionRows: normalizeClassProgressionRows(rawClass, allFeatures),
    skillChoices,
    languageChoiceCount: normalizeLanguageChoiceCount(
      rawClass.startingProficiencies?.languages,
    ),
    featureChoiceGroups: normalizeClassFeatureChoiceGroups(
      rawClass,
      allFeatures,
      weaponMasteryOptions,
    ),
    levelOneFeatures: allFeatures.filter((feature) => feature.level === 1),
    allFeatures,
    startingEquipment: (rawClass.startingEquipment?.entries ?? []).map(
      formatTaggedTextAsPlain,
    ),
    startingEquipmentGold: rawClass.startingEquipment?.goldAlternative
      ? formatTaggedTextAsPlain(rawClass.startingEquipment.goldAlternative)
      : extractClassGoldAlternative(rawClass.startingEquipment?.defaultData),
    startingEquipmentPackages: normalizeEquipmentPackages(
      rawClass.startingEquipment?.defaultData?.[0],
    ),
    detail,
    subclasses: dedupeSubclassesByName(
      rawSubclasses.filter(
        (sub) =>
          sub.className === rawClass.name &&
          sub.classSource === rawClass.source,
      ),
      rawClass.source,
    ).map((sub) => normalizeSubclass(sub, subclassFeatures)),
  };
}

export function normalizeEquipmentOption(rawItem: Raw5eItem): BuilderEquipmentOption {
  return {
    id: toSlug(rawItem.name, rawItem.source),
    name: rawItem.name,
    source: rawItem.source,
    sourceType: rawItem.builderSourceType ?? (rawItem.ac ? "class" : "manual"),
    category: "Other Gear",
    armorClass: rawItem.ac,
    value: rawItem.value,
  };
}

export function normalizeLanguage(rawLanguage: Raw5eLanguage): BuilderLanguage {
  return {
    name: rawLanguage.name,
    type: normalizeLanguageType(rawLanguage.type),
    source: rawLanguage.source,
  };
}

function normalizeLanguageType(type: string | undefined): BuilderLanguage["type"] {
  if (
    type === "standard" ||
    type === "rare" ||
    type === "exotic" ||
    type === "secret"
  ) {
    return type;
  }

  return "unknown";
}

function normalizeLanguageChoiceCount(
  languageProficiencies:
    | Array<Record<string, boolean> | { any?: number }>
    | undefined,
): number {
  return (languageProficiencies ?? []).reduce((total, entry) => {
    if ("any" in entry && typeof entry.any === "number") {
      return total + entry.any;
    }

    return total;
  }, 0);
}

function normalizeAbilityOptions(
  options: Raw5eWeightedAbilityChoice[],
): BuilderAbilityOption[] {
  return options.flatMap((option) => {
    const weighted = option.choose?.weighted;

    if (!weighted?.from?.length || !weighted.weights?.length) {
      return [];
    }

    return [
      {
        mode: weighted.weights.join("/") === "2/1" ? "+2/+1" : "+1/+1/+1",
        attributes: weighted.from
          .map((attribute) => ATTRIBUTE_ABBREVIATION_MAP[attribute])
          .filter((attribute): attribute is AttributeKey => Boolean(attribute)),
      },
    ];
  });
}

function normalizeOriginFeat(featRecord: Record<string, true> | undefined): string {
  const [featKey] = Object.keys(featRecord ?? {});

  if (!featKey) {
    return "";
  }

  const [nameAndVariant] = featKey.split("|");
  const [name, variant] = nameAndVariant.split(";").map((part) => part.trim());

  return variant ? `${toTitleCase(name)} (${toTitleCase(variant)})` : toTitleCase(name);
}

function normalizeProficiencyRecord(record: Record<string, boolean> | undefined): string[] {
  return Object.entries(record ?? {})
    .filter(([, enabled]) => enabled)
    .map(([name]) => formatSkill(name));
}

function normalizeEntriesToFeatures(entries: unknown[] | undefined): BuilderFeature[] {
  return (entries ?? []).flatMap((entry) => {
    if (!isNamedEntry(entry)) {
      return [];
    }

    return [
      {
        name: entry.name,
        description: stringifyEntries(entry.entries) || "Trait details.",
        blocks: parseRulesText(entry.entries),
      },
    ];
  });
}

function normalizeSpeciesChoiceGroups(
  entries: unknown[] | undefined,
): BuilderChoiceGroup[] {
  return (entries ?? []).flatMap((entry) => {
    if (!isNamedEntry(entry)) {
      return [];
    }

    const table = (entry.entries ?? []).find(isTableEntry);

    if (!table) {
      return [];
    }

    return [
      {
        id: toKebabCase(entry.name),
        label: entry.name,
        required: true,
        options: table.rows.map((row) => ({
          label: formatTaggedTextAsPlain(String(row[0] ?? "")),
          value: toKebabCase(String(row[0] ?? "")),
          description: formatTaggedTextAsPlain(String(row[1] ?? "")),
        })),
      },
    ];
  });
}

function normalizeSpeciesDescription(
  race: Raw5eRace,
  traits: BuilderFeature[],
): string {
  const firstTextEntry = (race.entries ?? []).find(
    (entry): entry is string => typeof entry === "string",
  );

  if (firstTextEntry) {
    return formatTaggedTextAsPlain(firstTextEntry);
  }

  const traitNames = traits.map((trait) => trait.name).slice(0, 3).join(", ");

  return traitNames
    ? `${race.name} combina ${traitNames} em uma linhagem jogavel de 2024.`
    : `${race.name} e uma especie jogavel de 2024.`;
}

function normalizeSpeciesImage(race: Raw5eRace): BuilderSpecies["image"] {
  return {
    src: `https://cdn.5e.tools/2024/img/races/${encodePathSegment(race.source)}/${encodePathSegment(race.name)}.webp`,
    alt: `${race.name} species artwork`,
  };
}

function normalizeBackgroundDescription(
  background: Raw5eBackground,
): string {
  const firstTextEntry = (background.entries ?? []).find(
    (entry): entry is string => typeof entry === "string",
  );

  if (firstTextEntry) {
    return formatTaggedTextAsPlain(firstTextEntry);
  }

  return `${background.name} define a origem narrativa do personagem e representa o treinamento, os contatos e as experiencias que moldaram sua vida antes da aventura.`;
}

function normalizeBackgroundRewards(entries: unknown[] | undefined): string[] {
  return (entries ?? []).flatMap((entry) => {
    if (!isListEntry(entry)) {
      return [];
    }

    return (entry.items ?? [])
      .map((item) => stringifyEntries([item]))
      .filter(Boolean);
  });
}

function extractEquipmentSummary(entries: unknown[] | undefined): string {
  for (const entry of entries ?? []) {
    if (!isListEntry(entry)) {
      continue;
    }

    for (const item of entry.items ?? []) {
      if (isEquipmentItem(item)) {
        return item.entry;
      }
    }
  }

  return "2024 Background equipment.";
}

export function extractBackgroundGold(
  startingEquipment: unknown[] | undefined,
): string | undefined {
  const first = (startingEquipment ?? [])[0];
  if (!first || typeof first !== "object") return undefined;
  const equipmentOptions = first as Record<string, unknown>;
  const bArr = equipmentOptions.b ?? equipmentOptions.B;
  if (!Array.isArray(bArr) || !bArr[0]) return undefined;
  const copper = (bArr[0] as Record<string, unknown>).value;
  if (typeof copper !== "number") return undefined;
  return `${Math.round(copper / 100)} GP`;
}

export function extractClassGoldAlternative(
  defaultData: Array<Record<string, Raw5eStartingEquipmentItem[]>> | undefined,
): string {
  const packages = defaultData?.[0];
  const bPackage = packages?.B ?? packages?.b;
  if (!bPackage) return "";
  const copper = bPackage.reduce((sum, item) => sum + (item.value ?? 0), 0);
  return copper > 0 ? `${formatCopperAsGold(copper)} GP` : "";
}

export function extractBackgroundItemsA(
  startingEquipment: unknown[] | undefined,
): BuilderEquipmentPackageItem[] {
  const first = (startingEquipment ?? [])[0];
  if (!first || typeof first !== "object") return [];
  const equipmentOptions = first as Record<string, unknown>;
  const aArr = equipmentOptions.a ?? equipmentOptions.A;
  if (!Array.isArray(aArr)) return [];

  return aArr.flatMap((entry, i): BuilderEquipmentPackageItem[] => {
    if (typeof entry === "string") {
      const name = toTitleCase(entry.split("|")[0] ?? "");
      if (!name) return [];
      return [{ id: toSlug(name, "xphb"), label: name, quantity: 1 }];
    }
    if (typeof entry === "object" && entry !== null) {
      const obj = entry as Record<string, unknown>;
      if (typeof obj.value === "number") {
        return [{ id: `gold-${i}`, label: "Gold", quantity: 1, value: obj.value }];
      }
      const ref = typeof obj.item === "string" ? obj.item : null;
      const refName = ref ? toTitleCase(ref.split("|")[0] ?? "") : null;
      const rawQuantity = typeof obj.quantity === "number" ? obj.quantity : 1;
      const label =
        typeof obj.displayName === "string"
          ? obj.displayName
          : refName
          ? formatPackageItemLabel(refName, rawQuantity)
          : null;
      if (!label) return [];
      const quantity = refName?.toLowerCase() === "rations" && rawQuantity > 1
        ? 1
        : rawQuantity;
      const catalogItemId = refName ? toSlug(refName, "xphb") : undefined;
      return [{
        id: catalogItemId ?? toKebabCase(label),
        label,
        quantity,
        catalogItemId,
      }];
    }
    return [];
  });
}

function formatPackageItemLabel(name: string, quantity: number): string {
  if (name.toLowerCase() === "rations" && quantity > 1) {
    return `Rations (${quantity} days' worth)`;
  }

  return name;
}

function normalizeClassSkillChoices(rawClass: Raw5eClass): BuilderClass["skillChoices"] {
  const skillEntry = rawClass.startingProficiencies?.skills?.[0];
  const choose = skillEntry?.choose;

  if (skillEntry?.any) {
    return {
      chooseFrom: Object.values(SKILL_LABELS),
      count: skillEntry.any,
    };
  }

  return {
    chooseFrom: (choose?.from ?? []).map(formatSkill),
    count: choose?.count ?? 0,
  };
}

function normalizeClassFeatureChoiceGroups(
  rawClass: Raw5eClass,
  allFeatures: BuilderFeature[],
  weaponMasteryOptions: BuilderChoiceOption[],
): BuilderClassFeatureChoiceGroup[] {
  const hasWeaponMastery = allFeatures.some(
    (feature) => feature.level === 1 && feature.name === "Weapon Mastery",
  );

  if (!hasWeaponMastery) {
    return [];
  }

  const classKey = rawClass.name.toLowerCase();
  const counts: Record<string, number> = {
    barbarian: 2,
    fighter: 3,
    paladin: 2,
    ranger: 2,
    rogue: 2,
  };
  const count = counts[classKey];

  if (!count) {
    return [];
  }

  const meleeOnly = classKey === "barbarian";
  const options = meleeOnly
    ? weaponMasteryOptions.filter((option) => option.description?.includes("melee"))
    : weaponMasteryOptions;

  return [
    {
      id: "weapon-mastery",
      featureName: "Weapon Mastery",
      label: "Weapon Mastery",
      description: meleeOnly
        ? "Choose two simple or martial melee weapons to master."
        : `Choose ${count} simple or martial weapons to master.`,
      count,
      options,
    },
  ];
}

function normalizeClassFeature(
  feature: string | { classFeature: string; gainSubclassFeature?: boolean },
  classFeatures: Raw5eFeature[],
): BuilderFeature | null {
  const featureRef = typeof feature === "string" ? feature : feature.classFeature;
  const [name, className, source, level] = featureRef.split("|");

  const featureLevel = Number(level);
  const matchedFeature = classFeatures.find(
    (entry) =>
      entry.name === name &&
      entry.source === source &&
      entry.level === featureLevel &&
      entry.className === className,
  );

  return {
    name,
    level: Number.isFinite(featureLevel) ? featureLevel : undefined,
    description:
      stringifyEntries(matchedFeature?.entries) || "Class feature details.",
    blocks: parseRulesText(matchedFeature?.entries),
    grantsSubclass:
      typeof feature === "object" && feature.gainSubclassFeature === true,
  };
}

function normalizeSubclassFeature(
  featureRef: string,
  subclassFeatures: Raw5eFeature[],
): BuilderFeature {
  const [name, , , subclassShortName, source, level] = featureRef.split("|");
  const featureLevel = Number(level);
  const matched = subclassFeatures.find(
    (entry) =>
      entry.name === name &&
      entry.source === source &&
      entry.level === featureLevel &&
      entry.subclassShortName === subclassShortName,
  );

  return {
    name,
    level: Number.isFinite(featureLevel) ? featureLevel : undefined,
    description: stringifyEntries(matched?.entries) || "Subclass feature details.",
    blocks: parseRulesText(matched?.entries),
  };
}

function dedupeSubclassesByName(
  subclasses: Raw5eSubclass[],
  preferredSource: string,
): Raw5eSubclass[] {
  const byName = new Map<string, Raw5eSubclass>();
  for (const sub of subclasses) {
    const existing = byName.get(sub.name);
    if (!existing || sub.source === preferredSource) {
      byName.set(sub.name, sub);
    }
  }
  return [...byName.values()];
}

function normalizeSubclass(
  rawSubclass: Raw5eSubclass,
  subclassFeatures: Raw5eFeature[],
): BuilderSubclass {
  return {
    id: toSlug(rawSubclass.name, rawSubclass.source),
    name: rawSubclass.name,
    shortName: rawSubclass.shortName ?? rawSubclass.name,
    source: rawSubclass.source,
    features: (rawSubclass.subclassFeatures ?? []).map((ref) =>
      normalizeSubclassFeature(ref, subclassFeatures),
    ),
  };
}

function normalizePrimaryAbility(
  primaryAbility: Raw5eClass["primaryAbility"],
): string[] {
  return (primaryAbility ?? []).flatMap((record) =>
    Object.entries(record)
      .filter(([, enabled]) => enabled)
      .map(([attribute]) => formatAttributeAbbreviation(attribute)),
  );
}

function normalizeWeaponProficiencies(
  weapons: NonNullable<Raw5eClass["startingProficiencies"]>["weapons"],
): string[] {
  return (weapons ?? []).flatMap((weapon) => {
    if (typeof weapon === "string") {
      return [formatTaggedTextAsPlain(weapon)];
    }

    return weapon.proficiency ? [formatTaggedTextAsPlain(weapon.proficiency)] : [];
  });
}

function normalizeClassImage(
  rawClass: Raw5eClass,
  classFluff: Raw5eClassFluff[],
): BuilderClass["image"] {
  const matchedFluff =
    classFluff.find(
      (entry) => entry.name === rawClass.name && entry.source === rawClass.source,
    ) ??
    classFluff.find(
      (entry) =>
        entry.name === rawClass.name &&
        (entry.source === "XPHB" || entry.source === "EFA"),
    ) ??
    classFluff.find((entry) => entry.name === rawClass.name);
  const image = matchedFluff?.images?.find((entry) => entry.href?.path);
  const path = image?.href?.path;

  if (!path) {
    return {
      src: `https://cdn.5e.tools/2024/img/classes/${encodePathSegment(rawClass.source)}/${encodePathSegment(rawClass.name)}.webp`,
      alt: `${rawClass.name} class artwork`,
    };
  }

  return {
    src: `https://cdn.5e.tools/2024/img/${path}`,
    alt: `${rawClass.name} class artwork`,
    credit: image.credit,
  };
}

function normalizeClassProgressionRows(
  rawClass: Raw5eClass,
  allFeatures: BuilderFeature[],
): BuilderClass["progressionRows"] {
  const spellSlots = rawClass.classTableGroups?.find(
    (group) => group.title === "Spell Slots per Spell Level",
  )?.rowsSpellProgression;

  return Array.from({ length: 20 }, (_entry, index) => {
    const level = index + 1;

    return {
      level,
      proficiencyBonus: `+${Math.ceil(level / 4) + 1}`,
      features: allFeatures
        .filter((feature) => feature.level === level)
        .map((feature) => feature.name),
      spellSlots: (spellSlots?.[index] ?? []).map((slot) => String(slot)),
    };
  });
}

function normalizeSpellcastingProgression(
  rawClass: Raw5eClass,
): BuilderClass["spellcastingProgression"] {
  if (!rawClass.spellcastingAbility) return undefined;

  const classTable = rawClass.classTableGroups?.find((group) =>
    (group.colLabels ?? []).some((label) => /cantrips|prepared spells|spells known/i.test(label)),
  );
  const cantripIndex = classTable?.colLabels?.findIndex((label) => /cantrips/i.test(label)) ?? -1;
  const preparedIndex = classTable?.colLabels?.findIndex((label) => /prepared spells/i.test(label)) ?? -1;
  const knownIndex = classTable?.colLabels?.findIndex((label) => /spells known/i.test(label)) ?? -1;
  const pactSlotsIndex = classTable?.colLabels?.findIndex((label) => /^Spell Slots$/i.test(label)) ?? -1;
  const pactSlotLevelIndex = classTable?.colLabels?.findIndex((label) => /slot level/i.test(label)) ?? -1;

  return {
    casterProgression: rawClass.casterProgression,
    cantripsKnown:
      rawClass.cantripProgression ?? extractNumericColumn(classTable?.rows, cantripIndex),
    knownSpells:
      rawClass.spellsKnownProgression ??
      rawClass.spellsKnownProgressionFixed ??
      extractNumericColumn(classTable?.rows, knownIndex),
    preparedSpells: extractNumericColumn(classTable?.rows, preparedIndex),
    pactMagicSlots: extractNumericColumn(classTable?.rows, pactSlotsIndex),
    pactMagicSlotLevels: extractNumericColumn(classTable?.rows, pactSlotLevelIndex),
  };
}

function extractNumericColumn(rows: unknown[][] | undefined, index: number): number[] {
  if (!rows || index < 0) return [];
  return rows.map((row) => {
    const value = row[index];
    return typeof value === "number" ? value : Number(value) || 0;
  });
}

function normalizeEquipmentPackages(
  rawPackages: Record<string, Raw5eStartingEquipmentItem[]> | undefined,
): BuilderEquipmentPackage[] {
  return Object.entries(rawPackages ?? {}).map(([id, items]) => {
    const normalizedItems = items.map(normalizeEquipmentPackageItem);
    const goldValue = normalizedItems.reduce(
      (total, item) => total + (item.value ?? 0),
      0,
    );
    const itemSummary = normalizedItems
      .filter((item) => item.value === undefined)
      .map((item) => `${item.quantity > 1 ? `${item.quantity} ` : ""}${item.label}`)
      .join(", ");
    return {
      id,
      label: `Option ${id}`,
      items: normalizedItems,
      goldValue,
      summary: itemSummary,
    };
  });
}

function normalizeEquipmentPackageItem(
  item: Raw5eStartingEquipmentItem,
): BuilderEquipmentPackageItem {
  const label = item.displayName ?? getItemNameFromReference(item.item) ?? item.equipmentType ?? "Gold";

  return {
    id: item.item ? toSlug(getItemNameFromReference(item.item) ?? label, "xphb") : toKebabCase(label),
    label,
    quantity: item.quantity ?? 1,
    value: item.value,
  };
}

function getItemNameFromReference(reference: string | undefined): string | undefined {
  if (!reference) {
    return undefined;
  }

  const [name] = reference.split("|");

  return toTitleCase(name);
}

function formatAttributeAbbreviation(attribute: string): string {
  const key = ATTRIBUTE_ABBREVIATION_MAP[attribute];
  return key ? ATTRIBUTE_LABELS[key] : toTitleCase(attribute);
}

function formatSkill(skill: string): string {
  return SKILL_LABELS[skill] ?? toTitleCase(skill);
}

function toTitleCase(value: string): string {
  return value.replace(/\w\S*/g, (word) => {
    return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
  });
}

function toKebabCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

/**
 * Texto plano de entries 5eTools via AST (fonte única de verdade para tags;
 * o parser inline e a travessia vivem em rulesTextAst).
 */
export function stringifyEntries(entries: unknown[] | undefined): string {
  return astToPlainText(parseRulesText(entries));
}

function normalizeLoreBlocks(
  lore: RawPlayerLoreEntry | undefined,
  fallback: string,
): RulesTextNode[] {
  const blocks = parseRulesText(lore?.entries);

  if (blocks.length) {
    return blocks;
  }

  return fallback
    ? [{ type: "paragraph", children: [{ type: "text", text: fallback }] }]
    : [];
}

function blocksToText(blocks: RulesTextNode[] | undefined): string {
  return astToPlainText(blocks ?? []);
}

export function formatTaggedTextAsPlain(value: string): string {
  return value
    .replace(/@\w+\[([^\]|]+)(?:\|[^\]]+)?\]/g, "$1")
    .replace(/\{@(?:i|b|em|strong)\s+([^}]+)\}/g, "$1")
    .replace(
      /\{@(?:classFeature|subclass|subclassFeature|class|filter)\s+([^}]+)\}/g,
      (_match: string, raw: string) => getFirstTaggedPart(raw),
    )
    .replace(
      /\{@(?:item|spell|condition|feat|skill|action|variantrule|sense|book|5etools|language)\s+([^}]+)\}/g,
      (_match: string, raw: string) => getTaggedDisplayText(raw),
    )
    .replace(
      /\{@(?:dice|damage|dc)\s+([^}]+)\}/g,
      (_match: string, raw: string) => getFirstTaggedPart(raw),
    )
    .replace(/\{@[a-zA-Z0-9]+\s+([^}]+)\}/g, (_match: string, raw: string) =>
      getFirstTaggedPart(raw),
    )
    .replace(/\s+/g, " ")
    .trim();
}

function getTaggedDisplayText(raw: string): string {
  const parts = raw.split("|").map((part) => part.trim());

  return parts[2] || parts[0];
}

function getFirstTaggedPart(raw: string): string {
  return raw.split("|")[0]?.trim() ?? "";
}

function formatCopperAsGold(value: number): string {
  return String(value / 100).replace(/\.0$/, "");
}

function isNamedEntry(entry: unknown): entry is { name: string; entries?: unknown[] } {
  return (
    typeof entry === "object" &&
    entry !== null &&
    "name" in entry &&
    typeof entry.name === "string"
  );
}

function isListEntry(entry: unknown): entry is { items?: unknown[] } {
  return typeof entry === "object" && entry !== null && "items" in entry;
}

function isTableEntry(entry: unknown): entry is {
  caption?: string;
  rows: unknown[][];
} {
  return (
    typeof entry === "object" &&
    entry !== null &&
    "rows" in entry &&
    Array.isArray(entry.rows)
  );
}

function isEquipmentItem(item: unknown): item is { name: string; entry: string } {
  return (
    typeof item === "object" &&
    item !== null &&
    "name" in item &&
    item.name === "Equipment:" &&
    "entry" in item &&
    typeof item.entry === "string"
  );
}

