import { describe, expect, it } from "vitest";
import { createFoundryCharacterExport } from "@/src/utils/foundryAdapter";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import type { CharacterSheetSummary } from "@/src/types/builder";

const state: CharacterBuilderState = {
  ruleset: "2024",
  level: 6,
  selectedSpeciesId: "aasimar-xphb",
  selectedClassId: "fighter-xphb",
  selectedSubclassId: "champion-xphb",
  asiOrFeatByLevel: {},
  selectedBackgroundId: "guard-xphb",
  inventory: [
    { itemId: "chain-mail-xphb", quantity: 1 },
    { itemId: "longsword-xphb", quantity: 1 },
    { itemId: "thieves-tools-xphb", quantity: 1 },
    { itemId: "potion-of-healing-xphb", quantity: 2 },
    { itemId: "rope-xphb", quantity: 1 },
  ],
  equippedItemIds: ["chain-mail-xphb", "longsword-xphb"],
  equipmentChoicesBySource: {},
  maxUnlockedStepIndex: 8,
  pendingChoiceIds: [],
  classSkillProficiencies: ["Athletics", "Perception"],
  skillTraining: {
    Athletics: "proficient",
    Perception: "expertise",
  },
  classFeatureChoices: {
    "weapon-mastery": ["longsword-xphb"],
  },
  speciesChoices: {
    "celestial-revelation": "radiant-soul",
  },
  speciesLanguages: ["Common", "Celestial"],
  attributeGenerationMethod: "standard-array",
  baseAttributes: {
    forca: 15,
    destreza: 14,
    constituicao: 13,
    inteligencia: 12,
    sabedoria: 10,
    carisma: 8,
  },
  backgroundAbilityBonuses: { forca: 2, constituicao: 1 },
  description: {
    nome: "Brienne",
    alinhamento: "Lawful Good",
    faith: "Bahamut",
    lifestyle: "Modest",
    age: "28",
    height: "6 ft.",
    weight: "180 lb.",
    eyes: "Blue",
    skin: "Bronze",
    hair: "Black",
    gender: "Female",
    aparencia: "Travel-worn armor.",
    personalidade: "Protective and direct.",
    tracos: "Never backs down.",
    notas: "Export test.",
    historia: "",
    portraitId: "",
  },
  money: { pc: 7, pp: 5, pe: 2, po: 42, pl: 1 },
  moneyTouched: true,
  carriedLoadKg: 0,
  skillModifierOverrides: {},
  hpRollByLevel: {},
  spellcasting: {
    cantripIds: ["fire-bolt-xphb"],
    knownSpellIds: ["shield-xphb"],
    preparedSpellIds: ["magic-missile-xphb"],
  },
};

