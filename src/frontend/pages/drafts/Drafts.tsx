/**
 * Drafts.tsx
 * Drafts saved on this device. Open one to read it again, download its PDF, or delete it.
 * Only redacted text and results are stored. The original note never is.
 */

import { useState } from "react";
import { deleteDraft, listDrafts, type Draft } from "../../../data/drafts";
import { getPlan } from "../../../data/plan";
import type { NDISWorkflowResult } from "../../../workflows/ndis/ndisWorkflow";
import type { ProviderWorkflowResult } from "../../../workflows/provider/providerWorkflow";
import type { SchoolWorkflowResult } from "../../../workflows/school/schoolWorkflow";
import type { TraumaWorkflowResult } from "../../../workflows/trauma/traumaWorkflow";
import { useStoreVersion } from "../../state/useStore";
import { downloadPdf, TOOLS, type WorkflowResult } from "../../toolRegistry";
import { EvidenceResult } from "../evidence/EvidenceTool";
import { NDISResult } from "../ndis/NDISDecoder";
import { SchoolResult } from "../school/SchoolTool";
import { TraumaResult } from "../trauma/TraumaTool";

function when(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

function ResultView({ draft }: { draft: Draft }) {
  if (draft.kind === "trauma") return <TraumaResult result={draft.result as TraumaWorkflowResult} />;
  if (draft.kind === "ndis") return <NDISResult result={draft.result as NDISWorkflowResult} />;
  if (draft.kind === "school") return <SchoolResult result={draft.result as SchoolWorkflowResult} />;
  return <EvidenceResult result={draft.result as ProviderWorkflowResult} />;
}

export function Drafts() {
  useStoreVersion();
  const drafts = listDrafts();
  const plan = getPlan();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = drafts.find((draft) => draft.id === openId) ?? null;

  return (
    <section className="page">
      <h1>Drafts</h1>
      <p className="hint">
        Saved on this device only. Drafts keep the redacted text and results, never the original note. {drafts.length} of{" "}
        {plan.savedDrafts} used on the {plan.label} plan.
      </p>
      {drafts.length === 0 ? <p className="hint">No drafts yet. Run a tool, then choose Save draft.</p> : null}
      <ul className="draft-list">
        {drafts.map((draft) => (
          <li key={draft.id} className="row">
            <button
              type="button"
              className={draft.id === openId ? "draft-item active" : "draft-item"}
              onClick={() => setOpenId(draft.id === openId ? null : draft.id)}
            >
              <strong>{TOOLS[draft.kind].label}</strong> {when(draft.createdAt)}
              <br />
              <span className="hint">{draft.title}</span>
            </button>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                if (draft.id === openId) setOpenId(null);
                deleteDraft(draft.id);
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      {open ? (
        <section className="page">
          <h2>Redacted text</h2>
          <pre className="preview-block">{open.redacted}</pre>
          <ResultView draft={open} />
          {open.aiDraft ? (
            <section>
              <h2>AI draft</h2>
              <pre className="preview-block">{open.aiDraft}</pre>
            </section>
          ) : null}
          <div className="row">
            <button
              type="button"
              className="ghost"
              onClick={() => {
                const tool = TOOLS[open.kind];
                downloadPdf(tool.pdf(open.result as WorkflowResult), tool.filename);
              }}
            >
              Download PDF
            </button>
          </div>
        </section>
      ) : null}
    </section>
  );
}
