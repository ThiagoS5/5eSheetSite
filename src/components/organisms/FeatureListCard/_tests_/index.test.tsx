/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  FeatureListCard,
  createNamedFeature,
} from "@/src/components/organisms/FeatureListCard";

describe("FeatureListCard", () => {
  afterEach(cleanup);

  it("renders an empty state when there are no features", () => {
    render(<FeatureListCard title="Class Features" features={[]} emptyLabel="No features yet." />);

    expect(screen.getByRole("heading", { name: "Class Features" })).toBeInTheDocument();
    expect(screen.getByText("No features yet.")).toBeInTheDocument();
  });

  it("expands feature details with English accessible labels", () => {
    render(
      <FeatureListCard
        title="Class Features"
        features={[createNamedFeature("Second Wind", "Regain hit points as a bonus action.")]}
        emptyLabel="No features yet."
      />,
    );

    const expandButton = screen.getByRole("button", {
      name: "View details for Second Wind",
    });
    fireEvent.click(expandButton);

    expect(expandButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Regain hit points as a bonus action.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Collapse Second Wind" }),
    ).toBeInTheDocument();
  });
});
