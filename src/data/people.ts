/**
 * people.ts
 * Person profiles, kept in this browser only. A profile is how the app gets to know someone:
 * strengths, communication, sensory needs, triggers, what helps, and their goals.
 * The name and nicknames never leave the device. They are swapped for [name] before any preview or send.
 *
 * Exports: PersonProfile, ProfileField, PROFILE_FIELDS, listPeople, getPerson, createPerson, savePerson,
 *          deletePerson, getActivePersonId, setActivePerson, getActivePerson, namesOf
 */

import { namesFrom } from "../privacy/knownNames";
import { deleteDocumentsFor } from "./documents";
import { deleteObservationsFor } from "./observations";
import { readJson, writeJson } from "./store";

const KEY = "fence.people.v1";
const ACTIVE_KEY = "fence.activePerson.v1";

export interface PersonProfile {
  id: string;
  name: string;
  otherNames: string;
  ageGroup: string;
  strengths: string;
  interests: string;
  communication: string;
  sensory: string;
  triggers: string;
  whatHelps: string;
  goals: string;
  supports: string;
  avoid: string;
  updatedAt: string;
}

export type ProfileField = Exclude<keyof PersonProfile, "id" | "name" | "otherNames" | "updatedAt">;

export const PROFILE_FIELDS: Array<{ key: ProfileField; label: string; hint: string }> = [
  { key: "ageGroup", label: "Age group", hint: "For example: primary school age, teenager, adult. Not a birth date." },
  { key: "strengths", label: "Strengths", hint: "What they are good at, and what people like about them." },
  { key: "interests", label: "Interests", hint: "Favourite things, topics, and activities." },
  { key: "communication", label: "How they communicate", hint: "Words, signs, devices, body language, and what helps them understand." },
  { key: "sensory", label: "Sensory needs", hint: "Sounds, lights, textures, and spaces they seek out or avoid." },
  { key: "triggers", label: "Known triggers", hint: "Situations that are hard, such as changes, noise, or waiting." },
  { key: "whatHelps", label: "What helps", hint: "What calms them and helps them get back on track." },
  { key: "goals", label: "Their goals", hint: "In their own words where you can." },
  { key: "supports", label: "Current supports", hint: "Supports, therapies, and funding areas in their plan." },
  { key: "avoid", label: "What to avoid", hint: "Things that make it harder." },
];

function all(): PersonProfile[] {
  const list = readJson<PersonProfile[]>(KEY, []);
  return Array.isArray(list) ? list : [];
}

export function listPeople(): PersonProfile[] {
  return all();
}

export function getPerson(id: string | null | undefined): PersonProfile | null {
  return id ? all().find((person) => person.id === id) ?? null : null;
}

export function createPerson(name = ""): PersonProfile {
  const person: PersonProfile = {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    name,
    otherNames: "",
    ageGroup: "",
    strengths: "",
    interests: "",
    communication: "",
    sensory: "",
    triggers: "",
    whatHelps: "",
    goals: "",
    supports: "",
    avoid: "",
    updatedAt: new Date().toISOString(),
  };
  writeJson(KEY, [...all(), person]);
  return person;
}

export function savePerson(person: PersonProfile): void {
  const next = { ...person, updatedAt: new Date().toISOString() };
  writeJson(
    KEY,
    all().map((item) => (item.id === person.id ? next : item)),
  );
}

/** Removes the profile, its pattern history, and its documents. */
export function deletePerson(id: string): void {
  writeJson(
    KEY,
    all().filter((person) => person.id !== id),
  );
  deleteObservationsFor(id);
  deleteDocumentsFor(id);
  if (getActivePersonId() === id) setActivePerson(null);
}

export function getActivePersonId(): string | null {
  const id = readJson<string | null>(ACTIVE_KEY, null);
  return getPerson(id) ? id : null;
}

export function setActivePerson(id: string | null): void {
  writeJson(ACTIVE_KEY, id);
}

export function getActivePerson(): PersonProfile | null {
  return getPerson(getActivePersonId());
}

export function namesOf(person: PersonProfile): string[] {
  return namesFrom(person.name, person.otherNames);
}