const summary: CharacterSheetSummary = {
  ruleset: "2024",
  level: 6,
  speciesId: "aasimar-xphb",
  classId: "fighter-xphb",
  backgroundId: "guard-xphb",
  originFeat: "Alert",
  baseAttributes: state.baseAttributes,
  backgroundAbilityBonuses: state.backgroundAbilityBonuses,
  finalAttributes: {
    forca: 17,
    destreza: 14,
    constituicao: 14,
    inteligencia: 12,
    sabedoria: 10,
    carisma: 8,
  },
  proficiencyBonus: 3,
  hitPoints: 44,
  armorClass: 16,
  selectedEquipment: [
    {
      id: "chain-mail-xphb",
      name: "Chain Mail",
      source: "XPHB",
      sourceType: "class",
      category: "Armor",
      type: "armor",
      armorClass: 16,
      armorType: "heavy",
      armor: { baseAC: 16, category: "heavy", strengthMin: 13, stealthDisadvantage: true },
    },
    {
      id: "longsword-xphb",
      name: "Longsword",
      source: "XPHB",
      sourceType: "class",
      category: "Weapon",
      type: "weapon",
      weaponCategory: "Martial",
      weaponRangeType: "melee",
      weaponProperties: ["V"],
      damageDice: "1d8",
      damageType: "S",
      value: 1500,
    },
  ],
  inventory: [
    {
      item: {
        id: "chain-mail-xphb",
        name: "Chain Mail",
        source: "XPHB",
        sourceType: "class",
        category: "Armor",
        type: "armor",
        armorClass: 16,
        armorType: "heavy",
        armor: { baseAC: 16, category: "heavy", strengthMin: 13, stealthDisadvantage: true },
      },
      quantity: 1,
    },
    {
      item: {
        id: "longsword-xphb",
        name: "Longsword",
        source: "XPHB",
        sourceType: "class",
        category: "Weapon",
        type: "weapon",
        weaponCategory: "Martial",
        weaponRangeType: "melee",
        weaponProperties: ["V"],
        damageDice: "1d8",
        damageType: "S",
        value: 1500,
      },
      quantity: 1,
    },
    {
      item: {
        id: "thieves-tools-xphb",
        name: "Thieves' Tools",
        source: "XPHB",
        sourceType: "background",
        category: "Other Gear",
        type: "tool",
      },
      quantity: 1,
    },
    {
      item: {
        id: "potion-of-healing-xphb",
        name: "Potion of Healing",
        source: "XPHB",
        sourceType: "manual",
        category: "Potion",
        type: "consumable",
      },
      quantity: 2,
    },
    {
      item: {
        id: "rope-xphb",
        name: "Rope",
        source: "XPHB",
        sourceType: "background",
        category: "Other Gear",
        type: "gear",
      },
      quantity: 1,
    },
  ],
  selectedTraits: [{ name: "Healing Hands", description: "Restore hit points." }],
  classFeatures: [{ name: "Second Wind", description: "Regain hit points." }],
  classSkillProficiencies: state.classSkillProficiencies,
  skillTraining: state.skillTraining,
  classFeatureChoices: state.classFeatureChoices,
  speciesChoices: state.speciesChoices,
  speciesLanguages: state.speciesLanguages,
  validationMessages: [],
  name: "Brienne",
  className: "Fighter",
  speciesName: "Aasimar",
  backgroundName: "Guard",
  currentHp: 20,
  maxHp: 44,
  tempHp: 3,
  hitDice: "6d10",
  initiative: 2,
  speedFeet: 30,
  speedMeters: 9,
  xp: 14000,
  xpThreshold: 23000,
  isSpellcaster: true,
  spellcasting: {
    ability: "inteligencia",
    abilityLabel: "Intelligence",
    spellSaveDc: 12,
    spellAttackBonus: 4,
    cantripsKnownLimit: 2,
    knownSpellLimit: 1,
    preparedSpellLimit: 1,
    selectedCantripCount: 1,
    selectedKnownCount: 1,
    selectedPreparedCount: 1,
    slots: [
      { level: 1, total: 4, used: 1, remaining: 3 },
      { level: 2, total: 3, used: 0, remaining: 3 },
    ],
    cantrips: [{
      id: "fire-bolt-xphb",
      name: "Fire Bolt",
      source: "XPHB",
      level: 0,
      school: "Evocation",
      schoolCode: "evo",
      classNames: ["Wizard"],
      castingTime: "Action",
      range: "120 feet",
      duration: "Instantaneous",
      components: "V, S",
      description: "Hurl a mote of fire.",
    }],
    knownSpells: [{
      id: "shield-xphb",
      name: "Shield",
      source: "XPHB",
      level: 1,
      school: "Abjuration",
      schoolCode: "abj",
      classNames: ["Wizard"],
      castingTime: "Reaction",
      range: "Self",
      duration: "1 round",
      components: "V, S",
      description: "An invisible barrier of magical force appears.",
    }],
    preparedSpells: [{
      id: "magic-missile-xphb",
      name: "Magic Missile",
      source: "XPHB",
      level: 1,
      school: "Evocation",
      schoolCode: "evo",
      classNames: ["Wizard"],
      castingTime: "Action",
      range: "120 feet",
      duration: "Instantaneous",
      components: "V, S",
      description: "Create three glowing darts.",
    }],
  },
  attributes: [],
  skills: [
    {
      name: "Athletics",
      label: "Athletics",
      attributeKey: "forca",
      modifier: 6,
      isProficient: true,
      isExpert: false,
      isOverridden: false,
    },
    {
      name: "Perception",
      label: "Perception",
      attributeKey: "sabedoria",
      modifier: 6,
      isProficient: true,
      isExpert: true,
      isOverridden: false,
    },
  ],
  savingThrows: [
    { attributeKey: "forca", label: "Strength", abbr: "STR", modifier: 6, isProficient: true },
    { attributeKey: "constituicao", label: "Constitution", abbr: "CON", modifier: 5, isProficient: true },
  ],
  passives: { perception: 16, investigation: 11, insight: 10 },
  senses: [{ name: "Darkvision", rangeFeet: 60 }],
  languages: ["Common", "Celestial"],
  toolProficiencies: ["Thieves' Tools"],
  resistances: ["Radiant"],
  immunities: [],
  vulnerabilities: [],
  features: [
    { name: "Alert", description: "Always ready.", source: "background" },
  ],
  weapons: [
    {
      name: "Longsword",
      attackBonus: "+6",
      damage: "1d8+3 Slashing",
      notes: "STR, proficient, Versatile",
      abilityKey: "forca",
      isProficient: true,
      damageBreakdown: [
        { label: "Weapon die", value: "1d8" },
        { label: "STR", value: "+3" },
      ],
    },
  ],
  money: { pc: 7, pp: 5, pe: 2, po: 42, pl: 1 },
  carry: { currentKg: 21, maxKg: 127 },
};

