import type { CharacterBuild } from "@/src/types/characterBuild";
import {
  FORGE_FATE_EXPORT_FORMAT,
  FORGE_FATE_EXPORT_FORMAT_VERSION,
  type ForgeFateExportV1,
} from "@/types/export";

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
