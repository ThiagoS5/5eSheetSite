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

describe("InventoryManager", () => {
  it("renders both accordion sections", () => {
    render(<InventoryManager catalog={catalog} inventory={[]} onAddItem={vi.fn()} onSetQuantity={vi.fn()} onRemoveItem={vi.fn()} />);
    expect(screen.getByText("Inventário Atual")).toBeInTheDocument();
    expect(screen.getByText("Adicionar Itens")).toBeInTheDocument();
    expect(screen.getByText("Nenhum item no inventário.")).toBeInTheDocument();
  });

  it("filters the catalog by the search query", () => {
    render(<InventoryManager catalog={catalog} inventory={[]} onAddItem={vi.fn()} onSetQuantity={vi.fn()} onRemoveItem={vi.fn()} />);
    expect(screen.getByText("Longsword")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Buscar item"), { target: { value: "ring" } });
    expect(screen.queryByText("Longsword")).not.toBeInTheDocument();
    expect(screen.getByText("Ring of Protection")).toBeInTheDocument();
  });

  it("calls onAddItem when ADD is clicked", () => {
    const onAddItem = vi.fn();
    render(<InventoryManager catalog={catalog} inventory={[]} onAddItem={onAddItem} onSetQuantity={vi.fn()} onRemoveItem={vi.fn()} />);
    fireEvent.click(screen.getAllByText("ADD")[0]);
    expect(onAddItem).toHaveBeenCalledWith("longsword-xphb");
  });

  it("manages quantity and removal for inventory entries", () => {
    const onSetQuantity = vi.fn();
    const onRemoveItem = vi.fn();
    render(<InventoryManager catalog={catalog} inventory={[{ itemId: "longsword-xphb", quantity: 2 }]} onAddItem={vi.fn()} onSetQuantity={onSetQuantity} onRemoveItem={onRemoveItem} />);
    fireEvent.click(screen.getByLabelText("Aumentar Longsword"));
    expect(onSetQuantity).toHaveBeenCalledWith("longsword-xphb", 3);
    fireEvent.click(screen.getByLabelText("Diminuir Longsword"));
    expect(onSetQuantity).toHaveBeenCalledWith("longsword-xphb", 1);
    fireEvent.click(screen.getByLabelText("Remover Longsword"));
    expect(onRemoveItem).toHaveBeenCalledWith("longsword-xphb");
  });
});
