/**
 * people.ts
 * Profiles, known-name hiding, pattern tracking, AI documents, and their endpoint.
 * The model is a fake, so no network call and no cost.
 * Run with: npm test
 */

import { buildDocumentRequest, describeRequest, requestDocument } from "../src/ai/documentClient";
import type { GeneratedDocument } from "../src/ai/documents";
import { listDocuments, saveDocument } from "../src/data/documents";
import { listObservations, summarisePatterns, summaryLines } from "../src/data/observations";
import { createPerson, deletePerson, savePerson, setActivePerson } from "../src/data/people";
import { recordForActivePerson, withActivePersonNames } from "../src/data/tracking";
import { buildDocumentPDF } from "../src/pdf/aiDocument";
import { namesFrom, redactKnownNames } from "../src/privacy/knownNames";
import { runSchoolWorkflow } from "../src/workflows/school/schoolWorkflow";
import { runTraumaWorkflow } from "../src/workflows/trauma/traumaWorkflow";
import type { AiEnv } from "../deployment/worker/aiHandler";
import type { Writer } from "../deployment/worker/claudeDrafter";
import { handleDocumentRequest } from "../deployment/worker/documentHandler";

let checks = 0;
const failures: string[] = [];

function check(name: string, ok: boolean, detail = ""): void {
  checks += 1;
  if (!ok) failures.push(detail ? `${name}\n    got: ${detail}` : name);
}

// 1. Known names: full name, parts, nicknames, possessives. Words that match a name stay when lowercase.
const names = namesFrom("Maya Chen", "Mimi, Moo");
check("names include parts and nicknames", ["Maya Chen", "Maya", "Chen", "Mimi", "Moo"].every((n) => names.includes(n)), names.join(","));
const hidden = redactKnownNames("Maya Chen said Mimi and Chen\u0027s dog may come. Maya\u0027s day.", names);
check("known names hidden", !/Maya|Chen|Mimi/.test(hidden) && hidden.includes("[name]\u0027s day"), hidden);
check("lowercase word kept", redactKnownNames("We will see. Will was calm.", namesFrom("Will")) === "We will see. [name] was calm.");

// 2. A person, linked tool runs, and pattern tracking.
const person = createPerson("Zara Quinn");
savePerson({ ...person, otherNames: "Zee", strengths: "Zee loves trains and drawing.", triggers: "Loud halls and waiting." });
setActivePerson(person.id);
const prepared = withActivePersonNames("Zee ran off and hid when the hall was too loud.");
check("active person name hidden before the workflow", !prepared.includes("Zee"), prepared);
recordForActivePerson("trauma", runTraumaWorkflow(prepared, true));
recordForActivePerson("trauma", runTraumaWorkflow(withActivePersonNames("Zara covered her ears in the crowded hall."), true));
recordForActivePerson("school", runSchoolWorkflow(withActivePersonNames("Zara left the room when it was too loud."), true));
const notes = listObservations(person.id);
check("three notes recorded", notes.length === 3, String(notes.length));
check("notes never hold the name", !JSON.stringify(notes).match(/Zara|Zee|Quinn/));
const summary = summarisePatterns(person.id);
const sensory = summary.patterns.find((item) => item.label === "Sensory load");
check("sensory load counted across notes", sensory?.count === 3, JSON.stringify(summary.patterns));
check("summary lines carry no dates", !summaryLines(summary).join(" ").match(/\d{4}-\d{2}/));
setActivePerson(null);
check("no one chosen means nothing recorded", (recordForActivePerson("trauma", runTraumaWorkflow("They hid.", true)), listObservations(person.id).length === 3));

// 3. The document request never carries the name.
const request = buildDocumentRequest("behaviour-support-plan", { ...person, name: "Zara Quinn", otherNames: "Zee", strengths: "Zee loves trains and drawing.", triggers: "Loud halls and waiting." }, notes, summary);
const shown = describeRequest(request);
check("request has profile fields", request.profile["Strengths"]?.includes("trains") === true, JSON.stringify(request.profile));
check("request hides nickname in fields", !shown.includes("Zee") && !shown.includes("Zara"), shown);
check("request carries the notes", request.observations.length === 3);
check("request carries pattern lines", request.patterns.some((line) => line.startsWith("Sensory load")));

