/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SubclassStep } from "@/src/components/organisms/levelup/SubclassStep";
import type { BuilderSubclass } from "@/types/builder";

const subclasses: BuilderSubclass[] = [
  { id: "battle-master-xphb", name: "Battle Master", shortName: "Battle Master", source: "XPHB", features: [{ name: "Combat Superiority", description: "...", level: 3 }] },
  { id: "champion-xphb", name: "Champion", shortName: "Champion", source: "XPHB", features: [] },
];

describe("SubclassStep", () => {
  afterEach(cleanup);

  it("renders a card per subclass and calls onSelect", () => {
    const onSelect = vi.fn();
    render(<SubclassStep level={3} subclasses={subclasses} selectedSubclassId="" onSelect={onSelect} />);

    expect(screen.getByText("Battle Master")).toBeInTheDocument();
    expect(screen.getByText("Champion")).toBeInTheDocument();
    const cards = screen.getAllByRole("button", { name: /Select|Selected/i });
    cards[0].click();
    expect(onSelect).toHaveBeenCalledWith("battle-master-xphb");
  });

  it("marks the selected subclass", () => {
    render(<SubclassStep level={3} subclasses={subclasses} selectedSubclassId="champion-xphb" onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "Selected" })).toBeInTheDocument();
  });
});
