/**
 * executiveFunctioning.ts
 * Classroom supports for starting, sequencing, and finishing.
 * Not a skills deficit claim.
 * Export: generateEFStrategies(need): string[]
 */

const STRATEGIES: Record<string, string[]> = {
  safety: ["Start only after the room is named.", "One adult gives the instruction."],
  space: ["Shorter work block.", "Done pile in sight so the end is visible."],
  predictability: ["Checklist of two steps.", "Same start cue each time."],
  "sensory-relief": ["Task card instead of a long verbal brief.", "Work sample shown once."],
  connection: ["Body-double: someone works nearby.", "Optional check at the halfway mark."],
  control: ["They order the steps.", "They choose the first two minutes."],
};

/** Two strategies for the need. Default is a short sequence. */
export function generateEFStrategies(need: string): string[] {
  return STRATEGIES[need] ?? ["Write the first step only.", "Show what done looks like."];
}
