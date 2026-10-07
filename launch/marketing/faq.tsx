/**
 * faq.tsx
 * Generic answers. No account, plan, or note examples.
 */

const QUESTIONS = [
  { q: "Does this diagnose a person?", a: "No. Pattern cues are planning hints." },
  { q: "Does this approve NDIS funding?", a: "No. It drafts notes. The plan and the NDIA decide funding." },
  { q: "Where does the original note go?", a: "The original stays in the preview. Workflows use the redacted text." },
  { q: "Is payment live?", a: "No. Billing is a mock ledger in this build." },
];

export function Faq() {
  return (
    <section>
      <h2>Questions</h2>
      {QUESTIONS.map((item) => (
        <div key={item.q}>
          <h3>{item.q}</h3>
          <p>{item.a}</p>
        </div>
      ))}
    </section>
  );
}
