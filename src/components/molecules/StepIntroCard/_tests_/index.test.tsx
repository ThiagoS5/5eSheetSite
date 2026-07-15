/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StepIntroCard } from "@/src/components/molecules/StepIntroCard";
import { conceptGlossary } from "@/src/data/conceptGlossary";

describe("StepIntroCard", () => {
  afterEach(cleanup);

  it("starts expanded in beginner mode, showing the long explanation", () => {
    render(<StepIntroCard conceptId="class" title="What is a Class?" beginnerMode />);

    expect(screen.getByRole("heading", { name: "What is a Class?" })).toBeInTheDocument();
    expect(screen.getByText(conceptGlossary.class.short)).toBeInTheDocument();
    expect(screen.getByText(conceptGlossary.class.long)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recolher guia" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("renders nothing outside beginner mode", () => {
    const { container } = render(
      <StepIntroCard conceptId="class" title="What is a Class?" beginnerMode={false} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("collapses the long explanation when toggled", () => {
    render(<StepIntroCard conceptId="species" title="Species" beginnerMode />);

    fireEvent.click(screen.getByRole("button", { name: "Recolher guia" }));

    expect(screen.queryByText(conceptGlossary.species.long)).not.toBeInTheDocument();
    expect(screen.getByText(conceptGlossary.species.short)).toBeInTheDocument();
  });
});
