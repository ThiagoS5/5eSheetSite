import { getLevelRequirements } from "@/rules/levelProgression";
import {
  createCharacterBuildFromLegacyState,
  createEmptyCharacterBuild,
  getStepIndexBySlug,
  type CreateCharacterBuildOptions,
} from "@/src/store/characterBuildModel";
import {
  getBuilderBackgrounds,
  getBuilderClasses,
  getBuilderEquipmentOptions,
  getBuilderLanguages,
  getBuilderSpecies,
} from "@/src/services/ruleService";
import { getSpellCatalog } from "@/src/services/spellService";
import type {
  CharacterBuild,
  CoinPouch,
  InventoryEntry,
  SkillTrainingLevel,
} from "@/src/types/characterBuild";
import type {
  BuilderBackground,
  BuilderClass,
  BuilderEquipmentOption,
  BuilderStepSlug,
} from "@/src/types/builder";
import type { AttributeBonuses, AttributeKey, CharacterAttributes } from "@/src/types/dnd";
import type { CharacterSpellcastingChoices } from "@/src/types/spells";

type FoundryItemType =
  | "background"
  | "class"
  | "consumable"
  | "container"
  | "equipment"
  | "feat"
  | "loot"
  | "race"
  | "spell"
  | "subclass"
  | "tool"
  | "weapon";

interface FoundryActorLike {
  name?: unknown;
  type?: unknown;
  system?: Record<string, unknown>;
  items?: FoundryItemLike[];
}

interface FoundryItemLike {
  _id?: unknown;
  name?: unknown;
  type?: unknown;
  system?: Record<string, unknown>;
}

export type ImportFoundryCharacterResult =
  | { ok: true; build: CharacterBuild }
  | { ok: false; error: string };

export type ImportFoundryCharacterOptions = Pick<
  CreateCharacterBuildOptions,
  "now" | "saveId"
>;

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const FOUNDRY_IMPORT_NOTE = "Imported from Foundry VTT. Review any custom or non-2024 content.";

const ABILITY_FROM_FOUNDRY: Record<string, AttributeKey> = {
  str: "forca",
  dex: "destreza",
  con: "constituicao",
  int: "inteligencia",
  wis: "sabedoria",
  cha: "carisma",
};

const SKILL_FROM_FOUNDRY: Record<string, string> = {
  acr: "Acrobatics",
  ani: "Animal Handling",
  arc: "Arcana",
  ath: "Athletics",
  dec: "Deception",
  his: "History",
  ins: "Insight",
  itm: "Intimidation",
  inv: "Investigation",
  med: "Medicine",
  nat: "Nature",
  prc: "Perception",
  prf: "Performance",
  per: "Persuasion",
  rel: "Religion",
  slt: "Sleight of Hand",
  ste: "Stealth",
  sur: "Survival",
};

const DEFAULT_ATTRIBUTES: CharacterAttributes = {
  forca: 8,
  destreza: 8,
  constituicao: 8,
  inteligencia: 8,
  sabedoria: 8,
  carisma: 8,
};

