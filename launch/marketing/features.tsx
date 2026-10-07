/**
 * features.tsx
 * Feature list. Each item is a draft tool, not a decision.
 */

const FEATURES = [
  { name: "Trauma engine", text: "Pattern cues, needs, and a regulation plan. Not a diagnosis." },
  { name: "NDIS decoder", text: "Funding cues, plain rules, draft goals, and a draft agreement." },
  { name: "School tools", text: "A staff note, support plan, regulation menu, and start strategies." },
  { name: "Evidence tools", text: "A rewritten progress note and a planning evidence pack." },
];

export function Features() {
  return (
    <section>
      <h2>Features</h2>
      <ul>
        {FEATURES.map((feature) => (
          <li key={feature.name}>
            <strong>{feature.name}</strong>: {feature.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
