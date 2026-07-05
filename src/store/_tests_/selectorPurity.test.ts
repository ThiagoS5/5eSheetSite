import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createCharacterStore } from "@/src/store/createCharacterStore";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";

describe("selector purity guardrail", () => {
  it("keeps characterSelectors as a thin orchestration layer", () => {
    const source = readFileSync("src/store/characterSelectors.ts", "utf8");
    const lineCount = source.trimEnd().split(/\r?\n/).length;

    expect(lineCount).toBeLessThanOrEqual(150);
  });

  it("keeps characterSheetSummaryRules an orchestrator, not a rule dump", () => {
    // A montagem do summary vive aqui desde a Fase 1; regra nova entra como
    // módulo próprio em rules/ ou src/adapters/, nunca inline neste arquivo
    // (master plan §26.1-A). Se este teste falhar, extraia o cálculo.
    const source = readFileSync("rules/characterSheetSummaryRules.ts", "utf8");
    const lineCount = source.trimEnd().split(/\r?\n/).length;

    expect(lineCount).toBeLessThanOrEqual(365);
  });

  it("snapshots the derived sheet contract for an equipped fighter", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setForca(14);
    store.getState().setDestreza(14);
    store.getState().addInventoryItem("chain-mail-xphb");
    store.getState().addInventoryItem("shield-xphb");
    store.getState().addInventoryItem("longsword-xphb");
    store.getState().toggleEquippedItem("chain-mail-xphb");
    store.getState().toggleEquippedItem("shield-xphb");
    store.getState().toggleEquippedItem("longsword-xphb");

    const summary = selectCharacterSheetSummary(store.getState());

    expect({
      armorClass: summary.armorClass,
      armorClassBreakdown: summary.armorClassBreakdown,
      proficiencyBonus: summary.proficiencyBonus,
      weapons: summary.weapons,
      pendencyIds: (summary.pendencies ?? []).map((pendency) => pendency.id),
    }).toMatchInlineSnapshot(`
      {
        "armorClass": 18,
        "armorClassBreakdown": [
          {
            "label": "Chain Mail",
            "value": 16,
          },
          {
            "label": "Shield",
            "value": 2,
          },
        ],
        "pendencyIds": [
          "recursos-classe-0",
          "antecedente-0",
          "especie-0",
          "detalhes-especie-0",
          "equipamento-0",
          "level-1-feature-option",
        ],
        "proficiencyBonus": 2,
        "weapons": [
          {
            "abilityKey": "forca",
            "attackBonus": "+4",
            "damage": "1+2 Bludgeoning",
            "damageBreakdown": [
              {
                "label": "Base damage",
                "value": "1",
              },
              {
                "label": "STR",
                "value": "+2",
              },
            ],
            "isProficient": true,
            "name": "Unarmed Strike",
            "notes": "STR, proficient, Melee",
          },
          {
            "abilityKey": "forca",
            "attackBonus": "+4",
            "damage": "1d8+2 Slashing",
            "damageBreakdown": [
              {
                "label": "Weapon die",
                "value": "1d8",
              },
              {
                "label": "STR",
                "value": "+2",
              },
            ],
            "isProficient": true,
            "name": "Longsword",
            "notes": "STR, proficient, Versatile",
          },
        ],
      }
    `);
  });
});
