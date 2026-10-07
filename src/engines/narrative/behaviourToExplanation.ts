/**
 * behaviourToExplanation.ts
 * A plain explanation of a described behaviour. Not a cause claim.
 * Export: explainBehaviour(behaviour): string
 */

const KNOWN: Record<string, string> = {
  flight: "Leaving or hiding can be a way to get away from a demand that feels too big.",
  fight: "Pushing back can be a way to make a threat stop.",
  fawn: "Agreeing fast can be a way to stay safe with the person who holds the demand.",
  shutdown: "Going quiet can be a full system, not a refusal to talk.",
  "sensory load": "Covering ears or leaving noise can be a limit, not a choice to opt out of class.",
};

/** Explain a known behaviour label, or a generic line for anything else. */
export function explainBehaviour(behaviour: string): string {
  const key = (behaviour ?? "").trim().toLowerCase();
  if (!key) return "No behaviour supplied.";
  return KNOWN[key] ?? `${behaviour} is a response to read with the person, not a verdict about them.`;
}
