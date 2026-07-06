/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  deleteCharacter,
  duplicateCharacter,
  getCharacter,
  listCharacters,
  saveCharacter,
} from "@/src/services/characterService";
import {
  createEmptyCharacterBuild,
  normalizeCharacterBuild,
} from "@/src/store/characterBuildModel";

describe("characterService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lists an empty roster when no local saves exist", async () => {
    await expect(listCharacters()).resolves.toStrictEqual([]);
  });

  it("saves, lists, and loads character builds from localStorage", async () => {
    const build = createEmptyCharacterBuild({
      now: "2026-06-13T10:00:00.000Z",
      saveId: "save-brienne",
    });
    const saved = await saveCharacter({
      ...build,
      draft: {
        ...build.draft,
        currentStepSlug: "equipamento",
        description: {
          ...build.draft.description,
          nome: "Brienne",
        },
      },
      progression: {
        ...build.progression,
        level: 4,
      },
      choices: {
        ...build.choices,
        selectedClassId: "fighter-xphb",
        selectedSpeciesId: "human-xphb",
        baseAttributes: {
          forca: 15,
          destreza: 14,
          constituicao: 13,
          inteligencia: 12,
          sabedoria: 10,
          carisma: 8,
        },
      },
    });

    await expect(getCharacter("save-brienne")).resolves.toMatchObject({
      exportMetadata: {
        saveId: "save-brienne",
        createdAt: "2026-06-13T10:00:00.000Z",
      },
      choices: {
        selectedClassId: "fighter-xphb",
        selectedSpeciesId: "human-xphb",
      },
    });
    await expect(listCharacters()).resolves.toStrictEqual([
      expect.objectContaining({
        id: "save-brienne",
        nome: "Brienne",
        classe: "Fighter",
        species: "Human",
        level: 4,
        currentStepHref: "/builder/equipamento",
      }),
    ]);
    expect(saved.exportMetadata.updatedAt).not.toBe(build.exportMetadata.updatedAt);
  });

  it("duplicates and deletes saved builds by saveId", async () => {
    const build = createEmptyCharacterBuild({
      now: "2026-06-13T10:00:00.000Z",
      saveId: "save-original",
    });

    await saveCharacter({
      ...build,
      draft: {
        ...build.draft,
        description: {
          ...build.draft.description,
          nome: "Aelar",
        },
      },
    });

    const duplicate = await duplicateCharacter("save-original");

    expect(duplicate?.exportMetadata.saveId).not.toBe("save-original");
    expect(duplicate?.draft.description.nome).toBe("Aelar (Copy)");
    expect(await listCharacters()).toHaveLength(2);

    await deleteCharacter("save-original");

    expect(await getCharacter("save-original")).toBeNull();
    expect(await listCharacters()).toHaveLength(1);
  });

  it("recovers from corrupted localStorage data on the next save", async () => {
    localStorage.setItem("forge-fate-character-saves:v1", "{bad-json");

    await expect(listCharacters()).resolves.toStrictEqual([]);

    await saveCharacter(
      createEmptyCharacterBuild({
        now: "2026-06-13T10:00:00.000Z",
        saveId: "save-clean",
      }),
    );

    expect(await listCharacters()).toHaveLength(1);
  });

  it("maps portraitId to portraitUrl on the dashboard character", async () => {
    const build = normalizeCharacterBuild({
      ...createEmptyCharacterBuild(),
      draft: {
        ...createEmptyCharacterBuild().draft,
        description: {
          ...createEmptyCharacterBuild().draft.description,
          nome: "Portrait Hero",
          portraitId: "portrait-ember-knight",
        },
      },
    });

    await saveCharacter(build);
    const characters = await listCharacters();
    const saved = characters.find((entry) => entry.nome === "Portrait Hero");

    expect(saved?.portraitUrl).toBe("/portraits/portrait-ember-knight.svg");
  });
});
