/**
 * cues.ts
 * Whole-word cue matching shared by the engines.
 *
 * "hit" matches "hit" and "hits" but never "white". "hitting" is listed on its own.
 * A plain cue also takes the endings s, es, d, ed, and ing.
 * A trailing * marks a stem: "avoid*" matches "avoid", "avoided", and "avoidance".
 * Multi-word cues allow any whitespace between words. Matching ignores case.
 *
 * Export: matchCues(text, cues): string[]
 */

const SUFFIX = "(?:s|es|d|ed|ing)?";

const compiled = new Map<string, RegExp>();

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\u005c]/g, "\u005c$&");
}

function cuePattern(cue: string): RegExp {
  const cached = compiled.get(cue);
  if (cached) return cached;
  const stem = cue.endsWith("*");
  const body = escapeRegExp(stem ? cue.slice(0, -1) : cue).replace(/\s+/g, String.raw`\s+`);
  const pattern = new RegExp(stem ? String.raw`\b${body}\w*` : String.raw`\b${body}${SUFFIX}\b`, "i");
  compiled.set(cue, pattern);
  return pattern;
}

/** Straight apostrophes, so curly and straight forms of a contraction match the same cue. */
function prepare(text: string): string {
  return (text ?? "").replace(/[\u2018\u2019]/g, "\u0027");
}

/** The words in the text that matched a cue, lowercased, in cue order, without repeats. */
export function matchCues(text: string, cues: string[]): string[] {
  const source = prepare(text);
  const found: string[] = [];
  for (const cue of cues) {
    const match = source.match(cuePattern(cue));
    if (!match) continue;
    const word = match[0].toLowerCase().replace(/\s+/g, " ");
    if (!found.includes(word)) found.push(word);
  }
  return found;
}