export function importFoundryCharacter(
  rawJson: string,
  options: ImportFoundryCharacterOptions = {},
): ImportFoundryCharacterResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawJson, (key, value) =>
      DANGEROUS_KEYS.has(key) ? undefined : value,
    );
  } catch {
    return { ok: false, error: "The file is not valid JSON." };
  }

  if (!isFoundryCharacterActor(parsed)) {
    return {
      ok: false,
      error: "The file is not a Foundry VTT character actor.",
    };
  }

  const actor = parsed;
  const items = actor.items ?? [];
  const identity = resolveIdentity(actor, items);
  const level = resolveLevel(actor, items);
  const foundryAttributes = resolveAttributes(actor.system);
  const backgroundAbilityBonuses = identity.background
    ? inferBackgroundAbilityBonuses(identity.background, foundryAttributes)
    : {};
  const baseAttributes = subtractBonuses(foundryAttributes, backgroundAbilityBonuses);
  const skills = resolveSkills(actor.system);
  const inventory = resolveInventory(items);
  const spells = resolveSpellcasting(items, identity.characterClass);
  const notes = createImportNotes({
    baseNotes: readDetailsString(actor.system, "notes"),
    identity,
    inventory,
    items,
    spells,
  });
  const baseBuild = createEmptyCharacterBuild(options);
  const playState = createPlayState(actor.system, baseBuild);

  const build = createCharacterBuildFromLegacyState(
    {
      characterBuild: baseBuild,
      level,
      externalLevelChoiceBaseline: level,
      selectedClassId: identity.characterClass?.id ?? "",
      selectedSubclassId: identity.subclassId,
      selectedSpeciesId: identity.species?.id ?? "",
      selectedBackgroundId: identity.background?.id ?? "",
      maxUnlockedStepIndex: getStepIndexBySlug("conclusao"),
      classSkillProficiencies: skills.classSkillProficiencies,
      skillTraining: skills.skillTraining,
      classFeatureChoices: resolveClassFeatureChoices(identity.characterClass, items),
      speciesLanguages: resolveLanguages(actor.system),
      attributeGenerationMethod: "manual",
      baseAttributes,
      backgroundAbilityBonuses,
      description: {
        ...baseBuild.draft.description,
        nome: readString(actor.name) || "Imported Foundry Character",
        alinhamento: readDetailsString(actor.system, "alignment"),
        faith: readDetailsString(actor.system, "faith"),
        lifestyle: readDetailsString(actor.system, "lifestyle"),
        age: readDetailsString(actor.system, "age"),
        height: readDetailsString(actor.system, "height"),
        weight: readDetailsString(actor.system, "weight"),
        eyes: readDetailsString(actor.system, "eyes"),
        skin: readDetailsString(actor.system, "skin"),
        hair: readDetailsString(actor.system, "hair"),
        gender: readDetailsString(actor.system, "gender"),
        aparencia: readDetailsString(actor.system, "appearance"),
        personalidade: joinText([
          readDetailsString(actor.system, "ideal"),
          readDetailsString(actor.system, "bond"),
          readDetailsString(actor.system, "flaw"),
        ]),
        tracos: readDetailsString(actor.system, "trait"),
        notas: notes,
        historia: stripHtml(readBiography(actor.system)),
      },
      money: resolveCurrency(actor.system),
      moneyTouched: true,
      inventory: inventory.entries,
      equippedItemIds: inventory.equippedItemIds,
      equipmentChoicesBySource: identity.characterClass
        ? { class: { mode: "gold", selectedOptionId: null } }
        : {},
      spellcasting: spells.choices,
      playState,
    },
    {
      createdAt: baseBuild.exportMetadata.createdAt,
      currentStepSlug: resolveCurrentStep(identity, level),
      saveId: baseBuild.exportMetadata.saveId,
      updatedAt: baseBuild.exportMetadata.updatedAt,
    },
  );

  return { ok: true, build };
}

function isFoundryCharacterActor(value: unknown): value is FoundryActorLike {
  return (
    isRecord(value) &&
    value.type === "character" &&
    isRecord(value.system) &&
    Array.isArray(value.items)
  );
}

function resolveIdentity(actor: FoundryActorLike, items: FoundryItemLike[]) {
  const details = readRecord(actor.system?.details);
  const classItem =
    findLinkedItem(items, "class", readString(details.originalClass)) ??
    items.find((item) => item.type === "class");
  const speciesItem =
    findLinkedItem(items, "race", readString(details.race)) ??
    items.find((item) => item.type === "race");
  const backgroundItem =
    findLinkedItem(items, "background", readString(details.background)) ??
    items.find((item) => item.type === "background");
  const subclassItem = items.find((item) => item.type === "subclass");
  const characterClass = findByFoundryIdentity(getBuilderClasses(), classItem);
  const species = findByFoundryIdentity(getBuilderSpecies(), speciesItem);
  const background = findByFoundryIdentity(getBuilderBackgrounds(), backgroundItem);
  const subclassId =
    characterClass?.subclasses.find((subclass) =>
      foundryIdentityMatches(subclass, subclassItem),
    )?.id ?? "";

  return {
    background,
    backgroundItem,
    characterClass,
    classItem,
    species,
    speciesItem,
    subclassId,
    subclassItem,
  };
}

