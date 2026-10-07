/**
 * narrative.ts
 * Plain-language note for a support person. No diagnosis.
 * Export: explainTrauma(patterns, needs): string
 */

import type { NeedResult } from "./behaviourToNeed";
import type { PatternResult } from "./patterns";

/** Join cues and needs into one short explanation. */
export function explainTrauma(patterns: PatternResult, needs: NeedResult): string {
  if (!patterns.hits.length) {
    return "No listed cues. Keep the demand small and offer a choice.";
  }
  const cues = patterns.hits.map((hit) => hit.label.toLowerCase()).join(", ");
  const needList = needs.needs.join(", ");
  return `The note mentions ${cues}. That can be a protection response, not defiance. A useful support focus is ${needList}. This is a planning hint, not a diagnosis.`;
}
