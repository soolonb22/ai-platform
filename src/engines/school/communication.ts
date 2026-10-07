/**
 * communication.ts
 * A short note a school can read. No diagnosis and no demand to comply.
 * Export: buildSchoolCommunication(need): string
 */

/** Plain note for staff. Unknown needs still get a choice-based line. */
export function buildSchoolCommunication(need: string): string {
  const focus = (need ?? "").trim() || "an unnamed support";
  return [
    `School note: support need mentioned is ${focus}.`,
    "Offer a choice before raising the demand.",
    "A break or a smaller step is allowed. This is not a behaviour rating.",
  ].join(" ");
}
