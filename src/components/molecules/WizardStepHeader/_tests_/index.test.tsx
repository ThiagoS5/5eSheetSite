/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WizardStepHeader } from "@/src/components/molecules/WizardStepHeader";

describe("WizardStepHeader", () => {
  afterEach(cleanup);

  it("renders eyebrow, title, and description", () => {
    render(
      <WizardStepHeader
        id="step-class"
        eyebrow="Step 1"
        title="Choose a Class"
        description="Your class defines what you do in combat."
      />,
    );

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Choose a Class" })).toHaveAttribute(
      "id",
      "step-class",
    );
    expect(screen.getByText("Your class defines what you do in combat.")).toBeInTheDocument();
  });

  it("hides the search field when no search handler is wired", () => {
    render(<WizardStepHeader id="step" title="Title" description="Desc" />);

    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("wires the search input to the handler and announces result counts", () => {
    const onSearch = vi.fn();
    render(
      <WizardStepHeader
        id="step"
        title="Title"
        description="Desc"
        searchId="class-search"
        searchLabel="Filter classes"
        resultCountLabel="12 classes found"
        onSearch={onSearch}
      />,
    );

    const input = screen.getByLabelText("Filter classes");
    fireEvent.change(input, { target: { value: "fig" } });
    expect(onSearch).toHaveBeenCalledWith("fig");

    const results = screen.getByText("12 classes found");
    expect(results).toHaveAttribute("aria-live", "polite");
    expect(input).toHaveAttribute("aria-describedby", results.id);
  });
});