function findLinkedItem(
  items: FoundryItemLike[],
  type: FoundryItemType,
  linkedId: string,
): FoundryItemLike | undefined {
  if (!linkedId) return undefined;
  return items.find((item) => item.type === type && readString(item._id) === linkedId);
}

function findByFoundryIdentity<T extends { id: string; name: string }>(
  candidates: readonly T[],
  item: FoundryItemLike | undefined,
): T | undefined {
  return candidates.find((candidate) => foundryIdentityMatches(candidate, item));
}

function foundryIdentityMatches<T extends { id: string; name: string }>(
  candidate: T,
  item: FoundryItemLike | undefined,
): boolean {
  const candidateSlugs = createCandidateSlugs(candidate.name, candidate.id);
  return createFoundryItemSlugs(item).some((slug) => candidateSlugs.has(slug));
}

function resolveLevel(actor: FoundryActorLike, items: FoundryItemLike[]): number {
  const details = readRecord(actor.system?.details);
  const detailLevel = readNumber(details.level);
  if (detailLevel !== undefined) return clampInteger(detailLevel, 1, 20);

  const classLevels = items
    .filter((item) => item.type === "class")
    .map((item) => readNumber(readRecord(item.system).levels) ?? 0)
    .reduce((total, value) => total + value, 0);

  return clampInteger(classLevels || 1, 1, 20);
}

function resolveAttributes(system: Record<string, unknown> | undefined): CharacterAttributes {
  const abilities = readRecord(system?.abilities);

  return Object.fromEntries(
    Object.entries(ABILITY_FROM_FOUNDRY).map(([foundryKey, attributeKey]) => {
      const score = readNumber(readRecord(abilities[foundryKey]).value);
      return [attributeKey, clampInteger(score ?? DEFAULT_ATTRIBUTES[attributeKey], 3, 20)];
    }),
  ) as CharacterAttributes;
}

function inferBackgroundAbilityBonuses(
  background: BuilderBackground,
  attributes: CharacterAttributes,
): AttributeBonuses {
  for (const option of background.abilityOptions) {
    if (option.mode === "+1/+1/+1") {
      const bonuses = Object.fromEntries(
        option.attributes.map((attribute) => [attribute, 1]),
      ) as AttributeBonuses;
      if (canSubtractBonuses(attributes, bonuses)) return bonuses;
    }

    if (option.mode === "+2/+1") {
      const sortedAttributes = [...option.attributes].sort(
        (first, second) => attributes[second] - attributes[first],
      );
      for (const major of sortedAttributes) {
        for (const minor of sortedAttributes) {
          if (major === minor) continue;
          const bonuses = { [major]: 2, [minor]: 1 } as AttributeBonuses;
          if (canSubtractBonuses(attributes, bonuses)) return bonuses;
        }
      }
    }
  }

  return {};
}

function canSubtractBonuses(
  attributes: CharacterAttributes,
  bonuses: AttributeBonuses,
): boolean {
  return Object.entries(bonuses).every(([key, bonus]) => {
    const attribute = key as AttributeKey;
    return attributes[attribute] - (bonus ?? 0) >= 3;
  });
}

function subtractBonuses(
  attributes: CharacterAttributes,
  bonuses: AttributeBonuses,
): CharacterAttributes {
  return Object.fromEntries(
    Object.entries(attributes).map(([key, value]) => [
      key,
      clampInteger(value - (bonuses[key as AttributeKey] ?? 0), 3, 20),
    ]),
  ) as CharacterAttributes;
}

