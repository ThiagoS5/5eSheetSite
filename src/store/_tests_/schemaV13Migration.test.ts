import { describe, it, expect } from "vitest";
import { normalizeCharacterBuild } from "@/src/store/characterBuildModel";
import { CHARACTER_BUILD_SCHEMA_VERSION } from "@/src/types/characterBuild";

describe("schema v13 migration — historia + campaignLog", () => {
  it("defaults new fields on a legacy build and preserves existing data", () => {
    const legacy = {
      draft: {
        currentStepSlug: "conclusao",
        maxUnlockedStepIndex: 0,
        pendingChoiceIds: [],
        inventory: [],
        equippedItemIds: [],
        equipmentChoicesBySource: {},
        description: { nome: "Thalindra", notas: "keep me" },
      },
      playState: { currentHp: 10, conditions: ["prone"] },
      exportMetadata: { schemaVersion: 12, saveId: "x", createdAt: "a", updatedAt: "b" },
    };

    const build = normalizeCharacterBuild(legacy as never);

    expect(build.exportMetadata.schemaVersion).toBe(CHARACTER_BUILD_SCHEMA_VERSION);
    expect(build.draft.description.historia).toBe("");
    expect(build.draft.description.notas).toBe("keep me");
    expect(build.playState.campaignLog).toEqual([]);
    expect(build.playState.conditions).toEqual(["prone"]);
  });
});
