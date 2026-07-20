import { describe, expect, it } from "vitest";
import { normalizeCharacterBuild } from "@/src/store/characterBuildModel";
import { CHARACTER_BUILD_SCHEMA_VERSION } from "@/src/types/characterBuild";

describe("schema v17 migration - flexible choices and Foundry origin", () => {
  it("pins the current schema version", () => {
    expect(CHARACTER_BUILD_SCHEMA_VERSION).toBe(17);
  });

  it("defaults old inventory entries to catalog-backed items", () => {
    const build = normalizeCharacterBuild({
      draft: {
        currentStepSlug: "conclusao",
        maxUnlockedStepIndex: 9,
        pendingChoiceIds: [],
        inventory: [{ itemId: "rope-xphb", quantity: 1 }],
        equippedItemIds: [],
        equipmentChoicesBySource: {},
        description: { nome: "Legacy Inventory Hero" },
      },
      progression: {
        level: 5,
        externalLevelChoiceBaseline: 0,
        levelChoices: {},
      },
      exportMetadata: {
        schemaVersion: 15,
        saveId: "legacy-v15",
        createdAt: "a",
        updatedAt: "b",
      },
    } as never);

    expect(build.exportMetadata.schemaVersion).toBe(CHARACTER_BUILD_SCHEMA_VERSION);
    expect(build.draft.inventory).toEqual([{ itemId: "rope-xphb", quantity: 1 }]);
  });

  it("preserves imported custom inventory metadata", () => {
    const build = normalizeCharacterBuild({
      draft: {
        currentStepSlug: "conclusao",
        maxUnlockedStepIndex: 9,
        pendingChoiceIds: [],
        inventory: [
          {
            itemId: "foundry-cube-of-force",
            quantity: 1,
            customItem: {
              name: " Cube of Force ",
              source: "Foundry VTT",
              category: "Wondrous",
              type: "gear",
              rarity: "rare",
              isMagical: true,
              attunementRequired: true,
              charges: { current: 6, max: 10 },
            },
          },
        ],
        equippedItemIds: [],
        equipmentChoicesBySource: {},
        description: { nome: "Imported Inventory Hero" },
      },
      progression: {
        level: 5,
        externalLevelChoiceBaseline: 0,
        levelChoices: {},
      },
      exportMetadata: {
        schemaVersion: 16,
        saveId: "schema-v16",
        createdAt: "a",
        updatedAt: "b",
      },
    } as never);

    expect(build.draft.inventory).toEqual([
      {
        itemId: "foundry-cube-of-force",
        quantity: 1,
        customItem: {
          name: "Cube of Force",
          source: "Foundry VTT",
          category: "Wondrous",
          type: "gear",
          rarity: "rare",
          isMagical: true,
          attunementRequired: true,
          charges: { current: 6, max: 10 },
        },
      },
    ]);
  });

  it("defaults v16 characters to rules mode with empty additional choices", () => {
    const build = normalizeCharacterBuild({
      choices: {
        creationPreferences: {
          activeSources: ["XPHB"],
          progressionMode: "xp",
        },
      },
      exportMetadata: {
        schemaVersion: 16,
        saveId: "schema-v16-flexible-default",
        createdAt: "a",
        updatedAt: "b",
      },
    } as never);

    expect(build.choices.creationPreferences?.choiceLimits).toBe("rules");
    expect(build.choices.additionalChoices).toMatchObject({
      skillProficiencies: [],
      toolProficiencies: [],
      languages: [],
      featIds: [],
      customSpells: [],
      customFeatures: [],
    });
  });

  it("preserves additional choices and a sanitized Foundry snapshot", () => {
    const build = normalizeCharacterBuild({
      choices: {
        additionalChoices: {
          skillProficiencies: ["Arcana", "Arcana"],
          toolProficiencies: ["Thieves' Tools"],
          languages: ["Draconic"],
          featIds: ["custom-feat"],
          classFeatureChoices: { mastery: ["whip"] },
          spellcasting: {
            cantripIds: ["custom-light"],
            knownSpellIds: [],
            preparedSpellIds: [],
          },
          customSpells: [],
          customFeatures: [],
        },
        creationPreferences: {
          activeSources: ["XPHB"],
          progressionMode: "milestone",
          choiceLimits: "flexible",
        },
      },
      exportMetadata: {
        schemaVersion: 17,
        saveId: "schema-v17",
        createdAt: "a",
        updatedAt: "b",
        foundryOrigin: {
          profile: "dnd5e-5.3",
          systemVersion: "5.3.3",
          actor: JSON.parse('{"name":"Snapshot Hero","__proto__":{"polluted":true}}'),
        },
      },
    } as never);

    expect(build.choices.creationPreferences?.choiceLimits).toBe("flexible");
    expect(build.choices.additionalChoices.skillProficiencies).toEqual(["Arcana"]);
    expect(build.exportMetadata.foundryOrigin).toMatchObject({
      profile: "dnd5e-5.3",
      systemVersion: "5.3.3",
      actor: { name: "Snapshot Hero" },
    });
  });
});
