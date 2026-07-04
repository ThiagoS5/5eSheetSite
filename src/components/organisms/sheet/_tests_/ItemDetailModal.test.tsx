/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ItemDetailModal, type DetailItem } from "@/src/components/organisms/sheet/ItemDetailModal";

const weapon: DetailItem = { kind: "weapon", name: "Adaga", attackBonus: "+6", damage: "1d4+3 Perfurante", notes: "Acuidade" };

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
});