describe("foundryAdapter", () => {
  it("maps builder state and sheet summary into a dnd5e 5.2.4 actor export", () => {
    const actor = createFoundryCharacterExport(state, summary);

    expect(actor.type).toBe("character");
    expect(actor.name).toBe("Brienne");
    expect(actor._stats).toMatchObject({
      systemId: "dnd5e",
      systemVersion: "5.2.4",
    });
    expect(actor.system.abilities.str).toMatchObject({ value: 17, proficient: 1 });
    expect(actor.system.abilities.con).toMatchObject({ value: 14, proficient: 1 });
    expect(actor.system.abilities.dex).toMatchObject({ value: 14, proficient: 0 });
    expect(actor.system.attributes.hp).toMatchObject({ max: 44, value: 20, temp: 3 });
    expect(actor.system.attributes.ac).toMatchObject({ flat: 16, calc: "flat" });
    expect(actor.system.attributes.movement).toMatchObject({ walk: 30, units: "ft" });
    expect(actor.system.attributes.senses).toMatchObject({ darkvision: 60, units: "ft" });
    expect(actor.system.attributes.init).toMatchObject({ value: 2 });
    expect(actor.system.attributes.prof).toBe(3);
    expect(actor.system.currency).toEqual({ cp: 7, sp: 5, ep: 2, gp: 42, pp: 1 });
    expect(actor.system.spells).toMatchObject({
      spell1: { value: 3, max: 4 },
      spell2: { value: 3, max: 3 },
      spell3: { value: 0, max: 0 },
    });
    expect(actor.system.skills).toMatchObject({
      ath: { value: 1 },
      prc: { value: 2 },
    });
    expect(actor.system.tools).toMatchObject({
      thief: { value: 1 },
    });
    expect(actor.system.traits?.languages).toMatchObject({
      value: ["common", "celestial"],
    });
    expect(actor.system.traits?.dr).toMatchObject({ value: ["radiant"] });
  });

  it("creates typed Foundry items and links identity details to those item ids", () => {
    const actor = createFoundryCharacterExport(state, summary);
    const itemByName = new Map(actor.items.map((item) => [item.name, item]));

    expect(itemByName.get("Fighter")?.type).toBe("class");
    expect(itemByName.get("Aasimar")?.type).toBe("race");
    expect(itemByName.get("Guard")?.type).toBe("background");
    expect(actor.system.details.originalClass).toBe(itemByName.get("Fighter")?._id);
    expect(actor.system.details.race).toBe(itemByName.get("Aasimar")?._id);
    expect(actor.system.details.background).toBe(itemByName.get("Guard")?._id);

    expect(itemByName.get("Chain Mail")).toMatchObject({
      type: "equipment",
      system: {
        quantity: 1,
        equipped: true,
        armor: { value: 16 },
        type: { value: "heavy" },
      },
    });
    expect(itemByName.get("Longsword")).toMatchObject({
      type: "weapon",
      system: {
        quantity: 1,
        equipped: true,
        damage: { base: { number: 1, denomination: 8, types: ["slashing"] } },
        type: { value: "martialM" },
      },
    });
    expect(itemByName.get("Thieves' Tools")).toMatchObject({
      type: "tool",
      system: { quantity: 1, type: { baseItem: "thief" } },
    });
    expect(itemByName.get("Potion of Healing")).toMatchObject({
      type: "consumable",
      system: { quantity: 2 },
    });
    expect(itemByName.get("Rope")).toMatchObject({
      type: "loot",
      system: { quantity: 1 },
    });
  });

  it("exports unique 16-char alphanumeric item ids even for long similar names", () => {
    const longNameSummary: CharacterSheetSummary = {
      ...summary,
      features: [
        { name: "Channel Divinity: Sacred Weapon", description: "A", source: "class" },
        { name: "Channel Divinity: Turn the Unholy", description: "B", source: "class" },
      ],
    };
    const actor = createFoundryCharacterExport(state, longNameSummary);
    const ids = actor.items.map((item) => item._id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-zA-Z0-9]{16}$/);
    }
  });

  it("does not duplicate class features and species traits already present in summary.features", () => {
    const actor = createFoundryCharacterExport(state, summary);
    const featNames = actor.items
      .filter((item) => item.type === "feat")
      .map((item) => item.name);

    expect(featNames.filter((name) => name === "Alert")).toHaveLength(1);
    // selectedTraits/classFeatures are projections of summary.features in real
    // derivations; the export must read features only, once.
    expect(featNames).not.toContain("Healing Hands");
    expect(featNames).not.toContain("Second Wind");
  });

  it("maps warlock pact magic to pact slots and pact progression", () => {
    const warlockSummary: CharacterSheetSummary = {
      ...summary,
      classId: "warlock-xphb",
      className: "Warlock",
      spellcasting: {
        ...summary.spellcasting!,
        slots: [{ level: 3, total: 2, used: 0, remaining: 2 }],
      },
    };
    const actor = createFoundryCharacterExport(state, warlockSummary);
    const classItem = actor.items.find((item) => item.type === "class");

    expect(actor.system.spells?.pact).toMatchObject({ value: 2, max: 2 });
    expect(actor.system.spells?.spell3).toMatchObject({ value: 0, max: 0 });
    expect(classItem?.system.spellcasting).toMatchObject({ progression: "pact" });
  });

  it("converts 5etools single-letter school codes to dnd5e three-letter codes", () => {
    const singleLetterSummary: CharacterSheetSummary = {
      ...summary,
      spellcasting: {
        ...summary.spellcasting!,
        cantrips: [{ ...summary.spellcasting!.cantrips[0], schoolCode: "V" }],
        knownSpells: [{ ...summary.spellcasting!.knownSpells[0], schoolCode: "T", school: "Transmutation" }],
        preparedSpells: [],
      },
    };
    const actor = createFoundryCharacterExport(state, singleLetterSummary);
    const itemByName = new Map(actor.items.map((item) => [item.name, item]));

    expect(itemByName.get("Fire Bolt")?.system.school).toBe("evo");
    expect(itemByName.get("Shield")?.system.school).toBe("trs");
  });

  it("exports spells as dnd5e spell items with level, school, preparation, and source class", () => {
    const actor = createFoundryCharacterExport(state, summary);
    const spellItems = actor.items.filter((item) => item.type === "spell");
    const itemByName = new Map(spellItems.map((item) => [item.name, item]));

    expect(spellItems).toHaveLength(3);
    expect(itemByName.get("Fire Bolt")).toMatchObject({
      system: {
        level: 0,
        school: "evo",
        properties: ["vocal", "somatic"],
        prepared: 2,
        sourceClass: "fighter",
        range: { value: "120", units: "ft" },
        activation: { type: "action", value: 1 },
      },
    });
    expect(itemByName.get("Shield")).toMatchObject({
      system: {
        level: 1,
        school: "abj",
        prepared: 0,
        sourceClass: "fighter",
        activation: { type: "reaction", value: 1 },
      },
    });
    expect(itemByName.get("Magic Missile")).toMatchObject({
      system: {
        level: 1,
        school: "evo",
        prepared: 2,
        sourceClass: "fighter",
      },
    });
  });
});
