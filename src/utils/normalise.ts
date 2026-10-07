/**
 * normalise.ts
 * Cleans text before redaction and budgeting.
 * Does not remove meaning. Does not redact.
 *
 * Export: normalise(input: string): string
 */

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const FANCY_QUOTES = /[“”«»]/g;
const FANCY_APOSTROPHE = /[‘’]/g;
const DASH = /[–—]/g;
const SPACE_BEFORE_PUNCT = /[ \t]+([,.;:!?])/g;
const MULTI_PUNCT = /([!?]){2,}/g;
const MULTI_DOT = /\.{4,}/g;
const MULTI_SPACE = /[ \t]{2,}/g;
const MULTI_BREAK = /\n{3,}/g;
const TRAILING_LINE_SPACE = /[ \t]+\n/g;

/** Collapse formatting noise. Keep words and sentence breaks. */
export function normalise(input: string): string {
  if (!input) return "";
  let text = input.replace(/\r\n?/g, "\n");
  text = text.replace(CONTROL, "");
  text = text.replace(FANCY_QUOTES, "\"");
  text = text.replace(FANCY_APOSTROPHE, "'");
  text = text.replace(DASH, "-");
  text = text.replace(SPACE_BEFORE_PUNCT, "$1");
  text = text.replace(MULTI_PUNCT, "$1");
  text = text.replace(MULTI_DOT, "...");
  text = text.replace(MULTI_SPACE, " ");
  text = text.replace(TRAILING_LINE_SPACE, "\n");
  text = text.replace(MULTI_BREAK, "\n\n");
  return text.trim();
}
