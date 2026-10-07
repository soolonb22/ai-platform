/**
 * ToolActions.tsx
 * Shared actions under every tool result: Download PDF, Save draft, and the optional AI draft.
 */

import { useEffect, useState } from "react";
import { saveDraft } from "../../data/drafts";
import { getPlan } from "../../data/plan";
import type { WorkflowKind } from "../../workflows/kinds";
import { downloadPdf, TOOLS, type WorkflowResult } from "../toolRegistry";
import { AiDraft } from "./AiDraft";

export function ToolActions({ kind, result }: { kind: WorkflowKind; result: WorkflowResult }) {
  const tool = TOOLS[kind];
  const [aiDraft, setAiDraft] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    setAiDraft("");
    setNote("");
  }, [result]);

  function save() {
    const outcome = saveDraft({ kind, result, aiDraft }, getPlan().savedDrafts);
    setNote("message" in outcome ? outcome.message : "Saved to Drafts on this device.");
  }

  return (
    <section className="page">
      <div className="row">
        <button type="button" className="ghost" onClick={() => downloadPdf(tool.pdf(result), tool.filename)}>
          Download PDF
        </button>
        <button type="button" className="ghost" onClick={save}>
          Save draft
        </button>
      </div>
      {note ? <p className="hint">{note}</p> : null}
      <AiDraft kind={kind} workerText={result.workerText} findings={tool.findings(result)} onDraft={setAiDraft} />
    </section>
  );
}
