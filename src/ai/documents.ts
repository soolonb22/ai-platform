/**
 * documents.ts
 * Full AI documents built from a person profile and their pattern history.
 * Shared by the browser and the server: the kinds, the request shape, the JSON schema
 * the model must follow, and a validator for what comes back.
 *
 * Exports: DOCUMENT_KINDS, DocumentKind, isDocumentKind, DOCUMENT_INFO, DocumentRequest,
 *          GeneratedDocument, DOCUMENT_LIMITS, DOCUMENT_SCHEMA, isGeneratedDocument
 */

export const DOCUMENT_KINDS = ["behaviour-support-plan", "service-agreement", "one-page-profile", "school-support-plan"] as const;

export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

export function isDocumentKind(value: unknown): value is DocumentKind {
  return typeof value === "string" && (DOCUMENT_KINDS as readonly string[]).includes(value);
}

export const DOCUMENT_INFO: Record<DocumentKind, { label: string; blurb: string; note: string }> = {
  "behaviour-support-plan": {
    label: "Behaviour support plan (draft)",
    blurb: "Triggers, early signs, proactive strategies, what to do in the moment, and recovery.",
    note: "Draft for discussion only. This is not a behaviour support plan under the NDIS rules. A plan that includes any restrictive practice must be developed by a registered NDIS behaviour support practitioner.",
  },
  "service-agreement": {
    label: "Service agreement (draft)",
    blurb: "Supports, goals, how support is delivered, responsibilities, changes, and complaints.",
    note: "Draft only and not legal advice. Add agreed rates from the current NDIS Pricing Arrangements and Price Limits, and have both parties review it before signing.",
  },
  "one-page-profile": {
    label: "One-page profile",
    blurb: "What people like about them, what matters to them, and how best to support them.",
    note: "Check this with the person. It should sound like them.",
  },
  "school-support-plan": {
    label: "School support plan (draft)",
    blurb: "Strengths, what has been noticed, what helps in class, and home and school communication.",
    note: "Draft to discuss with the school. It is not an individual education plan.",
  },
};

export interface DocumentRequest {
  kind: DocumentKind;
  /** Redacted profile fields, keyed by their label. The name is never included. */
  profile: Record<string, string>;
  /** Pattern summary lines, without dates. */
  patterns: string[];
  /** Recent redacted notes, newest first. */
  observations: string[];
}

export interface DocumentSection {
  heading: string;
  paragraphs: string[];
  points: string[];
}

export interface GeneratedDocument {
  title: string;
  sections: DocumentSection[];
  missing: string[];
}

export const DOCUMENT_LIMITS = {
  maxFields: 20,
  maxFieldChars: 1500,
  maxPatternLines: 20,
  maxObservations: 15,
  maxObservationChars: 1200,
  maxBodyBytes: 48000,
} as const;

const STRINGS = { type: "array", items: { type: "string" } };

export const DOCUMENT_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    title: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: { heading: { type: "string" }, paragraphs: STRINGS, points: STRINGS },
        required: ["heading", "paragraphs", "points"],
        additionalProperties: false,
      },
    },
    missing: STRINGS,
  },
  required: ["title", "sections", "missing"],
  additionalProperties: false,
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function isGeneratedDocument(value: unknown): value is GeneratedDocument {
  if (!value || typeof value !== "object") return false;
  const doc = value as Record<string, unknown>;
  return (
    typeof doc.title === "string" &&
    isStringArray(doc.missing) &&
    Array.isArray(doc.sections) &&
    doc.sections.length > 0 &&
    doc.sections.every((section) => {
      const item = section as Record<string, unknown>;
      return !!item && typeof item.heading === "string" && isStringArray(item.paragraphs) && isStringArray(item.points);
    })
  );
}
