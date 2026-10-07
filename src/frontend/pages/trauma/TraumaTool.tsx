/**
 * TraumaTool.tsx
 * Behaviour note in, trauma workflow out.
 * Renders the structured result. Does not render the original note.
 */

import { useState } from "react";
import { PreviewModal } from "../../components/PreviewModal";
import { previewFor } from "../../../privacy/fence";
import { runTraumaWorkflow, type TraumaWorkflowResult } from "../../../workflows/trauma/traumaWorkflow";
import { buildTraumaPlanPDF } from "../../../pdf/traumaPlan";
import { traumaPlanFrom } from "../../../pdf/mapResults";
import { PlatformError } from "../../../utils/errors";

export function TraumaTool() {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<TraumaWorkflowResult | null>(null);
  const [error, setError] = useState("");

  function run() {
    setError("");
    setResult(null);
    if (!text.trim()) {
      setError("No input to process.");
      return;
    }
    setPreview(previewFor(text));
  }

  function approve() {
    try {
      setResult(runTraumaWorkflow(text, true));
      setPreview("");
    } catch (caught) {
      setResult(null);
      setError(caught instanceof PlatformError ? caught.message : "Something went wrong.");
    }
  }

  function download() {
    if (!result) return;
    const bytes = buildTraumaPlanPDF(traumaPlanFrom(result));
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "trauma-plan.pdf";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="page">
      <h1>Trauma Tool</h1>
      <div className="field">
        <span className="field-label">Behaviour description</span>
        <textarea
          className="text-input"
          value={text}
          placeholder="Describe what happened. Review happens before the workflow."
          onChange={(event) => setText(event.target.value)}
        />
      </div>
      <button type="button" className="primary" onClick={run}>
        Run Trauma Workflow
      </button>
      {result ? (
        <button type="button" onClick={download}>
          Download PDF
        </button>
      ) : null}
      {error ? <p className="hint">{error}</p> : null}
      {preview ? (
        <PreviewModal originalText={text} redactedText={preview} onApprove={approve} onCancel={() => setPreview("")} />
      ) : null}
      {result ? <TraumaResult result={result} /> : null}
    </section>
  );
}

function TraumaResult({ result }: { result: TraumaWorkflowResult }) {
  return (
    <div className="page">
      <section>
        <h2>Patterns</h2>
        {result.patterns.hits.length ? (
          <ul>
            {result.patterns.hits.map((hit) => (
              <li key={hit.id}>
                {hit.label}: {hit.cues.join(", ")}
              </li>
            ))}
          </ul>
        ) : (
          <p className="hint">{result.patterns.note}</p>
        )}
      </section>
      <section>
        <h2>Needs</h2>
        <p>{result.needs.needs.join(", ")}</p>
        <p className="hint">{result.needs.summary}</p>
      </section>
      <section>
        <h2>Interventions</h2>
        <ul>
          {result.interventions.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Regulation Plan</h2>
        <p>{result.plan.aim}</p>
        <ul>
          {result.plan.now.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <ul>
          {result.plan.environment.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="hint">{result.plan.review}</p>
      </section>
      <section>
        <h2>Narrative Explanation</h2>
        <p>{result.narrative}</p>
      </section>
    </div>
  );
}
