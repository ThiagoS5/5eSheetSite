import { describe, expect, it } from "vitest";
import { normalizeCharacterBuild } from "@/src/store/characterBuildModel";
import { CHARACTER_BUILD_SCHEMA_VERSION } from "@/src/types/characterBuild";

describe("schema v16 migration - imported inventory metadata", () => {
  it("pins the current schema version", () => {
    expect(CHARACTER_BUILD_SCHEMA_VERSION).toBe(16);
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
});
