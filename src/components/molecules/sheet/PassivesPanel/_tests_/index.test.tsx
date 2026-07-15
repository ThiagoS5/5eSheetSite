/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PassivesPanel } from "@/src/components/molecules/sheet/PassivesPanel";

describe("PassivesPanel", () => {
  afterEach(cleanup);

  it("renders the three passive senses with their values", () => {
    render(<PassivesPanel perception={14} investigation={12} insight={11} />);

    expect(screen.getByText("Passive Senses")).toBeInTheDocument();
    expect(screen.getByText("Passive Perception")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("Passive Investigation")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Passive Insight")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
  });
});
