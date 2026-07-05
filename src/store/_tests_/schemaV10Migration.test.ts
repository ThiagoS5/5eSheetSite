import { describe, expect, it } from "vitest";
import v5FixtureRaw from "./fixtures/characterBuild.v5.json";
import {
  createCharacterBuildFromFlatState,
  flattenCharacterBuild,
  normalizeCharacterBuild,
} from "@/src/store/characterBuildModel";
import { getBuilderClasses } from "@/src/services/ruleService";
import { CHARACTER_BUILD_SCHEMA_VERSION } from "@/src/types/characterBuild";
import type { CharacterBuild } from "@/src/types/characterBuild";

const legacyFixture = v5FixtureRaw as unknown as CharacterBuild;

describe("schema v10 migration", () => {
  it("defaults equippedItemIds for older builds", () => {
    const build = normalizeCharacterBuild(legacyFixture);

    expect(CHARACTER_BUILD_SCHEMA_VERSION).toBe(10);
    expect(build.exportMetadata.schemaVersion).toBe(10);
    expect(build.draft.equippedItemIds).toEqual([]);
  });

  it("round-trips equippedItemIds through flat state", () => {
    const build = normalizeCharacterBuild({
      ...legacyFixture,
      draft: {
        ...legacyFixture.draft,
        inventory: [{ itemId: "longsword-xphb", quantity: 1 }],
        equippedItemIds: ["longsword-xphb"],
      },
    });

    const flat = flattenCharacterBuild(build);
    expect(flat.equippedItemIds).toEqual(["longsword-xphb"]);

    const rebuilt = createCharacterBuildFromFlatState({ ...flat } as never, build);
    expect(rebuilt.draft.equippedItemIds).toEqual(["longsword-xphb"]);
  });

  it("preserves equipped class-kit item ids during normalization", () => {
    const fighterKit = getBuilderClasses()
      .find((entry) => entry.id === "fighter-xphb")
      ?.startingEquipmentPackages.find((entry) =>
        entry.items.some((item) => item.id === "chain-mail-xphb"),
      );

    expect(fighterKit).toBeDefined();

    const build = normalizeCharacterBuild({
      ...legacyFixture,
      draft: {
        ...legacyFixture.draft,
        inventory: [],
        equippedItemIds: ["chain-mail-xphb"],
        equipmentChoicesBySource: {
          class: { mode: "items", selectedOptionId: fighterKit?.id ?? "" },
        },
      },
      choices: {
        ...legacyFixture.choices,
        selectedClassId: "fighter-xphb",
      },
    });

    expect(build.draft.equippedItemIds).toEqual(["chain-mail-xphb"]);
  });
});