function resolveSkills(system: Record<string, unknown> | undefined): {
  classSkillProficiencies: string[];
  skillTraining: Record<string, SkillTrainingLevel>;
} {
  const skills = readRecord(system?.skills);
  const skillTraining: Record<string, SkillTrainingLevel> = {};

  for (const [foundryKey, skillName] of Object.entries(SKILL_FROM_FOUNDRY)) {
    const value = readNumber(readRecord(skills[foundryKey]).value) ?? 0;
    if (value >= 2) {
      skillTraining[skillName] = "expertise";
    } else if (value >= 1) {
      skillTraining[skillName] = "proficient";
    } else if (value > 0) {
      skillTraining[skillName] = "half";
    }
  }

  return {
    classSkillProficiencies: Object.keys(skillTraining).filter(
      (skillName) => skillTraining[skillName] !== "half",
    ),
    skillTraining,
  };
}

function resolveLanguages(system: Record<string, unknown> | undefined): string[] {
  const value = readRecord(readRecord(system?.traits).languages).value;
  if (!Array.isArray(value)) return [];

  const languageBySlug = new Map(
    getBuilderLanguages().map((language) => [normalizeSlug(language.name), language.name]),
  );

  return value
    .map(readString)
    .filter(Boolean)
    .map((language) => languageBySlug.get(normalizeSlug(language)) ?? titleFromSlug(language));
}

function resolveInventory(items: FoundryItemLike[]): {
  entries: InventoryEntry[];
  equippedItemIds: string[];
  unmappedNames: string[];
} {
  const inventoryTypes = new Set<FoundryItemType>([
    "consumable",
    "container",
    "equipment",
    "loot",
    "tool",
    "weapon",
  ]);
  const itemBySlug = createEquipmentLookup();
  const quantityById = new Map<string, number>();
  const equippedIds = new Set<string>();
  const unmappedNames: string[] = [];

  for (const item of items) {
    if (!inventoryTypes.has(item.type as FoundryItemType)) continue;

    const option = createFoundryItemSlugs(item)
      .map((slug) => itemBySlug.get(slug))
      .find((entry): entry is BuilderEquipmentOption => Boolean(entry));

    if (!option) {
      const name = readString(item.name);
      if (name && name !== "Unarmed Strike") unmappedNames.push(name);
      continue;
    }

    const quantity = Math.max(1, Math.floor(readNumber(readRecord(item.system).quantity) ?? 1));
    quantityById.set(option.id, (quantityById.get(option.id) ?? 0) + quantity);
    if (readRecord(item.system).equipped === true) {
      equippedIds.add(option.id);
    }
  }

  return {
    entries: [...quantityById.entries()].map(([itemId, quantity]) => ({
      itemId,
      quantity,
    })),
    equippedItemIds: [...equippedIds],
    unmappedNames,
  };
}

function createEquipmentLookup(): Map<string, BuilderEquipmentOption> {
  const lookup = new Map<string, BuilderEquipmentOption>();
  for (const item of getBuilderEquipmentOptions()) {
    for (const slug of createCandidateSlugs(item.name, item.id)) {
      lookup.set(slug, item);
    }
  }
  return lookup;
}

function resolveSpellcasting(
  items: FoundryItemLike[],
  characterClass: BuilderClass | undefined,
): {
  choices: CharacterSpellcastingChoices | undefined;
  unmappedNames: string[];
} {
  const spellBySlug = new Map<string, string>();
  for (const spell of getSpellCatalog()) {
    for (const slug of createCandidateSlugs(spell.name, spell.id)) {
      spellBySlug.set(slug, spell.id);
    }
  }

  const choices: CharacterSpellcastingChoices = {
    cantripIds: [],
    knownSpellIds: [],
    preparedSpellIds: [],
  };
  const unmappedNames: string[] = [];

  for (const item of items) {
    if (item.type !== "spell") continue;

    const spellId = createFoundryItemSlugs(item)
      .map((slug) => spellBySlug.get(slug))
      .find((id): id is string => Boolean(id));

    if (!spellId) {
      const name = readString(item.name);
      if (name) unmappedNames.push(name);
      continue;
    }

    const level = readNumber(readRecord(item.system).level) ?? 0;
    if (level <= 0) {
      addUnique(choices.cantripIds, spellId);
    } else if (shouldImportAsPreparedSpell(item, characterClass)) {
      addUnique(choices.preparedSpellIds, spellId);
    } else {
      addUnique(choices.knownSpellIds, spellId);
    }
  }

  const hasSpells =
    choices.cantripIds.length > 0 ||
    choices.knownSpellIds.length > 0 ||
    choices.preparedSpellIds.length > 0;

  return { choices: hasSpells ? choices : undefined, unmappedNames };
}

