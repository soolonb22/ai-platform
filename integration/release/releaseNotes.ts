/**
 * releaseNotes.ts
 * Plain release notes from a version and a change list.
 */

/** One note block. Empty changes get a fixed line. */
export function generateReleaseNotes(version: string, changes: string[]): string {
  const lines = changes.map((change) => change.trim()).filter(Boolean);
  const body = lines.length ? lines.map((change) => `- ${change}`).join("\n") : "- No listed changes.";
  return [`Version ${version}`, "", body].join("\n");
}
