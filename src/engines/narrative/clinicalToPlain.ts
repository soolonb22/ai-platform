/**
 * clinicalToPlain.ts
 * Swaps listed clinical words for plain words. Does not interpret a case.
 * Export: toPlainLanguage(text): string
 */

const SWAPS: Array<[RegExp, string]> = [
  [/\b(?:a|an)\s+diagnos(?:is|ed)\s+of\b/gi, "a label of"],
  [/\bdiagnos(?:is|ed)\s+of\b/gi, "a label of"],
  [/\bdiagnosed\s+with\b/gi, "given a label of"],
  [/\bdiagnos(?:is|ed)\b/gi, "a label someone used"],
  [/\bautism\b/gi, "a neurodivergent profile"],
  [/\bADHD\b/g, "an attention difference"],
  [/\bPTSD\b/g, "a stress response"],
  [/\banxiety\b/gi, "worry in the body"],
  [/\bdepression\b/gi, "a low, heavy period"],
  [/\bdisorder\b/gi, "a named pattern"],
  [/\bsyndrome\b/gi, "a named pattern"],
  [/\bmedication\b/gi, "a prescribed support"],
  [/\bhypervigilant\b/gi, "on the watch"],
  [/\bdissociat\w*/gi, "checked out"],
];

/** Replace listed terms. Unknown clinical words are left as written. */
export function toPlainLanguage(text: string): string {
  let plain = (text ?? "").trim();
  if (!plain) return "No text supplied.";
  for (const [pattern, replacement] of SWAPS) {
    plain = plain.replace(pattern, replacement);
  }
  return plain;
}
