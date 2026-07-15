import { describe, expect, it } from "vitest";
import {
  formatWeight,
  parseWeight,
  personalDetailsSchema,
} from "@/src/schemas/personalDetailsSchema";

const validForm = { nome: "Aramil", weightUnit: "kg" as const };

describe("personalDetailsSchema", () => {
  it("accepts a minimal valid form", () => {
    const result = personalDetailsSchema.safeParse(validForm);
    expect(result.success).toBe(true);
  });

  it("requires a non-empty name", () => {
    const result = personalDetailsSchema.safeParse({ ...validForm, nome: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Name is required");
    }
  });

  it("caps the name at 60 characters", () => {
    const result = personalDetailsSchema.safeParse({ ...validForm, nome: "x".repeat(61) });
    expect(result.success).toBe(false);
  });

  it("only accepts kg or lb as weight unit", () => {
    expect(personalDetailsSchema.safeParse({ ...validForm, weightUnit: "st" }).success).toBe(false);
    expect(personalDetailsSchema.safeParse({ ...validForm, weightUnit: "lb" }).success).toBe(true);
  });

  it("enforces the long-text limits (story at 4000, notes at 1000)", () => {
    expect(
      personalDetailsSchema.safeParse({ ...validForm, historia: "x".repeat(4001) }).success,
    ).toBe(false);
    expect(
      personalDetailsSchema.safeParse({ ...validForm, notas: "x".repeat(1001) }).success,
    ).toBe(false);
  });
});

describe("parseWeight", () => {
  it("splits a stored value into number and unit", () => {
    expect(parseWeight("70kg")).toEqual({ weightValue: "70", weightUnit: "kg" });
    expect(parseWeight("155 lb")).toEqual({ weightValue: "155", weightUnit: "lb" });
  });

  it("defaults to kg when the unit is missing or the input is empty", () => {
    expect(parseWeight("80")).toEqual({ weightValue: "80", weightUnit: "kg" });
    expect(parseWeight("")).toEqual({ weightValue: "", weightUnit: "kg" });
    expect(parseWeight(null)).toEqual({ weightValue: "", weightUnit: "kg" });
  });

  it("falls back to an empty kg value for unparseable input", () => {
    expect(parseWeight("heavy")).toEqual({ weightValue: "", weightUnit: "kg" });
  });
});

describe("formatWeight", () => {
  it("joins value and unit without a space", () => {
    expect(formatWeight("70", "kg")).toBe("70kg");
    expect(formatWeight("155", "lb")).toBe("155lb");
  });

  it("returns an empty string when the value is blank", () => {
    expect(formatWeight("", "kg")).toBe("");
    expect(formatWeight("   ", "lb")).toBe("");
    expect(formatWeight(undefined, "kg")).toBe("");
  });
});
