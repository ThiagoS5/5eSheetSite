import { afterEach, describe, expect, it } from "vitest";
import { createCharacterStore, disposeCharacterStore } from "@/src/store/createCharacterStore";
import { migrateCharacterBuild } from "@/src/store/characterBuildModel";
import { importCharacter, serializeCharacterExport } from "@/src/utils/canonicalExport";
import { getCharacter, saveCharacter } from "@/src/services/characterService";
import { normalizePortraitDataUrl } from "@/src/utils/portrait";
import type { CharacterBuild } from "@/src/types/characterBuild";
import legacyFixture from "./fixtures/characterBuild.v17.json";
import { createFoundryCharacterExport } from "@/src/utils/foundryAdapter";
import { importFoundryCharacter } from "@/src/adapters/foundryImportAdapter";
import { renderPdfBuffer } from "@/src/adapters/pdfAdapter";

const portrait = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
const stores: ReturnType<typeof createCharacterStore>[] = [];
afterEach(() => { stores.splice(0).forEach(disposeCharacterStore); });

describe("schema v18 portraits", () => {
  it("exports every supported class resource pool as a Foundry item use counter", () => {
    for (const className of ["fighter", "monk", "sorcerer", "bard", "barbarian", "cleric", "druid", "paladin", "ranger", "warlock", "wizard", "rogue"]) {
      const store = createCharacterStore();
      stores.push(store);
      store.getState().selectClass(`${className}-xphb`);
      store.getState().setLevel(20);
      const state = store.getState();
      const summary = state.characterBuild.derivedSheet;
      const actor = createFoundryCharacterExport(state, summary);
      for (const resource of summary.resources ?? []) {
        const item = actor.items.find((entry) => entry.system.identifier === resource.id);
        expect(item?.system.uses, `${className}: ${resource.id}`).toMatchObject({ max: String(resource.maxUses) });
      }
    }
  });
  it("migrates a v17 save without losing its gallery selection", () => {
    const legacy = legacyFixture as unknown as Partial<CharacterBuild>;
    const migrated = migrateCharacterBuild(legacy, 17);
    expect(migrated.exportMetadata.schemaVersion).toBe(18);
    expect(migrated.draft.description).toMatchObject({ portraitId: "portrait-ember-knight", portraitDataUrl: "" });
  });

  it("preserves a portrait through builder, Vault and canonical JSON", async () => {
    const store = createCharacterStore();
    stores.push(store);
    store.getState().setDescriptionField("portraitDataUrl", portrait);
    const build = store.getState().characterBuild;
    await saveCharacter(build);
    const saved = await getCharacter(build.exportMetadata.saveId);
    expect(saved?.draft.description.portraitDataUrl).toBe(portrait);
    const parsed = importCharacter(serializeCharacterExport(build));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.build.draft.description.portraitDataUrl).toBe(portrait);
  });

  it("rejects remote URLs, SVGs and oversized images at migration", () => {
    for (const value of ["https://example.com/a.jpg", "data:image/svg+xml;base64,PHN2Zz4=", "data:image/jpeg;base64," + "A".repeat(700_001)]) {
      expect(normalizePortraitDataUrl(value)).toBe("");
    }
  });
  it("embeds the same portrait and resource uses in Foundry profiles and a real PDF", async () => {
    const store = createCharacterStore();
    stores.push(store);
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);
    store.getState().setDescriptionField("portraitDataUrl", portrait);
    store.getState().useResource("second-wind", 3);
    const state = store.getState();
    const summary = state.characterBuild.derivedSheet;
    for (const profile of ["dnd5e-5.2", "dnd5e-5.3"] as const) {
      const actor = createFoundryCharacterExport(state, summary, { profile });
      expect(actor.img).toBe(portrait);
      expect(actor.prototypeToken?.texture).toMatchObject({ src: portrait });
      expect(actor.items.find((item) => item.name === "Second Wind")?.system.uses).toMatchObject({ max: "3", spent: 1, recovery: [{ period: "sr", type: "formula", formula: "1" }, { period: "lr", type: "recoverAll" }] });
      const imported = importFoundryCharacter(JSON.stringify(actor));
      expect(imported.ok).toBe(true);
      if (imported.ok) expect(imported.build.draft.description.portraitDataUrl).toBe(portrait);
    }
    const buffer = await renderPdfBuffer({ summary, description: state.description, playState: state.playState });
    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    expect(buffer.toString("latin1")).toContain("/Subtype /Image");
  }, 20000);
});
