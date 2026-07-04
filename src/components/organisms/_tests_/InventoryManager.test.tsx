/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InventoryManager } from "@/src/components/organisms/InventoryManager";
import type { CatalogItem } from "@/types/builder";

const catalog: CatalogItem[] = [
  { id: "longsword-xphb", name: "Longsword", source: "XPHB", category: "Weapon", isMagical: false, isCommon: false, isContainer: false },
  { id: "ring-of-protection-dmg", name: "Ring of Protection", source: "DMG", category: "Ring", isMagical: true, isCommon: false, isContainer: false },
];

afterEach(cleanup);

/** Ambas as seções iniciam recolhidas; abre a seção pedida pelo trigger. */
function openSection(name: RegExp) {
  fireEvent.click(screen.getByRole("button", { name }));
}

describe("InventoryManager", () => {
  it("renders both accordion sections collapsed by default", () => {
    render(<InventoryManager catalog={catalog} inventory={[]} onAddItem={vi.fn()} onSetQuantity={vi.fn()} onRemoveItem={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Current Inventory/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /Add Items/ })).toHaveAttribute("aria-expanded", "false");
    // Conteúdo só aparece após expandir.
    expect(screen.queryByText("No items in inventory.")).not.toBeInTheDocument();
    openSection(/Current Inventory/);
    expect(screen.getByText("No items in inventory.")).toBeInTheDocument();
  });

  it("filters the catalog by the search query", () => {
    render(<InventoryManager catalog={catalog} inventory={[]} onAddItem={vi.fn()} onSetQuantity={vi.fn()} onRemoveItem={vi.fn()} />);
    openSection(/Add Items/);
    expect(screen.getByText("Longsword")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search item"), { target: { value: "ring" } });
    expect(screen.queryByText("Longsword")).not.toBeInTheDocument();
    expect(screen.getByText("Ring of Protection")).toBeInTheDocument();
  });

  it("calls onAddItem when ADD is clicked", () => {
    const onAddItem = vi.fn();
    render(<InventoryManager catalog={catalog} inventory={[]} onAddItem={onAddItem} onSetQuantity={vi.fn()} onRemoveItem={vi.fn()} />);
    openSection(/Add Items/);
    fireEvent.click(screen.getAllByText("ADD")[0]);
    expect(onAddItem).toHaveBeenCalledWith("longsword-xphb");
  });

  it("manages quantity and removal for inventory entries", () => {
    const onSetQuantity = vi.fn();
    const onRemoveItem = vi.fn();
    render(<InventoryManager catalog={catalog} inventory={[{ itemId: "longsword-xphb", quantity: 2 }]} onAddItem={vi.fn()} onSetQuantity={onSetQuantity} onRemoveItem={onRemoveItem} />);
    openSection(/Current Inventory/);
    fireEvent.click(screen.getByLabelText("Increase Longsword"));
    expect(onSetQuantity).toHaveBeenCalledWith("longsword-xphb", 3);
    fireEvent.click(screen.getByLabelText("Decrease Longsword"));
    expect(onSetQuantity).toHaveBeenCalledWith("longsword-xphb", 1);
    fireEvent.click(screen.getByLabelText("Remove Longsword"));
    expect(onRemoveItem).toHaveBeenCalledWith("longsword-xphb");
  });
});
