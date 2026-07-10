/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

const addCampaignLogEntry = vi.fn();
const removeCampaignLogEntry = vi.fn();
const updateCampaignLogEntry = vi.fn();
let campaignLog: { id: string; title: string; date: string; body: string }[] = [];

vi.mock("@/src/store/useCharacterStore", () => ({
  useCharacterStore: (selector: (s: unknown) => unknown) =>
    selector({
      characterBuild: { playState: { campaignLog } },
      addCampaignLogEntry,
      updateCampaignLogEntry,
      removeCampaignLogEntry,
    }),
}));

import { SessionLogPanel } from "@/src/components/organisms/sheet/SessionLogPanel";

describe("SessionLogPanel", () => {
  afterEach(cleanup);

  it("shows empty state and creates an entry", () => {
    campaignLog = [];
    render(<SessionLogPanel />);
    expect(screen.getByText(/no session entry recorded yet/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /new entry/i }));
    fireEvent.change(screen.getByLabelText(/entry title/i), { target: { value: "Session 1" } });
    fireEvent.change(screen.getByLabelText(/entry body/i), { target: { value: "We fought a dragon." } });
    fireEvent.click(screen.getByRole("button", { name: /save entry/i }));

    expect(addCampaignLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Session 1", body: "We fought a dragon." }),
    );
  });

  it("renders existing entries with a delete control", () => {
    campaignLog = [{ id: "a", title: "Prologue", date: "2026-07-10", body: "Began." }];
    render(<SessionLogPanel />);
    expect(screen.getByText("Prologue")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /delete Prologue/i }));
    expect(removeCampaignLogEntry).toHaveBeenCalledWith("a");
  });
});
