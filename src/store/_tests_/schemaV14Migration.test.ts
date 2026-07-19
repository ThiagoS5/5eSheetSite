import { describe, it, expect } from "vitest";
import { normalizeCharacterBuild } from "@/src/store/characterBuildModel";
import { CHARACTER_BUILD_SCHEMA_VERSION } from "@/src/types/characterBuild";

function createLegacyBuild(maxUnlockedStepIndex: number) {
  return {
    draft: {
      currentStepSlug: "antecedente",
      maxUnlockedStepIndex,
      pendingChoiceIds: [],
      inventory: [],
      equippedItemIds: [],
      equipmentChoicesBySource: {},
      description: { nome: "Migrated Hero" },
    },
    exportMetadata: {
      schemaVersion: 13,
      saveId: "x",
      createdAt: "a",
      updatedAt: "b",
    },
  };
}

describe("schema v14 migration — subclass step insertion", () => {
  it("pins the current schema version", () => {
    expect(CHARACTER_BUILD_SCHEMA_VERSION).toBe(15);
  });

  it("shifts maxUnlockedStepIndex past the inserted subclass step", () => {
    const build = normalizeCharacterBuild(createLegacyBuild(4) as never);

    expect(build.exportMetadata.schemaVersion).toBe(CHARACTER_BUILD_SCHEMA_VERSION);
    expect(build.draft.maxUnlockedStepIndex).toBe(5);
  });

  it("keeps maxUnlockedStepIndex before the insertion point untouched", () => {
    const build = normalizeCharacterBuild(createLegacyBuild(1) as never);

    expect(build.draft.maxUnlockedStepIndex).toBe(1);
  });

  it("does not shift indexes for builds already at v14", () => {
    const legacy = createLegacyBuild(4);
    legacy.exportMetadata.schemaVersion = 14;

    const build = normalizeCharacterBuild(legacy as never);

    expect(build.draft.maxUnlockedStepIndex).toBe(4);
  });
});
