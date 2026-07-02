/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";
import { SkillsPanel } from "@/src/components/molecules/sheet/SkillsPanel";
import type { SheetSkill } from "@/types/builder";

const setSkillTraining = vi.fn();
const setSkillOverride = vi.fn();

vi.mock("@/src/store/useCharacterStore", () => ({
  useCharacterStore: (selector: (s: unknown) => unknown) =>
    selector({
      setSkillTraining,
      setSkillOverride,
    }),
}));

// jsdom sanitizes <input type="number"> values at the property-setter level,
// silently coercing invalid intermediate values (e.g. "-", "abc") to "".
// Real browsers allow these as intermediate typing states (input.value === "-"),
// which is exactly what triggers the NaN bug this suite guards against.
// This helper forces the DOM node's `value` to bypass jsdom's sanitizer so the
// change event delivers the same "invalid" value a real browser would.
function fireChangeWithRawValue(input: HTMLInputElement, rawValue: string) {
  Object.defineProperty(input, "value", { value: rawValue, configurable: true });
  fireEvent.change(input);
}

const skills: SheetSkill[] = [
  { name: "Arcana", label: "Arcanismo", attributeKey: "inteligencia", modifier: 7, isProficient: true, isExpert: false, isOverridden: false },
  { name: "Athletics", label: "Atletismo", attributeKey: "forca", modifier: -1, isProficient: false, isExpert: false, isOverridden: false },
];

describe("SkillsPanel", () => {
  beforeEach(() => {
    setSkillTraining.mockClear();
    setSkillOverride.mockClear();
  });
  afterEach(cleanup);

  it("renders skill labels with signed modifiers", () => {
    render(<SkillsPanel skills={skills} />);
    expect(screen.getByText("Arcanismo")).toBeInTheDocument();
    expect(screen.getByText("+7")).toBeInTheDocument();
    expect(screen.getByText("Atletismo")).toBeInTheDocument();
    expect(screen.getByText("-1")).toBeInTheDocument();
  });

  it("shows a subheading only for attributes that have skills", () => {
    render(<SkillsPanel skills={skills} />);
    expect(screen.getByText("INT")).toBeInTheDocument();
    expect(screen.getByText("FOR")).toBeInTheDocument();
    expect(screen.queryByText("CAR")).not.toBeInTheDocument();
  });

  it("opens the skill detail modal when a skill label is clicked", () => {
    render(<SkillsPanel skills={skills} />);
    fireEvent.click(screen.getByRole("button", { name: "Arcanismo" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/Conhecimento sobre magia/)).toBeInTheDocument();
  });

  it("does not show training-cycle buttons or override inputs before toggling edit mode", () => {
    render(<SkillsPanel skills={skills} />);
    expect(screen.queryByRole("button", { name: "Treino: Arcanismo" })).not.toBeInTheDocument();
    expect(screen.queryByRole("spinbutton", { name: "Ajustar Arcanismo" })).not.toBeInTheDocument();
  });

  it("reveals training-cycle buttons and override inputs after toggling the gear", () => {
    render(<SkillsPanel skills={skills} />);
    fireEvent.click(screen.getByRole("button", { name: "Configurar perícias" }));
    expect(screen.getByRole("button", { name: "Treino: Arcanismo" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Ajustar Arcanismo" })).toBeInTheDocument();
  });

  it("cycles training level from none to proficient when clicked", () => {
    render(<SkillsPanel skills={skills} />);
    fireEvent.click(screen.getByRole("button", { name: "Configurar perícias" }));
    fireEvent.click(screen.getByRole("button", { name: "Treino: Atletismo" }));
    expect(setSkillTraining).toHaveBeenCalledWith("Athletics", "proficient");
  });

  it("cycles training level from proficient to expertise when clicked", () => {
    render(<SkillsPanel skills={skills} />);
    fireEvent.click(screen.getByRole("button", { name: "Configurar perícias" }));
    fireEvent.click(screen.getByRole("button", { name: "Treino: Arcanismo" }));
    expect(setSkillTraining).toHaveBeenCalledWith("Arcana", "expertise");
  });

  it("calls setSkillOverride with a numeric value when typing in the override input", () => {
    render(<SkillsPanel skills={skills} />);
    fireEvent.click(screen.getByRole("button", { name: "Configurar perícias" }));
    const input = screen.getByRole("spinbutton", { name: "Ajustar Arcanismo" });
    fireEvent.change(input, { target: { value: "5" } });
    expect(setSkillOverride).toHaveBeenCalledWith("Arcana", 5);
  });

  it("calls setSkillOverride with null when the override input is cleared", () => {
    render(<SkillsPanel skills={skills} />);
    fireEvent.click(screen.getByRole("button", { name: "Configurar perícias" }));
    const input = screen.getByRole("spinbutton", { name: "Ajustar Arcanismo" });
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.change(input, { target: { value: "" } });
    expect(setSkillOverride).toHaveBeenCalledWith("Arcana", null);
  });

  it("calls setSkillOverride with null instead of NaN when input is a lone minus sign", () => {
    render(<SkillsPanel skills={skills} />);
    fireEvent.click(screen.getByRole("button", { name: "Configurar perícias" }));
    const input = screen.getByRole("spinbutton", { name: "Ajustar Arcanismo" }) as HTMLInputElement;
    fireChangeWithRawValue(input, "-");
    expect(setSkillOverride).toHaveBeenCalledWith("Arcana", null);
    expect(setSkillOverride).not.toHaveBeenCalledWith("Arcana", NaN);
  });

  it("calls setSkillOverride with null instead of NaN when input is non-numeric", () => {
    render(<SkillsPanel skills={skills} />);
    fireEvent.click(screen.getByRole("button", { name: "Configurar perícias" }));
    const input = screen.getByRole("spinbutton", { name: "Ajustar Arcanismo" }) as HTMLInputElement;
    fireChangeWithRawValue(input, "abc");
    expect(setSkillOverride).toHaveBeenCalledWith("Arcana", null);
    expect(setSkillOverride).not.toHaveBeenCalledWith("Arcana", NaN);
  });

  it("shows the persisted override value in the input when entering edit mode", () => {
    const overriddenSkills: SheetSkill[] = [
      { name: "Arcana", label: "Arcanismo", attributeKey: "inteligencia", modifier: 9, isProficient: true, isExpert: false, isOverridden: true },
    ];
    render(<SkillsPanel skills={overriddenSkills} />);
    fireEvent.click(screen.getByRole("button", { name: "Configurar perícias" }));
    const input = screen.getByRole("spinbutton", { name: "Ajustar Arcanismo" });
    expect((input as HTMLInputElement).value).toBe("9");
  });
});
