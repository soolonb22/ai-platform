/**
 * localRedactor.ts
 * Client-side privacy fence. Regex only. No network, no storage.
 *
 * Heuristic, not a guarantee. A name with no title, label, or action word near it can slip through.
 * A capitalised common word before an action word ("Sleep was poor") can be over-redacted.
 * The preview shows both, so the person can rephrase.
 *
 * Order matters:
 *   1. NDIS terms are shielded so plan language survives.
 *   2. Structured tokens go next: email, identifiers, phone, dates, addresses.
 *   3. Organisations, then people. A run made only of generic words is left alone.
 *   4. Shielded terms come back.
 *
 * Export: redactLocal(input: string): string
 */

import { isGenericWord, restoreTerms, shieldTerms } from "./vocabulary";

const EMAIL = String.raw`[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}`;

const PHONE = String.raw`(?:\+61[\s.-]?|0)\d(?:[\s.-]?\d){8}\b|\(\d{2}\)[\s.-]?\d{4}[\s.-]?\d{4}`;

/** Labeled IDs only when the value contains a digit, so "Participant left" stays text. */
const IDENTIFIER = String.raw`(?:\b(?:NDIS|ABN|ACN|TFN|CRN|Medicare|member|participant|plan|customer|account|reference|ref|id)\b(?:\s+(?:number|no|num|id))?\s*[#:]?\s*[A-Z0-9-]*\d[A-Z0-9-]*\b|\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b|\b\d{2}[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}\b|\b\d{8,12}\b)`;

const MONTH = String.raw`(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)`;

const DATE = String.raw`(?:\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}(?:st|nd|rd|th)?(?:\s+of)?\s+${MONTH}\s+\d{2,4}\b|\b${MONTH}\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{2,4}\b)`;

/** Street lines and Australian suburb / state / postcode tails. */
const ADDRESS = String.raw`(?:\b(?:unit|apt|apartment|lot|level|suite)\s+\d+[A-Z]?,?\s+)?\b\d{1,5}[A-Z]?\s+(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\s+)(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Court|Ct|Crescent|Cres|Lane|Ln|Highway|Hwy|Boulevard|Blvd|Way|Place|Pl|Parade|Pde|Terrace|Tce)\b(?:,?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})?(?:,?\s+(?:NSW|VIC|QLD|SA|WA|TAS|NT|ACT))?(?:\s+\d{4})?|\b(?:NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\s+\d{4}\b|\bP\.?O\.?\s+Box\s+\d+\b`;

/** One to five capitalised words in front of an organisation keyword. */
const CAPS_RUN = String.raw`((?:[A-Z][\w\u0027\u2019.-]*\s+){1,5})`;

/** "Mackay State High School" -> [school]. "High Intensity" and "Primary disability" have no name in front. */
const SCHOOL = String.raw`\b${CAPS_RUN}(School|College|Academy|Grammar|Primary|High|Secondary)\b`;

/** "Harbour Therapy Clinic" -> [provider]. "Occupational Therapy" and "Mental Health" are generic. */
const PROVIDER = String.raw`\b${CAPS_RUN}(Providers?|Services|Clinic|Therapy|Therapies|Physiotherapy|Physio|Psychology|Pathology|Allied\s+Health|Health|Care|Support\s+Coordination)\b`;

const NAME_WORD = String.raw`[A-Z][a-z\u0027\u2019.-]+`;
const NAME_RUN = String.raw`(${NAME_WORD}(?:\s+${NAME_WORD}){0,2})`;

/** Honorific plus one to three capitalised words. "Dr Amit Patel" -> [name] */
const HONORIFIC_NAME = String.raw`\b(?:Mr|Mrs|Ms|Miss|Mx|Dr|Prof)\.?\s+${NAME_WORD}(?:\s+${NAME_WORD}){0,2}\b`;

function anyCase(word: string): string {
  return [...word].map((char) => `[${char.toUpperCase()}${char.toLowerCase()}]`).join("");
}

/** "Participant: Sarah Johnson" -> "Participant: [name]". The label is any case. The name must be capitalised. */
const LABELS = ["name", "participant", "client", "student", "child", "parent", "carer", "guardian"].map(anyCase).join("|");
const LABELED_NAME = String.raw`\b((?:${LABELS})\s*(?:[Ii][Ss]\s+|:\s*))${NAME_RUN}\b`;

/** "Student Maya Chen" -> "Student [name]". "Student Support Officer" is generic. */
const ROLE_NAME = String.raw`\b((?:Student|Pupil)\s+)${NAME_RUN}\b`;

/** "with Maya", "contact Sarah Johnson" -> keep the verb, replace the name. */
const VERB_NAME = String.raw`\b((?:contact|email|call|meet|see|with|from|for|by)\s+)${NAME_RUN}\b`;

