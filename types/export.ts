import type { CharacterBuild } from "@/src/types/characterBuild";

export const FORGE_FATE_EXPORT_FORMAT = "forge-fate-character" as const;
export const FORGE_FATE_EXPORT_FORMAT_VERSION = 1 as const;

/**
 * Envelope do JSON canônico (master plan §19.1). `formatVersion` versiona o
 * ENVELOPE; o build interno continua versionado por `exportMetadata.schemaVersion`.
 */
export interface ForgeFateExportV1 {
  format: typeof FORGE_FATE_EXPORT_FORMAT;
  formatVersion: typeof FORGE_FATE_EXPORT_FORMAT_VERSION;
  exportedAt: string;
  app: {
    name: "Forge & Fate";
    schemaVersion: number;
  };
  build: CharacterBuild;
}
