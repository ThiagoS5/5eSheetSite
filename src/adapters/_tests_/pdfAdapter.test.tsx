import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  compactDescriptionFields,
  createInventoryRows,
  getSpellAppendixDescription,
  groupSpellsByLevel,
  markdownToParagraphs,
  renderPdfBuffer,
  type PdfInventoryItem,
} from "@/src/adapters/pdfAdapter";
import type {
  BuilderEquipmentOption,
  CharacterDescription,
  CharacterSheetSummary,
  SheetSkill,
} from "@/src/types/builder";
import type { AttributeKey, CharacterAttributes } from "@/src/types/dnd";
import type { BuilderSpell, CharacterSpellcastingSummary } from "@/src/types/spells";
import type { CharacterBuildPlayState } from "@/src/types/characterBuild";

const ATTRIBUTE_ORDER: Array<{ key: AttributeKey; label: string; abbr: string }> = [
  { key: "forca", label: "Strength", abbr: "STR" },
  { key: "destreza", label: "Dexterity", abbr: "DEX" },
  { key: "constituicao", label: "Constitution", abbr: "CON" },
  { key: "inteligencia", label: "Intelligence", abbr: "INT" },
  { key: "sabedoria", label: "Wisdom", abbr: "WIS" },
  { key: "carisma", label: "Charisma", abbr: "CHA" },
];

const BASE_ATTRIBUTES: CharacterAttributes = {
  forca: 10,
  destreza: 10,
  constituicao: 10,
  inteligencia: 10,
  sabedoria: 10,
  carisma: 10,
};

type SkillTraining = CharacterSheetSummary["skillTraining"][string];

function modifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

