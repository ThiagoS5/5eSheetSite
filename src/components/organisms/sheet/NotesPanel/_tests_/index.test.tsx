/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const setDescriptionField = vi.fn();
vi.mock("@/src/store/useCharacterStore", () => ({
  useCharacterStore: (selector: (s: unknown) => unknown) =>
    selector({
      description: { tracos: "T", personalidade: "P", historia: "H", notas: "N" },
      setDescriptionField,
      characterBuild: { playState: { campaignLog: [] } },
      addCampaignLogEntry: vi.fn(),
      updateCampaignLogEntry: vi.fn(),
      removeCampaignLogEntry: vi.fn(),
    }),
}));

import { NotesPanel } from "@/src/components/organisms/sheet/NotesPanel";

describe("NotesPanel", () => {
  it("switches sub-tabs and edits the matching field", () => {
    render(<NotesPanel />);
    // default sub-tab = Personality Traits -> tracos
    const editor = screen.getByLabelText(/notes editor/i) as HTMLTextAreaElement;
    expect(editor.value).toBe("T");

    fireEvent.click(screen.getByRole("button", { name: "Backstory" }));
    fireEvent.change(screen.getByLabelText(/notes editor/i), { target: { value: "H2" } });
    expect(setDescriptionField).toHaveBeenCalledWith("historia", "H2");
  });
});
