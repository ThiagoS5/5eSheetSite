/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClassChangeDiffDialog } from "@/src/components/organisms/ClassChangeDiffDialog";

describe("ClassChangeDiffDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders all impact items", () => {
    render(
      <ClassChangeDiffDialog
        open
        items={["2 pericias de classe", "Weapon Mastery", "Kit de equipamento da classe", "Subclasse: Champion"]}
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("2 pericias de classe")).toBeInTheDocument();
    expect(screen.getByText("Weapon Mastery")).toBeInTheDocument();
    expect(screen.getByText("Kit de equipamento da classe")).toBeInTheDocument();
    expect(screen.getByText("Subclasse: Champion")).toBeInTheDocument();
  });

  it("fires onConfirm when confirming the class change", () => {
    const onConfirm = vi.fn();
    render(
      <ClassChangeDiffDialog
        open
        items={["2 pericias de classe"]}
        onConfirm={onConfirm}
        onCancel={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Trocar de classe" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("fires onCancel on Escape", () => {
    const onCancel = vi.fn();
    render(
      <ClassChangeDiffDialog
        open
        items={["2 pericias de classe"]}
        onConfirm={() => {}}
        onCancel={onCancel}
      />,
    );

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape", code: "Escape" });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("fires onCancel when clicking Cancelar", () => {
    const onCancel = vi.fn();
    render(
      <ClassChangeDiffDialog
        open
        items={["2 pericias de classe"]}
        onConfirm={() => {}}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
