/**
 * NDISDecoder.tsx
 * Plan text in, NDIS workflow out.
 * PDF binary is not parsed here. Text files load into the field.
 * The original plan is not rendered.
 */

import { useState } from "react";
import { FileUpload } from "../../components/FileUpload";
import { PreviewModal } from "../../components/PreviewModal";
import { TextInput } from "../../components/TextInput";
import { previewFor } from "../../../privacy/fence";
import { runNDISWorkflow, type NDISWorkflowResult } from "../../../workflows/ndis/ndisWorkflow";
import { buildServiceAgreementPDF } from "../../../pdf/serviceAgreement";
import { agreementFrom } from "../../../pdf/mapResults";
import { PlatformError } from "../../../utils/errors";

export function NDISDecoder() {
  const [text, setText] = useState("");
  const [fileNote, setFileNote] = useState("");
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<NDISWorkflowResult | null>(null);
  const [error, setError] = useState("");

  function onFile(name: string, value: string) {
    if (!value) {
      setFileNote(`${name} was not read. Paste the plan text. PDF extract is not in this layer.`);
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
      setResult(runNDISWorkflow(text, true));
      setPreview("");
    } catch (caught) {
      setResult(null);
      setError(caught instanceof PlatformError ? caught.message : "Something went wrong.");
    }
  }

  function download() {
    if (!result) return;
    const bytes = buildServiceAgreementPDF(agreementFrom(result));
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "service-agreement.pdf";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="page">
      <h1>NDIS Decoder</h1>
      <FileUpload caption="Plan file" onFile={onFile} />
      {fileNote ? <p className="hint">{fileNote}</p> : null}
      <TextInput caption="Plan text" value={text} onChange={setText} />
      <button type="button" className="primary" onClick={run}>
        Run NDIS Workflow
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
      {result ? <NDISResult result={result} /> : null}
    </section>
  );
}

function NDISResult({ result }: { result: NDISWorkflowResult }) {
  return (
    <div className="page">
      <section>
        <h2>Funding</h2>
        {result.funding.hits.length ? (
          <ul>
            {result.funding.hits.map((hit) => (
              <li key={hit.category}>
                {hit.label}: {hit.cues.join(", ")}
              </li>
            ))}
          </ul>
        ) : (
          <p className="hint">{result.funding.note}</p>
        )}
      </section>
      <section>
        <h2>Rule Explanations</h2>
        <ul>
          {result.rules.map((rule) => (
            <li key={rule.category}>{rule.plain}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Goals</h2>
        <ul>
          {result.goals.map((goal) => (
            <li key={goal.need}>{goal.statement}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Evidence Pack</h2>
        <ul>
          {result.evidence.items.map((item) => (
            <li key={item.need}>
              {item.need}: {item.goal}
            </li>
          ))}
        </ul>
        <p className="hint">{result.evidence.limit}</p>
      </section>
      <section>
        <h2>Service Agreement</h2>
        <p>{result.agreement.title}</p>
        <p>{result.agreement.categories.join(", ")}</p>
        <ul>
          {result.agreement.terms.map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ul>
        <p className="hint">{result.agreement.limit}</p>
      </section>
    </div>
  );
}