function formatAttackBonus(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

function skill(
  name: string,
  attributeKey: AttributeKey,
  attributes: CharacterAttributes,
  proficiencyBonus: number,
  training: SkillTraining = "none",
): SheetSkill {
  const proficiency =
    training === "expertise"
      ? proficiencyBonus * 2
      : training === "proficient"
        ? proficiencyBonus
        : training === "half"
          ? Math.floor(proficiencyBonus / 2)
          : 0;

  return {
    name,
    label: name,
    attributeKey,
    modifier: modifier(attributes[attributeKey]) + proficiency,
    isExpert: training === "expertise",
    isOverridden: false,
    isProficient: training !== "none",
  };
}

function equipment(
  id: string,
  name: string,
  category: BuilderEquipmentOption["category"],
  partial: Partial<BuilderEquipmentOption> = {},
): BuilderEquipmentOption {
  return {
    id,
    name,
    category,
    source: "XPHB",
    sourceType: "manual",
    ...partial,
  };
}

function spell(
  id: string,
  name: string,
  level: number,
  description: string,
  partial: Partial<BuilderSpell> = {},
): BuilderSpell {
  return {
    id,
    name,
    level,
    description,
    castingTime: "1 action",
    classNames: ["Cleric", "Wizard"],
    components: "V, S",
    duration: "Instantaneous",
    range: "60 feet",
    school: "Evocation",
    schoolCode: "V",
    source: "XPHB",
    ...partial,
  };
}

function description(partial: Partial<CharacterDescription>): CharacterDescription {
  return {
    nome: partial.nome ?? "Adventurer",
    alinhamento: partial.alinhamento ?? "Neutral Good",
    faith: partial.faith ?? "None recorded",
    lifestyle: partial.lifestyle ?? "Modest",
    age: partial.age ?? "30",
    height: partial.height ?? "5 ft. 10 in.",
    weight: partial.weight ?? "170 lb.",
    eyes: partial.eyes ?? "Brown",
    skin: partial.skin ?? "Tan",
    hair: partial.hair ?? "Black",
    gender: partial.gender ?? "Nonbinary",
    aparencia:
      partial.aparencia ??
      "A practical traveler with patched clothing, a weathered cloak, and a carefully maintained kit.",
    personalidade:
      partial.personalidade ??
      "Calm under pressure, generous with companions, and direct when danger leaves no room for ceremony.",
    tracos: partial.tracos ?? "Keeps promises even when the road gets expensive.",
    notas:
      partial.notas ??
      "This note block is intentionally rich enough to require the description appendix instead of a cramped page-one field.",
    historia: partial.historia ?? "",
    portraitId: partial.portraitId ?? "portrait-iron-warden",
  };
}

function buildSummary(
  partial: Partial<CharacterSheetSummary> &
    Pick<CharacterSheetSummary, "name" | "className" | "speciesName" | "backgroundName" | "level">,
): CharacterSheetSummary {
  const proficiencyBonus =
    partial.proficiencyBonus ??
    (partial.level >= 17 ? 6 : partial.level >= 13 ? 5 : partial.level >= 9 ? 4 : partial.level >= 5 ? 3 : 2);
  const finalAttributes = partial.finalAttributes ?? BASE_ATTRIBUTES;
  const attributes = ATTRIBUTE_ORDER.map((attribute) => ({
    ...attribute,
    score: finalAttributes[attribute.key],
    modifier: modifier(finalAttributes[attribute.key]),
  }));
  const skillTraining = partial.skillTraining ?? {
    Arcana: "none",
    Athletics: "none",
    Insight: "none",
    Investigation: "none",
    Perception: "proficient",
    Stealth: "none",
    Survival: "none",
  };
  const skills =
    partial.skills ??
    [
      skill("Arcana", "inteligencia", finalAttributes, proficiencyBonus, skillTraining.Arcana),
      skill("Athletics", "forca", finalAttributes, proficiencyBonus, skillTraining.Athletics),
      skill("Insight", "sabedoria", finalAttributes, proficiencyBonus, skillTraining.Insight),
      skill("Investigation", "inteligencia", finalAttributes, proficiencyBonus, skillTraining.Investigation),
      skill("Perception", "sabedoria", finalAttributes, proficiencyBonus, skillTraining.Perception),
      skill("Stealth", "destreza", finalAttributes, proficiencyBonus, skillTraining.Stealth),
      skill("Survival", "sabedoria", finalAttributes, proficiencyBonus, skillTraining.Survival),
    ];
  const selectedEquipment = partial.selectedEquipment ?? [];
  const features = partial.features ?? [];

  return {
    ruleset: "2024",
    level: partial.level,
    speciesId: partial.speciesId ?? `${partial.speciesName.toLowerCase()}-xphb`,
    classId: partial.classId ?? `${partial.className.toLowerCase()}-xphb`,
    backgroundId: partial.backgroundId ?? `${partial.backgroundName.toLowerCase()}-xphb`,
    originFeat: partial.originFeat ?? "Alert",
    baseAttributes: partial.baseAttributes ?? finalAttributes,
    backgroundAbilityBonuses: partial.backgroundAbilityBonuses ?? {},
    finalAttributes,
    proficiencyBonus,
    hitPoints: partial.hitPoints ?? partial.maxHp ?? 10,
    armorClass: partial.armorClass ?? 10 + modifier(finalAttributes.destreza),
    armorClassBreakdown: partial.armorClassBreakdown ?? [
      { label: "Base + Dexterity", value: partial.armorClass ?? 10 + modifier(finalAttributes.destreza) },
    ],
    selectedEquipment,
    inventory: selectedEquipment.map((item) => ({ item, quantity: 1 })),
    selectedTraits: partial.selectedTraits ?? [],
    classFeatures: partial.classFeatures ?? [],
    classSkillProficiencies: partial.classSkillProficiencies ?? ["Perception"],
    skillTraining,
    classFeatureChoices: partial.classFeatureChoices ?? {},
    speciesChoices: partial.speciesChoices ?? {},
    speciesLanguages: partial.speciesLanguages ?? ["Common"],
    validationMessages: partial.validationMessages ?? [],
    pendencies: partial.pendencies ?? [],
    name: partial.name,
    className: partial.className,
    speciesName: partial.speciesName,
    backgroundName: partial.backgroundName,
    currentHp: partial.currentHp ?? partial.maxHp ?? 10,
    maxHp: partial.maxHp ?? 10,
    maxHpBreakdown: partial.maxHpBreakdown ?? [{ label: "Total", value: partial.maxHp ?? 10 }],
    tempHp: partial.tempHp ?? 0,
    hitDice: partial.hitDice ?? `${partial.level}d8`,
    initiative: partial.initiative ?? modifier(finalAttributes.destreza),
    speedFeet: partial.speedFeet ?? 30,
    speedMeters: partial.speedMeters ?? 9,
    xp: partial.xp ?? 0,
    xpThreshold: partial.xpThreshold ?? 300,
    progressionMode: partial.progressionMode ?? "milestone",
    isSpellcaster: Boolean(partial.spellcasting ?? partial.isSpellcaster),
    spellcasting: partial.spellcasting,
    attributes,
    skills,
    savingThrows:
      partial.savingThrows ??
      [
        {
          attributeKey: "sabedoria",
          label: "Wisdom",
          abbr: "WIS",
          modifier: modifier(finalAttributes.sabedoria) + proficiencyBonus,
          isProficient: true,
        },
        {
          attributeKey: "carisma",
          label: "Charisma",
          abbr: "CHA",
          modifier: modifier(finalAttributes.carisma),
          isProficient: false,
        },
      ],
    passives: partial.passives ?? {
      perception: 10 + (skills.find((entry) => entry.name === "Perception")?.modifier ?? 0),
      investigation: 10 + (skills.find((entry) => entry.name === "Investigation")?.modifier ?? 0),
      insight: 10 + (skills.find((entry) => entry.name === "Insight")?.modifier ?? 0),
    },
    senses: partial.senses ?? [{ name: "Passive Perception", rangeFeet: 10 }],
    languages: partial.languages ?? ["Common"],
    toolProficiencies: partial.toolProficiencies ?? [],
    resistances: partial.resistances ?? [],
    immunities: partial.immunities ?? [],
    vulnerabilities: partial.vulnerabilities ?? [],
    features,
    weapons: partial.weapons ?? [],
    money: partial.money ?? { pc: 0, pp: 0, pe: 0, po: 10, pl: 0 },
    carry: partial.carry ?? { currentKg: 18, maxKg: 75 },
  };
}

function spellcasting(partial: Partial<CharacterSpellcastingSummary>): CharacterSpellcastingSummary {
  return {
    ability: partial.ability ?? "sabedoria",
    abilityLabel: partial.abilityLabel ?? "Wisdom",
    spellSaveDc: partial.spellSaveDc ?? 13,
    spellAttackBonus: partial.spellAttackBonus ?? 5,
    cantripsKnownLimit: partial.cantripsKnownLimit ?? 3,
    knownSpellLimit: partial.knownSpellLimit ?? 0,
    preparedSpellLimit: partial.preparedSpellLimit ?? 5,
    selectedCantripCount: partial.selectedCantripCount ?? partial.cantrips?.length ?? 0,
    selectedKnownCount: partial.selectedKnownCount ?? partial.knownSpells?.length ?? 0,
    selectedPreparedCount: partial.selectedPreparedCount ?? partial.preparedSpells?.length ?? 0,
    slots: partial.slots ?? [{ level: 1, total: 2, used: 0, remaining: 2 }],
    cantrips: partial.cantrips ?? [],
    knownSpells: partial.knownSpells ?? [],
    preparedSpells: partial.preparedSpells ?? [],
  };
}

function countPdfPages(buffer: Buffer): number {
  return buffer.toString("latin1").match(/\/Type\s*\/Page\b/g)?.length ?? 0;
}

async function maybeWritePdfFixture(label: string, buffer: Buffer): Promise<void> {
  if (process.env.WRITE_PDF_FIXTURES !== "1") {
    return;
  }

  const root = join(process.cwd(), "output", "pdf");
  const fileName = `${label.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}.pdf`;
  await mkdir(root, { recursive: true });
  await writeFile(join(root, fileName), buffer);
}

const longFeature =
  "The character has a table-ready rule reminder with enough words to confirm the appendix receives complete feature text while page one can remain concise.";

const rowan = buildSummary({
  name: "Rowan Pike",
  className: "Fighter",
  speciesName: "Human",
  backgroundName: "Soldier",
  level: 1,
  finalAttributes: { forca: 16, destreza: 12, constituicao: 14, inteligencia: 10, sabedoria: 11, carisma: 8 },
  armorClass: 18,
  armorClassBreakdown: [
    { label: "Chain Mail", value: 16 },
    { label: "Shield", value: 2 },
  ],
  hitDice: "1d10",
  maxHp: 12,
  currentHp: 12,
  selectedEquipment: [
    equipment("shield-xphb", "Shield", "Armor", { armorType: "shield", sourceType: "class" }),
    equipment("longsword-xphb", "Longsword", "Weapon", {
      damageDice: "1d8",
      damageType: "Slashing",
      sourceType: "class",
    }),
  ],
  features: [
    { name: "Second Wind", source: "class", description: "Regain hit points as a bonus action." },
    { name: "Alert", source: "background", description: "Add proficiency to initiative." },
  ],
  weapons: [
    {
      name: "Longsword",
      attackBonus: "+5",
      damage: "1d8+3 Slashing",
      notes: "Melee, versatile, proficient.",
    },
  ],
  carry: { currentKg: 33, maxKg: 120 },
  languages: ["Common"],
  toolProficiencies: ["Playing Cards"],
});

const mara = buildSummary({
  name: "Mara Deepbell",
  className: "Cleric",
  speciesName: "Dwarf",
  backgroundName: "Acolyte",
  level: 5,
  finalAttributes: { forca: 14, destreza: 10, constituicao: 16, inteligencia: 11, sabedoria: 18, carisma: 12 },
  armorClass: 17,
  armorClassBreakdown: [
    { label: "Scale Mail", value: 14 },
    { label: "Shield", value: 2 },
    { label: "Dexterity", value: 1 },
  ],
  hitDice: "5d8",
  maxHp: 43,
  currentHp: 36,
  resistances: ["Poison"],
  languages: ["Common", "Dwarvish", "Celestial"],
  toolProficiencies: ["Smith's Tools"],
  selectedEquipment: [
    equipment("mace-xphb", "Mace", "Weapon", {
      damageDice: "1d6",
      damageType: "Bludgeoning",
      sourceType: "class",
    }),
    equipment("holy-symbol-xphb", "Holy Symbol", "Other Gear", { sourceType: "class" }),
  ],
  features: [
    { name: "Channel Divinity", source: "class", description: longFeature },
    { name: "Darkvision", source: "species", description: "See in dim light and darkness within the listed range." },
    { name: "Magic Initiate", source: "background", description: "Learn minor magic from your formative training." },
  ],
  weapons: [
    {
      name: "Mace",
      attackBonus: "+5",
      damage: "1d6+2 Bludgeoning",
      notes: "Melee, simple, holy symbol usually readied.",
    },
  ],
  spellcasting: spellcasting({
    spellSaveDc: 15,
    spellAttackBonus: 7,
    cantripsKnownLimit: 4,
    preparedSpellLimit: 9,
    slots: [
      { level: 1, total: 4, used: 1, remaining: 3 },
      { level: 2, total: 3, used: 0, remaining: 3 },
      { level: 3, total: 2, used: 1, remaining: 1 },
    ],
    cantrips: [
      spell("guidance-xphb", "Guidance", 0, "Touch one willing creature and guide a crucial effort.", {
        school: "Divination",
        schoolCode: "D",
        range: "Touch",
        duration: "Concentration, up to 1 minute",
      }),
    ],
    preparedSpells: [
      spell("bless-xphb", "Bless", 1, "Bolster allies with a small but decisive blessing.", {
        school: "Enchantment",
        schoolCode: "E",
      }),
      spell("lesser-restoration-xphb", "Lesser Restoration", 2, "End one condition afflicting a creature you touch.", {
        school: "Abjuration",
        schoolCode: "A",
        range: "Touch",
      }),
      spell("spirit-guardians-xphb", "Spirit Guardians", 3, "Protective spirits flit around you and punish approaching foes.", {
        school: "Conjuration",
        schoolCode: "C",
        duration: "Concentration, up to 10 minutes",
      }),
    ],
  }),
});

const ilyra = buildSummary({
  name: "Ilyra Moonquill",
  className: "Wizard",
  speciesName: "Elf",
  backgroundName: "Sage",
  level: 11,
  finalAttributes: { forca: 8, destreza: 16, constituicao: 14, inteligencia: 20, sabedoria: 13, carisma: 12 },
  armorClass: 16,
  armorClassBreakdown: [{ label: "Mage Armor + Dexterity", value: 16 }],
  hitDice: "11d6",
  maxHp: 68,
  currentHp: 51,
  speedFeet: 35,
  speedMeters: 10,
  languages: ["Common", "Elvish", "Draconic", "Infernal"],
  toolProficiencies: ["Calligrapher's Supplies"],
  senses: [{ name: "Darkvision", rangeFeet: 60 }],
  selectedEquipment: [
    equipment("spellbook-xphb", "Spellbook", "Other Gear", { sourceType: "class" }),
    equipment("quarterstaff-xphb", "Quarterstaff", "Weapon", {
      damageDice: "1d6",
      damageType: "Bludgeoning",
      sourceType: "class",
    }),
  ],
  skillTraining: {
    Arcana: "expertise",
    Athletics: "none",
    Insight: "proficient",
    Investigation: "proficient",
    Perception: "proficient",
    Stealth: "none",
    Survival: "none",
  },
  features: [
    { name: "Arcane Recovery", source: "class", description: longFeature },
    { name: "Fey Ancestry", source: "species", description: "Advantage against being charmed." },
    { name: "Researcher", source: "background", description: "Know where to find lore and references." },
  ],
  weapons: [
    {
      name: "Quarterstaff",
      attackBonus: "+3",
      damage: "1d6-1 Bludgeoning",
      notes: "Melee, simple, last-resort option.",
    },
  ],
  spellcasting: spellcasting({
    ability: "inteligencia",
    abilityLabel: "Intelligence",
    spellSaveDc: 17,
    spellAttackBonus: 9,
    cantripsKnownLimit: 5,
    preparedSpellLimit: 16,
    slots: [
      { level: 1, total: 4, used: 0, remaining: 4 },
      { level: 2, total: 3, used: 1, remaining: 2 },
      { level: 3, total: 3, used: 0, remaining: 3 },
      { level: 4, total: 3, used: 2, remaining: 1 },
      { level: 5, total: 2, used: 0, remaining: 2 },
      { level: 6, total: 1, used: 0, remaining: 1 },
    ],
    cantrips: [
      spell("mage-hand-xphb", "Mage Hand", 0, "Create a spectral hand for careful manipulation.", {
        school: "Conjuration",
        schoolCode: "C",
      }),
      spell("ray-of-frost-xphb", "Ray of Frost", 0, "A beam of freezing energy slows and harms a foe."),
    ],
    preparedSpells: [
      spell("shield-xphb", "Shield", 1, "Raise a sudden magical barrier as a reaction.", {
        school: "Abjuration",
        schoolCode: "A",
        castingTime: "Reaction",
      }),
      spell("counterspell-xphb", "Counterspell", 3, "Interrupt a creature in the process of casting a spell.", {
        school: "Abjuration",
        schoolCode: "A",
        castingTime: "Reaction",
      }),
      spell("telekinesis-xphb", "Telekinesis", 5, "Move or restrain creatures and objects with sustained force.", {
        school: "Transmutation",
        schoolCode: "T",
        duration: "Concentration, up to 10 minutes",
      }),
      spell("disintegrate-xphb", "Disintegrate", 6, "A thin green ray threatens devastating force and leaves little behind.", {
        school: "Transmutation",
        schoolCode: "T",
      }),
    ],
  }),
});

const korga = buildSummary({
  name: "Korga Blackstep",
  className: "Rogue",
  speciesName: "Orc",
  backgroundName: "Criminal",
  level: 20,
  finalAttributes: { forca: 12, destreza: 22, constituicao: 16, inteligencia: 14, sabedoria: 13, carisma: 16 },
  armorClass: 18,
  armorClassBreakdown: [
    { label: "Studded Leather", value: 12 },
    { label: "Dexterity", value: 6 },
  ],
  hitDice: "20d8",
  maxHp: 163,
  currentHp: 141,
  initiative: 12,
  speedFeet: 40,
  speedMeters: 12,
  languages: ["Common", "Orc", "Thieves' Cant"],
  toolProficiencies: ["Thieves' Tools", "Disguise Kit", "Poisoner's Kit"],
  selectedEquipment: [
    equipment("rapier-xphb", "Rapier", "Weapon", { damageDice: "1d8", damageType: "Piercing", sourceType: "class" }),
    equipment("shortbow-xphb", "Shortbow", "Weapon", {
      damageDice: "1d6",
      damageType: "Piercing",
      sourceType: "class",
      range: "80/320",
    }),
    equipment("thieves-tools-xphb", "Thieves' Tools", "Other Gear", { sourceType: "background" }),
  ],
  skillTraining: {
    Arcana: "none",
    Athletics: "proficient",
    Insight: "proficient",
    Investigation: "proficient",
    Perception: "expertise",
    Stealth: "expertise",
    Survival: "none",
  },
  features: [
    { name: "Sneak Attack", source: "class", description: `${longFeature} Apply precision damage once per turn when the attack qualifies.` },
    { name: "Reliable Talent", source: "class", description: "Treat low d20 rolls on proficient checks as reliable results." },
    { name: "Adrenaline Rush", source: "species", description: "Dash with fierce momentum and gain temporary resilience." },
    { name: "Skulker", source: "background", description: "Move through shadows and exploit cover." },
  ],
  weapons: [
    {
      name: "Rapier",
      attackBonus: formatAttackBonus(12),
      damage: "1d8+6 Piercing",
      notes: "Finesse, qualifies for Sneak Attack.",
    },
    {
      name: "Shortbow",
      attackBonus: formatAttackBonus(12),
      damage: "1d6+6 Piercing",
      notes: "Ammunition, range 80/320.",
    },
  ],
  money: { pc: 14, pp: 22, pe: 0, po: 1320, pl: 8 },
  carry: { currentKg: 48, maxKg: 165 },
});

const matrixCases: Array<{
  label: string;
  description: CharacterDescription;
  expectedDescriptionFields: string[];
  expectedSpellLevels: number[];
  expectedInventory: string[];
  minBytes: number;
  minPages: number;
  summary: CharacterSheetSummary;
  inventory: PdfInventoryItem[];
}> = [
  {
    label: "level 1 human fighter with starting weapon and shield",
    description: description({
      nome: "Rowan Pike",
      portraitId: "portrait-iron-recruit",
      aparencia: "A polished shield, new boots, and the alert posture of someone freshly assigned to caravan duty.",
    }),
    expectedDescriptionFields: ["Alignment", "Lifestyle", "Age", "Height", "Weight", "Eyes", "Skin", "Hair", "Gender"],
    expectedInventory: ["Shield", "Longsword", "Rations"],
    expectedSpellLevels: [],
    minBytes: 6000,
    minPages: 3,
    inventory: [{ item: equipment("rations-xphb", "Rations", "Other Gear", { weightKg: 1 }), quantity: 5 }],
    summary: rowan,
  },
  {
    label: "level 5 dwarf cleric with prepared spells and defenses",
    description: description({
      nome: "Mara Deepbell",
      faith: "Moradin",
      portraitId: "portrait-gold-priest",
      tracos: "Blesses every doorway before crossing it and records debts in a copper-bound book.",
    }),
    expectedDescriptionFields: ["Faith", "Lifestyle", "Age", "Height", "Weight", "Eyes", "Skin", "Hair", "Gender"],
    expectedInventory: ["Mace", "Holy Symbol", "Healer's Kit"],
    expectedSpellLevels: [0, 1, 2, 3],
    minBytes: 7600,
    minPages: 4,
    inventory: [{ item: equipment("healers-kit-xphb", "Healer's Kit", "Other Gear", { weightKg: 1.5 }), quantity: 1 }],
    summary: mara,
  },
  {
    label: "level 11 elf wizard with high level spells and long notes",
    description: description({
      nome: "Ilyra Moonquill",
      alinhamento: "Chaotic Good",
      faith: "Sehanine",
      lifestyle: "Comfortable",
      portraitId: "portrait-moon-archmage",
      notas:
        "Maintains a spell index, a list of planar debts, three aliases, and a campaign journal with unresolved mysteries that should remain available in the appendix.",
    }),
    expectedDescriptionFields: ["Alignment", "Faith", "Lifestyle", "Age", "Height", "Weight", "Eyes", "Skin", "Hair", "Gender"],
    expectedInventory: ["Spellbook", "Quarterstaff", "Ink"],
    expectedSpellLevels: [0, 1, 3, 5, 6],
    minBytes: 8800,
    minPages: 4,
    inventory: [{ item: equipment("ink-xphb", "Ink", "Other Gear", { weightKg: 0.1 }), quantity: 3 }],
    summary: ilyra,
  },
  {
    label: "level 20 orc rogue with expertise and large mundane inventory",
    description: description({
      nome: "Korga Blackstep",
      alinhamento: "True Neutral",
      portraitId: "portrait-shadow-agent",
      lifestyle: "Wealthy",
      aparencia: "Dark leathers, silver buckles, several concealed pockets, and a duelist's calm smile.",
    }),
    expectedDescriptionFields: ["Alignment", "Lifestyle", "Age", "Height", "Weight", "Eyes", "Skin", "Hair", "Gender"],
    expectedInventory: ["Rapier", "Shortbow", "Thieves' Tools", "Grappling Hook", "Potion of Healing"],
    expectedSpellLevels: [],
    minBytes: 7600,
    minPages: 3,
    inventory: [
      { item: equipment("grappling-hook-xphb", "Grappling Hook", "Other Gear", { weightKg: 2 }), quantity: 1 },
      { item: equipment("potion-healing-xphb", "Potion of Healing", "Potion", { weightKg: 0.25 }), quantity: 2 },
    ],
    summary: korga,
  },
];

describe("pdfAdapter", () => {
  it("renders a readable martial character PDF with portrait and rich description", async () => {
    const buffer = await renderPdfBuffer({ summary: rowan, description: matrixCases[0].description });

    expect(buffer.toString("utf8", 0, 4)).toBe("%PDF");
    expect(buffer.byteLength).toBeGreaterThan(6000);
  });

  it("renders a spellcaster PDF with spell appendix content", async () => {
    const martialBuffer = await renderPdfBuffer({ summary: rowan, description: matrixCases[0].description });
    const spellcasterBuffer = await renderPdfBuffer({
      summary: ilyra,
      description: matrixCases[2].description,
      inventory: matrixCases[2].inventory,
    });

    expect(spellcasterBuffer.toString("utf8", 0, 4)).toBe("%PDF");
    expect(spellcasterBuffer.byteLength).toBeGreaterThan(martialBuffer.byteLength);
    expect(countPdfPages(spellcasterBuffer)).toBeGreaterThanOrEqual(4);
  });

  it.each(matrixCases)(
    "renders and fills the printable sheet for $label",
    async ({
      description: characterDescription,
      expectedDescriptionFields,
      expectedInventory,
      expectedSpellLevels,
      inventory,
      minBytes,
      minPages,
      summary,
    }) => {
      const buffer = await renderPdfBuffer({ summary, description: characterDescription, inventory });
      await maybeWritePdfFixture(summary.name, buffer);

      expect(buffer.toString("utf8", 0, 4)).toBe("%PDF");
      expect(buffer.byteLength).toBeGreaterThan(minBytes);
      expect(countPdfPages(buffer)).toBeGreaterThanOrEqual(minPages);

      const inventoryRows = createInventoryRows(summary, inventory);
      expect(inventoryRows.map((row) => row.label)).toEqual(expect.arrayContaining(expectedInventory));
      expect(inventoryRows.filter((row) => row.equipped).map((row) => row.label)).toEqual(
        expect.arrayContaining(summary.selectedEquipment.map((item) => item.name)),
      );

      const descriptionLabels = compactDescriptionFields(characterDescription).map((field) => field.label);
      expect(descriptionLabels).toEqual(expect.arrayContaining(expectedDescriptionFields));

      if (summary.spellcasting) {
        const groupedLevels = groupSpellsByLevel([
          ...summary.spellcasting.cantrips,
          ...summary.spellcasting.knownSpells,
          ...summary.spellcasting.preparedSpells,
        ]).map((group) => group.level);

        expect(groupedLevels).toEqual(expectedSpellLevels);
      } else {
        expect(expectedSpellLevels).toEqual([]);
      }
    },
  );

  it("keeps full spell descriptions for the appendix", () => {
    const [spellEntry] = ilyra.spellcasting?.preparedSpells ?? [];
    const longDescription =
      "This spell description contains an important final sentence that must remain in the printable appendix.";

    expect(getSpellAppendixDescription({ ...spellEntry, description: longDescription })).toBe(longDescription);
  });

  it("keeps the spell appendix sorted by level and spell name", () => {
    const grouped = groupSpellsByLevel([
      spell("z-level-2", "Zone of Truth", 2, "Compel honest speech.", { school: "Enchantment", schoolCode: "E" }),
      spell("a-level-0", "Acid Splash", 0, "Splash acid at a target."),
      spell("b-level-2", "Blur", 2, "Your body becomes blurred.", { school: "Illusion", schoolCode: "I" }),
    ]);

    expect(grouped.map((group) => group.level)).toEqual([0, 2]);
    expect(grouped[1]?.spells.map((entry) => entry.name)).toEqual(["Blur", "Zone of Truth"]);
  });

  it("strips markdown syntax and splits notes into paragraphs", () => {
    const paragraphs = markdownToParagraphs(
      "# Journal\n\n**Bold plans** with *emphasis* and `code`.\n\n- first errand\n- second errand\n\n> a quoted vow\n\n[a map](https://example.com)",
    );

    expect(paragraphs).toEqual([
      "Journal",
      "Bold plans with emphasis and code.",
      "- first errand",
      "- second errand",
      "a quoted vow",
      "a map",
    ]);
  });

  it("renders very long markdown notes across pages without failing", async () => {
    const longNotes = Array.from(
      { length: 60 },
      (_, index) =>
        `## Entry ${index + 1}\n\nThe party pressed on through **chapter ${index + 1}** of the campaign, logging debts, allies, and unresolved mysteries in careful detail.`,
    ).join("\n\n");
    const buffer = await renderPdfBuffer({
      summary: rowan,
      description: description({ nome: "Rowan Pike", notas: longNotes }),
    });

    expect(buffer.toString("utf8", 0, 4)).toBe("%PDF");
    expect(countPdfPages(buffer)).toBeGreaterThanOrEqual(4);
  });

  it.each(["A4", "LETTER"] as const)(
    "paginates long backstory, inventory, features, spells, and Session Log on %s",
    async (pageSize) => {
      const campaignLog = Array.from({ length: 18 }, (_, index) => ({
        id: `session-${index}`,
        title: `Session ${index + 1}`,
        date: `2026-07-${String((index % 28) + 1).padStart(2, "0")}`,
        body: Array.from(
          { length: 6 },
          () =>
            "The party recorded alliances, conditions, treasure, unresolved clues, and the consequences of every difficult choice.",
        ).join(" "),
      }));
      const playState: CharacterBuildPlayState = {
        currentHp: 81,
        tempHp: 12,
        hitDiceSpent: 4,
        usedSpellSlots: { 1: 2, 3: 1, 5: 1 },
        resourceUses: { sorceryPoints: 6, arcaneRecovery: 1 },
        resourceRecoveries: { sorceryPoints: "longRest", arcaneRecovery: "longRest" },
        deathSaves: { successes: 2, failures: 1 },
        inspiration: true,
        conditions: ["Poisoned", "Prone"],
        campaignLog,
        overrides: {},
      };
      const extensiveInventory = Array.from({ length: 45 }, (_, index) => ({
        item: equipment(
          `custom-item-${index}`,
          `Custom Expedition Item ${index + 1}`,
          "Other Gear",
          { weightKg: 0.5 },
        ),
        quantity: (index % 3) + 1,
      }));
      const buffer = await renderPdfBuffer(
        {
          summary: ilyra,
          description: description({
            nome: "Ilyra Moonfall",
            historia: "A long backstory. ".repeat(700),
            notas: "A long private note. ".repeat(300),
          }),
          inventory: extensiveInventory,
          playState,
        },
        { pageSize },
      );
      await maybeWritePdfFixture(`high-level-spellcaster-${pageSize}`, buffer);

      expect(buffer.toString("utf8", 0, 4)).toBe("%PDF");
      expect(buffer.byteLength).toBeGreaterThan(15_000);
      expect(countPdfPages(buffer)).toBeGreaterThanOrEqual(8);
    },
    30_000,
  );

  it("marks carried equipped items once and preserves their carried quantity", () => {
    const dagger = equipment("dagger-xphb", "Dagger", "Weapon", {
      damageDice: "1d4",
      damageType: "Piercing",
      sourceType: "class",
    });
    const summary = buildSummary({
      name: "Quantity Probe",
      className: "Rogue",
      speciesName: "Halfling",
      backgroundName: "Charlatan",
      level: 3,
      selectedEquipment: [dagger],
    });

    expect(createInventoryRows(summary, [{ item: dagger, quantity: 4 }])).toEqual([
      expect.objectContaining({
        equipped: true,
        id: "dagger-xphb",
        label: "Dagger",
        quantity: 4,
      }),
    ]);
  });
});
