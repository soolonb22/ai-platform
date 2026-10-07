/**
 * regression.ts
 * Cases from the 2026-10-07 audit. Each one failed before the fix.
 * Run with: npm test
 */

import { readFileSync } from "node:fs";
import { redactLocal } from "../src/privacy/localRedactor";
import { redactWorker } from "../src/privacy/workerRedactor";
import { previewFor, runFence } from "../src/privacy/fence";
import { detectPatterns } from "../src/engines/trauma/patterns";
import { extractFunding } from "../src/engines/ndis/fundingExtractor";
import { runNDISWorkflow } from "../src/workflows/ndis/ndisWorkflow";
import { runTraumaWorkflow } from "../src/workflows/trauma/traumaWorkflow";
import { writePdf, wrapLine } from "../src/pdf/writePdf";
import { handleRequest } from "../integration/api/apiRouter";
import { APP_VERSION } from "../src/version";
import { getVersion } from "../deployment/build/version";

let checks = 0;
const failures: string[] = [];

function check(name: string, ok: boolean, detail = ""): void {
  checks += 1;
  if (!ok) failures.push(detail ? `${name}\n    got: ${detail}` : name);
}

// 1. Redaction keeps NDIS language and ordinary sentences.
const keep = [
  "Funding for Improved Daily Living and Support Coordination is in the plan.",
  "Goal: Connect with Community Groups near home.",
  "The child is upset after lunch.",
  "The participant is happy with the support.",
  "Weekly Occupational Therapy and Speech Pathology sessions.",
  "High Intensity Supports are funded.",
  "School Leaver Employment Supports start next year.",
  "Primary disability is listed in the plan.",
  "Positive Behaviour Support plan is due.",
  "Student Support Officer will attend.",
  "Mental Health and Personal Care supports are funded.",
  "Mum said the bus was late.",
];
for (const text of keep) {
  const out = redactLocal(text);
  check(`keeps: ${text}`, out === text, out);
}

// 2. Redaction still removes people, schools, providers, and identifiers.
const hide: Array<[string, string, string]> = [
  ["Maya was upset after lunch.", "Maya", "[name] was upset"],
  ["Then Maya Chen said sorry.", "Chen", "Then [name] said sorry"],
  ["We went to the park with Maya.", "Maya", "with [name]"],
  ["Maya\u0027s mum called.", "Maya", "[name]\u0027s mum"],
  ["Student Maya Chen at Mackay State High School left.", "Mackay", "Student [name] at [school]"],
  ["Harbour Occupational Therapy sent the report.", "Harbour", "[provider] sent"],
  ["Harbour Therapy Clinic sent the report.", "Harbour", "[provider] sent"],
  ["Participant: Sarah Johnson", "Sarah", "Participant: [name]"],
  ["Contact Dr Amit Patel on 0412 345 678.", "Patel", "[phone]"],
  ["NDIS number 430123456, email maya@example.com.", "430123456", "[email]"],
];
for (const [text, gone, expected] of hide) {
  const out = redactLocal(text);
  check(`redacts: ${text}`, !out.includes(gone) && out.includes(expected), out);
}

// 3. The worker pass no longer wipes "plan" plus the next word.
for (const text of ["Plan includes Support Coordination.", "The participant wants more hours."]) {
  const out = redactWorker(text);
  check(`worker keeps: ${text}`, out === text, out);
}
check("worker still strips a labeled number", !redactWorker("Plan number 430123456").includes("430123456"));

// 4. Engines match whole words only.
check("white is not hit", detectPatterns("Wore a white shirt.").hits.length === 0);
check("number is not numb", detectPatterns("Used a number line in maths.").hits.length === 0);
check("a bit is not fight", detectPatterns("She was a bit tired.").hits.length === 0);
check("Tuesday is not SDA", extractFunding("Session on Tuesday went well.").hits.length === 0);
check(
  "word forms still match",
  ["fight", "flight"].every((id) =>
    detectPatterns("He was hitting the desk. She avoided the hall.").hits.some((hit) => hit.id === id),
  ),
);
check(
  "curly apostrophes match",
  detectPatterns("They couldn\u2019t settle.").hits.some((hit) => hit.id === "hyperarousal"),
);

// 5. The NDIS decoder reads real plan wording.
const plan = runNDISWorkflow(
  "Plan includes Support Coordination and Improved Daily Living supports. " +
    "Core Supports cover a support worker for community access. Assistive Technology is funded.",
  true,
);
check("plan text reaches the engine", plan.workerText.includes("Support Coordination"), plan.workerText);
check(
  "all three budget categories found",
  ["core", "capacity", "capital"].every((category) => plan.funding.hits.some((hit) => hit.category === category)),
  JSON.stringify(plan.funding.hits.map((hit) => hit.category)),
);

// 6. Approval is required. A missing flag is a refusal.
let refused = 0;
for (const flag of [false, undefined as unknown as boolean]) {
  try {
    runTraumaWorkflow("They ran off.", flag);
  } catch {
    refused += 1;
  }
}
check("workflow refuses without approval", refused === 2);
const denied = handleRequest("/trauma", { input: "They ran off." });
check("API refuses without approval", !denied.ok && "error" in denied && denied.error === "Preview was not approved.");
check("API runs with approval", handleRequest("/trauma", { input: "They ran off.", approved: true }).ok);
const curly = "Maya\u2019s note \u2014 she couldn\u2019t settle.";
check("preview matches what the workflow uses", previewFor(curly) === runFence(curly, true).preview.redacted);

// 7. PDFs wrap, paginate, and stay byte-exact.
function inspectPdf(pdf: Uint8Array): { pages: number; text: string } {
  const text = new TextDecoder().decode(pdf);
  for (const match of text.matchAll(/<< \/Length (\d+) >>\nstream\n/g)) {
    const start = (match.index ?? 0) + match[0].length;
    const end = text.indexOf("\nendstream", start);
    check("stream length is exact", Number(match[1]) === end - start, `${match[1]} vs ${end - start}`);
  }
  const xrefAt = Number(text.match(/startxref\n(\d+)/)?.[1] ?? -1);
  check("startxref points at xref", text.slice(xrefAt).startsWith("xref"));
  [...text.slice(xrefAt).matchAll(/(\d{10}) 00000 n /g)].forEach((match, index) => {
    check(`xref offset ${index + 1} is exact`, text.slice(Number(match[1])).startsWith(`${index + 1} 0 obj`));
  });
  return { pages: Number(text.match(/\/Count (\d+)/)?.[1] ?? 0), text };
}
const longLine = "word ".repeat(80).trim();
const many = Array.from({ length: 100 }, (_, index) => `Line ${index + 1}`);
const pdf = inspectPdf(writePdf([longLine, ...many, "Can\u2019t \u2014 caf\u00e9"]));
check("100 lines run onto 3 pages", pdf.pages === 3, String(pdf.pages));
check("last line is not cut off", pdf.text.includes("(Line 100) Tj"));
check("plain characters only", pdf.text.includes("(Can\u0027t - cafe) Tj"));
check("long words split", wrapLine("x".repeat(200)).every((part) => part.length <= 88));

// 8. One version everywhere.
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version: string };
check("version files agree", APP_VERSION === getVersion() && APP_VERSION === pkg.version, `${APP_VERSION} ${getVersion()} ${pkg.version}`);

if (failures.length) {
  console.error(`regression: ${failures.length} of ${checks} checks failed`);
  for (const failure of failures) console.error(`  FAIL ${failure}`);
  process.exit(1);
}
console.log(`regression ok (${checks} checks)`);
