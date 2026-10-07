/**
 * patterns.ts
 * Keyword categories for support planning. Not a diagnosis.
 * Cues match whole words, so "hit" does not fire on "white" and "numb" does not fire on "number".
 * Export: detectPatterns(text: string): PatternResult
 */

import { matchCues } from "../cues";

export type PatternId =
  | "hyperarousal"
  | "shutdown"
  | "flight"
  | "fight"
  | "fawn"
  | "sensory"
  | "safety";

export type PatternHit = {
  id: PatternId;
  label: string;
  cues: string[];
};

export type PatternResult = {
  hits: PatternHit[];
  note: string;
};

const CATEGORIES: Array<{ id: PatternId; label: string; cues: string[] }> = [
  {
    id: "hyperarousal",
    label: "High alert",
    cues: ["panic", "panick*", "startle", "can\u0027t settle", "couldn\u0027t settle", "racing", "on edge", "hypervigilant", "jumpy"],
  },
  {
    id: "shutdown",
    label: "Shutdown",
    cues: ["shutdown", "shut down", "numb", "blank", "won\u0027t talk", "wouldn\u0027t talk", "frozen", "froze", "dissociat*", "went quiet"],
  },
  {
    id: "flight",
    label: "Leave the demand",
    cues: ["ran off", "ran away", "left the room", "hid", "hide", "hiding", "avoid*", "bolt", "refused to enter", "absconded"],
  },
  {
    id: "fight",
    label: "Push back",
    cues: ["hit", "hitting", "kick", "threw", "throw", "yell", "scream", "swore", "swear", "lashed out", "argu*"],
  },
  {
    id: "fawn",
    label: "Appease",
    cues: ["people pleasing", "said sorry", "kept apologising", "agreed to everything", "couldn\u0027t say no", "fawn"],
  },
  {
    id: "sensory",
    label: "Sensory load",
    cues: ["too loud", "noisy", "bright", "itchy", "crowded", "covering ears", "covered ears", "sensory"],
  },
  {
    id: "safety",
    label: "Safety check",
    cues: ["unsafe", "scared", "afraid", "don\u0027t trust", "didn\u0027t trust", "watched the door", "asked who was there"],
  },
];

/** Match cue words. Empty text returns no hits. */
export function detectPatterns(text: string): PatternResult {
  const hits = CATEGORIES.map((category) => {
    const cues = matchCues(text, category.cues);
    return cues.length ? { id: category.id, label: category.label, cues } : null;
  }).filter((hit): hit is PatternHit => hit !== null);

  return {
    hits,
    note: hits.length
      ? "Cues only. Not a diagnosis."
      : "No listed cues found.",
  };
}
