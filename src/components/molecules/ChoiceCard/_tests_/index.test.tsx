/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChoiceCard } from "@/src/components/molecules/ChoiceCard";

describe("ChoiceCard", () => {
  afterEach(cleanup);

  it("renders title, eyebrow, and body content", () => {
    render(
      <ChoiceCard title="Fighter" eyebrow="Class" selected={false} onSelect={() => {}}>
        A master of martial combat.
      </ChoiceCard>,
    );

    expect(screen.getByRole("heading", { name: "Fighter" })).toBeInTheDocument();
    expect(screen.getByText("Class")).toBeInTheDocument();
    expect(screen.getByText("A master of martial combat.")).toBeInTheDocument();
  });

  it("fires onSelect and reflects the unselected state on the action button", () => {
    const onSelect = vi.fn();
    render(
      <ChoiceCard title="Fighter" selected={false} actionLabel="Pick" onSelect={onSelect}>
        body
      </ChoiceCard>,
    );

    const button = screen.getByRole("button", { name: "Pick" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("shows Selected and aria-pressed when selected", () => {
    render(
      <ChoiceCard title="Fighter" selected onSelect={() => {}}>
        body
      </ChoiceCard>,
    );

    expect(screen.getByRole("button", { name: "Selected" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("hides the default action button when showDefaultAction is false", () => {
    render(
      <ChoiceCard title="Fighter" selected={false} showDefaultAction={false} onSelect={() => {}}>
        body
      </ChoiceCard>,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("disables the action button when disabled", () => {
    render(
      <ChoiceCard title="Fighter" selected={false} disabled onSelect={() => {}}>
        body
      </ChoiceCard>,
    );

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
