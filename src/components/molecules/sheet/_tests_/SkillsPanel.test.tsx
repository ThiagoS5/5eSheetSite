/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { SkillsPanel } from "@/src/components/molecules/sheet/SkillsPanel";
import type { SheetSkill } from "@/types/builder";

const skills: SheetSkill[] = [
  { name: "Arcana", label: "Arcanismo", attributeKey: "inteligencia", modifier: 7, isProficient: true, isExpert: false, isOverridden: false },
  { name: "Athletics", label: "Atletismo", attributeKey: "forca", modifier: -1, isProficient: false, isExpert: false, isOverridden: false },
];

describe("SkillsPanel", () => {
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
});
