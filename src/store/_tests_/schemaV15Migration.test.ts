import { describe, expect, it } from "vitest";
import { normalizeCharacterBuild } from "@/src/store/characterBuildModel";
import { CHARACTER_BUILD_SCHEMA_VERSION } from "@/src/types/characterBuild";

describe("schema v15 migration - external level-choice baseline", () => {
  it("pins the current schema version", () => {
    expect(CHARACTER_BUILD_SCHEMA_VERSION).toBe(17);
  });

  it("defaults old builds to no external level-choice baseline", () => {
    const build = normalizeCharacterBuild({
      draft: {
        currentStepSlug: "conclusao",
        maxUnlockedStepIndex: 9,
        pendingChoiceIds: [],
        inventory: [],
        equippedItemIds: [],
        equipmentChoicesBySource: {},
        description: { nome: "Legacy Hero" },
      },
      progression: {
        level: 10,
        levelChoices: {},
      },
      exportMetadata: {
        schemaVersion: 14,
        saveId: "legacy-v14",
        createdAt: "a",
        updatedAt: "b",
      },
    } as never);

    expect(build.exportMetadata.schemaVersion).toBe(CHARACTER_BUILD_SCHEMA_VERSION);
    expect(build.progression.externalLevelChoiceBaseline).toBe(0);
  });
});
