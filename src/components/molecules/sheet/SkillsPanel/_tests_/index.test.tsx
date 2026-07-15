/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";
import { SkillsPanel } from "@/src/components/molecules/sheet/SkillsPanel";
import type { SheetSkill } from "@/src/types/builder";

const setSkillTraining = vi.fn();
const setSkillOverride = vi.fn();

vi.mock("@/src/store/useCharacterStore", () => ({
  useCharacterStore: (selector: (s: unknown) => unknown) =>
    selector({
      setSkillTraining,
      setSkillOverride,
    }),
}));







function fireChangeWithRawValue(input: HTMLInputElement, rawValue: string) {
  Object.defineProperty(input, "value", { value: rawValue, configurable: true });
  fireEvent.change(input);
}

const skills: SheetSkill[] = [
  { name: "Arcana", label: "Arcana", attributeKey: "inteligencia", modifier: 7, isProficient: true, isExpert: false, isOverridden: false },
  { name: "Athletics", label: "Athletics", attributeKey: "forca", modifier: -1, isProficient: false, isExpert: false, isOverridden: false },
];

describe("SkillsPanel", () => {
  beforeEach(() => {
    setSkillTraining.mockClear();
    setSkillOverride.mockClear();
  });
  afterEach(cleanup);

  it("renders skill labels with signed modifiers", () => {
    render(<SkillsPanel skills={skills} />);
    expect(screen.getByText("Arcana")).toBeInTheDocument();
    expect(screen.getByText("+7")).toBeInTheDocument();
    expect(screen.getByText("Athletics")).toBeInTheDocument();
    expect(screen.getByText("-1")).toBeInTheDocument();
  });

  it("shows a subheading only for attributes that have skills", () => {
    render(<SkillsPanel skills={skills} />);
    expect(screen.getByText("INT")).toBeInTheDocument();
    expect(screen.getByText("STR")).toBeInTheDocument();
    expect(screen.queryByText("CHA")).not.toBeInTheDocument();
  });

  it("opens the skill detail modal when a skill label is clicked", () => {
    render(<SkillsPanel skills={skills} />);
    fireEvent.click(screen.getByRole("button", { name: "Arcana" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/magic, arcane rituals/i)).toBeInTheDocument();
  });

  it("does not show training-cycle buttons or override inputs before toggling edit mode", () => {
    render(<SkillsPanel skills={skills} />);
    expect(screen.queryByRole("button", { name: "Training: Arcana" })).not.toBeInTheDocument();
    expect(screen.queryByRole("spinbutton", { name: "Adjust Arcana" })).not.toBeInTheDocument();
  });

  it("reveals training-cycle buttons and override inputs after toggling the gear", () => {
    render(<SkillsPanel skills={skills} />);
    fireEvent.click(screen.getByRole("button", { name: "Configure skills" }));
    expect(screen.getByRole("button", { name: "Training: Arcana" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Adjust Arcana" })).toBeInTheDocument();
  });

  it("cycles training level from none to proficient when clicked", () => {
    render(<SkillsPanel skills={skills} />);
    fireEvent.click(screen.getByRole("button", { name: "Configure skills" }));
    fireEvent.click(screen.getByRole("button", { name: "Training: Athletics" }));
    expect(setSkillTraining).toHaveBeenCalledWith("Athletics", "proficient");
  });

  it("cycles training level from proficient to expertise when clicked", () => {
    render(<SkillsPanel skills={skills} />);
    fireEvent.click(screen.getByRole("button", { name: "Configure skills" }));
    fireEvent.click(screen.getByRole("button", { name: "Training: Arcana" }));
    expect(setSkillTraining).toHaveBeenCalledWith("Arcana", "expertise");
  });

  it("calls setSkillOverride with a numeric value when typing in the override input", () => {
    render(<SkillsPanel skills={skills} />);
    fireEvent.click(screen.getByRole("button", { name: "Configure skills" }));
    const input = screen.getByRole("spinbutton", { name: "Adjust Arcana" });
    fireEvent.change(input, { target: { value: "5" } });
    expect(setSkillOverride).toHaveBeenCalledWith("Arcana", 5);
  });

  it("calls setSkillOverride with null when the override input is cleared", () => {
    render(<SkillsPanel skills={skills} />);
    fireEvent.click(screen.getByRole("button", { name: "Configure skills" }));
    const input = screen.getByRole("spinbutton", { name: "Adjust Arcana" });
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.change(input, { target: { value: "" } });
    expect(setSkillOverride).toHaveBeenCalledWith("Arcana", null);
  });

  it("calls setSkillOverride with null instead of NaN when input is a lone minus sign", () => {
    render(<SkillsPanel skills={skills} />);
    fireEvent.click(screen.getByRole("button", { name: "Configure skills" }));
    const input = screen.getByRole("spinbutton", { name: "Adjust Arcana" }) as HTMLInputElement;
    fireChangeWithRawValue(input, "-");
    expect(setSkillOverride).toHaveBeenCalledWith("Arcana", null);
    expect(setSkillOverride).not.toHaveBeenCalledWith("Arcana", NaN);
  });

  it("calls setSkillOverride with null instead of NaN when input is non-numeric", () => {
    render(<SkillsPanel skills={skills} />);
    fireEvent.click(screen.getByRole("button", { name: "Configure skills" }));
    const input = screen.getByRole("spinbutton", { name: "Adjust Arcana" }) as HTMLInputElement;
    fireChangeWithRawValue(input, "abc");
    expect(setSkillOverride).toHaveBeenCalledWith("Arcana", null);
    expect(setSkillOverride).not.toHaveBeenCalledWith("Arcana", NaN);
  });

  it("shows the persisted override value in the input when entering edit mode", () => {
    const overriddenSkills: SheetSkill[] = [
      { name: "Arcana", label: "Arcana", attributeKey: "inteligencia", modifier: 9, isProficient: true, isExpert: false, isOverridden: true },
    ];
    render(<SkillsPanel skills={overriddenSkills} />);
    fireEvent.click(screen.getByRole("button", { name: "Configure skills" }));
    const input = screen.getByRole("spinbutton", { name: "Adjust Arcana" });
    expect((input as HTMLInputElement).value).toBe("9");
  });
});
