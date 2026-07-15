/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EquipmentCard } from "@/src/components/organisms/EquipmentCard";
import type { BuilderEquipmentOption } from "@/src/types/builder";

const equipment: BuilderEquipmentOption[] = [
  {
    id: "longsword",
    name: "Longsword",
    source: "PHB",
    sourceType: "class",
    category: "Weapon",
    type: "weapon",
  },
];

describe("EquipmentCard", () => {
  afterEach(cleanup);

  it("renders selected equipment with source labels", () => {
    render(<EquipmentCard equipment={equipment} />);

    expect(screen.getByRole("heading", { name: "Equipment" })).toBeInTheDocument();
    expect(screen.getByText("Longsword")).toBeInTheDocument();
    expect(screen.getByText("PHB")).toBeInTheDocument();
  });

  it("renders an empty state when no equipment is selected", () => {
    render(<EquipmentCard equipment={[]} />);

    expect(screen.getByText("No equipment selected.")).toBeInTheDocument();
  });
});
