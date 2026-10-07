/**
 * knownNames.ts
 * Replaces names we were told about, a person's name and nicknames, with [name].
 * Runs on top of the regex redactor, which cannot know every name.
 * Only capitalised matches are replaced, so a name that is also a word ("Will", "May")
 * does not wipe out "will" or "may" in ordinary sentences.
 *
 * Exports: namesFrom(name, otherNames), redactKnownNames(text, names)
 */

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\u005c]/g, "\u005c$&");
}

/** Full names, nicknames, and each part of them. Longest first. One-letter parts are skipped. */
export function namesFrom(name: string, otherNames = ""): string[] {
  const parts = [name ?? "", ...(otherNames ?? "").split(",")]
    .flatMap((entry) => {
      const trimmed = entry.trim();
      return trimmed ? [trimmed, ...trimmed.split(/\s+/)] : [];
    })
    .filter((part) => part.replace(/[^\p{L}]/gu, "").length >= 2);
  return [...new Set(parts)].sort((a, b) => b.length - a.length);
}

export function redactKnownNames(text: string, names: string[]): string {
  let out = text ?? "";
  for (const name of names) {
    const pattern = new RegExp(String.raw`(^|[^\p{L}\p{N}])(${escapeRegExp(name)})(?=$|[^\p{L}\p{N}])`, "giu");
    out = out.replace(pattern, (match: string, lead: string, found: string) =>
      /^\p{Lu}/u.test(found) ? `${lead}[name]` : match,
    );
  }
  return out;
}
