/**
 * workerRedactor.ts
 * Second-pass fence. Runs after preview approval, before the model call.
 * Assumes localRedactor already ran. This pass catches leftovers.
 *
 * Regex only. Heuristic, not a guarantee.
 * Export: redactWorker(input: string): string
 */

const EMAIL = String.raw`[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}`;
const PHONE = String.raw`(?:\+61[\s.-]?|0)\d(?:[\s.-]?\d){8}\b|\(\d{2}\)[\s.-]?\d{4}[\s.-]?\d{4}`;

/** Leftover IDs: labels, UUIDs, card-like groups, long digit runs. */
const IDENTIFIER = String.raw`(?:\b(?:NDIS|ABN|ACN|TFN|CRN|Medicare|member|participant|plan|customer|account|reference|ref|id|policy)\b(?:\s+(?:number|no|num|id))?\s*[#:]?\s*[A-Z0-9-]{4,}\b|\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b|\b(?:\d{4}[\s-]?){3}\d{4}\b|\b\d{2}[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}\b|\b\d{6,12}\b)`;

/**
 * Diagnostic and clinical labels. Replaced as a class, not interpreted.
 * Kept as a word list so the worker never sees the term.
 */
const CLINICAL = String.raw`\b(?:autism|autistic|ADHD|ASD|PTSD|OCD|bipolar|schizophrenia|depression|anxiety|diagnosis|diagnosed|disorder|syndrome|medication|prescription|dosage|sertraline|risperidone|methylphenidate)\b`;

/**
 * Prohibited content. Category match only. Replaced, not echoed.
 * Covers self-harm, violence instructions, sexual exploitation, and crime how-to cues.
 */
const PROHIBITED = String.raw`\b(?:suicide|self-harm|kill myself|how to (?:make|build) (?:a )?(?:bomb|explosive|weapon)|child (?:sexual|porn|abuse)|csam|groom(?:ing)? a (?:child|minor))\b`;

type Rule = {
  name: string;
  pattern: RegExp;
  replace: string;
};

const RULES: Rule[] = [
  {
    name: "email",
    // Second chance for an address the local pass missed.
    pattern: new RegExp(EMAIL, "gi"),
    replace: "[email]",
  },
  {
    name: "phone",
    // Second chance for an AU number the local pass missed.
    pattern: new RegExp(PHONE, "g"),
    replace: "[phone]",
  },
  {
    name: "identifier",
    // Remaining labels, card groups, UUIDs, and digit runs of 6–12.
    pattern: new RegExp(IDENTIFIER, "gi"),
    replace: "[identifier]",
  },
  {
    name: "clinical",
    // Diagnostic and medication terms become [clinical]. No interpretation.
    pattern: new RegExp(CLINICAL, "gi"),
    replace: "[clinical]",
  },
  {
    name: "prohibited",
    // Unsafe phrases are dropped to [removed] so they are not forwarded.
    pattern: new RegExp(PROHIBITED, "gi"),
    replace: "[removed]",
  },
];

function collapseWhitespace(value: string): string {
  return value.replace(/[ \t]{2,}/g, " ").replace(/[ \t]+\n/g, "\n").trim();
}

/** Second-pass redaction. Call only with already previewed text. */
export function redactWorker(input: string): string {
  if (!input) return "";
  let text = input;
  for (const rule of RULES) {
    text = text.replace(rule.pattern, rule.replace);
  }
  text = text.replace(
    /\b(?:NDIS|ABN|ACN|TFN|CRN|Medicare|member|participant|plan|customer|account|reference|ref|id|policy)\b(?:\s+(?:number|no|num|id))?\s*[#:]?\s*(?=\[identifier\])/gi,
    "",
  );
  return collapseWhitespace(text);
}
