/**
 * pricing.tsx
 * Ranges from the tier lists. The low end is the mock charge. Not a live checkout.
 */

const SUBSCRIPTIONS = [
  { name: "Parent", range: "$29–$49 / month" },
  { name: "Coordinator", range: "$99–$149 / month" },
  { name: "Provider", range: "$299–$499 / month" },
];

const LICENSES = [
  { name: "Small school", range: "$3,000 / year" },
  { name: "Medium school", range: "$7,500 / year" },
  { name: "Large school", range: "$15,000 / year" },
  { name: "Enterprise", range: "$1,000–$5,000 / month" },
];

export function Pricing() {
  return (
    <section id="pricing">
      <h2>Pricing</h2>
      <h3>Subscriptions</h3>
      <ul>
        {SUBSCRIPTIONS.map((tier) => (
          <li key={tier.name}>
            {tier.name}: {tier.range}
          </li>
        ))}
      </ul>
      <h3>Licences</h3>
      <ul>
        {LICENSES.map((tier) => (
          <li key={tier.name}>
            {tier.name}: {tier.range}
          </li>
        ))}
      </ul>
      <p>Checkout is not live. These are the mock ranges.</p>
    </section>
  );
}
