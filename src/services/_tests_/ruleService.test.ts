import { describe, expect, it } from "vitest";
import {
  getBuilderBackgrounds,
  getBuilderClasses,
  getBuilderEquipmentOptions,
  getBuilderLanguages,
  getBuilderSpecies,
  getDataSourceAudit,
  getSubclassesForClass,
} from "@/src/services/ruleService";
import { formatTaggedTextAsPlain } from "@/src/adapters/fiveEToolsAdapter";

describe("builder data services", () => {
  it("sanitizes complex 5etools tags before rendering", () => {
    expect(
      formatTaggedTextAsPlain(
        "Your {@classFeature Replicate Magic Item|Artificer|EFA|2|EFA} feature...",
      ),
    ).toBe("Your Replicate Magic Item feature...");
    expect(
      formatTaggedTextAsPlain("{@subclass Artillerist|Artificer|EFA|EFA}"),
    ).toBe("Artillerist");
  });

  it("maps the 5etools files that feed the MVP wizard", () => {
    expect(getDataSourceAudit()).toStrictEqual([
      {
        step: "Class",
        files: ["data/class/*.json"],
        purpose: "Classes, hit dice, proficiencies, features, and starting equipment.",
      },
      {
        step: "Species",
        files: ["data/races.json", "data/languages.json"],
        purpose: "2024 species traits, size, speed, senses, resistances, and magic.",
      },
      {
        step: "Background",
        files: ["data/backgrounds.json", "data/feats.json"],
        purpose: "2024 ability bonuses, origin feats, skills, tools, and equipment.",
      },
      {
        step: "Ability Scores",
        files: ["data/charcreationoptions.json", "data/backgrounds.json"],
        purpose: "Attribute generation methods and background ability choices.",
      },
      {
        step: "Equipment",
        files: ["data/items.json", "data/class/*.json", "data/backgrounds.json"],
        purpose: "Class/background equipment and item-derived sheet values.",
      },
    ]);
  });

  it("returns only 2024 species and does not expose species ability bonuses", () => {
    const species = getBuilderSpecies();

    expect(species.every((entry) => entry.ruleset === "2024")).toBe(true);
    expect(species.find((entry) => entry.id === "aasimar-xphb")).toMatchObject({
      name: "Aasimar",
      source: "XPHB",
      abilityBonuses: [],
    });
  });

  it("normalizes 2024 backgrounds with ability choices and origin feats", () => {
    const backgrounds = getBuilderBackgrounds();

    expect(backgrounds.find((entry) => entry.id === "acolyte-xphb")).toMatchObject({
      name: "Acolyte",
      source: "XPHB",
      summary: expect.any(String),
      descriptionBlocks: expect.arrayContaining([
        expect.objectContaining({ type: "paragraph" }),
      ]),
      originFeat: "Magic Initiate (Cleric)",
      image: {
        src: "https://cdn.5e.tools/2024/img/backgrounds/XPHB/Acolyte.webp",
        alt: expect.stringContaining("Acolyte"),
      },
      abilityOptions: [
        { mode: "+2/+1", attributes: ["inteligencia", "sabedoria", "carisma"] },
        { mode: "+1/+1/+1", attributes: ["inteligencia", "sabedoria", "carisma"] },
      ],
    });
  });

  it("normalizes 2024 classes, level progression, and equipment packages", () => {
    const fighter = getBuilderClasses().find((entry) => entry.id === "fighter-xphb");

    expect(fighter).toMatchObject({
      name: "Fighter",
      level: 1,
      hitDie: 10,
      summary: expect.any(String),
      descriptionBlocks: expect.arrayContaining([
        expect.objectContaining({ type: "paragraph" }),
      ]),
      primaryAbility: ["Strength", "Dexterity"],
      savingThrows: ["Strength", "Constitution"],
      levelOneFeatures: [
        expect.objectContaining({ name: "Fighting Style" }),
        expect.objectContaining({ name: "Second Wind" }),
        expect.objectContaining({ name: "Weapon Mastery" }),
      ],
    });
    expect(fighter?.allFeatures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Fighting Style", level: 1 }),
        expect.objectContaining({ name: "Extra Attack", level: 5 }),
        expect.objectContaining({ name: "Epic Boon", level: 19 }),
      ]),
    );
    expect(fighter?.startingEquipmentPackages.map((entry) => entry.id)).toStrictEqual([
      "A",
      "B",
      "C",
    ]);
    expect(fighter?.progressionRows[0]).toMatchObject({
      level: 1,
      proficiencyBonus: "+2",
      features: ["Fighting Style", "Second Wind", "Weapon Mastery"],
    });
    expect(fighter?.image).toMatchObject({
      src: "https://cdn.5e.tools/2024/img/classes/XPHB/Fighter.webp",
      alt: expect.stringContaining("Fighter"),
    });

    expect(
      getBuilderEquipmentOptions().find((entry) => entry.id === "chain-mail-xphb"),
    ).toMatchObject({
      name: "Chain Mail",
      armorClass: 16,
      sourceType: "class",
    });
  });

  it("normalizes Artificer 2024 class details from EFA references", () => {
    const artificer = getBuilderClasses().find((entry) => entry.id === "artificer-efa");

    expect(artificer).toMatchObject({
      name: "Artificer",
      source: "EFA",
      primaryAbility: ["Intelligence"],
      spellcastingAbility: "Intelligence",
      armorProficiencies: ["light", "medium", "shield"],
      weaponProficiencies: ["simple"],
      toolProficiencies: [
        "Thieves' Tools",
        "Tinker's Tools",
        "one type of Artisan's Tools of your choice",
      ],
      image: {
        src: "https://cdn.5e.tools/2024/img/classes/EFA/Artificer.webp",
        alt: expect.stringContaining("Artificer"),
      },
    });
    expect(artificer?.levelOneFeatures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Spellcasting",
          level: 1,
          blocks: expect.arrayContaining([
            expect.objectContaining({ type: "paragraph" }),
          ]),
        }),
        expect.objectContaining({ name: "Tinker's Magic", level: 1 }),
      ]),
    );
    expect(artificer?.progressionRows[0]).toMatchObject({
      level: 1,
      proficiencyBonus: "+2",
      features: ["Spellcasting", "Tinker's Magic"],
      spellSlots: ["2", "0", "0", "0", "0"],
    });
  });

  it("normalizes Weapon Mastery class choice groups", () => {
    const barbarian = getBuilderClasses().find(
      (entry) => entry.id === "barbarian-xphb",
    );
    const fighter = getBuilderClasses().find((entry) => entry.id === "fighter-xphb");

    expect(barbarian?.featureChoiceGroups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon-mastery",
          count: 2,
          options: expect.arrayContaining([
            expect.objectContaining({ label: expect.stringContaining("Greataxe") }),
          ]),
        }),
      ]),
    );
    expect(
      barbarian?.featureChoiceGroups[0]?.options.every((option) =>
        option.description?.includes("melee"),
      ),
    ).toBe(true);
    expect(fighter?.featureChoiceGroups[0]).toMatchObject({
      id: "weapon-mastery",
      count: 3,
    });
  });

  it("normalizes Bard 2024 as three unrestricted class skill choices", () => {
    const bard = getBuilderClasses().find((entry) => entry.id === "bard-xphb");

    expect(bard?.skillChoices).toMatchObject({
      count: 3,
      chooseFrom: expect.arrayContaining([
        "Acrobatics",
        "Arcana",
        "Performance",
        "Stealth",
      ]),
    });
    expect(bard?.skillChoices.chooseFrom).toHaveLength(18);
  });

  it("normalizes species choices and XPHB languages", () => {
    const dragonborn = getBuilderSpecies().find(
      (entry) => entry.id === "dragonborn-xphb",
    );

    expect(dragonborn?.choiceGroups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "draconic-ancestry",
          required: true,
          options: expect.arrayContaining([
            expect.objectContaining({ label: "Black", value: "black" }),
            expect.objectContaining({ label: "Red", value: "red" }),
          ]),
        }),
      ]),
    );
    expect(dragonborn?.image).toMatchObject({
      src: "https://cdn.5e.tools/2024/img/races/XPHB/Dragonborn.webp",
      alt: expect.stringContaining("Dragonborn"),
    });
    expect(dragonborn?.summary).toEqual(expect.any(String));
    expect(dragonborn?.descriptionBlocks).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "paragraph" })]),
    );
    expect(getBuilderLanguages()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Common", type: "standard" }),
        expect.objectContaining({ name: "Draconic", type: "standard" }),
        expect.objectContaining({ name: "Abyssal", type: "rare" }),
      ]),
    );
  });

  it("exposes a class's 2024 subclasses with leveled features", () => {
    const subclasses = getSubclassesForClass("fighter-xphb");
    const battleMaster = subclasses.find((s) => s.name === "Battle Master");
    expect(battleMaster).toBeDefined();
    expect(battleMaster?.id).toBe("battle-master-xphb");
    expect(
      battleMaster?.features.some((f) => f.level === 3 && f.name.length > 0),
    ).toBe(true);
  });

  it("includes legacy-compatible subclasses and dedupes reprints by name", () => {
    const subclasses = getSubclassesForClass("fighter-xphb");
    const names = subclasses.map((s) => s.name);

    // Legacy subclass available to the 2024 Fighter (source XGE, classSource XPHB).
    const cavalier = subclasses.find((s) => s.name === "Cavalier");
    expect(cavalier?.id).toBe("cavalier-xge");

    // Reprinted subclass deduped to the 2024 version, present once.
    expect(names.filter((n) => n === "Battle Master")).toHaveLength(1);
    expect(subclasses.find((s) => s.name === "Battle Master")?.id).toBe(
      "battle-master-xphb",
    );

    // No duplicate names.
    expect(new Set(names).size).toBe(names.length);
  });

  it("returns an empty list for an unknown class id", () => {
    expect(getSubclassesForClass("does-not-exist")).toEqual([]);
  });
});