/** Action words that follow a person. Modal verbs are left out to avoid "Transport will". */
const ACTION = [
  "was", "is", "were", "has", "had", "said", "says", "felt", "feels", "got", "gets", "went", "goes",
  "ran", "runs", "left", "leaves", "became", "seemed", "seems", "did", "does",
  "didn[\u0027\u2019]t", "doesn[\u0027\u2019]t", "wouldn[\u0027\u2019]t", "won[\u0027\u2019]t",
  "couldn[\u0027\u2019]t", "can[\u0027\u2019]t",
  "wanted", "wants", "needed", "needs", "liked", "likes", "loved", "loves", "told", "tells", "asked", "asks",
  "started", "starts", "stopped", "stops", "refused", "refuses", "tried", "tries", "cried", "cries",
  "screamed", "screams", "yelled", "yells", "hit", "hits", "threw", "throws", "hid", "hides", "came", "comes",
  "lives", "lived", "attends", "attended", "uses", "used", "enjoys", "enjoyed", "struggles", "struggled",
  "kept", "keeps", "took", "takes", "made", "makes", "sat", "sits", "stood", "walked", "talked", "spoke",
  "shared", "agreed", "arrived", "returned", "completed", "finished", "met", "saw", "appeared", "looked",
].join("|");

/** A bare name before an action word or a possessive: "Maya was upset" -> "[name] was upset". */
const PERSON_ACTION = String.raw`\b(${NAME_WORD}(?:\s+${NAME_WORD})?)(?=[\u0027\u2019]s\b|\s+(?:${ACTION})\b)`;

type Replace = (match: string, ...groups: string[]) => string;

type Rule = {
  name: string;
  pattern: RegExp;
  replace: string | Replace;
};

/** Keep generic words at the front of a run ("Yesterday Mackay State High" keeps "Yesterday"). */
function placeholderFor(run: string, placeholder: string): string | null {
  const words = run.trim().split(/\s+/);
  let index = 0;
  while (index < words.length && isGenericWord(words[index])) index += 1;
  if (index === words.length) return null;
  const keep = words.slice(0, index).join(" ");
  return keep ? `${keep} ${placeholder}` : placeholder;
}

/** Replace the whole organisation, keyword included, when the run holds a named word. */
function organisation(placeholder: string): Replace {
  return (match, run) => placeholderFor(run, placeholder) ?? match;
}

/** Keep the label or verb in front, replace the name after it. */
const prefixedName: Replace = (match, prefix, run) => {
  const swapped = placeholderFor(run, "[name]");
  return swapped === null ? match : `${prefix}${swapped}`;
};

const RULES: Rule[] = [
  {
    name: "email",
    // Full address, including plus-tags. Runs first so "@" is not split by later rules.
    pattern: new RegExp(EMAIL, "gi"),
    replace: "[email]",
  },
  {
    name: "identifier",
    // Labeled IDs, UUIDs, ABN 2-3-3-3 groups, and 8-12 digit runs.
    // Runs before phone so an NDIS number is not read as a handset.
    pattern: new RegExp(IDENTIFIER, "gi"),
    replace: "[identifier]",
  },
  {
    name: "phone",
    // AU mobiles and landlines only: leading 0 or +61, or (0x) xxxx xxxx.
    pattern: new RegExp(PHONE, "g"),
    replace: "[phone]",
  },
  {
    name: "date",
    // Numeric and written dates. Day-only words are left alone.
    pattern: new RegExp(DATE, "gi"),
    replace: "[date]",
  },
  {
    name: "address",
    // Street line, optional suburb / state / postcode, PO Box, bare state+postcode.
    pattern: new RegExp(ADDRESS, "g"),
    replace: "[address]",
  },
  {
    name: "school",
    pattern: new RegExp(SCHOOL, "g"),
    replace: organisation("[school]"),
  },
  {
    name: "provider",
    pattern: new RegExp(PROVIDER, "g"),
    replace: organisation("[provider]"),
  },
  {
    name: "honorific-name",
    // Title plus capitalised name. After orgs so "Dr" inside an org is already gone.
    pattern: new RegExp(HONORIFIC_NAME, "g"),
    replace: "[name]",
  },
  {
    name: "labeled-name",
    pattern: new RegExp(LABELED_NAME, "g"),
    replace: prefixedName,
  },
  {
    name: "role-name",
    pattern: new RegExp(ROLE_NAME, "g"),
    replace: prefixedName,
  },
  {
    name: "verb-name",
    pattern: new RegExp(VERB_NAME, "g"),
    replace: prefixedName,
  },
  {
    name: "person-action",
    pattern: new RegExp(PERSON_ACTION, "g"),
    replace: (match, run) => placeholderFor(run, "[name]") ?? match,
  },
];

/** Drop a leftover label when its value was replaced, e.g. "ABN [identifier]". */
const LEFTOVER_LABEL =
  /\b(?:NDIS|ABN|ACN|TFN|CRN|Medicare|member|participant|plan|customer|account|reference|ref|id)\b(?:\s+(?:number|no|num|id))?\s*[#:]?\s*(?=\[identifier\])/gi;

function collapseWhitespace(value: string): string {
  return value.replace(/[ \t]{2,}/g, " ").replace(/[ \t]+\n/g, "\n").trim();
}

/** Redact a raw string before it is previewed or sent onward. */
export function redactLocal(input: string): string {
  if (!input) return "";
  const shielded = shieldTerms(input);
  let text = shielded.text;
  for (const rule of RULES) {
    text = text.replace(rule.pattern, rule.replace as Replace);
  }
  text = restoreTerms(text, shielded.terms);
  text = text.replace(LEFTOVER_LABEL, "");
  return collapseWhitespace(text);
}
