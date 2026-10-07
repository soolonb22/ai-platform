/**
 * DocumentView.tsx
 * Shows one AI document with its safety note and a PDF download.
 */

import { DOCUMENT_INFO, type DocumentKind, type GeneratedDocument } from "../../../ai/documents";
import { buildDocumentPDF } from "../../../pdf/aiDocument";
import { downloadPdf } from "../../toolRegistry";

function fileName(title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${slug || "document"}.pdf`;
}

export function DocumentView({ kind, document }: { kind: DocumentKind; document: GeneratedDocument }) {
  const note = DOCUMENT_INFO[kind].note;
  return (
    <article className="document">
      <h2>{document.title}</h2>
      <p className="hint">{note}</p>
      {document.sections.map((section, index) => (
        <section key={`${index}-${section.heading}`}>
          <h3>{section.heading}</h3>
          {section.paragraphs.map((paragraph, item) => (
            <p key={item}>{paragraph}</p>
          ))}
          {section.points.length ? (
            <ul>
              {section.points.map((point, item) => (
                <li key={item}>{point}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
      {document.missing.length ? (
        <section className="missing">
          <h3>Details to add or confirm</h3>
          <ul>
            {document.missing.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className="row">
        <button type="button" className="ghost" onClick={() => downloadPdf(buildDocumentPDF(document, note), fileName(document.title))}>
          Download PDF
        </button>
      </div>
    </article>
  );
}
