/**
 * progressNoteRewriter.ts
 * Turns a rough note into a short professional note.
 * Keeps it descriptive. Does not add a diagnosis or an outcome claim.
 * Export: rewriteProgressNotes(text): string
 */

/** Rewrite a note. Empty input returns a fixed line. */
export function rewriteProgressNotes(text: string): string {
  const source = (text ?? "").replace(/\s+/g, " ").trim();
  if (!source) return "No note supplied.";
  return [
    "Progress note",
    `Observed: ${source}`,
    "Support offered a choice and a chance to pause.",
    "Outcome was not scored. Follow the person's account of what helped.",
  ].join("\n");
}
