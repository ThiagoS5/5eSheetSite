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
];

// Controlled harness: feeds the emitted value back as the prop, like the real orchestrator.
function Harness({ onChange }: { onChange: (c: AsiOrFeatChoice | undefined) => void }) {
  const [value, setValue] = useState<AsiOrFeatChoice | undefined>(undefined);
  return (
    <AsiOrFeatStep
      level={4}
      attributes={attributes}
      selectableFeats={feats}
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
});
