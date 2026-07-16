import { describe, expect, it } from "vitest";
import {
  filterByActiveSources,
  getInactiveSourceEntries,
  isSourceActive,
} from "@/src/utils/sourceFiltering";

const entries = [
  { id: "fighter-xphb", name: "Fighter", source: "XPHB" },
  { id: "legacy-fighter-phb", name: "Legacy Fighter", source: "phb" },
  { id: "artificer-efa", name: "Artificer", source: "EFA" },
];

describe("sourceFiltering", () => {
  it("matches active source codes case-insensitively", () => {
    expect(isSourceActive("xphb", ["XPHB"])).toBe(true);
    expect(isSourceActive("PHB", ["xphb"])).toBe(false);
  });

  it("filters inactive sources while preserving explicit legacy selections", () => {
    expect(filterByActiveSources(entries, ["XPHB"], ["legacy-fighter-phb"])).toEqual([
      entries[0],
      entries[1],
    ]);
  });

  it("reports inactive entries for warnings", () => {
    expect(getInactiveSourceEntries(entries, ["XPHB"]).map((entry) => entry.id)).toEqual([
      "legacy-fighter-phb",
      "artificer-efa",
    ]);
  });
});
