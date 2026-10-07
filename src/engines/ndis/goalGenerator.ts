/**
 * goalGenerator.ts
 * Draft goals from stated needs. The person can reject or rewrite them.
 * Export: generateGoals(needs): Goal[]
 */

export type Goal = {
  need: string;
  statement: string;
  review: string;
};

const GOAL_FOR: Record<string, string> = {
  safety: "I choose supports that help me feel safe in the places I use.",
  space: "I can take a break or leave a task without losing the support.",
  predictability: "I know the next step before a support starts.",
  "sensory-relief": "I can reduce noise, light, or crowd load during support.",
  connection: "I choose when I want company and when I want time alone.",
  control: "I choose between options instead of being told the only way.",
  community: "I take part in a community activity I pick, at a pace I can manage.",
  daily: "I get help with the daily tasks I want support for.",
};

/** One draft goal per need. Unknown needs get a generic choice-and-control goal. */
export function generateGoals(needs: string[]): Goal[] {
  const unique = [...new Set(needs.map((need) => need.trim()).filter(Boolean))];
  return unique.map((need) => ({
    need,
    statement: GOAL_FOR[need] ?? `I get support for ${need} in a way I can change.`,
    review: "Review with the person. Do not treat this as an approved plan goal.",
  }));
}
