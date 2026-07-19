/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ImportCharacterButton } from "@/src/components/molecules/ImportCharacterButton";
import { serializeCharacterExport } from "@/src/utils/canonicalExport";
import { createEmptyCharacterBuild } from "@/src/store/characterBuildModel";
import { listCharacters } from "@/src/services/characterService";

function makeFile(content: string): File {
  return new File([content], "hero.json", { type: "application/json" });
}

describe("ImportCharacterButton", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(cleanup);

  it("imports a valid export file into the vault with a new saveId", async () => {
    const user = userEvent.setup();
    const build = createEmptyCharacterBuild();
    build.draft.description.nome = "Imported Hero";
    render(<ImportCharacterButton />);

    const input = screen.getByLabelText(/import foundry character file/i);
    await user.upload(input, makeFile(serializeCharacterExport(build)));

    await waitFor(async () => {
      const characters = await listCharacters();
      const imported = characters.find((entry) => entry.nome === "Imported Hero");
      expect(imported).toBeDefined();
      expect(imported?.id).not.toBe(build.exportMetadata.saveId);
    });
  });

  it("imports a Foundry actor export into the vault", async () => {
    const user = userEvent.setup();
    render(<ImportCharacterButton />);

    const input = screen.getByLabelText(/import foundry character file/i);
    await user.upload(input, makeFile(JSON.stringify(createFoundryActorFixture())));

    await waitFor(async () => {
      const characters = await listCharacters();
      const imported = characters.find(
        (entry) => entry.nome === "Hatrian Heaven (O Comerciante)",
      );

      expect(imported).toBeDefined();
      expect(imported?.classe).toBe("Sorcerer");
      expect(imported?.species).toBe("Human");
    });
  });

  it("shows the import error and does not write to the vault on invalid files", async () => {
    const user = userEvent.setup();
    render(<ImportCharacterButton />);
    const before = (await listCharacters()).length;

    const input = screen.getByLabelText(/import foundry character file/i);
    await user.upload(input, makeFile("{not json"));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/not valid JSON/i),
    );
    expect((await listCharacters()).length).toBe(before);
  });

  it("rejects oversized files without reading or writing them", async () => {
    const user = userEvent.setup();
    render(<ImportCharacterButton />);
    const before = (await listCharacters()).length;

    // A File whose reported size exceeds the 2 MB cap; the guard checks
    // `file.size` before calling `.text()`, so no parse ever runs.
    const huge = makeFile("{}");
    Object.defineProperty(huge, "size", { value: 3 * 1024 * 1024 });

    const input = screen.getByLabelText(/import foundry character file/i);
    await user.upload(input, huge);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/too large/i),
    );
    expect((await listCharacters()).length).toBe(before);
  });
});

function createFoundryActorFixture() {
  return {
    name: "Hatrian Heaven (O Comerciante)",
    type: "character",
    system: {
      details: {
        race: "race-id",
        background: "background-id",
        originalClass: "class-id",
      },
      abilities: {
        str: { value: 8 },
        dex: { value: 13 },
        con: { value: 12 },
        int: { value: 16 },
        wis: { value: 10 },
        cha: { value: 20 },
      },
      attributes: { hp: { value: 62, max: null, temp: 0 } },
      currency: { cp: 0, sp: 0, ep: 0, gp: 50, pp: 0 },
      skills: {},
      traits: { languages: { value: ["common", "elvish"] } },
    },
    items: [
      { _id: "race-id", name: "Human", type: "race", system: { identifier: "human" } },
      {
        _id: "class-id",
        name: "Sorcerer",
        type: "class",
        system: { identifier: "sorcerer", levels: 10 },
      },
      {
        _id: "background-id",
        name: "Merchant",
        type: "background",
        system: { identifier: "merchant" },
      },
    ],
  };
}
