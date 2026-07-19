import { describe, expect, it } from "vitest";
import { importFoundryCharacter } from "@/src/adapters/foundryImportAdapter";
import { getBuilderClasses } from "@/src/services/ruleService";
import { createStoreStateFromBuild } from "@/src/store/characterBuildModel";
import { getPendingRequirements } from "@/src/store/levelChoiceResolver";

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
    expect(build.choices.classSkillProficiencies).toEqual(
      expect.arrayContaining(["Animal Handling", "Intimidation", "Persuasion"]),
    );
    expect(build.choices.speciesLanguages).toEqual([
      "Common",
      "Elvish",
      "Infernal",
      "Primordial",
    ]);
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
      ]),
    );
    expect(build.draft.equippedItemIds).toEqual(
      expect.arrayContaining(["rapier-xphb", "backpack-xphb"]),
    );
    expect(build.choices.spellcasting).toMatchObject({
      cantripIds: ["mage-hand-xphb"],
      knownSpellIds: ["shield-xphb"],
      preparedSpellIds: ["magic-missile-xphb"],
    });
    expect(build.draft.description.notas).not.toContain(
      "Unmapped Foundry subclass: Shadow Magic",
    );
    expect(build.draft.description.notas).toContain("Trade Ledger of Doom");

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
        system: { identifier: "trade-ledger-of-doom", quantity: 1 },
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
