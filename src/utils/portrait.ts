import { getPortraitById } from "@/src/data/portraits";
import type { CharacterDescription } from "@/src/types/builder";

export const MAX_PORTRAIT_DATA_LENGTH = 700_000;

/** Only bounded, embedded raster images can travel with a character save. */
export function normalizePortraitDataUrl(value: unknown): string {
  if (typeof value !== "string" || value.length > MAX_PORTRAIT_DATA_LENGTH) return "";
  return /^data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/.test(value) ? value : "";
}

export function resolveCharacterPortrait(description: Pick<CharacterDescription, "portraitId" | "portraitDataUrl">): string | undefined {
  return normalizePortraitDataUrl(description.portraitDataUrl) || getPortraitById(description.portraitId)?.src;
}
