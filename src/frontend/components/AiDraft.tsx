/**
 * AiDraft.tsx
 * Optional AI draft under a tool result.
 * Shows exactly what will leave this device before anything is sent.
 * "Keep it on this device" cancels. A draft counts against the plan only once it comes back.
 */

import { useEffect, useState } from "react";
import { requestAiDraft } from "../../ai/client";
import { aiDraftsLeftToday, getPlan, recordAiDraft, setPlan } from "../../data/plan";
import type { WorkflowKind } from "../../workflows/kinds";
import { useStoreVersion } from "../state/useStore";

type Status = "idle" | "confirm" | "sending" | "done" | "error";

export interface AiDraftProps {
  kind: WorkflowKind;
  workerText: string;
  findings: string[];
  onDraft: (draft: string) => void;
}

export function AiDraft({ kind, workerText, findings, onDraft }: AiDraftProps) {
  useStoreVersion();
  const plan = getPlan();
  const left = aiDraftsLeftToday();
  const [status, setStatus] = useState<Status>("idle");
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setStatus("idle");
    setDraft("");
    setMessage("");
  }, [workerText]);

  async function send() {
    setStatus("sending");
    const result = await requestAiDraft({ kind, text: workerText, context: findings });
    if ("message" in result) {
      setMessage(result.message);
      setStatus("error");
      return;
    }
    recordAiDraft();
    setDraft(result.draft);
    onDraft(result.draft);
    setStatus("done");
  }

  if (plan.aiDraftsPerDay === 0) {
    return (
      <section className="ai-box">
        <h2>AI draft</h2>
        <p className="hint">
          AI drafting comes with the paid plans. They are demo plans for now, so no payment is taken. Every tool above stays
          free.
        </p>
        <div className="row">
          <button type="button" className="primary" onClick={() => setPlan("parent")}>
            Switch to the Parent demo plan
          </button>
        </div>
        <p className="hint">You can change plans any time in Settings.</p>
      </section>
    );
  }

  return (
    <section className="ai-box">
      <h2>AI draft</h2>
      {status === "idle" ? (
        <>
          <p className="hint">
            Claude, an AI model by Anthropic, can turn this into a plain-language draft. {left} of {plan.aiDraftsPerDay} left today.
          </p>
          <button type="button" className="primary" disabled={left === 0} onClick={() => setStatus("confirm")}>
            Draft with AI
          </button>
        </>
      ) : null}
      {status === "confirm" ? (
        <>
          <p className="hint">This is what will leave this device. Nothing else is sent.</p>
          <pre className="preview-block">{workerText}</pre>
          <pre className="preview-block">{findings.join("\n")}</pre>
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
      {status === "sending" ? <p className="hint">Drafting. This can take up to a minute.</p> : null}
      {status === "done" ? (
        <>
          <pre className="preview-block">{draft}</pre>
          <div className="row">
            <button type="button" className="ghost" onClick={() => navigator.clipboard?.writeText(draft)}>
              Copy
            </button>
          </div>
          <p className="hint">AI draft. Check it before you use it. It is not a diagnosis or a funding decision.</p>
        </>
      ) : null}
      {status === "error" ? (
        <>
          <p className="hint">{message}</p>
          <button type="button" className="ghost" onClick={() => setStatus("idle")}>
            Try again
          </button>
        </>
      ) : null}
    </section>
  );
}
