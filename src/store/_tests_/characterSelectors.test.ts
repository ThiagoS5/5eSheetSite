import { describe, expect, it } from "vitest";
import {
  createCharacterStore,
  initialCharacterState,
} from "@/src/store/createCharacterStore";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import { getBuilderClasses } from "@/src/services/ruleService";
import { getItemCatalog } from "@/src/services/itemCatalogService";
import { calculateMaxHitPoints } from "@/src/adapters/characterDerivedAdapter";

describe("character selectors", () => {
  it("derives final attributes from 2024 background bonuses, not species", () => {
    const store = createCharacterStore();

    store.getState().selectSpecies("aasimar-xphb");
    store.getState().selectBackground("acolyte-xphb");
    store.getState().setBackgroundAbilityBonuses({
      inteligencia: 2,
      sabedoria: 1,
    });

    const summary = selectCharacterSheetSummary(store.getState());

    expect(summary.ruleset).toBe("2024");
    expect(summary.speciesId).toBe("aasimar-xphb");
    expect(summary.backgroundId).toBe("acolyte-xphb");
    expect(summary.finalAttributes.inteligencia).toBe(
      initialCharacterState.baseAttributes.inteligencia + 2,
    );
    expect(summary.originFeat).toBe("Magic Initiate (Cleric)");
    expect(summary.senses[0]?.rangeFeet).toBeGreaterThanOrEqual(60);
  });

  it("caps final attributes at 20 after background bonus + ASI", () => {
    const store = createCharacterStore();

    store.getState().selectClass("fighter-xphb");
    store.getState().setForca(17);
    store.getState().setBackgroundAbilityBonuses({ forca: 2 });
    store.getState().setLevel(4);
    store.getState().setLevelAsiOrFeat(4, { mode: "asi", increases: { forca: 2 } });

    const summary = selectCharacterSheetSummary(store.getState());

    // 17 base + 2 background + 2 ASI = 21, mas a regra 5e 2024 limita em 20
    expect(summary.finalAttributes.forca).toBe(20);
  });

  it("allows epic boon ability bonuses to raise an attribute above 20 (cap 30)", () => {
    const store = createCharacterStore();

    store.getState().selectClass("fighter-xphb");
    store.getState().setForca(17);
    store.getState().setBackgroundAbilityBonuses({ forca: 2 });
    store.getState().setLevel(19);
    store.getState().setLevelAsiOrFeat(4, { mode: "asi", increases: { forca: 2 } });
    store.getState().setLevelAsiOrFeat(19, {
      mode: "feat",
      featId: "boon-of-speed-xphb",
      asi: { forca: 1 },
    });

    const summary = selectCharacterSheetSummary(store.getState());

    // 17 + 2 (background) + 2 (ASI, capado em 20) + 1 (Epic Boon) = 21
    expect(summary.finalAttributes.forca).toBe(21);
    // Boon of Speed também soma +30 ft de deslocamento
    expect(summary.speedFeet).toBe(60);
  });

  it("includes the chosen class package items in carried load without auto-equipping", () => {
    const store = createCharacterStore();
    const fighter = getBuilderClasses().find((c) => c.id === "fighter-xphb");
    if (!fighter || fighter.startingEquipmentPackages.length === 0) {
      throw new Error("expected fighter to have starting equipment packages");
    }
    store.getState().selectClass("fighter-xphb");
    store.getState().setEquipmentSourceOption("class", fighter.startingEquipmentPackages[0].id);

    const summary = selectCharacterSheetSummary(store.getState());
    expect(summary.selectedEquipment).toHaveLength(0);
    expect(summary.carry.currentKg).toBeGreaterThan(0);
  });

  it("equips items from the chosen class package without duplicating them in manual inventory", () => {
    const store = createCharacterStore();
    const fighter = getBuilderClasses().find((c) => c.id === "fighter-xphb");
    const packageWithChainMail = fighter?.startingEquipmentPackages.find((entry) =>
      entry.items.some((item) => item.id === "chain-mail-xphb"),
    );
    if (!packageWithChainMail) {
      throw new Error("expected fighter to have a chain mail starting package");
    }

    store.getState().selectClass("fighter-xphb");
    store.getState().setEquipmentSourceOption("class", packageWithChainMail.id);
    store.getState().toggleEquippedItem("chain-mail-xphb");

    const summary = selectCharacterSheetSummary(store.getState());

    expect(store.getState().inventory).toEqual([]);
    expect(summary.selectedEquipment).toContainEqual(
      expect.objectContaining({ id: "chain-mail-xphb", sourceType: "class" }),
    );
    expect(summary.armorClass).toBe(16);
  });

  it("scales max HP with character level", () => {
    const store = createCharacterStore();
    const fighter = getBuilderClasses().find((c) => c.id === "fighter-xphb");
    if (!fighter || fighter.hitDie !== 10) {
      throw new Error("expected fighter to use a d10 hit die");
    }
    store.getState().selectClass("fighter-xphb");

    const atLevelOne = selectCharacterSheetSummary(store.getState()).maxHp;

    store.getState().setLevel(5);
    const summary = selectCharacterSheetSummary(store.getState());
    const con = summary.finalAttributes.constituicao;

    expect(summary.maxHp).toBe(calculateMaxHitPoints(10, con, 5));
    expect(summary.maxHp).toBeGreaterThan(atLevelOne);
    expect(summary.hitPoints).toBe(summary.maxHp);
    expect(summary.currentHp).toBe(summary.maxHp);
  });

  it("exposes class features unlocked up to the current level", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");

    const atLevelOne = selectCharacterSheetSummary(store.getState());
    expect(atLevelOne.classFeatures.some((f) => f.name === "Extra Attack")).toBe(
      false,
    );

    store.getState().setLevel(5);
    const atLevelFive = selectCharacterSheetSummary(store.getState());


    expect(atLevelFive.classFeatures.some((f) => f.name === "Extra Attack")).toBe(
      true,
    );

    expect(
      atLevelFive.classFeatures.some((f) => f.name === "Second Wind"),
    ).toBe(true);

    expect(
      atLevelFive.classFeatures.every((f) => (f.level ?? 1) <= 5),
    ).toBe(true);
  });

  it("keeps carried inventory separate from equipped items", () => {
    const store = createCharacterStore();
    store.getState().addInventoryItem("chain-mail-xphb");
    const summary = selectCharacterSheetSummary(store.getState());
    expect(summary.selectedEquipment.some((e) => e.id === "chain-mail-xphb")).toBe(false);
    expect(summary.inventory).toContainEqual(
      expect.objectContaining({
        item: expect.objectContaining({ id: "chain-mail-xphb", sourceType: "manual" }),
        quantity: 1,
      }),
    );
    expect(summary.carry.currentKg).toBeGreaterThan(0);
  });

  it("exposes class package, background package, and manual items as carried inventory", () => {
    const store = createCharacterStore();
    const fighter = getBuilderClasses().find((c) => c.id === "fighter-xphb");
    const packageWithChainMail = fighter?.startingEquipmentPackages.find((entry) =>
      entry.items.some((item) => item.id === "chain-mail-xphb"),
    );
    if (!packageWithChainMail) {
      throw new Error("expected fighter to have a chain mail starting package");
    }

    store.getState().selectClass("fighter-xphb");
    store.getState().selectBackground("aberrant-heir-efa");
    store.getState().setEquipmentSourceOption("class", packageWithChainMail.id);
    store.getState().setEquipmentSourceOption("background", "A");
    store.getState().addInventoryItem("longsword-xphb");

    const summary = selectCharacterSheetSummary(store.getState());
    const ids = summary.inventory.map((entry) => entry.item.id);

    expect(ids).toContain("chain-mail-xphb");
    expect(ids).toContain("longsword-xphb");
    expect(summary.inventory.some((entry) => entry.item.sourceType === "background")).toBe(true);
    expect(summary.inventory.find((entry) => entry.item.id === "longsword-xphb")?.quantity).toBe(1);
  });

  it("derives armor class and attacks only from equipped inventory", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setDestreza(18);
    store.getState().setForca(14);
    store.getState().addInventoryItem("chain-mail-xphb");
    store.getState().addInventoryItem("shield-xphb");
    store.getState().addInventoryItem("longsword-xphb");

    const carriedOnly = selectCharacterSheetSummary(store.getState());
    expect(carriedOnly.armorClass).toBe(14);
    expect(carriedOnly.weapons.some((weapon) => weapon.name === "Longsword")).toBe(false);

    store.getState().toggleEquippedItem("chain-mail-xphb");
    store.getState().toggleEquippedItem("shield-xphb");
    store.getState().toggleEquippedItem("longsword-xphb");

    const equipped = selectCharacterSheetSummary(store.getState());
    expect(equipped.armorClass).toBe(18);
    expect(equipped.weapons.find((weapon) => weapon.name === "Longsword")).toMatchObject({
      attackBonus: "+4",
      damage: "1d8+2 Slashing",
      notes: expect.stringContaining("proficient"),
    });

    store.getState().toggleEquippedItem("shield-xphb");
    expect(selectCharacterSheetSummary(store.getState()).armorClass).toBe(16);
  });

  it("applies equipped magic item bonuses to AC and saving throws", () => {
    const store = createCharacterStore();
    const ring = getItemCatalog().find((item) => item.id === "ring-of-protection-xdmg");

    expect(ring).toMatchObject({
      armorClassBonus: 1,
      savingThrowBonus: 1,
    });

    store.getState().setDestreza(10);
    store.getState().addInventoryItem("ring-of-protection-xdmg");
    const unequipped = selectCharacterSheetSummary(store.getState());

    store.getState().toggleEquippedItem("ring-of-protection-xdmg");
    const equipped = selectCharacterSheetSummary(store.getState());

    expect(equipped.armorClass).toBe(unequipped.armorClass + 1);
    expect(equipped.savingThrows.map((save) => save.modifier)).toEqual(
      unequipped.savingThrows.map((save) => save.modifier + 1),
    );
  });

  it("applies real catalog magic armor bonuses to worn armor AC", () => {
    const store = createCharacterStore();
    const armor = getItemCatalog().find(
      (item) => item.name === "Black Dragon Scale Mail" && item.source === "XDMG",
    );

    expect(armor).toMatchObject({
      armorClass: 14,
      armorClassBonus: 1,
      armorType: "medium",
    });

    store.getState().setDestreza(18);
    store.getState().addInventoryItem(armor!.id);
    store.getState().toggleEquippedItem(armor!.id);

    expect(selectCharacterSheetSummary(store.getState()).armorClass).toBe(17);
  });

  it("applies real catalog magic shield bonuses to shield AC", () => {
    const store = createCharacterStore();
    const shield = getItemCatalog().find(
      (item) => item.name === "Arrow-Catching Shield" && item.source === "XDMG",
    );

    expect(shield).toMatchObject({
      armorClass: 2,
      armorClassBonus: 2,
      armorType: "shield",
    });

    store.getState().setDestreza(10);
    store.getState().addInventoryItem(shield!.id);
    store.getState().toggleEquippedItem(shield!.id);

    expect(selectCharacterSheetSummary(store.getState()).armorClass).toBe(14);
  });

  it("applies equipped magic weapon bonuses to attacks", () => {
    const store = createCharacterStore();
    const weapon = getItemCatalog().find(
      (item) => item.name === "+1 Moon Sickle" && item.source === "TCE",
    );

    expect(weapon).toMatchObject({
      category: "Weapon",
      weaponBonus: 1,
      damageDice: "1d4",
    });

    store.getState().selectClass("fighter-xphb");
    store.getState().setForca(14);
    store.getState().addInventoryItem(weapon!.id);
    store.getState().toggleEquippedItem(weapon!.id);

    const attack = selectCharacterSheetSummary(store.getState()).weapons.find(
      (entry) => entry.name === "+1 Moon Sickle",
    );

    expect(attack).toMatchObject({
      attackBonus: "+5",
      damage: "1d4+3 Slashing",
      notes: expect.stringContaining("+1 magic weapon"),
    });
    expect(attack?.damageBreakdown).toContainEqual({
      label: "Magic bonus",
      value: "+1",
    });
  });

  it("applies ASI bonuses to final attributes and recomputes HP", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);
    const before = selectCharacterSheetSummary(store.getState());

    store.getState().setLevelAsiOrFeat(4, { mode: "asi", increases: { constituicao: 2 } });
    const after = selectCharacterSheetSummary(store.getState());

    expect(after.finalAttributes.constituicao).toBe(before.finalAttributes.constituicao + 2);

    expect(after.maxHp).toBe(before.maxHp + 4);
  });

  it("applies half-feat ability bonuses to final attributes and derived values", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);
    store.getState().setConstituicao(13);
    const before = selectCharacterSheetSummary(store.getState());

    store.getState().setLevelAsiOrFeat(4, {
      mode: "feat",
      featId: "speedy-xphb",
      asi: { constituicao: 1 },
    });
    const after = selectCharacterSheetSummary(store.getState());

    expect(after.finalAttributes.constituicao).toBe(before.finalAttributes.constituicao + 1);
    expect(after.maxHp).toBe(before.maxHp + 4);
  });

  it("applies skill proficiencies selected inside a feat", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);
    store.getState().setSabedoria(13);
    const before = selectCharacterSheetSummary(store.getState());

    store.getState().setLevelAsiOrFeat(4, {
      mode: "feat",
      featId: "skill-expert-xphb",
      asi: { sabedoria: 1 },
      skillProficiencies: ["Perception"],
    });
    const after = selectCharacterSheetSummary(store.getState());
    const perception = after.skills.find((skill) => skill.name === "Perception");

    expect(after.finalAttributes.sabedoria).toBe(before.finalAttributes.sabedoria + 1);
    expect(perception?.isProficient).toBe(true);
    expect(after.passives.perception).toBe(before.passives.perception + 3);
  });

  it("uses the real origin feat description and applies origin feat effects", () => {
    const store = createCharacterStore();
    store.getState().selectBackground("criminal-xphb");
    store.getState().setDestreza(10);

    const summary = selectCharacterSheetSummary(store.getState());
    const originFeature = summary.features.find(
      (feature) => feature.source === "background" && feature.name === "Alert",
    );

    expect(summary.originFeat).toBe("Alert");
    // XPHB 2024: Alert soma o bônus de proficiência (+2 no nível 1) à iniciativa.
    expect(summary.initiative).toBe(summary.proficiencyBonus);
    expect(originFeature?.description).toMatch(/initiative/i);
    expect(originFeature?.description).not.toMatch(/gp|po|equipment|equipamento/i);
  });

  it("includes selected subclass features and reports level pendings", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(3);

    const pending = selectCharacterSheetSummary(store.getState());
    // A pendência de subclasse agora nasce da validação do step "subclasse".
    expect((pending.pendencies ?? []).some((p) => p.stepSlug === "subclasse")).toBe(true);
    expect(pending.validationMessages.some((m) => /subclass/i.test(m))).toBe(true);

    store.getState().selectSubclass("battle-master-xphb");
    const resolved = selectCharacterSheetSummary(store.getState());
    expect((resolved.pendencies ?? []).some((p) => p.stepSlug === "subclasse")).toBe(false);
    expect(resolved.features.some((f) => f.source === "class")).toBe(true);
    expect(resolved.validationMessages.some((m) => /subclass/i.test(m))).toBe(false);
  });

  it("derives spellcasting from selected class and spell choices", () => {
    const store = createCharacterStore();
    store.getState().selectClass("wizard-xphb");
    store.getState().setLevel(5);
    store.getState().setInteligencia(16);
    store.getState().setSpellcastingChoices({
      cantripIds: ["acid-splash-xphb", "mage-hand-xphb"],
      knownSpellIds: [],
      preparedSpellIds: ["fireball-xphb"],
    });

    const summary = selectCharacterSheetSummary(store.getState());

    expect(summary.isSpellcaster).toBe(true);
    expect(summary.spellcasting).toMatchObject({
      ability: "inteligencia",
      spellSaveDc: 14,
      spellAttackBonus: 6,
      cantripsKnownLimit: 4,
      preparedSpellLimit: 9,
      selectedCantripCount: 2,
      selectedPreparedCount: 1,
    });
    expect(summary.spellcasting?.preparedSpells.map((spell) => spell.name)).toEqual([
      "Fireball",
    ]);
  });
});
