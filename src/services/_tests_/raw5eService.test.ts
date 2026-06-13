import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchRaw5eJson,
  type Raw5eClassFile,
} from "@/src/services/raw5eService";

describe("raw5eService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches JSON files from public/data using a safe relative path", async () => {
    const payload: Raw5eClassFile = {
      class: [
        {
          name: "Fighter",
          source: "XPHB",
          edition: "one",
          hd: { number: 1, faces: 10 },
          proficiency: ["str", "con"],
          startingProficiencies: {
            armor: ["light"],
            weapons: ["simple"],
            skills: [{ choose: { from: ["athletics"], count: 1 } }],
          },
          startingEquipment: {
            default: ["{@item Longsword|XPHB}"],
            defaultData: [{ a: ["longsword|xphb"] }],
          },
          classFeatures: ["Fighting Style|Fighter|XPHB|1"],
        },
      ],
      classFeature: [],
      subclass: [],
      subclassFeature: [],
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchRaw5eJson<Raw5eClassFile>("class/class-fighter.json")).resolves.toEqual(payload);

    expect(fetchMock).toHaveBeenCalledWith("/data/class/class-fighter.json");
  });

  it("rejects unsafe paths before fetch is called", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchRaw5eJson("../secrets.json")).rejects.toThrow(
      "Invalid 5etools data path",
    );
    await expect(fetchRaw5eJson("/data/classes.json")).rejects.toThrow(
      "Invalid 5etools data path",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
