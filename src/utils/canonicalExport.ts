import { z } from "zod";
import type { CharacterBuild } from "@/src/types/characterBuild";
import {
  CHARACTER_BUILD_SCHEMA_VERSION,
} from "@/src/types/characterBuild";
import {
  FORGE_FATE_EXPORT_FORMAT,
  FORGE_FATE_EXPORT_FORMAT_VERSION,
  type ForgeFateExportV1,
} from "@/types/export";
import {
  createSaveId,
  normalizeCharacterBuild,
} from "@/src/store/characterBuildModel";

export function exportCharacter(
  build: CharacterBuild,
  exportedAt: string = new Date().toISOString(),
): ForgeFateExportV1 {
  return {
    format: FORGE_FATE_EXPORT_FORMAT,
    formatVersion: FORGE_FATE_EXPORT_FORMAT_VERSION,
    exportedAt,
    app: {
      name: "Forge & Fate",
      schemaVersion: build.exportMetadata.schemaVersion,
    },
    build,
  };
}

export function serializeCharacterExport(build: CharacterBuild): string {
  return JSON.stringify(exportCharacter(build), null, 2);
}

const exportEnvelopeSchema = z.object({
  format: z.literal(FORGE_FATE_EXPORT_FORMAT),
  formatVersion: z.number().int().min(1),
  exportedAt: z.string(),
  app: z.object({
    name: z.string(),
    schemaVersion: z.number().int().min(1),
  }),
  build: z.record(z.string(), z.unknown()),
});

export type ImportCharacterResult =
  | { ok: true; build: CharacterBuild }
  | { ok: false; error: string };

/**
 * Import canônico: valida o envelope com zod e delega migração de schemas
 * antigos ao ponto único `normalizeCharacterBuild`. Sempre gera saveId novo —
 * import nunca sobrescreve um save existente por colisão.
 */
export function importCharacter(rawJson: string): ImportCharacterResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { ok: false, error: "The file is not valid JSON." };
  }

  const envelope = exportEnvelopeSchema.safeParse(parsed);

  if (!envelope.success) {
    return {
      ok: false,
      error: "The file is not a Forge & Fate character export.",
    };
  }

  if (
    envelope.data.formatVersion > FORGE_FATE_EXPORT_FORMAT_VERSION ||
    envelope.data.app.schemaVersion > CHARACTER_BUILD_SCHEMA_VERSION
  ) {
    return {
      ok: false,
      error:
        "This character was exported by a newer version of Forge & Fate. Update the app and try again.",
    };
  }

  const now = new Date().toISOString();
  const build = normalizeCharacterBuild({
    ...(envelope.data.build as Partial<CharacterBuild>),
    exportMetadata: {
      schemaVersion: CHARACTER_BUILD_SCHEMA_VERSION,
      saveId: createSaveId(),
      createdAt: now,
      updatedAt: now,
    },
  });

  return { ok: true, build };
}
