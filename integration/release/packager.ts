/**
 * packager.ts
 * Writes a release manifest. Does not copy secrets.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { getVersion } from "../../deployment/build/version";
import { generateReleaseNotes } from "./releaseNotes";

export interface ReleaseArtifact {
  version: string;
  frontend: string;
  worker: string;
  versionFile: string;
  envSchema: string;
  notes: string;
}

/** Record the release paths and the current version. */
export function buildRelease(changes: string[] = []): ReleaseArtifact {
  const version = getVersion();
  const artifact: ReleaseArtifact = {
    version,
    frontend: "src/frontend",
    worker: "deployment/worker/index.ts",
    versionFile: "deployment/build/version.json",
    envSchema: "deployment/env/env.schema.json",
    notes: generateReleaseNotes(version, changes),
  };
  mkdirSync("integration/release/out", { recursive: true });
  writeFileSync("integration/release/out/release.json", `${JSON.stringify(artifact, null, 2)}\n`);
  return artifact;
}
