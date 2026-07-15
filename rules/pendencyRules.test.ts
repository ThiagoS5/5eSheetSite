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

  it("routes the unresolved subclass choice to the subclass step, once", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(3);

    const pendencies = deriveBuilderPendencies({
      state: store.getState(),
      characterClass: fighterClass(),
    });

    const subclassPendencies = pendencies.filter(
      (pendency) => /subclass/i.test(pendency.label),
    );
    expect(subclassPendencies).toEqual([
      {
        id: "subclasse-0",
        stepSlug: "subclasse",
        label: "Choose a Fighter subclass to continue.",
        severity: "blocking",
      },
    ]);
  });

  it("keeps non-subclass level choices as resources-step pendencies", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().selectSubclass("battle-master-xphb");
    store.getState().setLevel(4);

    const pendencies = deriveBuilderPendencies({
      state: store.getState(),
      characterClass: fighterClass(),
    });

    expect(pendencies).toContainEqual({
      id: "level-4-asi-or-feat",
      stepSlug: "recursos-classe",
      label: "Level 4: choose ASI or feat",
      severity: "blocking",
    });
  });
});
