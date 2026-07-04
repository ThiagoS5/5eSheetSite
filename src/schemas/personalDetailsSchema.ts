import { z } from "zod";

/**
 * Form-shape schema for the character description form. Kept as strings to
 * match the persisted `CharacterDescription` (no schema migration): numeric
 * fields are constrained in the UI, and weight is recombined into the existing
 * `weight` string as `"{value}{unit}"` on save. `weightValue`/`weightUnit` are
 * form-only and never persisted as separate fields.
 */
export const personalDetailsSchema = z.object({
  nome: z.string().min(1, "Name is required").max(60, "Maximum of 60 characters"),
  alinhamento: z.string().max(40).optional(),
  faith: z.string().max(60).optional(),
  lifestyle: z.string().max(60).optional(),
  age: z.string().max(7).optional(),
  gender: z.string().max(40).optional(),
  height: z.string().max(20).optional(),
  weightValue: z.string().max(7).optional(),
  weightUnit: z.enum(["kg", "lb"]),
  eyes: z.string().max(40).optional(),
  skin: z.string().max(40).optional(),
  hair: z.string().max(40).optional(),
  aparencia: z.string().max(500).optional(),
  personalidade: z.string().max(500).optional(),
  tracos: z.string().max(2000).optional(),
  notas: z.string().max(1000).optional(),
});

export type PersonalDetailsForm = z.infer<typeof personalDetailsSchema>;

export type WeightUnit = "kg" | "lb";

/** Split a stored weight string like "77kg" into value + unit. */
export function parseWeight(stored: string | undefined | null): {
  weightValue: string;
  weightUnit: WeightUnit;
} {
  const text = (stored ?? "").trim();
  const match = text.match(/^([\d.,]*)\s*(kg|lb)?$/i);
  if (!match) return { weightValue: "", weightUnit: "kg" };
  const unit = match[2]?.toLowerCase() === "lb" ? "lb" : "kg";
  return { weightValue: match[1] ?? "", weightUnit: unit };
}

/** Recombine value + unit into the stored weight string. */
export function formatWeight(value: string | undefined, unit: WeightUnit): string {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? "" : `${trimmed}${unit}`;
}
