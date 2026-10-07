/**
 * SchoolTool.tsx
 * Behaviour note in, school workflow out.
 * Renders the classroom result. Does not render the original note.
 */

import { useState } from "react";
import { PreviewModal } from "../../components/PreviewModal";
import { TextInput } from "../../components/TextInput";
import { previewFor } from "../../../privacy/fence";
import { runSchoolWorkflow, type SchoolWorkflowResult } from "../../../workflows/school/schoolWorkflow";
import { buildSchoolCommunicationPDF } from "../../../pdf/schoolCommunication";
import { schoolFrom } from "../../../pdf/mapResults";
import { PlatformError } from "../../../utils/errors";

export function SchoolTool() {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<SchoolWorkflowResult | null>(null);
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
      setResult(runSchoolWorkflow(text, true));
      setPreview("");
    } catch (caught) {
      setResult(null);
      setError(caught instanceof PlatformError ? caught.message : "Something went wrong.");
    }
  }

  function download() {
    if (!result) return;
    const bytes = buildSchoolCommunicationPDF(schoolFrom(result));
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "school-note.pdf";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="page">
      <h1>School Tools</h1>
      <TextInput caption="Behaviour description" value={text} onChange={setText} placeholder="Describe what happened in class." />
      <button type="button" className="primary" onClick={run}>
        Run School Workflow
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
      {result ? <SchoolResult result={result} /> : null}
    </section>
  );
}

function SchoolResult({ result }: { result: SchoolWorkflowResult }) {
  return (
    <div className="page">
      <section>
        <h2>Needs</h2>
        <p>{result.needs.needs.join(", ")}</p>
        <p className="hint">
          {result.needs.summary} Focus used for the plan: {result.focus}.
        </p>
      </section>
      <section>
        <h2>Support Plan</h2>
        <ul>
          {result.plan.entry.map((line) => (
            <li key={line}>{line}</li>
          ))}
          {result.plan.during.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p>{result.plan.exit}</p>
      </section>
      <section>
        <h2>Regulation Menu</h2>
        <ul>
          {result.menu.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>EF Strategies</h2>
        <ul>
          {result.strategies.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>School Communication</h2>
        <p>{result.communication}</p>
      </section>
    </div>
  );
}
