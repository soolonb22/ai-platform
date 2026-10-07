/**
 * build.ts
 * Bump patch, compile TypeScript, write a build manifest.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { bumpPatch, getVersion } from "./version";

const outDir = "deployment/build/out";
const version = bumpPatch();
mkdirSync(outDir, { recursive: true });

const compile = spawnSync("npx", ["--yes", "tsc", "--pretty", "false", "--outDir", outDir, "--rootDir", "."], {
  stdio: "inherit",
});

const manifest = {
  version: getVersion(),
  compiled: compile.status === 0,
  output: outDir,
};

writeFileSync(`${outDir}/build.json`, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`version ${version}`);

if (compile.status !== 0) process.exit(compile.status ?? 1);
