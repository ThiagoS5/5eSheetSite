/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ChoiceCounter } from "@/src/components/molecules/ChoiceCounter";

describe("ChoiceCounter", () => {
  afterEach(cleanup);

  it("renders the selected/total count with the label", () => {
    render(<ChoiceCounter selected={2} total={3} label="skills" />);

    const status = screen.getByText("2 of 3 skills");

    expect(status).toBeInTheDocument();
    expect(status.closest("[aria-live]")).toHaveAttribute("aria-live", "polite");
  });

  it("marks the counter complete with an accessible checkmark when selected equals total", () => {
    render(<ChoiceCounter selected={3} total={3} label="skills" />);

    expect(screen.getByText("3 of 3 skills")).toBeInTheDocument();
    expect(screen.getByText("complete")).toBeInTheDocument();
  });

  it("does not render the completion mark when selection is incomplete", () => {
    render(<ChoiceCounter selected={1} total={2} label="languages" />);

    expect(screen.queryByText("complete")).not.toBeInTheDocument();
  });

  it("reports the required minimum separately from flexible extras", () => {
    render(<ChoiceCounter selected={5} total={3} label="languages" />);

    expect(screen.getByText("3 of 3 languages + 2 extra")).toBeInTheDocument();
    expect(screen.getByText("complete")).toBeInTheDocument();
  });
});
