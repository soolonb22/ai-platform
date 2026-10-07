/**
 * vocabulary.ts
 * Word lists the redactor uses to tell names apart from ordinary capitalised words.
 *
 * NDIS_TERMS are shielded before any rule runs, so plan language survives redaction.
 * GENERIC words are capitalised words that are never treated as a person or an organisation.
 * Both lists match case-insensitively.
 *
 * Exports: NDIS_TERMS, isGenericWord, shieldTerms, restoreTerms
 */

/** Official NDIS budget, support, and service names. Longest match wins. */
export const NDIS_TERMS: string[] = [
  "Assistance with Social, Economic and Community Participation",
  "Increased Social and Community Participation",
  "Assistance with Self-Care Activities",
  "Assistance with Daily Life",
  "Improved Daily Living",
  "Improved Life Choices",
  "Improved Living Arrangements",
  "Improved Health and Wellbeing",
  "Improved Relationships",
  "Improved Learning",
  "Finding and Keeping a Job",
  "School Leaver Employment Supports",
  "Specialist Disability Accommodation",
  "Supported Independent Living",
  "Short Term Accommodation",
  "Medium Term Accommodation",
  "Specialist Support Coordination",
  "Support Coordination",
  "Support Coordinator",
  "Psychosocial Recovery Coach",
  "Local Area Coordination",
  "Local Area Coordinator",
  "Plan Management",
  "Plan Manager",
  "Positive Behaviour Support",
  "Behaviour Support",
  "Early Childhood Early Intervention",
  "Early Childhood",
  "High Intensity",
  "Core Supports",
  "Capacity Building Supports",
  "Capacity Building",
  "Capital Supports",
  "Assistive Technology",
  "Home Modifications",
  "Home Modification",
  "Occupational Therapy",
  "Speech Therapy",
  "Speech Pathology",
  "Music Therapy",
  "Art Therapy",
  "Exercise Physiology",
  "Therapeutic Supports",
  "Allied Health",
  "Daily Activities",
  "Daily Life",
  "Community Access",
];

const GENERIC = new Set(
  `
  the a an this that these those their theirs our ours my mine your yours his her hers its
  he she they them we us you it there here then and but or so if when while whilst after before
  during since until because as at in on of to for from with without by about also both each every
  all any some many most few several other another such what who whom whose which where why how
  not now later earlier soon still just only even very really overall however afterwards eventually
  initially finally again usually sometimes often always never please thanks hi hello dear regards
  yes no ok okay

  today yesterday tomorrow tonight monday tuesday wednesday thursday friday saturday sunday weekend
  weekday morning afternoon evening night day week fortnight month year term semester holidays
  christmas easter january february march july september october november december
  weekly daily fortnightly monthly yearly annual annually recently currently previously next last
  first second third final new current previous ongoing funded approved requested recommended
  proposed total remaining

  staff teacher teachers aide principal coordinator worker workers therapist psychologist doctor gp
  nurse specialist officer manager planner delegate advocate mentor tutor coach driver neighbour
  friend friends peer peers classmate classmates partner husband wife son daughter baby kid kids boy
  girl man woman adult adults mum mom mummy mother dad daddy father parent parents carer carers
  guardian family grandma grandpa grandmother grandfather nan nana pop aunt aunty auntie uncle cousin
  brother sister sibling siblings participant client student students pupil child children person
  people team everyone someone anyone nobody somebody everybody anybody nothing something everything

  plan plans goal goals budget budgets funding funds support supports supported service services
  provider providers care core capacity building capital assistive technology home modification
  modifications specialist disability accommodation independent living short medium long behaviour
  behavior positive early childhood intervention allied health occupational speech pathology therapy
  therapies therapeutic physiotherapy physio psychology psychosocial recovery music art exercise
  physiology dietetics podiatry local area coordination management improved increased assistance
  relationships learning wellbeing choices arrangements employment job leaver intensity high primary
  secondary state public private mental physical social economic personal community participation
  access life activities activity consumables transport travel group groups centre center program
  programme session sessions report reports review meeting assessment agreement statement note notes
  summary outcome outcomes progress evidence letter email phone call form request appeal decision
  reason reasons option options strategy strategies trauma sensory regulation respite foster aged
  medical school schools college class classroom lesson lessons

  ndis ndia lac sil sda sta mta at ot pbs sles medicare centrelink australia australian queensland
  tasmania nsw qld vic wa sa nt act tas english maths math science history geography sport pe
  library office hall room playground canteen bus car train taxi uber lunch breakfast dinner snack
  recess food sleep bedtime noise weather rain pain mood routine change changes homework swimming
  shopping work screen communication toileting eating sleeping dressing showering play playtime
  assembly excursion camp reading writing leave break quiet corner
  `
    .split(/\s+/)
    .filter(Boolean),
);

/** True for a capitalised word that is not a name: "The", "Monday", "Therapy". */
export function isGenericWord(word: string): boolean {
  const bare = word
    .replace(/['\u2019]s$/i, "")
    .replace(/[^A-Za-z-]/g, "")
    .toLowerCase();
  return bare.length === 0 || GENERIC.has(bare);
}

const OPEN = "\uE000";
const CLOSE = "\uE001";
const BASE = 0xe100;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\u005c]/g, "\u005c$&");
}

const TERMS_PATTERN = new RegExp(
  String.raw`(\b[A-Za-z][\w'\u2019.-]*\s+)?\b(` +
    [...NDIS_TERMS]
      .sort((a, b) => b.length - a.length)
      .map((term) => escapeRegExp(term).replace(/\s+/g, String.raw`\s+`))
      .join("|") +
    String.raw`)\b`,
  "gi",
);

export interface Shielded {
  text: string;
  terms: string[];
}

/**
 * Swap NDIS terms for placeholders that no redaction rule can match.
 * A term straight after a named word, as in "Harbour Occupational Therapy", is an
 * organisation name. It is left in place so the provider rule can remove it.
 */
export function shieldTerms(input: string): Shielded {
  const terms: string[] = [];
  const text = input.replace(TERMS_PATTERN, (match: string, before: string | undefined, term: string) => {
    const lead = before ?? "";
    const word = lead.trim();
    if (word && /^[A-Z]/.test(word) && !isGenericWord(word)) return match;
    terms.push(term);
    return `${lead}${OPEN}${String.fromCharCode(BASE + terms.length - 1)}${CLOSE}`;
  });
  return { text, terms };
}

/** Put shielded terms back, in their original case. */
export function restoreTerms(text: string, terms: string[]): string {
  return text.replace(/\uE000([\s\S])\uE001/g, (_match, code: string) => terms[code.charCodeAt(0) - BASE] ?? "");
}
