import { describe, expect, it } from "vitest";
import { quickBuildProfiles } from "@/src/data/quickBuildProfiles";
import { createQuickBuild, getAvailableQuickBuildProfiles } from "@/src/store/quickBuildFactory";
import { getBuilderClasses } from "@/src/services/ruleService";
import { getSpellById } from "@/src/services/spellService";
import type { CreationPreferences } from "@/src/types/characterBuild";

const preferences: CreationPreferences = { activeSources: ["XPHB", "EFA"], progressionMode: "xp", choiceLimits: "rules" };

describe("quick-build creation", () => {
  it.each(quickBuildProfiles)("creates a healthy $label with its starting spells", (profile) => {
    const build = createQuickBuild(profile, preferences);
    const characterClass = getBuilderClasses().find((entry) => entry.id === profile.classId)!;
    const choices = build.choices.spellcasting!;
    expect(build.playState.currentHp).toBe(build.derivedSheet.maxHp);
    expect(build.playState.currentHp).toBeGreaterThan(0);
    expect(build.draft.currentStepSlug).toBe("descricao");
    expect(build.draft.maxUnlockedStepIndex).toBe(9);
    expect(choices.cantripIds).toHaveLength(characterClass.spellcastingProgression?.cantripsKnown[0] ?? 0);
    expect(choices.knownSpellIds).toHaveLength(characterClass.spellcastingProgression?.knownSpells[0] ?? 0);
    expect(choices.preparedSpellIds).toHaveLength(characterClass.spellcastingProgression?.preparedSpells[0] ?? 0);
    for (const id of [...choices.cantripIds, ...choices.knownSpellIds, ...choices.preparedSpellIds]) {
      const spell = getSpellById(id)!;
      expect(spell.classNames).toContain(characterClass.name);
      expect(preferences.activeSources).toContain(spell.source);
      expect(spell.level).toBeLessThanOrEqual(1);
    }
  });

  it("does not offer or create an Artificer when EFA is disabled", () => {
    const coreOnly = { ...preferences, activeSources: ["XPHB"] };
    expect(getAvailableQuickBuildProfiles(coreOnly).map((profile) => profile.classId)).not.toContain("artificer-efa");
    expect(() => createQuickBuild(quickBuildProfiles.find((profile) => profile.classId === "artificer-efa")!, coreOnly)).toThrow(/unavailable/);
  });

  it("prepares the Wizard starter loadout from the 2024 catalog", () => {
    const build = createQuickBuild(quickBuildProfiles.find((profile) => profile.classId === "wizard-xphb")!, preferences);
    expect(build.choices.spellcasting?.cantripIds).toEqual(["fire-bolt-xphb", "mage-hand-xphb", "light-xphb"]);
    expect(build.choices.spellcasting?.preparedSpellIds).toEqual(["magic-missile-xphb", "shield-xphb", "detect-magic-xphb", "thunderwave-xphb"]);
    expect(build.derivedSheet.spellcasting?.spellSaveDc).toBe(13);
  });
});
