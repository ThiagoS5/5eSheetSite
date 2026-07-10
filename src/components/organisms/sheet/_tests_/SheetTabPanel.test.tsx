/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import type { CharacterSheetSummary, CharacterDescription } from "@/types/builder";
import { EMPTY_COIN_POUCH } from "@/src/types/characterBuild";

vi.mock("@/src/store/useCharacterStore", () => ({
  useCharacterStore: (selector: (s: unknown) => unknown) =>
    selector({
      playState: undefined,
      characterBuild: { playState: { conditions: [], campaignLog: [] } },
      toggleCondition: vi.fn(),
      setResourceUseCount: vi.fn(),
      setSkillTraining: vi.fn(),
      setSkillOverride: vi.fn(),
      applyDamage: vi.fn(),
      heal: vi.fn(),
      setTempHp: vi.fn(),
      shortRest: vi.fn(),
      longRest: vi.fn(),
      toggleInspiration: vi.fn(),
      setOverride: vi.fn(),
    }),
}));

import { SheetTabPanel } from "@/src/components/organisms/sheet/SheetTabPanel";

function makeSummaryFixture(): CharacterSheetSummary {
  return {
    ruleset: "2024",
    level: 5,
    speciesId: "high-elf",
    classId: "wizard",
    backgroundId: "sage",
    originFeat: "",
    baseAttributes: { forca: 10, destreza: 14, constituicao: 12, inteligencia: 16, sabedoria: 10, carisma: 8 },
    backgroundAbilityBonuses: {},
    finalAttributes: { forca: 10, destreza: 14, constituicao: 12, inteligencia: 16, sabedoria: 10, carisma: 8 },
    proficiencyBonus: 3,
    hitPoints: 27,
    armorClass: 13,
    selectedEquipment: [],
    inventory: [],
    selectedTraits: [],
    classFeatures: [],
    classSkillProficiencies: [],
    skillTraining: {},
    classFeatureChoices: {},
    speciesChoices: {},
    speciesLanguages: [],
    validationMessages: [],
    name: "Thalindra",
    className: "Wizard",
    speciesName: "High Elf",
    backgroundName: "Sage",
    currentHp: 27,
    maxHp: 27,
    tempHp: 0,
    hitDice: "5d6",
    initiative: 3,
    speedFeet: 30,
    speedMeters: 9,
    xp: 0,
    xpThreshold: 0,
    isSpellcaster: false,
    attributes: [],
    skills: [],
    savingThrows: [],
    passives: { perception: 11, investigation: 11, insight: 13 },
    senses: [],
    languages: [],
    toolProficiencies: [],
    resistances: [],
    immunities: [],
    vulnerabilities: [],
    features: [],
    weapons: [],
    money: EMPTY_COIN_POUCH,
    carry: { currentKg: 0, maxKg: 75 },
  };
}

function makeDescriptionFixture(): CharacterDescription {
  return {
    nome: "Thalindra",
    alinhamento: "",
    faith: "",
    lifestyle: "",
    age: "",
    height: "",
    weight: "",
    eyes: "",
    skin: "",
    hair: "",
    gender: "",
    aparencia: "",
    personalidade: "",
    tracos: "",
    notas: "",
    historia: "",
    portraitId: "",
  };
}

describe("SheetTabPanel", () => {
  it("renders without throwing", () => {
    const { container } = render(
      <SheetTabPanel summary={makeSummaryFixture()} description={makeDescriptionFixture()} />,
    );
    expect(container).toBeTruthy();
  });
});
