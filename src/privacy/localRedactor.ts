/**
 * localRedactor.ts
 * Client-side privacy fence. Regex only. No network, no storage.
 *
 * Heuristic, not a guarantee. Unknown names and unusual formats can slip through.
 * Rules run in order so structured tokens are removed before name patterns run.
 *
 * Export: redactLocal(input: string): string
 */

const EMAIL = String.raw`[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}`;

const PHONE = String.raw`(?:\+61[\s.-]?|0)\d(?:[\s.-]?\d){8}\b|\(\d{2}\)[\s.-]?\d{4}[\s.-]?\d{4}`;

/** Labeled IDs only when the value contains a digit, so "Participant left" stays text. */
const IDENTIFIER = String.raw`(?:\b(?:NDIS|ABN|ACN|TFN|CRN|Medicare|member|participant|plan|customer|account|reference|ref|id)\b(?:\s+(?:number|no|num|id))?\s*[#:]?\s*[A-Z0-9-]*\d[A-Z0-9-]*\b|\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b|\b\d{2}[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}\b|\b\d{8,12}\b)`;

const DATE = String.raw`(?:\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}(?:st|nd|rd|th)?(?:\s+of)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{2,4}\b|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{2,4}\b)`;

/** Street lines and Australian suburb / state / postcode tails. */
const ADDRESS = String.raw`(?:\b(?:unit|apt|apartment|lot|level|suite)\s+\d+[A-Z]?,?\s+)?\b\d{1,5}[A-Z]?\s+(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\s+)(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Court|Ct|Crescent|Cres|Lane|Ln|Highway|Hwy|Boulevard|Blvd|Way|Place|Pl|Parade|Pde|Terrace|Tce)\b(?:,?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})?(?:,?\s+(?:NSW|VIC|QLD|SA|WA|TAS|NT|ACT))?(?:\s+\d{4})?|\b(?:NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\s+\d{4}\b|\bP\.?O\.?\s+Box\s+\d+\b`;

/**
 * School-like org. Whole phrase, not just the keyword, so the name is not left behind.
 * "Mackay State High School" -> [school]
 */
const SCHOOL = String.raw`\b(?:[A-Z][\w'’.-]*\s+){0,5}(?:Primary|High|Secondary|Grammar|College|Academy|School)\b`;

/**
 * Provider-like org. "Harbour Therapy Clinic" -> [provider]
 * "Ability Care Provider" -> [provider]
 */
const PROVIDER = String.raw`\b(?:[A-Z][\w'’.-]*\s+){0,5}(?:Provider|Services|Clinic|Therap(?:y|ies)|Allied\s+Health|Support\s+Coordination)\b`;

/** Honorific plus one to three capitalised words. "Dr Amit Patel" -> [name] */
const HONORIFIC_NAME = String.raw`\b(?:Mr|Mrs|Ms|Miss|Mx|Dr|Prof)\.?\s+[A-Z][a-z'’.-]+(?:\s+[A-Z][a-z'’.-]+){0,2}\b`;

/** Labeled person. "Participant: Sarah Johnson" -> [name] */
const LABELED_NAME = String.raw`\b(?:name|participant|client|student|child|parent|carer|guardian)\s*(?:is|:)\s*[A-Z][a-z'’.-]+(?:\s+[A-Z][a-z'’.-]+){0,2}\b`;

/** Role plus a capitalised name. "Student Maya Chen" -> [name] */
const ROLE_NAME = String.raw`\b(?:Student|Pupil)\s+[A-Z][a-z'’.-]+(?:\s+[A-Z][a-z'’.-]+){0,2}\b`;

/** Verb-led person. "contact Sarah Johnson" -> contact [name] */
const VERB_NAME = String.raw`\b(contact|email|call|meet|see|with|from|for)\s+[A-Z][a-z'’.-]+(?:\s+[A-Z][a-z'’.-]+){1,2}\b`;

type Rule = {
  name: string;
  pattern: RegExp;
  replace: string | ((match: string, ...groups: string[]) => string);
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
    // Labeled IDs, UUIDs, ABN 2-3-3-3 groups, and 8–12 digit runs.
    // Runs before phone so an NDIS number is not read as a handset.
    pattern: new RegExp(IDENTIFIER, "gi"),
    replace: "[identifier]",
  },
  {
    name: "phone",
    // AU mobiles and landlines only: leading 0 or +61, or (0x) xxxx xxxx.
    // Bare digit runs are left for the identifier rule.
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
    // Organisation ending in a school-type word. Placeholder is [school], not the name.
    pattern: new RegExp(SCHOOL, "g"),
    replace: "[school]",
  },
  {
    name: "provider",
    // Organisation ending in a provider-type word. Placeholder is [provider].
    pattern: new RegExp(PROVIDER, "g"),
    replace: "[provider]",
  },
  {
    name: "honorific-name",
    // Title plus capitalised name. Applied after orgs so "Dr" inside an org is already gone.
    pattern: new RegExp(HONORIFIC_NAME, "g"),
    replace: "[name]",
  },
  {
    name: "labeled-name",
    // "Name: …" / "participant is …". Case-insensitive on the label only via the pattern flags.
    pattern: new RegExp(LABELED_NAME, "gi"),
    replace: "[name]",
  },
  {
    name: "role-name",
    // "Student Maya Chen". Role word is replaced with the name.
    pattern: new RegExp(ROLE_NAME, "g"),
    replace: "[name]",
  },
  {
    name: "verb-name",
    // Keep the verb, replace the following capitalised person.
    pattern: new RegExp(VERB_NAME, "g"),
    replace: (_match, verb: string) => `${verb} [name]`,
  },
];

function collapseWhitespace(value: string): string {
  return value.replace(/[ \t]{2,}/g, " ").replace(/[ \t]+\n/g, "\n").trim();
}

/** Redact a raw string before it is previewed or sent onward. */
export function redactLocal(input: string): string {
  if (!input) return "";
  let text = input;
  for (const rule of RULES) {
    text = text.replace(rule.pattern, rule.replace as (match: string, ...groups: string[]) => string);
  }
  // Drop a leftover label when the value was already replaced, e.g. "ABN [identifier]".
  text = text.replace(
    /\b(?:NDIS|ABN|ACN|TFN|CRN|Medicare|member|participant|plan|customer|account|reference|ref|id)\b(?:\s+(?:number|no|num|id))?\s*[#:]?\s*(?=\[identifier\])/gi,
    "",
  );
  return collapseWhitespace(text);
}
