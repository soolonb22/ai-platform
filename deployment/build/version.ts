/**
 * version.ts
 * Semantic version stored in version.json.
 * Export: getVersion()
 */

import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("./version.json", import.meta.url);

/** Current MAJOR.MINOR.PATCH value. */
export function getVersion(): string {
  const parsed = JSON.parse(readFileSync(file, "utf8")) as { version?: string };
  return parsed.version ?? "0.0.0";
}

/** Increment the patch number and return the new version. */
export function bumpPatch(): string {
  const [major, minor, patch] = getVersion().split(".").map((part) => Number(part) || 0);
  const next = `${major}.${minor}.${patch + 1}`;
  writeFileSync(file, `${JSON.stringify({ version: next }, null, 2)}\n`);
  return next;
}
