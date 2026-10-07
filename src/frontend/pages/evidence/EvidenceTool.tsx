/**
 * EvidenceTool.tsx
 * Provider note in, provider workflow out.
 * Text files load into the field. PDF binary is not parsed.
 * The original note is not rendered.
 */

import { useState } from "react";
import { FileUpload } from "../../components/FileUpload";
import { PreviewModal } from "../../components/PreviewModal";
import { ToolActions } from "../../components/ToolActions";
import { TextInput } from "../../components/TextInput";
import { previewFor } from "../../../privacy/fence";
import { runProviderWorkflow, type ProviderWorkflowResult } from "../../../workflows/provider/providerWorkflow";

import { PlatformError } from "../../../utils/errors";

export function EvidenceTool() {
  const [text, setText] = useState("");
  const [fileNote, setFileNote] = useState("");
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<ProviderWorkflowResult | null>(null);
  const [error, setError] = useState("");

  function onFile(name: string, value: string) {
    if (!value) {
      setFileNote(`${name} was not read. Paste the note. PDF extract is not in this layer.`);
      return;
    }
    setText(value);
    setFileNote(`Loaded ${name}`);
  }

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
      setResult(runProviderWorkflow(text, true));
      setPreview("");
    } catch (caught) {
      setResult(null);
      setError(caught instanceof PlatformError ? caught.message : "Something went wrong.");
    }
  }


  return (
    <section className="page">
      <h1>Evidence Tools</h1>
      <FileUpload caption="Provider note file" onFile={onFile} />
      {fileNote ? <p className="hint">{fileNote}</p> : null}
      <TextInput caption="Provider notes" value={text} onChange={setText} placeholder="Paste the progress note." />
      <button type="button" className="primary" onClick={run}>
        Run Provider Workflow
      </button>

      {error ? <p className="hint">{error}</p> : null}
      {preview ? (
        <PreviewModal originalText={text} redactedText={preview} onApprove={approve} onCancel={() => setPreview("")} />
      ) : null}
      {result ? <EvidenceResult result={result} /> : null}
      {result ? <ToolActions kind="provider" result={result} /> : null}
    </section>
  );
}

export function EvidenceResult({ result }: { result: ProviderWorkflowResult }) {
  return (
    <div className="page">
      <section>
        <h2>Rewritten Notes</h2>
        <pre className="preview-block">{result.note.text}</pre>
      </section>
      <section>
        <h2>Evidence Summary</h2>
        <ul>
          {result.evidence.items.map((item) => (
            <li key={item.need}>
              {item.need}: {item.observed}
            </li>
          ))}
        </ul>
        <p className="hint">{result.evidence.limit}</p>
      </section>
      <section>
        <h2>Goals</h2>
        <ul>
          {result.goals.map((goal) => (
            <li key={goal.need}>{goal.statement}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