function shouldImportAsPreparedSpell(
  item: FoundryItemLike,
  characterClass: BuilderClass | undefined,
): boolean {
  const system = readRecord(item.system);
  const preparation = readRecord(system.preparation);
  const mode = normalizeSlug(readString(preparation.mode));

  if (
    mode === "prepared" ||
    mode === "always" ||
    mode === "atwill" ||
    mode === "innate"
  ) {
    return true;
  }

  const prepared =
    readNumber(system.prepared) ??
    (readBoolean(preparation.prepared) ? 1 : 0);
  if (prepared <= 0) return false;

  return prepared >= 2 || hasPreparedSpellProgression(characterClass);
}

function hasPreparedSpellProgression(
  characterClass: BuilderClass | undefined,
): boolean {
  return (
    characterClass?.spellcastingProgression?.preparedSpells.some(
      (preparedCount) => preparedCount > 0,
    ) ?? false
  );
}

function resolveClassFeatureChoices(
  characterClass: BuilderClass | undefined,
  items: FoundryItemLike[],
): Record<string, string[]> {
  if (!characterClass) return {};

  const foundryFeatureSlugs = new Set(
    items
      .filter((item) => item.type === "feat")
      .flatMap((item) => createFoundryItemSlugs(item)),
  );

  return Object.fromEntries(
    characterClass.featureChoiceGroups
      .map((group) => {
        const selected = group.options
          .filter((option) =>
            [...createCandidateSlugs(option.label, option.value)].some((slug) =>
              foundryFeatureSlugs.has(slug),
            ),
          )
          .map((option) => option.value)
          .slice(0, group.count);

        return [group.id, selected];
      })
      .filter(([, selected]) => selected.length > 0),
  );
}

function createPlayState(
  system: Record<string, unknown> | undefined,
  baseBuild: CharacterBuild,
): CharacterBuild["playState"] {
  const hp = readRecord(readRecord(system?.attributes).hp);
  const ac = readRecord(readRecord(system?.attributes).ac);
  const hpValue = readNumber(hp.value);
  const maxHp = readNumber(hp.max) ?? hpValue;
  const armorClass = readNumber(ac.flat);

  return {
    ...baseBuild.playState,
    currentHp: hpValue ?? baseBuild.playState.currentHp,
    tempHp: readNumber(hp.temp) ?? baseBuild.playState.tempHp,
    usedSpellSlots: resolveUsedSpellSlots(system),
    overrides: {
      ...baseBuild.playState.overrides,
      ...(maxHp !== undefined ? { maxHp } : {}),
      ...(armorClass !== undefined ? { armorClass } : {}),
    },
  };
}

function resolveUsedSpellSlots(
  system: Record<string, unknown> | undefined,
): Record<number, number> {
  const spells = readRecord(system?.spells);
  const usedSlots: Record<number, number> = {};

  for (let level = 1; level <= 9; level += 1) {
    const slot = readRecord(spells[`spell${level}`]);
    const value = readNumber(slot.value);
    const max = readNumber(slot.max);
    if (value !== undefined && max !== undefined && max > value) {
      usedSlots[level] = max - value;
    }
  }

  const pact = readRecord(spells.pact);
  const pactValue = readNumber(pact.value);
  const pactMax = readNumber(pact.max);
  const pactLevel = readNumber(pact.level);
  if (
    pactLevel !== undefined &&
    pactValue !== undefined &&
    pactMax !== undefined &&
    pactMax > pactValue
  ) {
    usedSlots[pactLevel] = pactMax - pactValue;
  }

  return usedSlots;
}

function resolveCurrency(system: Record<string, unknown> | undefined): CoinPouch {
  const currency = readRecord(system?.currency);

  return {
    pc: readNumber(currency.cp) ?? 0,
    pp: readNumber(currency.sp) ?? 0,
    pe: readNumber(currency.ep) ?? 0,
    po: readNumber(currency.gp) ?? 0,
    pl: readNumber(currency.pp) ?? 0,
  };
}

