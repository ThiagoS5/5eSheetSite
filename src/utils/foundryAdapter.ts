import foundryReference from "@/src/_references/foundry-reference.json";
import { getItemCatalog } from "@/src/services/itemCatalogService";
import { getBuilderClasses } from "@/src/services/ruleService";
import { getSpellCatalog } from "@/src/services/spellService";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import type {
  BuilderEquipmentOption,
  CatalogItem,
  CharacterSheetSummary,
  SheetFeature,
} from "@/src/types/builder";
import type { AttributeKey } from "@/src/types/dnd";
import type { BuilderSpell } from "@/src/types/spells";
import type {
  FoundryDnd5eProfile,
  FoundryOriginSnapshot,
} from "@/src/types/characterBuild";
import {
  createCharacterExportProjection,
  type CharacterExportProjection,
} from "@/src/utils/characterExportProjection";

type AbilityAbbreviation = "str" | "dex" | "con" | "int" | "wis" | "cha";
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

interface FoundryCurrency {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

interface FoundrySkill {
  ability?: AbilityAbbreviation;
  value: number;
  bonuses?: Record<string, unknown>;
  roll?: Record<string, unknown>;
  [key: string]: unknown;
}

interface FoundryTool {
  ability?: AbilityAbbreviation;
  value: number;
  bonuses?: Record<string, unknown>;
  roll?: Record<string, unknown>;
  [key: string]: unknown;
}

interface FoundrySpellSlot {
  value: number;
  max: number;
  override?: number | null;
  [key: string]: unknown;
}

type FoundrySpellSlots = Record<`spell${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`, FoundrySpellSlot> & {
  pact: FoundrySpellSlot;
};

interface CatalogLookup<T extends { id: string; name: string }> {
  byId: Map<string, T>;
  byName: Map<string, T[]>;
}

interface FoundryExportContext {
  itemLookup?: CatalogLookup<CatalogItem>;
  spellLookup?: CatalogLookup<BuilderSpell>;
}

export interface FoundryExportOptions {
  profile?: FoundryDnd5eProfile;
  originSnapshot?: FoundryOriginSnapshot;
}

interface FoundryProfileDefinition {
  id: FoundryDnd5eProfile;
  systemVersion: string;
  coreVersion: string;
  sensesShape: "flat" | "ranges";
}

export const FOUNDRY_DND5E_PROFILES: Record<
  FoundryDnd5eProfile,
  FoundryProfileDefinition
> = {
  "dnd5e-5.2": {
    id: "dnd5e-5.2",
    systemVersion: "5.2.4",
    coreVersion: "13.350",
    sensesShape: "flat",
  },
  "dnd5e-5.3": {
    id: "dnd5e-5.3",
    systemVersion: "5.3.3",
    coreVersion: "14.0",
    sensesShape: "ranges",
  },
};

export interface FoundryActorExport {
  name: string;
  type: "character";
  img?: string;
  system: FoundryCharacterSystem;
  prototypeToken?: Record<string, unknown>;
  items: FoundryItemExport[];
  effects?: unknown[];
  folder?: string | null;
  flags?: Record<string, unknown>;
  _stats?: Record<string, unknown>;
  ownership?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface FoundryCharacterSystem {
  abilities: Record<AbilityAbbreviation, FoundryAbility>;
  attributes: {
    hp: FoundryHitPoints;
    ac: FoundryArmorClass;
    movement?: Record<string, unknown>;
    senses?: Record<string, unknown>;
    init?: Record<string, unknown>;
    prof?: number;
    [key: string]: unknown;
  };
  currency?: FoundryCurrency;
  details: Record<string, unknown>;
  skills?: Record<string, FoundrySkill>;
  spells?: FoundrySpellSlots;
  tools?: Record<string, FoundryTool>;
  traits?: Record<string, unknown>;
  resources?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface FoundryAbility {
  value: number;
  proficient?: number;
  bonuses?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface FoundryHitPoints {
  value: number;
  max: number | null;
  temp?: number | null;
  tempmax?: number | null;
  [key: string]: unknown;
}

export interface FoundryArmorClass {
  flat: number | null;
  calc?: string;
  [key: string]: unknown;
}

export interface FoundryItemExport {
  _id: string;
  name: string;
  type: FoundryItemType;
  img: string;
  system: Record<string, unknown>;
  effects: unknown[];
  folder: string | null;
  flags: Record<string, unknown>;
  sort: number;
  ownership: Record<string, unknown>;
  [key: string]: unknown;
}

const ATTRIBUTE_TO_FOUNDRY: Record<AttributeKey, AbilityAbbreviation> = {
  forca: "str",
  destreza: "dex",
  constituicao: "con",
  inteligencia: "int",
  sabedoria: "wis",
  carisma: "cha",
};

const FOUNDRY_SOURCE = "Forge & Fate Character Builder";
const FIVEETOOLS_IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/5etools-mirror-3/5etools-img/main/";

const SOURCE_BOOK_NAMES: Record<string, string> = {
  XPHB: "PHB 2024",
  XDMG: "DMG 2024",
};

function createFoundryExportContext(): FoundryExportContext {
  return {};
}

function getItemLookup(context: FoundryExportContext): CatalogLookup<CatalogItem> {
  context.itemLookup ??= createCatalogLookup(getItemCatalog());
  return context.itemLookup;
}

function getSpellLookup(context: FoundryExportContext): CatalogLookup<BuilderSpell> {
  context.spellLookup ??= createCatalogLookup(getSpellCatalog());
  return context.spellLookup;
}

function createCatalogLookup<T extends { id: string; name: string }>(entries: T[]): CatalogLookup<T> {
  const byId = new Map<string, T>();
  const byName = new Map<string, T[]>();

  for (const entry of entries) {
    byId.set(entry.id, entry);
    const key = entry.name.toLowerCase();
    const matches = byName.get(key);
    if (matches) {
      matches.push(entry);
    } else {
      byName.set(key, [entry]);
    }
  }

  return { byId, byName };
}

const SKILL_TO_FOUNDRY: Record<string, string> = {
  acrobatics: "acr",
  "animal handling": "ani",
  arcana: "arc",
  athletics: "ath",
  deception: "dec",
  history: "his",
  insight: "ins",
  intimidation: "itm",
  investigation: "inv",
  medicine: "med",
  nature: "nat",
  perception: "prc",
  performance: "prf",
  persuasion: "per",
  religion: "rel",
  "sleight of hand": "slt",
  stealth: "ste",
  survival: "sur",
};

const TOOL_TO_FOUNDRY: Record<string, string> = {
  "alchemist's supplies": "alchemist",
  "brewer's supplies": "brewer",
  "calligrapher's supplies": "calligrapher",
  "carpenter's tools": "carpenter",
  "cartographer's tools": "cartographer",
  "cobbler's tools": "cobbler",
  "cook's utensils": "cook",
  "disguise kit": "disg",
  "forgery kit": "forg",
  "glassblower's tools": "glassblower",
  "herbalism kit": "herb",
  "jeweler's tools": "jeweler",
  "leatherworker's tools": "leatherworker",
  "mason's tools": "mason",
  "navigator's tools": "navg",
  "painter's supplies": "painter",
  "poisoner's kit": "pois",
  "potter's tools": "potter",
  "smith's tools": "smith",
  "thieves' tools": "thief",
  "tinker's tools": "tinker",
  "weaver's tools": "weaver",
  "woodcarver's tools": "woodcarver",
};

// 5etools single-letter school codes -> dnd5e three-letter codes.
const SPELL_SCHOOL_CODES: Record<string, string> = {
  A: "abj",
  C: "con",
  D: "div",
  E: "enc",
  V: "evo",
  I: "ill",
  N: "nec",
  T: "trs",
};

const SPELL_SCHOOL_BY_NAME: Record<string, string> = {
  abjuration: "abj",
  conjuration: "con",
  divination: "div",
  enchantment: "enc",
  evocation: "evo",
  illusion: "ill",
  necromancy: "nec",
  transmutation: "trs",
};

// 5etools casterProgression -> dnd5e spellcasting progression.
const CASTER_PROGRESSION_TO_FOUNDRY: Record<string, string> = {
  full: "full",
  "1/2": "half",
  "1/3": "third",
  pact: "pact",
  artificer: "artificer",
};

const DAMAGE_TYPES: Record<string, string> = {
  B: "bludgeoning",
  Bludgeoning: "bludgeoning",
  P: "piercing",
  Piercing: "piercing",
  S: "slashing",
  Slashing: "slashing",
};

export function createFoundryCharacterExport(
  state: CharacterBuilderState,
  summary: CharacterSheetSummary,
  options: FoundryExportOptions = {},
): FoundryActorExport {
  const profile = FOUNDRY_DND5E_PROFILES[options.profile ?? "dnd5e-5.3"];
  const projection = createCharacterExportProjection(
    summary,
    state.description,
    state.playState,
  );
  const hasOriginSnapshot = Boolean(options.originSnapshot);
  const actor = options.originSnapshot
    ? cloneActor(options.originSnapshot.actor)
    : cloneReference();
  const originalItems = hasOriginSnapshot ? (actor.items ?? []) : [];
  const characterName = projection.identity.name;
  const context = createFoundryExportContext();
  const items = createFoundryItems(state, summary, context);
  const identity = getIdentityItemIds(summary);

  actor.name = characterName;
  actor.type = "character";
  actor.items = mergeFoundryItems(originalItems, items);
  actor.effects ??= [];
  actor.folder ??= null;
  actor.prototypeToken = {
    ...(actor.prototypeToken ?? {}),
    name: characterName,
  };

  actor.system.abilities = mapAbilities(actor.system.abilities, summary);
  actor.system.attributes = mapAttributes(actor.system.attributes, summary, profile);
  actor.system.currency = mapCurrency(summary);
  actor.system.details = mapDetails(actor.system.details, state, summary, identity);
  actor.system.skills = mapSkills(actor.system.skills ?? {}, summary);
  actor.system.spells = mapSpellSlots(
    actor.system.spells,
    summary,
    getFoundryCasterProgression(summary) === "pact",
  );
  actor.system.tools = mapTools(actor.system.tools ?? {}, summary);
  actor.system.traits = mapTraits(actor.system.traits ?? {}, summary, projection);
  actor._stats = {
    ...(actor._stats ?? {}),
    coreVersion: profile.coreVersion,
    systemId: "dnd5e",
    systemVersion: profile.systemVersion,
  };
  actor.items = actor.items.map((item) => ({
    ...item,
    _stats: {
      ...((item._stats as Record<string, unknown> | undefined) ?? {}),
      coreVersion: profile.coreVersion,
      systemId: "dnd5e",
      systemVersion: profile.systemVersion,
    },
  }));

  return actor;
}

function cloneReference(): FoundryActorExport {
  return JSON.parse(JSON.stringify(foundryReference)) as FoundryActorExport;
}

function cloneActor(actor: Record<string, unknown>): FoundryActorExport {
  return JSON.parse(JSON.stringify(actor)) as FoundryActorExport;
}

function mergeFoundryItems(
  originalItems: FoundryItemExport[],
  mappedItems: FoundryItemExport[],
): FoundryItemExport[] {
  const remaining = [...originalItems];
  const merged = mappedItems.map((mapped) => {
    const matchIndex = remaining.findIndex(
      (original) =>
        original._id === mapped._id ||
        (original.type === mapped.type &&
          original.name.trim().toLowerCase() === mapped.name.trim().toLowerCase()),
    );
    if (matchIndex < 0) return mapped;
    const [original] = remaining.splice(matchIndex, 1);
    return deepMergeFoundry(original, mapped) as FoundryItemExport;
  });
  return [...merged, ...remaining];
}

function deepMergeFoundry(original: unknown, current: unknown): unknown {
  if (
    !original ||
    !current ||
    typeof original !== "object" ||
    typeof current !== "object" ||
    Array.isArray(original) ||
    Array.isArray(current)
  ) {
    return current;
  }

  const merged: Record<string, unknown> = {
    ...(original as Record<string, unknown>),
  };
  for (const [key, value] of Object.entries(current as Record<string, unknown>)) {
    merged[key] = deepMergeFoundry(merged[key], value);
  }
  return merged;
}

function mapAbilities(
  current: Record<AbilityAbbreviation, FoundryAbility>,
  summary: CharacterSheetSummary,
) {
  const proficientSaves = new Set(
    summary.savingThrows
      .filter((save) => save.isProficient)
      .map((save) => ATTRIBUTE_TO_FOUNDRY[save.attributeKey]),
  );

  return Object.fromEntries(
    (Object.entries(ATTRIBUTE_TO_FOUNDRY) as Array<[AttributeKey, AbilityAbbreviation]>).map(
      ([attribute, foundryKey]) => [
        foundryKey,
        {
          ...current[foundryKey],
          value: summary.finalAttributes[attribute],
          proficient: proficientSaves.has(foundryKey) ? 1 : 0,
        },
      ],
    ),
  ) as Record<AbilityAbbreviation, FoundryAbility>;
}

function mapAttributes(
  current: FoundryCharacterSystem["attributes"],
  summary: CharacterSheetSummary,
  profile: FoundryProfileDefinition,
): FoundryCharacterSystem["attributes"] {
  const currentSenses = (current.senses as Record<string, unknown> | undefined) ?? {};
  const rangeValues = {
    darkvision: getSenseRange(summary, "darkvision"),
    blindsight: getSenseRange(summary, "blindsight"),
    tremorsense: getSenseRange(summary, "tremorsense"),
    truesight: getSenseRange(summary, "truesight"),
  };
  const sensesWithoutFlatRanges = Object.fromEntries(
    Object.entries(currentSenses).filter(
      ([key]) => !Object.hasOwn(rangeValues, key),
    ),
  );
  const mappedSenses =
    profile.sensesShape === "ranges"
      ? {
          ...sensesWithoutFlatRanges,
          ranges: {
            ...((currentSenses.ranges as Record<string, unknown> | undefined) ?? {}),
            ...rangeValues,
          },
          units: "ft",
          special: summary.senses
            .filter((sense) => !sense.rangeFeet)
            .map((sense) => sense.name)
            .join(", "),
        }
      : {
          ...currentSenses,
          ...rangeValues,
          units: "ft",
          special: summary.senses
            .filter((sense) => !sense.rangeFeet)
            .map((sense) => sense.name)
            .join(", "),
        };
  return {
    ...current,
    hp: {
      ...current.hp,
      value: summary.currentHp,
      max: summary.maxHp,
      temp: summary.tempHp,
    },
    ac: {
      ...current.ac,
      flat: summary.armorClass,
      calc: "flat",
    },
    movement: {
      ...(current.movement as Record<string, unknown> | undefined),
      walk: summary.speedFeet,
      units: "ft",
      hover: false,
    },
    senses: mappedSenses,
    init: {
      ...(current.init as Record<string, unknown> | undefined),
      value: summary.initiative,
    },
    prof: summary.proficiencyBonus,
  };
}

function mapCurrency(summary: CharacterSheetSummary): FoundryCurrency {
  return {
    cp: summary.money.pc,
    sp: summary.money.pp,
    ep: summary.money.pe,
    gp: summary.money.po,
    pp: summary.money.pl,
  };
}

function mapDetails(
  current: Record<string, unknown>,
  state: CharacterBuilderState,
  summary: CharacterSheetSummary,
  identity: ReturnType<typeof getIdentityItemIds>,
) {
  return {
    ...current,
    level: summary.level,
    race: identity.race,
    background: identity.background,
    originalClass: identity.class,
    xp: {
      ...((current.xp as Record<string, unknown> | undefined) ?? {}),
      value: summary.xp,
      max: summary.xpThreshold,
    },
    alignment: state.description.alinhamento,
    faith: state.description.faith,
    lifestyle: state.description.lifestyle,
    appearance: state.description.aparencia,
    trait: state.description.tracos,
    age: state.description.age,
    height: state.description.height,
    weight: state.description.weight,
    eyes: state.description.eyes,
    skin: state.description.skin,
    hair: state.description.hair,
    gender: state.description.gender,
    biography: {
      value: createBiography(state),
      public: "",
    },
  };
}

function mapSkills(
  current: Record<string, FoundrySkill>,
  summary: CharacterSheetSummary,
): Record<string, FoundrySkill> {
  const next = { ...current };
  for (const skill of summary.skills) {
    const key = SKILL_TO_FOUNDRY[skill.name.toLowerCase()] ?? SKILL_TO_FOUNDRY[skill.label.toLowerCase()];
    if (!key) continue;
    next[key] = {
      ...(next[key] ?? {}),
      ability: ATTRIBUTE_TO_FOUNDRY[skill.attributeKey],
      value: skill.isExpert ? 2 : skill.isProficient ? 1 : 0,
    };
  }
  return next;
}

function mapSpellSlots(
  current: FoundryCharacterSystem["spells"] | undefined,
  summary: CharacterSheetSummary,
  isPactCaster: boolean,
): FoundrySpellSlots {
  const leveledSlots = isPactCaster ? [] : summary.spellcasting?.slots ?? [];
  const slots = Object.fromEntries(
    Array.from({ length: 9 }, (_, index) => {
      const level = index + 1;
      const source = leveledSlots.find((slot) => slot.level === level);
      return [
        `spell${level}`,
        {
          ...((current?.[`spell${level}` as keyof FoundrySpellSlots] as Record<string, unknown> | undefined) ?? {}),
          value: source?.remaining ?? 0,
          max: source?.total ?? 0,
        },
      ];
    }),
  ) as FoundrySpellSlots;
  const pactSlot = isPactCaster ? summary.spellcasting?.slots[0] : undefined;
  slots.pact = {
    ...(current?.pact ?? {}),
    value: pactSlot?.remaining ?? 0,
    max: pactSlot?.total ?? 0,
  };
  return slots;
}

function getFoundryCasterProgression(summary: CharacterSheetSummary): string {
  if (!summary.isSpellcaster) return "none";
  const characterClass = getBuilderClasses().find((entry) => entry.id === summary.classId);
  const progression = characterClass?.spellcastingProgression?.casterProgression ?? "";
  return CASTER_PROGRESSION_TO_FOUNDRY[progression] ?? "full";
}

function mapTools(
  current: Record<string, FoundryTool>,
  summary: CharacterSheetSummary,
): Record<string, FoundryTool> {
  const next = { ...current };
  for (const proficiency of summary.toolProficiencies) {
    const key = TOOL_TO_FOUNDRY[proficiency.toLowerCase()] ?? toFoundrySlug(proficiency);
    next[key] = {
      ...(next[key] ?? {}),
      ability: next[key]?.ability ?? "dex",
      value: 1,
    };
  }
  return next;
}

function mapTraits(
  current: Record<string, unknown>,
  summary: CharacterSheetSummary,
  projection: CharacterExportProjection,
): Record<string, unknown> {
  return {
    ...current,
    languages: {
      ...((current.languages as Record<string, unknown> | undefined) ?? {}),
      value: projection.proficiencies.languages.map(toFoundrySlug),
    },
    dr: mapTraitList(current.dr, projection.defenses.resistances),
    di: mapTraitList(current.di, projection.defenses.immunities),
    dv: mapTraitList(current.dv, projection.defenses.vulnerabilities),
    weaponProf: {
      ...((current.weaponProf as Record<string, unknown> | undefined) ?? {}),
      value: inferWeaponProficiencies(summary),
    },
    armorProf: {
      ...((current.armorProf as Record<string, unknown> | undefined) ?? {}),
      value: inferArmorProficiencies(summary),
    },
  };
}

function mapTraitList(current: unknown, values: string[]) {
  return {
    ...((current as Record<string, unknown> | undefined) ?? {}),
    value: values.map(toFoundrySlug),
  };
}

function createFoundryItems(
  state: CharacterBuilderState,
  summary: CharacterSheetSummary,
  context: FoundryExportContext,
): FoundryItemExport[] {
  const identity = createIdentityItems(state, summary);
  // summary.features already carries class, subclass, species, and origin-feat
  // features; re-adding selectedTraits/classFeatures would duplicate items.
  const featureItems = [
    ...summary.features.map((feature) => createSheetFeatureItem(feature)),
    ...Object.entries(summary.classFeatureChoices).map(([choiceId, values]) =>
      createFeatureItem(titleFromId(choiceId), values.join(", "), "class"),
    ),
  ];
  const inventoryItems = summary.inventory.map((entry) =>
    createInventoryItem(entry.item, entry.quantity, state.equippedItemIds.includes(entry.item.id), context),
  );
  const spellItems = createSpellItems(summary, context);

  const usedIds = new Set<string>();
  return [...identity, ...featureItems, ...inventoryItems, ...spellItems].map((item, index) => {
    let id = item._id;
    let salt = 0;
    while (usedIds.has(id)) {
      id = createFoundryId(`${item._id}:${++salt}`);
    }
    usedIds.add(id);
    return {
      ...item,
      _id: id,
      sort: index * 100000,
    };
  });
}

function createIdentityItems(
  state: CharacterBuilderState,
  summary: CharacterSheetSummary,
): FoundryItemExport[] {
  const identity = getIdentityItemIds(summary);
  return [
    createBaseItem({
      id: identity.class,
      name: summary.className || titleFromId(summary.classId),
      type: "class",
      img: "icons/svg/book.svg",
      system: {
        identifier: toIdentifier(summary.className || summary.classId),
        description: createDescription("Selected class."),
        source: createSource(),
        levels: summary.level,
        hd: { denomination: summary.hitDice.split("d")[1] ? `d${summary.hitDice.split("d")[1]}` : "d6", spent: 0, additional: "" },
        spellcasting: {
          progression: getFoundryCasterProgression(summary),
          ability: summary.spellcasting ? ATTRIBUTE_TO_FOUNDRY[summary.spellcasting.ability] : "",
          preparation: {},
        },
        advancement: [],
        startingEquipment: [],
        properties: [],
      },
    }),
    createBaseItem({
      id: identity.race,
      name: summary.speciesName || titleFromId(summary.speciesId),
      type: "race",
      img: "icons/svg/mystery-man.svg",
      system: {
        identifier: toIdentifier(summary.speciesName || summary.speciesId),
        description: createDescription("Selected species."),
        source: createSource(),
        movement: { walk: String(summary.speedFeet), units: "ft", hover: false, ignoredDifficultTerrain: [] },
        senses: {
          darkvision: getSenseRange(summary, "darkvision"),
          blindsight: getSenseRange(summary, "blindsight"),
          truesight: getSenseRange(summary, "truesight"),
          tremorsense: getSenseRange(summary, "tremorsense"),
          units: "ft",
          special: "",
        },
        type: { value: "humanoid", subtype: summary.speciesName, custom: "" },
        advancement: [],
      },
    }),
    createBaseItem({
      id: identity.background,
      name: summary.backgroundName || titleFromId(summary.backgroundId),
      type: "background",
      img: "icons/svg/book.svg",
      system: {
        identifier: toIdentifier(summary.backgroundName || summary.backgroundId),
        description: createDescription("Selected background."),
        source: createSource(),
        advancement: [],
        startingEquipment: [],
      },
    }),
    ...(state.selectedSubclassId
      ? [createBaseItem({
          id: createFoundryId(`subclass:${state.selectedSubclassId}`),
          name: titleFromId(state.selectedSubclassId) || "Subclass",
          type: "subclass" as const,
          img: "icons/svg/book.svg",
          system: {
            identifier: toIdentifier(state.selectedSubclassId),
            classIdentifier: toIdentifier(summary.className || summary.classId),
            description: createDescription("Selected subclass."),
            source: createSource(),
            advancement: [],
            spellcasting: { progression: "none", preparation: {} },
          },
        })]
      : []),
  ];
}

function getIdentityItemIds(summary: CharacterSheetSummary) {
  return {
    class: createFoundryId(`class:${summary.classId || summary.className}`),
    race: createFoundryId(`race:${summary.speciesId || summary.speciesName}`),
    background: createFoundryId(`background:${summary.backgroundId || summary.backgroundName}`),
  };
}

function createSheetFeatureItem(feature: SheetFeature): FoundryItemExport {
  return createFeatureItem(feature.name, feature.description, feature.source);
}

function createFeatureItem(
  name: string,
  description: string,
  source: "background" | "class" | "feat" | "race" | "species" | "custom",
): FoundryItemExport {
  const typeValue =
    source === "species" ? "race" : source === "custom" ? "feat" : source;
  return createBaseItem({
    id: createFoundryId(`feat:${typeValue}:${name}`),
    name,
    type: "feat",
    img: "icons/svg/aura.svg",
    system: {
      source: createSource(),
      description: createDescription(description),
      requirements: "",
      uses: { max: "", recovery: [], spent: 0 },
      type: { value: typeValue, subtype: "" },
      properties: [],
      advancement: [],
      activities: {},
      identifier: toIdentifier(name),
      crewed: false,
      enchant: {},
      prerequisites: { items: [], repeatable: false },
    },
  });
}

function createInventoryItem(
  item: BuilderEquipmentOption,
  quantity: number,
  equipped: boolean,
  context: FoundryExportContext,
): FoundryItemExport {
  const data = createFoundryEquipmentData(item, context);
  const foundryItem = data.item;

  if (foundryItem.type === "weapon" || foundryItem.category === "Weapon") {
    return createWeaponItem(data, quantity, equipped);
  }
  if (foundryItem.type === "tool") {
    return createToolItem(data, quantity);
  }
  if (foundryItem.type === "consumable" || foundryItem.category === "Potion") {
    return createConsumableItem(data, quantity);
  }
  if (foundryItem.type === "pack") {
    return createContainerItem(data, quantity, equipped);
  }
  if (foundryItem.type === "armor" || foundryItem.type === "shield" || foundryItem.category === "Armor") {
    return createEquipmentItem(data, quantity, equipped);
  }
  return createLootItem(data, quantity);
}

function createWeaponItem(
  data: FoundryEquipmentExportData,
  quantity: number,
  equipped: boolean,
): FoundryItemExport {
  const item = data.item;
  const damage = parseDamage(item.damageDice, item.damageType);
  return createBaseItem({
    id: createFoundryId(`weapon:${item.id}`),
    name: item.name,
    type: "weapon",
    img: createFoundryImage("items", item.name, data.imageSource, "icons/svg/sword.svg"),
    system: {
      ...createPhysicalItemSystem(item, quantity, equipped),
      cover: null,
      range: parseRange(item.range, item.weaponRangeType),
      uses: { max: "", recovery: [], spent: 0 },
      damage: {
        base: {
          number: damage.number,
          denomination: damage.denomination,
          bonus: "",
          types: damage.types,
          custom: { enabled: false, formula: "" },
          scaling: { mode: "", number: null, formula: "" },
        },
        versatile: {
          number: item.weaponProperties?.includes("V") ? damage.number : null,
          denomination: item.weaponProperties?.includes("V") ? damage.denomination + 2 : null,
          bonus: "",
          types: damage.types,
          custom: { enabled: false, formula: "" },
          scaling: { mode: "", number: null, formula: "" },
        },
      },
      armor: { value: null },
      properties: mapWeaponProperties(item.weaponProperties),
      proficient: 1,
      type: { value: mapWeaponType(item), baseItem: toIdentifier(item.name) },
      magicalBonus: null,
      activities: createWeaponActivities(item, damage),
      ammunition: {},
      mastery: "",
    },
  });
}

function createEquipmentItem(
  data: FoundryEquipmentExportData,
  quantity: number,
  equipped: boolean,
): FoundryItemExport {
  const item = data.item;
  return createBaseItem({
    id: createFoundryId(`equipment:${item.id}`),
    name: item.name,
    type: "equipment",
    img: createFoundryImage("items", item.name, data.imageSource, "icons/svg/shield.svg"),
    system: {
      ...createPhysicalItemSystem(item, quantity, equipped),
      cover: null,
      uses: { max: "", recovery: [], spent: 0 },
      armor: {
        value: item.armor?.baseAC ?? item.armorClass ?? null,
        dex: item.armor?.maxDexBonus ?? null,
        magicalBonus: null,
      },
      hp: { value: 0, max: 0, dt: null, conditions: "" },
      speed: { value: null, conditions: "", units: "ft" },
      strength: item.armor?.strengthMin ?? null,
      proficient: null,
      type: { value: item.armorType ?? item.type ?? "trinket", baseItem: toIdentifier(item.name) },
      properties: item.armor?.stealthDisadvantage ? ["stealthDisadvantage"] : [],
      activities: {},
      crew: { value: [] },
    },
  });
}

function createToolItem(data: FoundryEquipmentExportData, quantity: number): FoundryItemExport {
  const item = data.item;
  const baseItem = TOOL_TO_FOUNDRY[item.name.toLowerCase()] ?? toIdentifier(item.name);
  return createBaseItem({
    id: createFoundryId(`tool:${item.id}`),
    name: item.name,
    type: "tool",
    img: createFoundryImage("items", item.name, data.imageSource, "icons/svg/tools.svg"),
    system: {
      ...createPhysicalItemSystem(item, quantity, false),
      type: { value: "art", baseItem },
      properties: [],
      uses: { spent: 0, recovery: [] },
      ability: "dex",
      chatFlavor: "",
    },
  });
}

function createConsumableItem(data: FoundryEquipmentExportData, quantity: number): FoundryItemExport {
  const item = data.item;
  return createBaseItem({
    id: createFoundryId(`consumable:${item.id}`),
    name: item.name,
    type: "consumable",
    img: createFoundryImage("items", item.name, data.imageSource, "icons/svg/potion.svg"),
    system: {
      ...createPhysicalItemSystem(item, quantity, false),
      type: { value: item.category === "Potion" ? "potion" : "", subtype: "" },
      properties: [],
      uses: { max: String(quantity), spent: 0, recovery: [], autoDestroy: false },
      magicalBonus: 0,
      damage: {
        base: { types: [], custom: { enabled: false, formula: "" }, scaling: { mode: "", number: null, formula: "" } },
        replace: false,
      },
      activities: createConsumableActivities(item),
    },
  });
}

function createContainerItem(
  data: FoundryEquipmentExportData,
  quantity: number,
  equipped: boolean,
): FoundryItemExport {
  const item = data.item;
  return createBaseItem({
    id: createFoundryId(`container:${item.id}`),
    name: item.name,
    type: "container",
    img: createFoundryImage("items", item.name, data.imageSource, "icons/svg/chest.svg"),
    system: {
      ...createPhysicalItemSystem(item, quantity, equipped),
      capacity: {
        count: null,
        weight: { value: null, units: "lb" },
        volume: { value: null, units: "ft3" },
      },
      properties: [],
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    },
  });
}

function createLootItem(data: FoundryEquipmentExportData, quantity: number): FoundryItemExport {
  const item = data.item;
  return createBaseItem({
    id: createFoundryId(`loot:${item.id}`),
    name: item.name,
    type: "loot",
    img: createFoundryImage("items", item.name, data.imageSource, "icons/svg/item-bag.svg"),
    system: {
      source: createSource(item.source),
      description: createDescription(createEquipmentDescription(item)),
      quantity,
      weight: { value: kgToLb(item.weightKg), units: "lb" },
      price: createPrice(item.value),
      identified: true,
      rarity: "",
      type: { value: "gear", subtype: "" },
      properties: [],
      identifier: toIdentifier(item.name),
      unidentified: { description: "" },
      container: null,
    },
  });
}

function createPhysicalItemSystem(
  item: BuilderEquipmentOption,
  quantity: number,
  equipped: boolean,
) {
  return {
    source: createSource(item.source),
    description: createDescription(createEquipmentDescription(item)),
    quantity,
    weight: { value: kgToLb(item.weightKg), units: "lb" },
    price: createPrice(item.value),
    attunement: "",
    equipped,
    rarity: "",
    identified: true,
    unidentified: { description: "" },
    container: null,
    attuned: false,
    identifier: toIdentifier(item.name),
  };
}

interface FoundryEquipmentExportData {
  item: BuilderEquipmentOption;
  imageSource?: string;
}

function createFoundryEquipmentData(
  item: BuilderEquipmentOption,
  context: FoundryExportContext,
): FoundryEquipmentExportData {
  const catalogItem = findCatalogItemForFoundry(item, context);
  const shouldUseCatalogIdentity = Boolean(
    catalogItem && isLegacySource(item.source) && isModernRulesSource(catalogItem.source),
  );
  const foundryItem = catalogItem
    ? mergeEquipmentWithCatalog(item, catalogItem, {
        useCatalogIdentity: shouldUseCatalogIdentity,
      })
    : item;

  return {
    item: foundryItem,
    imageSource: resolveEquipmentImageSource(item, catalogItem, foundryItem, shouldUseCatalogIdentity),
  };
}

function resolveEquipmentImageSource(
  originalItem: BuilderEquipmentOption,
  catalogItem: CatalogItem | undefined,
  foundryItem: BuilderEquipmentOption,
  useCatalogIdentity: boolean,
): string | undefined {
  if (useCatalogIdentity) {
    return foundryItem.hasFluffImages ? foundryItem.source : undefined;
  }
  if (originalItem.hasFluffImages) {
    return originalItem.source;
  }
  return catalogItem?.hasFluffImages ? catalogItem.source : undefined;
}

function findCatalogItemForFoundry(
  item: BuilderEquipmentOption,
  context: FoundryExportContext,
): CatalogItem | undefined {
  const lookup = getItemLookup(context);
  const sameNameItems = lookup.byName.get(item.name.toLowerCase()) ?? [];
  const preferred2024 = sameNameItems.find((entry) => entry.source === "XPHB")
    ?? sameNameItems.find((entry) => entry.source === "XDMG");

  if (item.source.toUpperCase() === "PHB") {
    return preferred2024 ?? sameNameItems[0];
  }

  return lookup.byId.get(item.id)
    ?? sameNameItems.find((entry) => entry.source === item.source)
    ?? preferred2024
    ?? sameNameItems[0];
}

function mergeEquipmentWithCatalog(
  item: BuilderEquipmentOption,
  catalogItem: CatalogItem,
  options: { useCatalogIdentity?: boolean } = {},
): BuilderEquipmentOption {
  return {
    ...item,
    id: options.useCatalogIdentity ? catalogItem.id : item.id,
    source: options.useCatalogIdentity ? catalogItem.source : item.source || catalogItem.source,
    category: item.category ?? catalogItem.category,
    type: item.type ?? catalogItem.type,
    detail: preferDetailedText(item.detail, catalogItem.detail),
    hasFluffImages: item.hasFluffImages ?? catalogItem.hasFluffImages,
    rarity: item.rarity ?? catalogItem.rarity,
    isMagical: item.isMagical ?? catalogItem.isMagical,
    isCommon: item.isCommon ?? catalogItem.isCommon,
    isContainer: item.isContainer ?? catalogItem.isContainer,
    weightKg: item.weightKg ?? catalogItem.weightKg,
    armorClass: item.armorClass ?? catalogItem.armorClass,
    armorClassBonus: item.armorClassBonus ?? catalogItem.armorClassBonus,
    armorType: item.armorType ?? catalogItem.armorType,
    armor: item.armor ?? catalogItem.armor,
    shieldBonus: item.shieldBonus ?? catalogItem.shieldBonus,
    savingThrowBonus: item.savingThrowBonus ?? catalogItem.savingThrowBonus,
    weaponBonus: item.weaponBonus ?? catalogItem.weaponBonus,
    resistances: item.resistances ?? catalogItem.resistances,
    attunementRequired: item.attunementRequired ?? catalogItem.attunementRequired,
    weaponCategory: item.weaponCategory ?? catalogItem.weaponCategory,
    weaponRangeType: item.weaponRangeType ?? catalogItem.weaponRangeType,
    weaponProperties: item.weaponProperties ?? catalogItem.weaponProperties,
    damageDice: item.damageDice ?? catalogItem.damageDice,
    damageType: item.damageType ?? catalogItem.damageType,
    range: item.range ?? catalogItem.range,
    value: item.value ?? catalogItem.value,
  };
}

function createEquipmentDescription(item: BuilderEquipmentOption): string {
  if (item.detail?.trim()) {
    return item.detail;
  }

  const details = [`${item.name} (${item.category}).`];
  if (item.armorClass ?? item.armor?.baseAC) {
    details.push(`Armor Class ${item.armor?.baseAC ?? item.armorClass}.`);
  }
  if (item.armor?.strengthMin) {
    details.push(`Strength ${item.armor.strengthMin} required.`);
  }
  if (item.armor?.stealthDisadvantage) {
    details.push("Imposes disadvantage on Stealth checks.");
  }
  if (item.damageDice) {
    const damageType = item.damageType ? (DAMAGE_TYPES[item.damageType] ?? item.damageType) : "";
    details.push(`Damage ${item.damageDice}${damageType ? ` ${damageType}` : ""}.`);
  }
  if (item.range) {
    details.push(`Range ${item.range} feet.`);
  }
  if (item.weaponCategory || item.weaponRangeType) {
    details.push(
      [
        item.weaponCategory ? `${item.weaponCategory} weapon` : "Weapon",
        item.weaponRangeType ? item.weaponRangeType : "",
      ].filter(Boolean).join(", ") + ".",
    );
  }
  if (item.weaponProperties?.length) {
    details.push(`Properties ${item.weaponProperties.join(", ")}.`);
  }
  if (item.rarity && item.rarity !== "none") {
    details.push(`Rarity ${item.rarity}.`);
  }

  return details.join(" ");
}

function createWeaponActivities(
  item: BuilderEquipmentOption,
  damage: ReturnType<typeof parseDamage>,
): Record<string, unknown> {
  const id = createFoundryId(`activity:weapon:${item.id}:attack`);
  const range = parseRange(item.range, item.weaponRangeType);
  return {
    [id]: {
      _id: id,
      type: "attack",
      name: "Attack",
      activation: { type: "action", value: 1, condition: "", override: false },
      consumption: {
        targets: [],
        scaling: { allowed: false, max: "" },
        spellSlot: false,
      },
      description: { chatFlavor: "" },
      duration: { units: "inst", concentration: false, override: false },
      effects: [],
      range: { ...range, special: "", override: false },
      target: createActivityTarget({ count: "1", type: "creature" }),
      attack: {
        ability: "",
        bonus: "",
        critical: { threshold: null },
        flat: false,
        type: {
          value: item.weaponRangeType === "ranged" ? "ranged" : "melee",
          classification: "weapon",
        },
      },
      damage: {
        critical: { bonus: "" },
        includeBase: true,
        parts: [{
          number: damage.number,
          denomination: damage.denomination,
          bonus: "",
          types: damage.types,
          custom: { enabled: false, formula: "" },
          scaling: { mode: "", number: null, formula: "" },
        }],
      },
      uses: { spent: 0, recovery: [] },
      sort: 0,
      flags: {},
      visibility: {
        level: {},
        requireAttunement: false,
        requireIdentification: false,
        requireMagic: false,
      },
    },
  };
}

function createConsumableActivities(item: BuilderEquipmentOption): Record<string, unknown> {
  if (item.type !== "consumable" && item.category !== "Potion") {
    return {};
  }

  const id = createFoundryId(`activity:consumable:${item.id}:use`);
  const isHealing = item.name.toLowerCase().includes("healing") || item.detail?.toLowerCase().includes("hit points");
  return {
    [id]: {
      _id: id,
      type: "utility",
      name: "Use",
      activation: {
        type: item.detail?.toLowerCase().includes("bonus action") ? "bonus" : "action",
        value: 1,
        condition: "",
        override: false,
      },
      consumption: {
        targets: [{ type: "itemUses", target: "", value: "1", scaling: { mode: "", formula: "" } }],
        scaling: { allowed: false, max: "" },
        spellSlot: false,
      },
      description: {},
      duration: { units: "inst", concentration: false, override: false },
      effects: [],
      range: { value: isHealing ? "5" : "", units: isHealing ? "ft" : "self", special: "", override: false },
      target: createActivityTarget({ count: isHealing ? "1" : "", type: isHealing ? "creature" : "" }),
      uses: { spent: 0, recovery: [] },
      sort: 0,
      flags: {},
      visibility: {
        level: {},
        requireAttunement: false,
        requireIdentification: false,
        requireMagic: false,
      },
    },
  };
}

function createSpellItems(
  summary: CharacterSheetSummary,
  context: FoundryExportContext,
): FoundryItemExport[] {
  const spells = new Map<string, { spell: BuilderSpell; prepared: number }>();

  for (const spell of summary.spellcasting?.cantrips ?? []) {
    spells.set(spell.id, { spell, prepared: 2 });
  }
  for (const spell of summary.spellcasting?.knownSpells ?? []) {
    spells.set(spell.id, { spell, prepared: 0 });
  }
  for (const spell of summary.spellcasting?.preparedSpells ?? []) {
    spells.set(spell.id, { spell, prepared: 2 });
  }

  return [...spells.values()].map(({ spell, prepared }) =>
    createSpellItem(spell, prepared, summary, context),
  );
}

function createSpellItem(
  spell: BuilderSpell,
  prepared: number,
  summary: CharacterSheetSummary,
  context: FoundryExportContext,
): FoundryItemExport {
  const foundrySpell = createFoundrySpellData(spell, context);
  const target = parseSpellTarget(foundrySpell);
  return createBaseItem({
    id: createFoundryId(`spell:${foundrySpell.id}`),
    name: foundrySpell.name,
    type: "spell",
    img: createFoundryImage("spells", foundrySpell.name, foundrySpell.imageSource, "icons/svg/spell.svg"),
    system: {
      source: createSource(foundrySpell.source),
      description: createDescription(foundrySpell.description),
      level: foundrySpell.level,
      school: toFoundrySpellSchool(foundrySpell),
      properties: parseSpellProperties(foundrySpell.components, foundrySpell.duration),
      ability: summary.spellcasting ? ATTRIBUTE_TO_FOUNDRY[summary.spellcasting.ability] : "",
      materials: { value: parseMaterialComponent(foundrySpell.components), consumed: false, cost: 0, supply: 0 },
      target,
      range: parseSpellRange(foundrySpell.range),
      activation: parseActivation(foundrySpell.castingTime),
      duration: parseDuration(foundrySpell.duration),
      uses: { max: "", recovery: [], spent: 0 },
      method: "spell",
      prepared,
      sourceClass: toIdentifier(summary.className),
      identifier: toIdentifier(foundrySpell.name),
      activities: createSpellActivities(foundrySpell, target),
    },
  });
}

type FoundrySpellExportData = BuilderSpell & {
  imageSource?: string;
};

function createFoundrySpellData(
  spell: BuilderSpell,
  context: FoundryExportContext,
): FoundrySpellExportData {
  const catalogSpell = findSpellForFoundry(spell, context);
  const shouldUseCatalogIdentity = spell.source.toUpperCase() === "PHB" && catalogSpell?.source === "XPHB";
  const mergedSpell = catalogSpell
    ? {
        ...catalogSpell,
        ...spell,
        id: shouldUseCatalogIdentity ? catalogSpell.id : spell.id,
        source: shouldUseCatalogIdentity ? catalogSpell.source : spell.source,
        description: preferDetailedText(spell.description, catalogSpell.description) ?? spell.description,
        hasFluffImages: spell.hasFluffImages ?? catalogSpell.hasFluffImages,
      }
    : spell;

  return {
    ...mergedSpell,
    imageSource: mergedSpell.hasFluffImages ? mergedSpell.source : undefined,
  };
}

function findSpellForFoundry(
  spell: BuilderSpell,
  context: FoundryExportContext,
): BuilderSpell | undefined {
  const lookup = getSpellLookup(context);
  const exact = lookup.byId.get(spell.id);
  const sameName = lookup.byName.get(spell.name.toLowerCase()) ?? [];
  const xphb = sameName.find((entry) => entry.source === "XPHB");

  if (spell.source.toUpperCase() === "PHB") {
    return xphb ?? exact ?? sameName[0];
  }

  return exact
    ?? sameName.find((entry) => entry.source === spell.source)
    ?? xphb
    ?? sameName[0];
}

function createSpellActivities(
  spell: BuilderSpell,
  target: ReturnType<typeof parseSpellTarget>,
): Record<string, unknown> {
  const id = createFoundryId(`activity:spell:${spell.id}:cast`);
  const duration = parseDuration(spell.duration);
  const activation = parseActivation(spell.castingTime);
  return {
    [id]: {
      _id: id,
      type: "utility",
      name: "Cast",
      activation: { ...activation, override: false },
      consumption: {
        scaling: { allowed: false },
        spellSlot: spell.level > 0,
        targets: [],
      },
      description: {},
      duration: {
        ...duration,
        concentration: spell.duration.toLowerCase().includes("concentration"),
        override: false,
      },
      effects: [],
      range: { ...parseSpellRange(spell.range), override: false },
      target: createActivityTarget({
        count: target.affects.count,
        type: target.affects.type,
        special: target.affects.special,
        template: target.template,
      }),
      uses: { spent: 0, recovery: [] },
      roll: { prompt: false, visible: false },
      sort: 0,
      flags: {},
      img: "systems/dnd5e/icons/svg/activity/cast.svg",
      visibility: {
        level: {},
        requireAttunement: false,
        requireIdentification: false,
        requireMagic: false,
      },
    },
  };
}

function createBaseItem(input: {
  id: string;
  name: string;
  type: FoundryItemType;
  img: string;
  system: Record<string, unknown>;
}): FoundryItemExport {
  return {
    _id: input.id,
    name: input.name,
    type: input.type,
    img: input.img,
    system: input.system,
    effects: [],
    folder: null,
    flags: {},
    sort: 0,
    ownership: {
      default: 0,
    },
  };
}

function createDescription(value: string) {
  return {
    value: toFoundryDescriptionHtml(value),
    chat: "",
  };
}

function createSource(source?: string) {
  const normalizedSource = source?.toUpperCase() ?? "";
  return {
    custom: FOUNDRY_SOURCE,
    book: SOURCE_BOOK_NAMES[normalizedSource] ?? source ?? "",
    page: "",
    license: "",
    rules: normalizedSource === "PHB" ? "2014" : "2024",
    revision: 1,
  };
}

function createFoundryImage(
  folder: "items" | "spells",
  name: string,
  source: string | undefined,
  fallback: string,
): string {
  if (!source) {
    return fallback;
  }

  return `${FIVEETOOLS_IMAGE_BASE_URL}${folder}/${encodeURIComponent(source)}/${encodeURIComponent(`${name}.webp`)}`;
}

function toFoundryDescriptionHtml(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function preferDetailedText(first: string | undefined, second: string | undefined): string | undefined {
  const firstText = first?.trim() ?? "";
  const secondText = second?.trim() ?? "";
  if (!firstText) return secondText || undefined;
  if (!secondText) return firstText;
  return secondText.length > firstText.length ? secondText : firstText;
}

function isLegacySource(source?: string): boolean {
  return source?.toUpperCase() === "PHB";
}

function isModernRulesSource(source?: string): boolean {
  return source === "XPHB" || source === "XDMG";
}

function createBiography(state: CharacterBuilderState): string {
  const fields = [
    state.description.aparencia,
    state.description.personalidade,
    state.description.tracos,
    state.description.notas,
  ].filter((value) => value.trim().length > 0);

  return fields.join("\n\n");
}

function getSenseRange(summary: CharacterSheetSummary, sense: string): number | null {
  return summary.senses.find((entry) => entry.name.toLowerCase() === sense)?.rangeFeet ?? null;
}

function inferWeaponProficiencies(summary: CharacterSheetSummary): string[] {
  const values = new Set<string>();
  for (const weapon of summary.selectedEquipment) {
    if (weapon.category !== "Weapon") continue;
    const category = weapon.weaponCategory?.toLowerCase();
    if (category === "simple") values.add("sim");
    if (category === "martial") values.add("mar");
  }
  return [...values];
}

function inferArmorProficiencies(summary: CharacterSheetSummary): string[] {
  const values = new Set<string>();
  for (const item of summary.selectedEquipment) {
    if (item.armorType === "light") values.add("lgt");
    if (item.armorType === "medium") values.add("med");
    if (item.armorType === "heavy") values.add("hvy");
    if (item.armorType === "shield" || item.type === "shield") values.add("shl");
  }
  return [...values];
}

function mapWeaponType(item: BuilderEquipmentOption): string {
  const category = item.weaponCategory?.toLowerCase() === "martial" ? "martial" : "simple";
  const range = item.weaponRangeType === "ranged" ? "R" : "M";
  return `${category}${range}`;
}

function mapWeaponProperties(properties: string[] | undefined): string[] {
  const propertyMap: Record<string, string> = {
    A: "amm",
    F: "fin",
    H: "hvy",
    L: "lgt",
    T: "thr",
    V: "ver",
    "2H": "two",
  };
  return (properties ?? []).map((property) => propertyMap[property] ?? property.toLowerCase());
}

function parseDamage(dice: string | undefined, type: string | undefined) {
  const match = dice?.match(/(\d+)d(\d+)/i);
  return {
    number: match ? Number(match[1]) : null,
    denomination: match ? Number(match[2]) : 0,
    types: type ? [DAMAGE_TYPES[type] ?? type.toLowerCase()] : [],
  };
}

function parseRange(range: string | undefined, rangeType: BuilderEquipmentOption["weaponRangeType"]) {
  const [value, long] = (range ?? "").match(/\d+/g) ?? [];
  return {
    value: value ? Number(value) : rangeType === "melee" ? 5 : null,
    long: long ? Number(long) : 0,
    units: "ft",
  };
}

function parseSpellRange(range: string) {
  const normalized = range.toLowerCase();
  if (normalized.includes("self")) return { value: "", units: "self", special: "" };
  if (normalized.includes("touch")) return { value: "0", units: "touch", special: "" };
  const value = normalized.match(/\d+/)?.[0] ?? "";
  return { value, units: normalized.includes("mile") ? "mi" : "ft", special: "" };
}

function parseSpellTarget(spell: BuilderSpell) {
  const text = spell.description.toLowerCase();
  const template = parseSpellTemplate(text);
  const isSelfOnly = spell.range.toLowerCase().includes("self") && !template.type;
  const affectsType = isSelfOnly ? "" : inferSpellAffectsType(text);

  return {
    template: {
      count: "",
      contiguous: false,
      type: template.type,
      size: template.size,
      width: "",
      height: "",
      units: template.type ? "ft" : "",
    },
    affects: {
      count: isSelfOnly ? "" : inferSpellAffectsCount(text),
      type: affectsType,
      choice: false,
      special: isSelfOnly ? "Self" : affectsType ? "" : inferSpellSpecialTarget(spell),
    },
  };
}

function createActivityTarget(input: {
  count?: string;
  type?: string;
  special?: string;
  template?: {
    count?: string;
    contiguous?: boolean;
    type?: string;
    size?: string;
    width?: string;
    height?: string;
    units?: string;
  };
}) {
  return {
    template: {
      count: input.template?.count ?? "",
      contiguous: input.template?.contiguous ?? false,
      type: input.template?.type ?? "",
      size: input.template?.size ?? "",
      width: input.template?.width ?? "",
      height: input.template?.height ?? "",
      units: input.template?.units ?? "ft",
    },
    affects: {
      count: input.count ?? "",
      type: input.type ?? "",
      choice: false,
      special: input.special ?? "",
    },
    prompt: true,
    override: false,
  };
}

function parseSpellTemplate(text: string): { type: string; size: string } {
  const shapePatterns: Array<[string, RegExp]> = [
    ["cone", /(\d+)-foot\s+cone/],
    ["cube", /(\d+)-foot\s+cube/],
    ["cylinder", /(\d+)-foot(?:-[a-z]+)?\s+cylinder/],
    ["sphere", /(\d+)-foot(?:-[a-z]+)?\s+sphere/],
    ["emanation", /(\d+)-foot(?:-[a-z]+)?\s+emanation/],
    ["line", /(\d+)-foot(?:-[a-z]+)?\s+line/],
  ];

  for (const [type, pattern] of shapePatterns) {
    const match = text.match(pattern);
    if (match) {
      return { type, size: match[1] };
    }
  }

  return { type: "", size: "" };
}

function inferSpellAffectsCount(text: string): string {
  if (/\b(up to )?three\b/.test(text)) return "3";
  if (/\b(up to )?two\b/.test(text)) return "2";
  if (/\bone(?:\s+\w+){0,4}\s+(creature|object|humanoid|beast)\b/.test(text)) return "1";
  if (/\b(one|a|the target)\s+(creature|object|humanoid|beast)\b/.test(text)) return "1";
  return "";
}

function inferSpellAffectsType(text: string): string {
  if (text.includes("creature") || text.includes("humanoid") || text.includes("beast")) {
    return "creature";
  }
  if (text.includes("object")) {
    return "object";
  }
  return "";
}

function inferSpellSpecialTarget(spell: BuilderSpell): string {
  if (spell.range.toLowerCase().includes("self")) {
    return "Self";
  }
  if (spell.range.toLowerCase().includes("touch")) {
    return "Touched target";
  }
  return "";
}

function parseActivation(castingTime: string) {
  const normalized = castingTime.toLowerCase();
  if (normalized.includes("reaction")) return { type: "reaction", value: 1, condition: "" };
  if (normalized.includes("bonus")) return { type: "bonus", value: 1, condition: "" };
  if (normalized.includes("minute")) return { type: "minute", value: Number(normalized.match(/\d+/)?.[0] ?? 1), condition: "" };
  if (normalized.includes("hour")) return { type: "hour", value: Number(normalized.match(/\d+/)?.[0] ?? 1), condition: "" };
  return { type: "action", value: 1, condition: "" };
}

function parseDuration(duration: string) {
  const normalized = duration.toLowerCase();
  if (normalized.includes("instant")) return { value: "", units: "inst" };
  if (normalized.includes("round")) return { value: normalized.match(/\d+/)?.[0] ?? "1", units: "round" };
  if (normalized.includes("minute")) return { value: normalized.match(/\d+/)?.[0] ?? "1", units: "minute" };
  if (normalized.includes("hour")) return { value: normalized.match(/\d+/)?.[0] ?? "1", units: "hour" };
  return { value: "", units: "" };
}

function parseSpellProperties(components: string, duration: string): string[] {
  const normalized = components.toLowerCase();
  return [
    normalized.includes("v") ? "vocal" : undefined,
    normalized.includes("s") ? "somatic" : undefined,
    normalized.includes("m") ? "material" : undefined,
    duration.toLowerCase().includes("concentration") ? "concentration" : undefined,
  ].filter((property): property is string => Boolean(property));
}

function parseMaterialComponent(components: string): string {
  const match = components.match(/\((.+)\)/);
  return match?.[1] ?? "";
}

function createPrice(copperValue: number | undefined) {
  if (!copperValue) return { value: 0, denomination: "gp" };
  if (copperValue % 100 === 0) return { value: copperValue / 100, denomination: "gp" };
  if (copperValue % 10 === 0) return { value: copperValue / 10, denomination: "sp" };
  return { value: copperValue, denomination: "cp" };
}

function kgToLb(value: number | undefined): number {
  return value ? Math.round(value * 2.20462 * 10) / 10 : 0;
}

function toFoundrySlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function toIdentifier(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleFromId(id: string): string {
  const [name] = id.split("-xphb");
  return name
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function toFoundrySpellSchool(spell: BuilderSpell): string {
  const code = spell.schoolCode ?? "";
  const mapped = SPELL_SCHOOL_CODES[code.toUpperCase()];
  if (mapped) return mapped;
  if (/^[a-z]{3}$/i.test(code)) return code.toLowerCase();
  return SPELL_SCHOOL_BY_NAME[spell.school.toLowerCase()] ?? "";
}

// Deterministic 16-char alphanumeric id derived from the full input string,
// so long names that share a prefix cannot collide.
function createFoundryId(value: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0xcbf29ce4;
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    h1 = Math.imul(h1 ^ code, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ code, 0x85ebca6b) >>> 0;
  }
  return `${h1.toString(36)}${h2.toString(36)}`.padEnd(16, "0").slice(0, 16);
}
