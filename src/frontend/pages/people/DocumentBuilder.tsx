/**
 * DocumentBuilder.tsx
 * Pick a document, see exactly what will leave this device, then let Claude write it from
 * the profile and pattern history. Finished documents are saved for this person on this device.
 * A document counts as one AI draft, and only once it comes back.
 */

import { useEffect, useState } from "react";
import { buildDocumentRequest, describeRequest, requestDocument } from "../../../ai/documentClient";
import { DOCUMENT_INFO, DOCUMENT_KINDS, type DocumentKind, type DocumentRequest } from "../../../ai/documents";
import { deleteDocument, listDocuments, saveDocument } from "../../../data/documents";
import { listObservations, summarisePatterns } from "../../../data/observations";
import type { PersonProfile } from "../../../data/people";
import { aiDraftsLeftToday, getPlan, recordAiDraft, setPlan } from "../../../data/plan";
import { DocumentView } from "./DocumentView";

type Status = "idle" | "confirm" | "sending" | "error";

export function DocumentBuilder({ person }: { person: PersonProfile }) {
  const plan = getPlan();
  const left = aiDraftsLeftToday();
  const saved = listDocuments(person.id);
  const [status, setStatus] = useState<Status>("idle");
  const [request, setRequest] = useState<DocumentRequest | null>(null);
  const [message, setMessage] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setStatus("idle");
    setRequest(null);
    setOpenId(null);
  }, [person.id]);

  function prepare(kind: DocumentKind) {
    setRequest(buildDocumentRequest(kind, person, listObservations(person.id), summarisePatterns(person.id)));
    setStatus("confirm");
  }

  async function send() {
    if (!request) return;
    setStatus("sending");
    const result = await requestDocument(request);
    if ("message" in result) {
      setMessage(result.message);
      setStatus("error");
      return;
    }
    recordAiDraft();
    const doc = saveDocument(person.id, request.kind, result.document);
    setOpenId(doc.id);
    setStatus("idle");
  }

  const open = saved.find((item) => item.id === openId) ?? null;

  return (
    <section className="ai-box">
      <h2>Documents</h2>
      {plan.aiDraftsPerDay === 0 ? (
        <>
          <p className="hint">AI documents come with the paid plans. They are demo plans for now, so no payment is taken.</p>
          <div className="row">
            <button type="button" className="primary" onClick={() => setPlan("parent")}>
              Switch to the Parent demo plan
            </button>
          </div>
        </>
      ) : null}
      {plan.aiDraftsPerDay > 0 && status === "idle" ? (
        <>
          <p className="hint">
            Claude writes these from the profile and the pattern history. Each document uses one AI draft. {left} of{" "}
            {plan.aiDraftsPerDay} left today.
          </p>
          <div className="doc-choices">
            {DOCUMENT_KINDS.map((kind) => (
              <button key={kind} type="button" className="doc-choice" disabled={left === 0} onClick={() => prepare(kind)}>
                <strong>{DOCUMENT_INFO[kind].label}</strong>
                <span className="hint">{DOCUMENT_INFO[kind].blurb}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}
      {status === "confirm" && request ? (
        <>
          <h3>{DOCUMENT_INFO[request.kind].label}</h3>
          <p className="hint">This is what will leave this device. The name is never sent.</p>
          <pre className="preview-block">{describeRequest(request)}</pre>
          <div className="row">
            <button type="button" className="primary" onClick={send}>
              Send to AI
            </button>
            <button type="button" className="ghost" onClick={() => setStatus("idle")}>
              Keep it on this device
            </button>
          </div>
        </>
      ) : null}
      {status === "sending" ? <p className="hint">Writing the document. This can take a minute or two.</p> : null}
      {status === "error" ? (
        <>
          <p className="hint">{message}</p>
          <button type="button" className="ghost" onClick={() => setStatus("idle")}>
            Back
          </button>
        </>
      ) : null}
      {saved.length ? (
        <>
          <h3>Saved documents</h3>
          <ul className="draft-list">
            {saved.map((item) => (
              <li key={item.id} className="row">
                <button
                  type="button"
                  className={item.id === openId ? "draft-item active" : "draft-item"}
                  onClick={() => setOpenId(item.id === openId ? null : item.id)}
                >
                  <strong>{DOCUMENT_INFO[item.kind].label}</strong> {new Date(item.createdAt).toLocaleDateString()}
                </button>
                <button type="button" className="ghost" onClick={() => deleteDocument(item.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {open ? <DocumentView kind={open.kind} document={open.document} /> : null}
    </section>
  );
}
