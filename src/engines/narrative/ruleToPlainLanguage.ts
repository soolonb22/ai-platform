/**
 * ruleToPlainLanguage.ts
 * Shortens rule lines and adds a limit so they are not read as approval.
 * Export: simplifyRules(rules): string[]
 */

/** One plain line per rule. Empty rules return a single limit line. */
export function simplifyRules(rules: string[]): string[] {
  const lines = rules.map((rule) => rule.replace(/\s+/g, " ").trim()).filter(Boolean);
  if (!lines.length) return ["No rule supplied. Do not guess a funding or school decision."];
  return lines.map((rule) => `In short: ${rule} This does not approve a support.`);
}
