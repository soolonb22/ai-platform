/**
 * fixtures.ts
 * One check per workflow, plus fence and PDF length.
 */

import { redactLocal } from "../src/privacy/localRedactor";
import { runNDISWorkflow } from "../src/workflows/ndis/ndisWorkflow";
import { runProviderWorkflow } from "../src/workflows/provider/providerWorkflow";
import { runSchoolWorkflow } from "../src/workflows/school/schoolWorkflow";
import { runTraumaWorkflow } from "../src/workflows/trauma/traumaWorkflow";
import { buildServiceAgreementPDF } from "../src/pdf/serviceAgreement";
import { agreementFrom } from "../src/pdf/mapResults";
import { issueLicense } from "../monetization/licensing/licenseManager";
import { allocateSeat } from "../scale/multiseat/seatAllocator";
import { APP_VERSION } from "../src/version";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const participant = redactLocal("Participant left the room.");
assert(participant.includes("left the room"), "participant word was over-redacted");

const student = redactLocal("Student Maya Chen at Mackay State High School left.");
assert(student.includes("[name]"), "student name was not redacted");
assert(student.includes("[school]"), "school was not redacted");

let denied = false;
try {
  runTraumaWorkflow("They ran off and hid.", false);
} catch {
  denied = true;
}
assert(denied, "denied trauma should throw");
const trauma = runTraumaWorkflow("They ran off and hid.", true);
assert(trauma.patterns.hits.some((hit) => hit.id === "flight"), "trauma flight missing");

const ndis = runNDISWorkflow("Support worker for daily life.", true);
assert(ndis.funding.hits.some((hit) => hit.category === "core"), "ndis core missing");

const school = runSchoolWorkflow("They left the room.", true);
assert(school.focus.length > 0, "school focus missing");

const provider = runProviderWorkflow("Left when crowded, then said sorry.", true);
assert(provider.note.text.includes("Progress note"), "provider note missing");

const pdf = buildServiceAgreementPDF(agreementFrom(ndis));
const text = new TextDecoder().decode(pdf);
const length = Number(text.match(/\/Length (\d+)/)?.[1] ?? 0);
const start = text.indexOf("stream\n") + "stream\n".length;
const end = text.indexOf("\nendstream", start);
const slice = text.slice(start, end);
assert(text.startsWith("%PDF-1.4"), "pdf header missing");
assert(length === new TextEncoder().encode(slice).length, "pdf length mismatch");

issueLicense("school-1", "small-school");
const seat = allocateSeat("school-1");
assert(seat.used === 1, "seat was not allocated");
assert(APP_VERSION === "0.1.1", "version mismatch");

console.log("fixtures ok");
