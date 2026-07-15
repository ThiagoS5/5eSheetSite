/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SubclassStep } from "@/src/components/organisms/levelup/SubclassStep";
import type { BuilderSubclass } from "@/types/builder";

const subclasses: BuilderSubclass[] = [
  { id: "battle-master-xphb", name: "Battle Master", shortName: "Battle Master", source: "XPHB", features: [{ name: "Combat Superiority", description: "...", level: 3 }] },
  { id: "champion-xphb", name: "Champion", shortName: "Champion", source: "XPHB", features: [] },
];

describe("SubclassStep", () => {
  afterEach(cleanup);

  it("routes to the Class › Subclass screen when nothing is chosen", () => {
    const onNavigate = vi.fn();
    render(
      <SubclassStep
        level={3}
        className="Fighter"
        subclasses={subclasses}
        selectedSubclassId=""
        onNavigateToSubclassScreen={onNavigate}
      />,
    );

    const link = screen.getByRole("link", { name: /Choose a subclass/i });
    expect(link).toHaveAttribute("href", "/builder/subclasse");
    expect(screen.getByText(/2 available options/)).toBeInTheDocument();

    fireEvent.click(link);
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("summarizes the chosen subclass and offers to change it", () => {
    render(
      <SubclassStep
        level={3}
        className="Fighter"
        subclasses={subclasses}
        selectedSubclassId="battle-master-xphb"
        onNavigateToSubclassScreen={() => {}}
      />,
    );

    expect(screen.getByText("Battle Master")).toBeInTheDocument();
    expect(screen.getByText(/Subclass chosen/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Change subclass/i }),
    ).toHaveAttribute("href", "/builder/subclasse");
  });
});
