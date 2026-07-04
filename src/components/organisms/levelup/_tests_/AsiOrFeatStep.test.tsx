/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AsiOrFeatStep } from "@/src/components/organisms/levelup/AsiOrFeatStep";
import type { AsiAttribute } from "@/src/components/organisms/levelup/types";
import type { AsiOrFeatChoice } from "@/src/types/characterBuild";
import type { BuilderFeat } from "@/types/builder";

const attributes: AsiAttribute[] = [
  { key: "forca", label: "Força", current: 13 },
  { key: "destreza", label: "Destreza", current: 12 },
  { key: "constituicao", label: "Constituição", current: 14 },
  { key: "inteligencia", label: "Inteligência", current: 10 },
  { key: "sabedoria", label: "Sabedoria", current: 11 },
  { key: "carisma", label: "Carisma", current: 8 },
];
const feats: BuilderFeat[] = [
  { id: "alert-xphb", name: "Alert", source: "XPHB", category: "general", prerequisites: [], repeatable: false, description: "" },
  {
    id: "grappler-xphb",
    name: "Grappler",
    source: "XPHB",
    category: "general",
    prerequisites: [],
    repeatable: false,
    description: "",
    abilityBonus: { choose: { from: ["forca", "destreza"], amount: 1 } },
  },
  {
    id: "skill-expert-xphb",
    name: "Skill Expert",
    source: "XPHB",
    category: "general",
    prerequisites: [],
    repeatable: false,
    description: "",
    abilityBonus: { choose: { from: ["sabedoria", "inteligencia"], amount: 1 } },
    effects: {
      choiceRequirements: [
        { kind: "ability", count: 1, options: ["sabedoria", "inteligencia"] },
        { kind: "skill", count: 1, options: ["Perception", "Investigation"] },
      ],
    },
  },
];

// Controlled harness: feeds the emitted value back as the prop, like the real orchestrator.
function Harness({
  onChange,
  initialValue,
}: {
  onChange: (c: AsiOrFeatChoice | undefined) => void;
  initialValue?: AsiOrFeatChoice;
}) {
  const [value, setValue] = useState<AsiOrFeatChoice | undefined>(initialValue);
  return (
    <AsiOrFeatStep
      level={4}
      attributes={attributes}
      selectableFeats={feats}
      blockedFeats={[
        {
          feat: {
            id: "epic-boon-of-fate-xphb",
            name: "Epic Boon of Fate",
            source: "XPHB",
            category: "epic-boon",
            prerequisites: [{ level: 19 }],
            repeatable: false,
            description: "",
          },
          reason: "Requer nivel 19.",
        },
      ]}
      value={value}
      onChange={(c) => { onChange(c); setValue(c); }}
    />
  );
}

describe("AsiOrFeatStep", () => {
  afterEach(cleanup);

  it("emits a +2 ASI in single mode", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /Constituição/ }));
    expect(onChange).toHaveBeenCalledWith({ mode: "asi", increases: { constituicao: 2 } });
  });

  it("emits a +1/+1 ASI after switching to '+1 em dois'", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "+1 em dois" }));
    fireEvent.click(screen.getByRole("button", { name: /Força/ }));
    fireEvent.click(screen.getByRole("button", { name: /Destreza/ }));
    expect(onChange).toHaveBeenLastCalledWith({ mode: "asi", increases: { forca: 1, destreza: 1 } });
  });

  it("switching to the Talento tab shows feats and emits a feat choice", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Talento" }));
    fireEvent.click(screen.getByRole("button", { name: /Alert/ }));
    expect(onChange).toHaveBeenCalledWith({ mode: "feat", featId: "alert-xphb" });
  });

  it("clears an existing ASI when switching to the feat tab", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} initialValue={{ mode: "asi", increases: { constituicao: 2 } }} />);

    fireEvent.click(screen.getByRole("button", { name: "Talento" }));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("stores a half-feat attribute choice inside the feat choice", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Talento" }));
    fireEvent.click(screen.getByRole("button", { name: /Grappler/ }));
    expect(screen.getByText(/escolha o atributo/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Força/ }));

    expect(onChange).toHaveBeenLastCalledWith({
      mode: "feat",
      featId: "grappler-xphb",
      asi: { forca: 1 },
    });
  });

  it("stores required feat proficiency choices with the feat", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Talento" }));
    fireEvent.click(screen.getByRole("button", { name: /Skill Expert/ }));
    expect(screen.getByText(/escolha 1 pericia/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Sabedoria/ }));
    fireEvent.click(screen.getByRole("button", { name: /Perception/ }));

    expect(onChange).toHaveBeenLastCalledWith({
      mode: "feat",
      featId: "skill-expert-xphb",
      asi: { sabedoria: 1 },
      skillProficiencies: ["Perception"],
    });
  });

  it("renders blocked feats with a visible reason", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Talento" }));

    expect(screen.getByText("Epic Boon of Fate")).toBeInTheDocument();
    expect(screen.getByText(/requer nivel 19/i)).toBeInTheDocument();
  });
});