// 4. The document endpoint, with a fake model.
const SITE = "https://site.test";
const LIVE: AiEnv = { AI_API_KEY: "test-key" };
const sample: GeneratedDocument = {
  title: "Draft behaviour support plan for [name]",
  sections: [{ heading: "About [name]", paragraphs: ["[name] loves trains."], points: ["Calm space ready"] }],
  missing: ["Who else supports [name] at school?"],
};
const seen: Array<{ prompt: string; maxTokens: number; schema?: Record<string, unknown> }> = [];
const fakeWriter: Writer = async ({ prompt, maxTokens, schema }) => {
  seen.push({ prompt, maxTokens, schema });
  return { ok: true, text: JSON.stringify(sample) };
};

function post(body: unknown, origin: string | null = SITE): Request {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (origin) headers.origin = origin;
  return new Request(`${SITE}/api/document`, { method: "POST", headers, body: JSON.stringify(body) });
}

async function main(): Promise<void> {
  const status = async (body: unknown, env: AiEnv, writer: Writer = fakeWriter, origin: string | null = SITE) =>
    (await handleDocumentRequest(post(body, origin), env, writer)).status;

  check("off without a key", (await status(request, {})) === 503);
  check("other site refused", (await status(request, LIVE, fakeWriter, "https://evil.test")) === 403);
  check("unknown document refused", (await status({ ...request, kind: "tax-return" }, LIVE)) === 400);
  check("empty material refused", (await status({ kind: "one-page-profile", profile: {}, patterns: [], observations: [] }, LIVE)) === 400);

  seen.length = 0;
  const leaky = { ...request, profile: { ...request.profile, Supports: "Email coordinator@example.com" } };
  const ok = await handleDocumentRequest(post(leaky), LIVE, fakeWriter);
  const data = (await ok.json()) as { document?: GeneratedDocument };
  check("document returned", ok.status === 200 && data.document?.title === sample.title);
  check("server re-redacts profile fields", !seen[0]?.prompt.includes("coordinator@example.com") && seen[0]?.prompt.includes("[email]") === true);
  check("schema and room requested", seen[0]?.maxTokens === 16000 && !!seen[0]?.schema);
  check("notes reach the prompt", seen[0]?.prompt.includes("Note 1 (most recent)") === true);

  check("bad JSON refused", (await status(request, LIVE, async () => ({ ok: true, text: "not json" }))) === 502);
  check("wrong shape refused", (await status(request, LIVE, async () => ({ ok: true, text: JSON.stringify({ title: "x" }) }))) === 502);
  check("model errors pass through", (await status(request, LIVE, async () => ({ ok: false, status: 429, error: "busy" }))) === 429);

  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (_input: unknown, init?: RequestInit) =>
    handleDocumentRequest(new Request(`${SITE}/api/document`, { ...init, headers: { ...(init?.headers as object), origin: SITE } }), LIVE, fakeWriter)) as typeof fetch;
  const viaClient = await requestDocument(request);
  check("client gets the document", "document" in viaClient && viaClient.document.sections.length === 1);
  globalThis.fetch = realFetch;

  // 5. Saving, the PDF, and deleting a person with everything linked to them.
  saveDocument(person.id, "behaviour-support-plan", sample);
  check("document saved for the person", listDocuments(person.id).length === 1);
  const pdfText = new TextDecoder().decode(buildDocumentPDF(sample, "Draft for discussion only."));
  check("PDF has the heading and the details to add", pdfText.includes("(ABOUT [NAME]) Tj") && pdfText.includes("(DETAILS TO ADD OR CONFIRM) Tj"));
  deletePerson(person.id);
  check("deleting a person removes notes and documents", listObservations(person.id).length === 0 && listDocuments(person.id).length === 0);

  if (failures.length) {
    console.error(`people: ${failures.length} of ${checks} checks failed`);
    for (const failure of failures) console.error(`  FAIL ${failure}`);
    process.exit(1);
  }
  console.log(`people ok (${checks} checks)`);
}

main().catch((error) => {
  console.error("people crashed:", error);
  process.exit(1);
});
