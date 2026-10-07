/**
 * traumaToStory.ts
 * Turns pattern labels into a short story for a support person.
 * Not a trauma finding.
 * Export: traumaStory(patterns): string
 */

/** One paragraph from pattern labels. Empty input gets a default line. */
export function traumaStory(patterns: string[]): string {
  const labels = patterns.map((item) => item.trim()).filter(Boolean);
  if (!labels.length) return "No pattern was listed. Keep the demand small and offer a choice.";
  return `The notes point to ${labels.join(", ")}. Read that as protection, not as a story about being difficult. Ask what felt unsafe or too much, and let them skip the retelling. This is a planning story, not a diagnosis.`;
}
