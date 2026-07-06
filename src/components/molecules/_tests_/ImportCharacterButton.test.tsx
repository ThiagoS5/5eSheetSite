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

    const input = screen.getByLabelText(/import character file/i);
    await user.upload(input, makeFile(serializeCharacterExport(build)));

    await waitFor(async () => {
      const characters = await listCharacters();
      const imported = characters.find((entry) => entry.nome === "Imported Hero");
      expect(imported).toBeDefined();
      expect(imported?.id).not.toBe(build.exportMetadata.saveId);
    });
  });

  it("shows the import error and does not write to the vault on invalid files", async () => {
    const user = userEvent.setup();
    render(<ImportCharacterButton />);
    const before = (await listCharacters()).length;

    const input = screen.getByLabelText(/import character file/i);
    await user.upload(input, makeFile("{not json"));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/not valid JSON/i),
    );
    expect((await listCharacters()).length).toBe(before);
  });
});
