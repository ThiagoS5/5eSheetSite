import { describe, expect, it } from "vitest";
import { deriveBuilderPendencies } from "@/rules/pendencyRules";
import { createCharacterStore } from "@/src/store/createCharacterStore";
import { getBuilderClasses } from "@/src/services/ruleService";

function fighterClass() {
  const characterClass = getBuilderClasses().find((entry) => entry.id === "fighter-xphb");
  if (!characterClass) {
    throw new Error("fighter-xphb missing");
  }
  return characterClass;
}

describe("pendency rules", () => {
  it("returns typed blocking pendencies for incomplete wizard steps", () => {
    const store = createCharacterStore();

    const pendencies = deriveBuilderPendencies({
      state: store.getState(),
    });

    expect(pendencies).toContainEqual({
      id: "classe-0",
      stepSlug: "classe",
      label: "Choose a Class to continue.",
      severity: "blocking",
    });
  });

  it("includes unresolved level choices as resources-step pendencies", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(3);

    const pendencies = deriveBuilderPendencies({
      state: store.getState(),
      characterClass: fighterClass(),
    });

    expect(pendencies).toContainEqual({
      id: "level-3-subclass",
      stepSlug: "recursos-classe",
      label: "Level 3: choose a subclass",
      severity: "blocking",
    });
  });
});
