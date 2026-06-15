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
  BuilderFeatureBlock,
  BuilderLanguage,
  BuilderSpecies,
} from "@/types/builder";
import {
  ATTRIBUTE_ABBREVIATION_MAP,
  ATTRIBUTE_LABELS,
  type AttributeKey,
} from "@/types/dnd";
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
  Raw5eWeightedAbilityChoice,
} from "@/types/fiveETools";

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
    detail: detail || `${race.name} species details.`,
  };
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
    image: lore?.image ?? normalizeClassImage(rawClass, classFluff),
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
    startingEquipmentGold: formatTaggedTextAsPlain(
      rawClass.startingEquipment?.goldAlternative ?? "",
    ),
    startingEquipmentPackages: normalizeEquipmentPackages(
      rawClass.startingEquipment?.defaultData?.[0],
    ),
    detail,
  };
}

export function normalizeEquipmentOption(rawItem: Raw5eItem): BuilderEquipmentOption {
  return {
    id: toSlug(rawItem.name, rawItem.source),
    name: rawItem.name,
    source: rawItem.source,
    sourceType: rawItem.builderSourceType ?? (rawItem.ac ? "class" : "manual"),
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
        blocks: entriesToBlocks(entry.entries),
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
      .map(stringifyEntry)
      .map(formatTaggedTextAsPlain)
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

  return "Equipamento de antecedente 2024.";
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
        ? "Escolha duas armas melee simples ou marciais para dominar."
        : `Escolha ${count} armas simples ou marciais para dominar.`,
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
    blocks: entriesToBlocks(matchedFeature?.entries),
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
    const goldSummary = goldValue > 0 ? `${formatCopperAsGold(goldValue)} GP` : "";

    return {
      id,
      label: `Option ${id}`,
      items: normalizedItems,
      goldValue,
      summary: [itemSummary, goldSummary].filter(Boolean).join(" and "),
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

function stringifyEntries(entries: unknown[] | undefined): string {
  return (entries ?? [])
    .map(stringifyEntry)
    .filter(Boolean)
    .join(" ");
}

function normalizeLoreBlocks(
  lore: RawPlayerLoreEntry | undefined,
  fallback: string,
): BuilderFeatureBlock[] {
  const blocks = entriesToBlocks(lore?.entries);

  if (blocks.length) {
    return blocks;
  }

  return fallback ? [{ type: "paragraph", text: fallback }] : [];
}

function blocksToText(blocks: BuilderFeatureBlock[] | undefined): string {
  return (blocks ?? [])
    .flatMap((block) => (block.type === "list" ? block.items : [block.text]))
    .join(" ")
    .trim();
}

function entriesToBlocks(
  entries: unknown[] | undefined,
): NonNullable<BuilderFeature["blocks"]> {
  return (entries ?? []).flatMap((entry) => entryToBlocks(entry));
}

function entryToBlocks(entry: unknown): NonNullable<BuilderFeature["blocks"]> {
  if (typeof entry === "string") {
    const text = formatTaggedTextAsPlain(entry);
    return text ? [{ type: "paragraph", text }] : [];
  }

  if (isListEntry(entry)) {
    const items = (entry.items ?? [])
      .map(stringifyEntry)
      .map(formatTaggedTextAsPlain)
      .filter(Boolean);

    return items.length ? [{ type: "list", items }] : [];
  }

  if (isNamedEntry(entry)) {
    const text = stringifyEntries(entry.entries);
    return text ? [{ type: "paragraph", text: `${entry.name}: ${text}` }] : [];
  }

  if (isEntryWithEntries(entry)) {
    return entriesToBlocks(entry.entries);
  }

  if (isEntryWithEntry(entry)) {
    const text = formatTaggedTextAsPlain(entry.entry);
    return text ? [{ type: "paragraph", text }] : [];
  }

  return [];
}

function stringifyEntry(entry: unknown): string {
  if (typeof entry === "string") {
    return formatTaggedTextAsPlain(entry);
  }

  if (isNamedEntry(entry)) {
    return `${entry.name}: ${stringifyEntries(entry.entries)}`;
  }

  if (isEntryWithEntries(entry)) {
    return stringifyEntries(entry.entries);
  }

  if (isListEntry(entry)) {
    return (entry.items ?? []).map(stringifyEntry).filter(Boolean).join(" ");
  }

  if (isEntryWithEntry(entry)) {
    return formatTaggedTextAsPlain(entry.entry);
  }

  if (isTableEntry(entry)) {
    const header = entry.caption ? `${entry.caption}: ` : "";
    return `${header}${entry.rows
      .map((row) => row.map((cell) => formatTaggedTextAsPlain(String(cell))).join(" - "))
      .join("; ")}`;
  }

  return "";
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

function isEntryWithEntry(entry: unknown): entry is { entry: string } {
  return (
    typeof entry === "object" &&
    entry !== null &&
    "entry" in entry &&
    typeof entry.entry === "string"
  );
}

function isEntryWithEntries(entry: unknown): entry is { entries: unknown[] } {
  return (
    typeof entry === "object" &&
    entry !== null &&
    "entries" in entry &&
    Array.isArray(entry.entries)
  );
}
