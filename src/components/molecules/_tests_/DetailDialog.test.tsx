/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DetailDialog } from "@/src/components/molecules/DetailDialog";

describe("DetailDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("opens an accessible details dialog from a keyboard-focusable trigger", () => {
    render(
      <DetailDialog title="Fighter" description="Class details">
        <p>Second Wind details.</p>
      </DetailDialog>,
    );

    const trigger = screen.getByRole("button", { name: "Detalhes" });

    expect(trigger).toBeInTheDocument();
    fireEvent.click(trigger);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Second Wind details.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Fechar detalhes de Fighter" }),
    ).toBeInTheDocument();
  });
});
