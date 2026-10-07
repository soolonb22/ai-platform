/**
 * aiDocument.ts
 * PDF for an AI document: title, sections, the details still to add, and the safety note.
 * Uses writePdf, so long text wraps and runs onto more pages.
 * Export: buildDocumentPDF(document, note)
 */

import type { GeneratedDocument } from "../ai/documents";
import { writePdf } from "./writePdf";

export function buildDocumentPDF(document: GeneratedDocument, note: string): Uint8Array<ArrayBuffer> {
  const lines: string[] = [document.title, ""];
  for (const section of document.sections) {
    lines.push(section.heading.toUpperCase());
    for (const paragraph of section.paragraphs) lines.push(paragraph, "");
    for (const point of section.points) lines.push(`- ${point}`);
    lines.push("");
  }
  if (document.missing.length) {
    lines.push("DETAILS TO ADD OR CONFIRM");
    for (const item of document.missing) lines.push(`- ${item}`);
    lines.push("");
  }
  lines.push(note, "AI draft from redacted notes. Check every line before use.");
  return writePdf(lines);
}
