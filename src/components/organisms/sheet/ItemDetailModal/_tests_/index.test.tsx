/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ItemDetailModal, type DetailItem } from "@/src/components/organisms/sheet/ItemDetailModal";

const weapon: DetailItem = { kind: "weapon", name: "Adaga", attackBonus: "+6", damage: "1d4+3 Perfurante", notes: "Acuidade" };
const equipment: DetailItem = {
  kind: "equipment",
  name: "Hempen Rope",
  qty: 1,
  source: "Background",
  category: "Other Gear",
  type: "Gear",
  weight: "4.54 kg",
  cost: "1 GP",
  description: "A sturdy 50-foot coil of hempen rope.",
};

describe("ItemDetailModal", () => {
  afterEach(cleanup);
  it("renders nothing when item is null", () => {
    render(<ItemDetailModal item={null} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders weapon detail fields when open", () => {
    render(<ItemDetailModal item={weapon} onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Adaga")).toBeInTheDocument();
    expect(screen.getByText("+6")).toBeInTheDocument();
    expect(screen.getByText("1d4+3 Perfurante")).toBeInTheDocument();
  });

  it("calls onClose when the close button is pressed", () => {
    const onClose = vi.fn();
    render(<ItemDetailModal item={weapon} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders real equipment metadata and description", () => {
    render(<ItemDetailModal item={equipment} onClose={() => {}} />);

    expect(screen.getByText("Other Gear")).toBeInTheDocument();
    expect(screen.getByText("Gear")).toBeInTheDocument();
    expect(screen.getByText("4.54 kg")).toBeInTheDocument();
    expect(screen.getByText("A sturdy 50-foot coil of hempen rope.")).toBeInTheDocument();
  });
});
