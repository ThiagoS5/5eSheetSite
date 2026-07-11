import { buildPdfDocument } from "@/src/adapters/pdfAdapterDocument";
import type { PdfCharacterInput, PdfExportOptions } from "@/src/adapters/pdfAdapterDocument";

export async function renderPdfBuffer(
  input: PdfCharacterInput,
  options?: PdfExportOptions,
): Promise<Buffer> {
  const { renderToBuffer } = await import("@react-pdf/renderer");
  return renderToBuffer(buildPdfDocument(input, options));
}

export {
  buildPdfDocument,
  compactDescriptionFields,
  createInventoryRows,
  formatList,
  formatModifier,
  getSpellAppendixDescription,
  groupSpellsByLevel,
  markdownToParagraphs,
  splitFeatureSummary,
  type PdfCharacterInput,
  type PdfExportOptions,
  type PdfInventoryItem,
  type PdfInventoryRow,
} from "@/src/adapters/pdfAdapterDocument";