function resolveCurrentStep(
  identity: ReturnType<typeof resolveIdentity>,
  level: number,
): BuilderStepSlug {
  if (!identity.characterClass) return "classe";
  if (isSubclassRequired(identity.characterClass, level) && !identity.subclassId) {
    return "subclasse";
  }
  if (!identity.background) return "antecedente";
  if (!identity.species) return "especie";
  return "conclusao";
}

function isSubclassRequired(characterClass: BuilderClass, level: number): boolean {
  return getLevelRequirements(characterClass, 0, level).some(
    (requirement) => requirement.kind === "subclass",
  );
}

function createImportNotes(input: {
  baseNotes: string;
  identity: ReturnType<typeof resolveIdentity>;
  inventory: ReturnType<typeof resolveInventory>;
  items: FoundryItemLike[];
  spells: ReturnType<typeof resolveSpellcasting>;
}): string {
  const notes = [input.baseNotes, FOUNDRY_IMPORT_NOTE].filter(Boolean);

  if (input.identity.subclassItem && !input.identity.subclassId) {
    notes.push(`Unmapped Foundry subclass: ${readString(input.identity.subclassItem.name)}`);
  }

  const classItems = input.items.filter((item) => item.type === "class");
  if (classItems.length > 1) {
    notes.push(
      `Foundry multiclass data detected: ${classItems.map((item) => readString(item.name)).join(", ")}`,
    );
  }

  appendUnmappedNote(notes, "items", input.inventory.unmappedNames);
  appendUnmappedNote(notes, "spells", input.spells.unmappedNames);

  return notes.join("\n\n");
}

function appendUnmappedNote(notes: string[], label: string, values: string[]) {
  const uniqueValues = [...new Set(values)].filter(Boolean);
  if (uniqueValues.length === 0) return;

  const preview = uniqueValues.slice(0, 8).join(", ");
  const suffix =
    uniqueValues.length > 8 ? `, and ${uniqueValues.length - 8} more` : "";
  notes.push(`Unmapped Foundry ${label}: ${preview}${suffix}.`);
}

function createFoundryItemSlugs(item: FoundryItemLike | undefined): string[] {
  if (!item) return [];

  const system = readRecord(item.system);
  const type = readRecord(system.type);
  const values = [
    readString(system.identifier),
    readString(type.baseItem),
    readString(item.name),
    stripParenthetical(readString(item.name)),
  ];

  return [...new Set(values.flatMap((value) => [...createCandidateSlugs(value)]))];
}

function createCandidateSlugs(...values: Array<string | undefined>): Set<string> {
  const slugs = new Set<string>();
  for (const value of values) {
    const slug = normalizeSlug(value ?? "");
    if (!slug) continue;
    slugs.add(slug);
    slugs.add(stripSourceSuffix(slug));
  }
  return slugs;
}

function stripSourceSuffix(slug: string): string {
  return slug.replace(/-(xphb|phb|xge|tce|dmg|xdmg|xmm|mm)$/i, "");
}

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/['\u2019]/g, "")
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripParenthetical(value: string): string {
  return value.replace(/\s*\([^)]*\)\s*/g, " ").trim();
}

function titleFromSlug(value: string): string {
  return normalizeSlug(value)
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function readBiography(system: Record<string, unknown> | undefined): string {
  const details = readRecord(system?.details);
  return readString(readRecord(details.biography).value);
}

function readDetailsString(
  system: Record<string, unknown> | undefined,
  key: string,
): string {
  return stripHtml(readString(readRecord(system?.details)[key]));
}

function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function joinText(values: string[]): string {
  return values.filter(Boolean).join("\n");
}

function addUnique(values: string[], value: string) {
  if (!values.includes(value)) {
    values.push(value);
  }
}

function readRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return undefined;
}

function readBoolean(value: unknown): boolean {
  return value === true;
}

function clampInteger(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(value)));
}
