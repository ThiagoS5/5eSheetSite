import { describe, expect, it } from "vitest";
import { importFoundryCharacter } from "@/src/adapters/foundryImportAdapter";
import { getBuilderClasses } from "@/src/services/ruleService";
import { createStoreStateFromBuild } from "@/src/store/characterBuildModel";
import { getPendingRequirements } from "@/src/store/levelChoiceResolver";
import { createFoundryCharacterExport } from "@/src/utils/foundryAdapter";

const importOptions = {
  now: "2026-07-18T12:00:00.000Z",
  saveId: "foundry-import-save",
};

describe("foundryImportAdapter", () => {
  it("maps a Foundry dnd5e actor export into a Forge & Fate build", () => {
    const result = importFoundryCharacter(
      JSON.stringify(createFoundryActorFixture()),
      importOptions,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const build = result.build;

    expect(build.exportMetadata).toMatchObject({
      saveId: "foundry-import-save",
      createdAt: "2026-07-18T12:00:00.000Z",
      updatedAt: "2026-07-18T12:00:00.000Z",
    });
    expect(build.draft.description.nome).toBe("Hatrian Heaven (O Comerciante)");
    expect(build.draft.description.alinhamento).toBe("Chaotic Neutral");
    expect(build.draft.description.historia).toBe("Deals in secrets.");
    expect(build.progression.level).toBe(10);
    expect(build.progression.externalLevelChoiceBaseline).toBe(10);
    expect(build.choices.selectedClassId).toBe("sorcerer-xphb");
    expect(build.choices.selectedSpeciesId).toBe("human-xphb");
    expect(build.choices.selectedBackgroundId).toBe("merchant-xphb");
    expect(build.choices.selectedSubclassId).toBe("shadow-magic-xge");
    expect(build.choices.attributeGenerationMethod).toBe("manual");
    expect(build.derivedSheet.finalAttributes).toMatchObject({
      forca: 8,
      destreza: 13,
      constituicao: 12,
      inteligencia: 16,
      sabedoria: 10,
      carisma: 20,
    });
    expect(build.choices.skillTraining).toMatchObject({
      "Animal Handling": "proficient",
      Intimidation: "expertise",
      Persuasion: "proficient",
    });
    expect(build.choices.classSkillProficiencies).toEqual(["Intimidation"]);
    expect(build.choices.additionalChoices.skillProficiencies).toEqual([]);
    expect(build.choices.speciesLanguages).toEqual([
      "Common",
      "Elvish",
    ]);
    expect(build.choices.additionalChoices.languages).toEqual([
      "Infernal",
      "Primordial",
    ]);
    expect(build.derivedSheet.languages).toEqual(
      expect.arrayContaining(["Common", "Elvish", "Infernal", "Primordial"]),
    );
    expect(build.choices.money).toEqual({ pc: 24, pp: 1, pe: 0, po: 50, pl: 0 });
    expect(build.playState).toMatchObject({
      currentHp: 62,
      tempHp: 4,
      overrides: { armorClass: 15, maxHp: 62 },
    });
    expect(build.draft.inventory).toEqual(
      expect.arrayContaining([
        { itemId: "rapier-xphb", quantity: 1 },
        { itemId: "dagger-xphb", quantity: 2 },
        { itemId: "backpack-xphb", quantity: 1 },
        {
          itemId: "foundry-trade-ledger-of-doom",
          quantity: 1,
          customItem: expect.objectContaining({
            name: "Trade Ledger of Doom",
            source: "Foundry VTT",
            category: "Wondrous",
            isMagical: true,
            attunementRequired: true,
            charges: { current: 2, max: 3 },
          }),
        },
        {
          itemId: "foundry-3-plate-armor",
          quantity: 1,
          customItem: expect.objectContaining({
            name: "+3 Plate Armor",
            category: "Armor",
            isMagical: true,
          }),
        },
      ]),
    );
    expect(build.draft.equippedItemIds).toEqual(
      expect.arrayContaining(["rapier-xphb", "backpack-xphb"]),
    );
    expect(build.choices.spellcasting).toMatchObject({
      cantripIds: ["mage-hand-xphb"],
      knownSpellIds: [],
      preparedSpellIds: ["magic-missile-xphb"],
    });
    expect(build.choices.additionalChoices.spellcasting.knownSpellIds).toEqual([
      "shield-xphb",
    ]);
    expect(build.derivedSheet.spellcasting?.knownSpells.map((spell) => spell.name)).toContain(
      "Shield",
    );
    expect(build.draft.description.notas).not.toContain(
      "Unmapped Foundry subclass: Shadow Magic",
    );
    expect(build.draft.description.notas).not.toContain("Unmapped Foundry items");
    expect(build.derivedSheet.inventory.map((entry) => entry.item.name)).toContain(
      "Trade Ledger of Doom",
    );
    expect(build.derivedSheet.classSkillProficiencies).toEqual(
      expect.arrayContaining(["Animal Handling", "Intimidation", "Persuasion"]),
    );
    expect(build.exportMetadata.foundryOrigin).toMatchObject({
      profile: "dnd5e-5.2",
      actor: { name: "Hatrian Heaven (O Comerciante)" },
    });

    const characterClass = getBuilderClasses().find(
      (entry) => entry.id === build.choices.selectedClassId,
    );
    expect(characterClass).toBeDefined();
    if (!characterClass) return;

    expect(
      getPendingRequirements(createStoreStateFromBuild(build), characterClass),
    ).toEqual([]);
  });

  it("rejects files that are not Foundry dnd5e character actors", () => {
    expect(importFoundryCharacter("{not json")).toEqual({
      ok: false,
      error: "The file is not valid JSON.",
    });
    expect(importFoundryCharacter(JSON.stringify({ type: "npc", items: [] }))).toEqual({
      ok: false,
      error: "The file is not a Foundry VTT character actor.",
    });
  });

  it("keeps an unmapped Foundry subclass pending despite the external baseline", () => {
    const actor = createFoundryActorFixture();
    const subclassItem = actor.items.find((item) => item.type === "subclass");
    if (!subclassItem) throw new Error("Foundry fixture subclass missing");

    subclassItem.name = "Custom Shadow Market";
    subclassItem.system.identifier = "custom-shadow-market";

    const result = importFoundryCharacter(JSON.stringify(actor), importOptions);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const build = result.build;
    const characterClass = getBuilderClasses().find(
      (entry) => entry.id === build.choices.selectedClassId,
    );
    expect(characterClass).toBeDefined();
    if (!characterClass) return;

    const pendingRequirements = getPendingRequirements(
      createStoreStateFromBuild(build),
      characterClass,
    );

    expect(build.draft.currentStepSlug).toBe("subclasse");
    expect(build.draft.description.notas).toContain(
      "Unmapped Foundry subclass: Custom Shadow Market",
    );
    expect(pendingRequirements.some((req) => req.kind === "subclass")).toBe(true);
    expect(pendingRequirements.some((req) => req.kind === "asi-or-feat")).toBe(
      false,
    );
  });

  it("treats Foundry prepared value 1 as prepared for prepared casters", () => {
    const result = importFoundryCharacter(
      JSON.stringify({
        name: "Foundry Druid",
        type: "character",
        system: {
          details: { originalClass: "class-id" },
          abilities: {
            str: { value: 8 },
            dex: { value: 13 },
            con: { value: 12 },
            int: { value: 10 },
            wis: { value: 16 },
            cha: { value: 10 },
          },
        },
        items: [
          {
            _id: "class-id",
            name: "Druid",
            type: "class",
            system: { identifier: "druid", levels: 3 },
          },
          {
            _id: "spell-id",
            name: "Animal Friendship",
            type: "spell",
            system: {
              identifier: "animal-friendship",
              level: 1,
              prepared: 1,
              sourceClass: "druid",
            },
          },
        ],
      }),
      importOptions,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.build.choices.selectedClassId).toBe("druid-xphb");
    expect(result.build.choices.spellcasting).toMatchObject({
      knownSpellIds: [],
      preparedSpellIds: ["animal-friendship-xphb"],
    });
  });

  it("detects dnd5e 5.3 and preserves level-10 extras without false pendencies", () => {
    const actor = createFoundryActorFixture() as unknown as {
      [key: string]: unknown;
      system: {
        [key: string]: unknown;
        attributes: Record<string, unknown>;
        traits: Record<string, unknown>;
      };
      items: Array<Record<string, unknown>>;
    };
    Object.assign(actor, {
      _stats: { systemId: "dnd5e", systemVersion: "5.3.3", coreVersion: "14.0" },
      effects: [{ name: "Poisoned", disabled: false, statuses: ["poisoned"] }],
    });
    Object.assign(actor.system.attributes, {
      senses: { ranges: { darkvision: 90 }, units: "ft", special: "Echo sense" },
      death: { success: 2, failure: 1 },
      inspiration: true,
    });
    Object.assign(actor.system, {
      tools: { thief: { value: 1, label: "Thieves' Tools" } },
    });
    Object.assign(actor.system.traits, {
      dr: { value: ["fire"], custom: "Psychic" },
      di: { value: ["poison"] },
      dv: { value: ["radiant"] },
    });
    actor.items.push(
      {
        _id: "custom-spell-id",
        name: "Merchant's Spark",
        type: "spell",
        system: {
          level: 1,
          school: "evo",
          activation: { type: "action", value: 1 },
          range: { value: 90, units: "ft" },
          duration: { value: null, units: "inst" },
          preparation: { mode: "known", prepared: false },
          description: { value: "<p>A private guild spell.</p>" },
        },
      },
      {
        _id: "custom-feat-id",
        name: "Guild Secret",
        type: "feat",
        system: { description: { value: "<p>An imported custom feature.</p>" } },
      },
    );

    const result = importFoundryCharacter(JSON.stringify(actor), importOptions);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const build = result.build;
    expect(build.exportMetadata.foundryOrigin?.profile).toBe("dnd5e-5.3");
    expect(build.choices.additionalChoices).toMatchObject({
      languages: ["Infernal", "Primordial"],
      toolProficiencies: ["Thieves' Tools"],
      resistances: ["Fire", "Psychic"],
      immunities: ["Poison"],
      vulnerabilities: ["Radiant"],
      senses: [
        { name: "Darkvision", rangeFeet: 90 },
        { name: "Echo sense" },
      ],
    });
    expect(build.choices.additionalChoices.customSpells).toEqual([
      expect.objectContaining({ name: "Merchant's Spark", level: 1 }),
    ]);
    expect(build.choices.additionalChoices.customFeatures).toEqual([
      expect.objectContaining({ name: "Guild Secret" }),
    ]);
    expect(build.playState).toMatchObject({
      deathSaves: { successes: 2, failures: 1 },
      inspiration: true,
      conditions: ["Poisoned"],
    });

    const characterClass = getBuilderClasses().find(
      (entry) => entry.id === build.choices.selectedClassId,
    )!;
    expect(getPendingRequirements(createStoreStateFromBuild(build), characterClass)).toEqual([]);
  });

  it("rejects Foundry snapshots larger than 2 MiB", () => {
    const actor = createFoundryActorFixture();
    Object.assign(actor, { padding: "x".repeat(2 * 1024 * 1024) });
    expect(importFoundryCharacter(JSON.stringify(actor))).toEqual({
      ok: false,
      error: "The Foundry actor exceeds the 2 MiB snapshot limit.",
    });
  });

  it("preserves unknown snapshot metadata through import, edit, and cross-profile re-export", () => {
    const source = createFoundryActorFixture();
    const actor = {
      ...source,
      flags: { customModule: { mystery: true } },
      ownership: { default: 0, playerId: 3 },
      system: {
        ...source.system,
        customModuleField: { untouched: "keep-me" },
      },
      items: source.items.map((item, index) =>
        index === 0 ? { ...item, flags: { customModule: { itemMarker: 7 } } } : item,
      ),
      _stats: { systemId: "dnd5e", systemVersion: "5.2.4", coreVersion: "13.350" },
    };
    const imported = importFoundryCharacter(JSON.stringify(actor), importOptions);

    expect(imported.ok).toBe(true);
    if (!imported.ok) return;

    const state = createStoreStateFromBuild(imported.build);
    const editedState = {
      ...state,
      description: {
        ...state.description,
        nome: "Hatrian Reforged",
        tracos: "Updated at the table.",
      },
    };
    const editedSummary = {
      ...imported.build.derivedSheet,
      name: "Hatrian Reforged",
      currentHp: 41,
      tempHp: 0,
    };
    const reexported = createFoundryCharacterExport(editedState, editedSummary, {
      profile: "dnd5e-5.3",
      originSnapshot: imported.build.exportMetadata.foundryOrigin,
    });

    expect(reexported.name).toBe("Hatrian Reforged");
    expect(reexported.system.attributes.hp).toMatchObject({ value: 41, temp: 0 });
    expect(reexported.system.details.trait).toBe("Updated at the table.");
    expect(reexported.system.customModuleField).toEqual({ untouched: "keep-me" });
    expect(reexported.flags).toEqual({ customModule: { mystery: true } });
    expect(reexported.ownership).toEqual({ default: 0, playerId: 3 });
    expect(reexported.items.find((item) => item.name === "Human")?.flags).toEqual({
      customModule: { itemMarker: 7 },
    });
    expect(reexported._stats).toMatchObject({ systemVersion: "5.3.3", coreVersion: "14.0" });
    expect(reexported.system.attributes.senses).toHaveProperty("ranges");
  });
});

function createFoundryActorFixture() {
  return {
    name: "Hatrian Heaven (O Comerciante)",
    type: "character",
    system: {
      details: {
        alignment: "Chaotic Neutral",
        biography: { value: "<p>Deals in secrets.</p>", public: "" },
        trait: "Always bargaining.",
        ideal: "Freedom matters more than law.",
        bond: "The ledger must survive.",
        flaw: "Cannot resist a rare bargain.",
        race: "race-id",
        background: "background-id",
        originalClass: "class-id",
      },
      abilities: {
        str: { value: 8 },
        dex: { value: 13 },
        con: { value: 12 },
        int: { value: 16 },
        wis: { value: 10 },
        cha: { value: 20 },
      },
      attributes: {
        hp: { value: 62, max: null, temp: 4 },
        ac: { flat: 15 },
      },
      currency: { cp: 24, sp: 1, ep: 0, gp: 50, pp: 0 },
      skills: {
        ani: { value: 1 },
        itm: { value: 2 },
        per: { value: 1 },
      },
      traits: {
        languages: {
          value: ["common", "elvish", "infernal", "primordial"],
        },
      },
    },
    items: [
      {
        _id: "race-id",
        name: "Human",
        type: "race",
        system: { identifier: "human" },
      },
      {
        _id: "class-id",
        name: "Sorcerer",
        type: "class",
        system: { identifier: "sorcerer", levels: 10 },
      },
      {
        _id: "subclass-id",
        name: "Shadow Magic",
        type: "subclass",
        system: { identifier: "shadow-magic", classIdentifier: "sorcerer" },
      },
      {
        _id: "background-id",
        name: "Merchant",
        type: "background",
        system: { identifier: "merchant" },
      },
      {
        _id: "rapier-id",
        name: "Rapier",
        type: "weapon",
        system: {
          identifier: "rapier",
          quantity: 1,
          equipped: true,
          type: { baseItem: "rapier" },
        },
      },
      {
        _id: "dagger-id",
        name: "Dagger",
        type: "weapon",
        system: {
          identifier: "dagger",
          quantity: 2,
          equipped: false,
          type: { baseItem: "dagger" },
        },
      },
      {
        _id: "backpack-id",
        name: "Backpack",
        type: "container",
        system: { identifier: "backpack", quantity: 1, equipped: true },
      },
      {
        _id: "custom-ledger-id",
        name: "Trade Ledger of Doom",
        type: "loot",
        system: {
          identifier: "trade-ledger-of-doom",
          quantity: 1,
          rarity: "rare",
          properties: ["mgc"],
          attunement: "required",
          uses: { max: 3, spent: 1 },
        },
      },
      {
        _id: "custom-plate-id",
        name: "+3 Plate Armor",
        type: "equipment",
        system: {
          identifier: "3-plate-armor",
          quantity: 1,
          rarity: "legendary",
          properties: ["mgc"],
          type: { value: "heavy", baseItem: "plate" },
          armor: { value: 18, magicalBonus: 3 },
        },
      },
      {
        _id: "mage-hand-id",
        name: "Mage Hand",
        type: "spell",
        system: { identifier: "mage-hand", level: 0, prepared: 2 },
      },
      {
        _id: "shield-id",
        name: "Shield",
        type: "spell",
        system: { identifier: "shield", level: 1, prepared: 0 },
      },
      {
        _id: "magic-missile-id",
        name: "Magic Missile",
        type: "spell",
        system: { identifier: "magic-missile", level: 1, prepared: 2 },
      },
    ],
  };
}
