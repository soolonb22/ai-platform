/**
 * microInterventions.ts
 * Short support options. Offers, not instructions to the person.
 * Export: generateInterventions(need: NeedResult): string[]
 */

import type { NeedId, NeedResult } from "./behaviourToNeed";

const OPTIONS: Record<NeedId, string[]> = {
  safety: [
    "Name who is here and that they can leave.",
    "Sit at an angle, not blocking the exit.",
  ],
  space: [
    "Offer a quiet corner with no follow-up questions.",
    "Pause the task. Return only if they invite it.",
  ],
  predictability: [
    "Say the next two steps in order.",
    "Show the end time before starting.",
  ],
  "sensory-relief": [
    "Lower noise and light. Offer headphones or a hat.",
    "Move to a less crowded spot.",
  ],
  connection: [
    "Stay nearby without talking, if that is wanted.",
    "Ask one choice: sit together or sit apart.",
  ],
  control: [
    "Give two acceptable options, not an order.",
    "Let them change the order of the steps.",
  ],
};

/** Up to four options drawn from the listed needs. */
export function generateInterventions(need: NeedResult): string[] {
  const lines = need.needs.flatMap((id) => OPTIONS[id] ?? []);
  return lines.slice(0, 4);
}
