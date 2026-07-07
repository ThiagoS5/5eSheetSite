/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InventoryManager } from "@/src/components/organisms/InventoryManager";
import type { CatalogItem } from "@/types/builder";

const catalog: CatalogItem[] = [
  { id: "longsword-xphb", name: "Longsword", source: "XPHB", category: "Weapon", type: "weapon", isMagical: false, isCommon: false, isContainer: false },
  { id: "ring-of-protection-dmg", name: "Ring of Protection", source: "DMG", category: "Ring", type: "gear", isMagical: true, isCommon: false, isContainer: false },
];

afterEach(cleanup);


function openSection(name: RegExp) {
  fireEvent.click(screen.getByRole("button", { name }));
}

describe("InventoryManager", () => {
  it("renders both accordion sections collapsed by default", () => {
    render(<InventoryManager catalog={catalog} inventory={[]} equippedItemIds={[]} onAddItem={vi.fn()} onSetQuantity={vi.fn()} onRemoveItem={vi.fn()} onToggleEquipped={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Current Inventory/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /Add Items/ })).toHaveAttribute("aria-expanded", "false");

    expect(screen.queryByText("No items in inventory.")).not.toBeInTheDocument();
    openSection(/Current Inventory/);
    expect(screen.getByText("No items in inventory.")).toBeInTheDocument();
  });

  it("filters the catalog by the search query", () => {
    render(<InventoryManager catalog={catalog} inventory={[]} equippedItemIds={[]} onAddItem={vi.fn()} onSetQuantity={vi.fn()} onRemoveItem={vi.fn()} onToggleEquipped={vi.fn()} />);
    openSection(/Add Items/);
    expect(screen.getByText("Longsword")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search item"), { target: { value: "ring" } });
    expect(screen.queryByText("Longsword")).not.toBeInTheDocument();
    expect(screen.getByText("Ring of Protection")).toBeInTheDocument();
  });

  it("filters the catalog by source and renders source badges", () => {
    render(<InventoryManager catalog={catalog} inventory={[]} equippedItemIds={[]} onAddItem={vi.fn()} onSetQuantity={vi.fn()} onRemoveItem={vi.fn()} onToggleEquipped={vi.fn()} />);
    openSection(/Add Items/);
    expect(screen.queryByRole("button", { name: "Source DMG" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Filter item sources" }));
    expect(screen.getByRole("button", { name: "Filter item sources" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Source AAG" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Source DMG" }));
    expect(screen.queryByText("Longsword")).not.toBeInTheDocument();
    expect(screen.getByText("Ring of Protection")).toBeInTheDocument();
    expect(screen.getByText("DMG")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear sources" }));
    expect(screen.getByText("Longsword")).toBeInTheDocument();
  });

  it("calls onAddItem when ADD is clicked", () => {
    const onAddItem = vi.fn();
    render(<InventoryManager catalog={catalog} inventory={[]} equippedItemIds={[]} onAddItem={onAddItem} onSetQuantity={vi.fn()} onRemoveItem={vi.fn()} onToggleEquipped={vi.fn()} />);
    openSection(/Add Items/);
    fireEvent.click(screen.getAllByText("ADD")[0]);
    expect(onAddItem).toHaveBeenCalledWith("longsword-xphb");
  });

  it("keeps the add action immediately available after adding an item", () => {
    const onAddItem = vi.fn();
    render(<InventoryManager catalog={catalog} inventory={[]} equippedItemIds={[]} onAddItem={onAddItem} onSetQuantity={vi.fn()} onRemoveItem={vi.fn()} onToggleEquipped={vi.fn()} />);
    openSection(/Add Items/);
    const addButton = screen.getAllByRole("button", { name: "ADD" })[0];

    fireEvent.click(addButton);
    fireEvent.click(addButton);

    expect(addButton).not.toBeDisabled();
    expect(addButton).toHaveTextContent("ADD");
    expect(onAddItem).toHaveBeenCalledTimes(2);
    expect(onAddItem).toHaveBeenNthCalledWith(1, "longsword-xphb");
    expect(onAddItem).toHaveBeenNthCalledWith(2, "longsword-xphb");
  });

  it("manages quantity and removal for inventory entries", () => {
    const onSetQuantity = vi.fn();
    const onRemoveItem = vi.fn();
    render(<InventoryManager catalog={catalog} inventory={[{ itemId: "longsword-xphb", quantity: 2 }]} equippedItemIds={[]} onAddItem={vi.fn()} onSetQuantity={onSetQuantity} onRemoveItem={onRemoveItem} onToggleEquipped={vi.fn()} />);
    openSection(/Current Inventory/);
    fireEvent.click(screen.getByLabelText("Increase Longsword"));
    expect(onSetQuantity).toHaveBeenCalledWith("longsword-xphb", 3);
    fireEvent.click(screen.getByLabelText("Decrease Longsword"));
    expect(onSetQuantity).toHaveBeenCalledWith("longsword-xphb", 1);
    fireEvent.click(screen.getByLabelText("Remove Longsword"));
    expect(onRemoveItem).toHaveBeenCalledWith("longsword-xphb");
  });

  it("toggles equipped state for inventory entries", () => {
    const onToggleEquipped = vi.fn();
    const { rerender } = render(<InventoryManager catalog={catalog} inventory={[{ itemId: "longsword-xphb", quantity: 1 }]} equippedItemIds={[]} onAddItem={vi.fn()} onSetQuantity={vi.fn()} onRemoveItem={vi.fn()} onToggleEquipped={onToggleEquipped} />);
    openSection(/Current Inventory/);
    fireEvent.click(screen.getByRole("button", { name: "Equip Longsword" }));
    expect(onToggleEquipped).toHaveBeenCalledWith("longsword-xphb");

    rerender(<InventoryManager catalog={catalog} inventory={[{ itemId: "longsword-xphb", quantity: 1 }]} equippedItemIds={["longsword-xphb"]} onAddItem={vi.fn()} onSetQuantity={vi.fn()} onRemoveItem={vi.fn()} onToggleEquipped={onToggleEquipped} />);
    expect(screen.getByRole("button", { name: "Unequip Longsword" })).toBeInTheDocument();
  });

  it("renders catalog skeleton rows while loading", () => {
    render(<InventoryManager catalog={catalog} inventory={[]} equippedItemIds={[]} isCatalogLoading onAddItem={vi.fn()} onSetQuantity={vi.fn()} onRemoveItem={vi.fn()} onToggleEquipped={vi.fn()} />);
    openSection(/Add Items/);
    expect(screen.getAllByTestId("item-catalog-skeleton")).toHaveLength(6);
  });
});
