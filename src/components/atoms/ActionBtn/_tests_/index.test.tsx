/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActionBtn } from "@/src/components/atoms/ActionBtn";

describe("ActionBtn", () => {
  afterEach(cleanup);

  it("defaults to type=button so it never submits forms accidentally", () => {
    render(<ActionBtn>Confirm</ActionBtn>);

    expect(screen.getByRole("button", { name: "Confirm" })).toHaveAttribute("type", "button");
  });

  it("keeps an explicit type when one is passed", () => {
    render(<ActionBtn type="submit">Save</ActionBtn>);

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "submit");
  });

  it("applies the secondary intent and small size classes", () => {
    render(
      <ActionBtn intent="secondary" size="sm">
        Cancel
      </ActionBtn>,
    );

    const button = screen.getByRole("button", { name: "Cancel" });
    expect(button).toHaveClass("bg-white/5");
    expect(button).toHaveClass("min-h-9");
  });

  it("forwards native button props such as onClick and disabled", () => {
    const onClick = vi.fn();
    render(
      <ActionBtn onClick={onClick} disabled>
        Roll
      </ActionBtn>,
    );

    const button = screen.getByRole("button", { name: "Roll" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
