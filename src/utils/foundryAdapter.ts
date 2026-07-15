import foundryReference from "@/src/_references/foundry-reference.json";
import { getBuilderClasses } from "@/src/services/ruleService";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import type {
  BuilderEquipmentOption,
  CharacterSheetSummary,
  SheetFeature,
} from "@/types/builder";
import type { AttributeKey } from "@/types/dnd";
import type { BuilderSpell } from "@/types/spells";

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
): FoundryActorExport {
  const actor = cloneReference();
  const characterName = state.description.nome.trim() || summary.name.trim() || "Character";
  const items = createFoundryItems(state, summary);
  const identity = getIdentityItemIds(summary);

  actor.name = characterName;
  actor.type = "character";
  actor.items = items;
  actor.effects = [];
  actor.folder = null;
  actor.prototypeToken = {
    ...(actor.prototypeToken ?? {}),
    name: characterName,
  };

  actor.system.abilities = mapAbilities(actor.system.abilities, summary);
  actor.system.attributes = mapAttributes(actor.system.attributes, summary);
  actor.system.currency = mapCurrency(summary);
  actor.system.details = mapDetails(actor.system.details, state, summary, identity);
  actor.system.skills = mapSkills(actor.system.skills ?? {}, summary);
  actor.system.spells = mapSpellSlots(
    actor.system.spells,
    summary,
    getFoundryCasterProgression(summary) === "pact",
  );
  actor.system.tools = mapTools(actor.system.tools ?? {}, summary);
  actor.system.traits = mapTraits(actor.system.traits ?? {}, summary);

  return actor;
}

function cloneReference(): FoundryActorExport {
  return JSON.parse(JSON.stringify(foundryReference)) as FoundryActorExport;
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
): FoundryCharacterSystem["attributes"] {
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
    senses: {
      ...(current.senses as Record<string, unknown> | undefined),
      darkvision: getSenseRange(summary, "darkvision"),
      blindsight: getSenseRange(summary, "blindsight"),
      tremorsense: getSenseRange(summary, "tremorsense"),
      truesight: getSenseRange(summary, "truesight"),
      units: "ft",
      special: summary.senses
        .filter((sense) => !sense.rangeFeet)
        .map((sense) => sense.name)
        .join(", "),
    },
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
): Record<string, unknown> {
  return {
    ...current,
    languages: {
      ...((current.languages as Record<string, unknown> | undefined) ?? {}),
      value: summary.languages.map(toFoundrySlug),
    },
    dr: mapTraitList(current.dr, summary.resistances),
    di: mapTraitList(current.di, summary.immunities),
    dv: mapTraitList(current.dv, summary.vulnerabilities),
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
    createInventoryItem(entry.item, entry.quantity, state.equippedItemIds.includes(entry.item.id)),
  );
  const spellItems = createSpellItems(summary);

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
  source: "background" | "class" | "feat" | "race" | "species",
): FoundryItemExport {
  const typeValue = source === "species" ? "race" : source;
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
): FoundryItemExport {
  if (item.type === "weapon" || item.category === "Weapon") {
    return createWeaponItem(item, quantity, equipped);
  }
  if (item.type === "tool") {
    return createToolItem(item, quantity);
  }
  if (item.type === "consumable" || item.category === "Potion") {
    return createConsumableItem(item, quantity);
  }
  if (item.type === "pack") {
    return createContainerItem(item, quantity, equipped);
  }
  if (item.type === "armor" || item.type === "shield" || item.category === "Armor") {
    return createEquipmentItem(item, quantity, equipped);
  }
  return createLootItem(item, quantity);
}

function createWeaponItem(
  item: BuilderEquipmentOption,
  quantity: number,
  equipped: boolean,
): FoundryItemExport {
  const damage = parseDamage(item.damageDice, item.damageType);
  return createBaseItem({
    id: createFoundryId(`weapon:${item.id}`),
    name: item.name,
    type: "weapon",
    img: "icons/svg/sword.svg",
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
      activities: {},
      ammunition: {},
      mastery: "",
    },
  });
}

function createEquipmentItem(
  item: BuilderEquipmentOption,
  quantity: number,
  equipped: boolean,
): FoundryItemExport {
  return createBaseItem({
    id: createFoundryId(`equipment:${item.id}`),
    name: item.name,
    type: "equipment",
    img: "icons/svg/shield.svg",
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

function createToolItem(item: BuilderEquipmentOption, quantity: number): FoundryItemExport {
  const baseItem = TOOL_TO_FOUNDRY[item.name.toLowerCase()] ?? toIdentifier(item.name);
  return createBaseItem({
    id: createFoundryId(`tool:${item.id}`),
    name: item.name,
    type: "tool",
    img: "icons/svg/tools.svg",
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

function createConsumableItem(item: BuilderEquipmentOption, quantity: number): FoundryItemExport {
  return createBaseItem({
    id: createFoundryId(`consumable:${item.id}`),
    name: item.name,
    type: "consumable",
    img: "icons/svg/potion.svg",
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
    },
  });
}

function createContainerItem(
  item: BuilderEquipmentOption,
  quantity: number,
  equipped: boolean,
): FoundryItemExport {
  return createBaseItem({
    id: createFoundryId(`container:${item.id}`),
    name: item.name,
    type: "container",
    img: "icons/svg/chest.svg",
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

function createLootItem(item: BuilderEquipmentOption, quantity: number): FoundryItemExport {
  return createBaseItem({
    id: createFoundryId(`loot:${item.id}`),
    name: item.name,
    type: "loot",
    img: "icons/svg/item-bag.svg",
    system: {
      source: createSource(item.source),
      description: createDescription(""),
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
    description: createDescription(""),
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

function createSpellItems(summary: CharacterSheetSummary): FoundryItemExport[] {
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

  return [...spells.values()].map(({ spell, prepared }) => createSpellItem(spell, prepared, summary));
}

function createSpellItem(
  spell: BuilderSpell,
  prepared: number,
  summary: CharacterSheetSummary,
): FoundryItemExport {
  return createBaseItem({
    id: createFoundryId(`spell:${spell.id}`),
    name: spell.name,
    type: "spell",
    img: "icons/svg/spell.svg",
    system: {
      source: createSource(spell.source),
      description: createDescription(spell.description),
      level: spell.level,
      school: toFoundrySpellSchool(spell),
      properties: parseSpellProperties(spell.components, spell.duration),
      ability: summary.spellcasting ? ATTRIBUTE_TO_FOUNDRY[summary.spellcasting.ability] : "",
      materials: { value: parseMaterialComponent(spell.components), consumed: false, cost: 0, supply: 0 },
      target: { template: { count: "", contiguous: false, type: "", size: "", width: "", height: "", units: "" }, affects: { count: "", type: "", choice: false, special: "" } },
      range: parseSpellRange(spell.range),
      activation: parseActivation(spell.castingTime),
      duration: parseDuration(spell.duration),
      uses: { max: "", recovery: [], spent: 0 },
      method: "spell",
      prepared,
      sourceClass: toIdentifier(summary.className),
      identifier: toIdentifier(spell.name),
      activities: {},
    },
  });
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
    value,
    chat: "",
  };
}

function createSource(source?: string) {
  return {
    custom: FOUNDRY_SOURCE,
    book: source ?? "",
    page: "",
    license: "",
    rules: "2024",
    revision: 1,
  };
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
