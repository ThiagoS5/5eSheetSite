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
    render(<ChoiceCounter selected={2} total={3} label="pericias" />);

    const status = screen.getByText("2 de 3 pericias");

    expect(status).toBeInTheDocument();
    expect(status.closest("[aria-live]")).toHaveAttribute("aria-live", "polite");
  });

  it("marks the counter complete with an accessible checkmark when selected equals total", () => {
    render(<ChoiceCounter selected={3} total={3} label="pericias" />);

    expect(screen.getByText("3 de 3 pericias")).toBeInTheDocument();
    expect(screen.getByText("completo")).toBeInTheDocument();
  });

  it("does not render the completion mark when selection is incomplete", () => {
    render(<ChoiceCounter selected={1} total={2} label="idiomas" />);

    expect(screen.queryByText("completo")).not.toBeInTheDocument();
  });
});
