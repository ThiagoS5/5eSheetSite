/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FeatureTagList } from "@/src/components/molecules/FeatureTagList";
import type { BuilderFeature } from "@/src/types/builder";

const features: BuilderFeature[] = [
  { name: "Second Wind", description: "Regain hit points as a bonus action.", level: 1 },
  { name: "Action Surge", description: "Take one additional action.", level: 2 },
];

describe("FeatureTagList", () => {
  afterEach(cleanup);

  it("renders one tag per feature in an accessible list", () => {
    render(<FeatureTagList features={features} emptyLabel="No features" />);

    expect(screen.getByRole("list", { name: "No features" })).toBeInTheDocument();
    expect(screen.getByText("Second Wind")).toBeInTheDocument();
    expect(screen.getByText("Action Surge")).toBeInTheDocument();
  });

  it("prefers an explicit aria label over the empty label", () => {
    render(
      <FeatureTagList features={features} emptyLabel="No features" ariaLabel="Class features" />,
    );

    expect(screen.getByRole("list", { name: "Class features" })).toBeInTheDocument();
  });

  it("renders the empty label when there are no features", () => {
    render(<FeatureTagList features={[]} emptyLabel="No features" />);

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByText("No features")).toBeInTheDocument();
  });
});
