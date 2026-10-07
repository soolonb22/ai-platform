/**
 * schoolCommunication.ts
 * Builds a one-page school-communication PDF with no library.
 * Staff note only. Not a behaviour rating.
 * Export: buildSchoolCommunicationPDF(comm: SchoolCommunication): Uint8Array
 */

export interface SchoolCommunication {
  behaviour: string;
  needs: string[];
  strategies: string[];
  menu: string[];
  staffNote: string;
}

import { writePdf } from "./writePdf.ts";

function linesFor(comm: SchoolCommunication): string[] {
  return [
    "Draft school communication",
    "",
    "Behaviour summary",
    comm.behaviour || "No behaviour supplied",
    "",
    "Underlying needs",
    ...(comm.needs.length ? comm.needs : ["No need listed"]),
    "",
    "Support strategies",
    ...(comm.strategies.length ? comm.strategies : ["Show the first step and the finish time."]),
    "",
    "Regulation menu",
    ...(comm.menu.length ? comm.menu : ["Break card.", "Two choices."]),
    "",
    "Communication to staff",
    comm.staffNote || "Offer a choice before raising the demand.",
    "",
    "This is not a behaviour rating.",
  ];
}

/** Return a single-page PDF. Text past 40 lines is left off the page. */
export function buildSchoolCommunicationPDF(comm: SchoolCommunication): Uint8Array {
  return writePdf(linesFor(comm));
}
