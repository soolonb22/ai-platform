/**
 * behaviourToNeed.ts
 * Maps observed behaviour to a possible support need. Not a cause claim.
 * Export: mapBehaviourToNeed(text: string): NeedResult
 */

import { detectPatterns, type PatternId } from "./patterns";

export type NeedId = "safety" | "space" | "predictability" | "sensory-relief" | "connection" | "control";

export type NeedResult = {
  behaviour: string;
  needs: NeedId[];
  summary: string;
};

const NEED_BY_PATTERN: Record<PatternId, NeedId[]> = {
  hyperarousal: ["safety", "sensory-relief"],
  shutdown: ["space", "safety"],
  flight: ["space", "control"],
  fight: ["safety", "control"],
  fawn: ["safety", "control"],
  sensory: ["sensory-relief", "space"],
  safety: ["safety", "predictability"],
};

/** Infer needs from pattern cues in the text. */
export function mapBehaviourToNeed(text: string): NeedResult {
  const patterns = detectPatterns(text);
  const needs = [...new Set(patterns.hits.flatMap((hit) => NEED_BY_PATTERN[hit.id]))];
  const behaviour = patterns.hits.map((hit) => hit.label).join(", ") || "No listed behaviour";
  return {
    behaviour,
    needs: needs.length ? needs : ["predictability"],
    summary: needs.length
      ? `Possible needs: ${needs.join(", ")}. Not a finding.`
      : "No clear cue. Default to predictability and choice.",
  };
}
