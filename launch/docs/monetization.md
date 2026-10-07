# Monetization

Billing is a mock ledger. No card data and no live checkout.

Subscriptions, charged at the low end of the range:

- Parent: $29–$49 / month
- Coordinator: $99–$149 / month
- Provider: $299–$499 / month

Licences:

- Small school: $3,000 / year
- Medium school: $7,500 / year
- Large school: $15,000 / year
- Enterprise: $1,000–$5,000 / month, charged at 1000 in the mock

Marketplace products: Progress Note Generator $40, Sensory Profile Mapper $35, Trauma Pattern Decoder $50.

`createSubscription`, `issueLicense`, and `purchaseProduct` call the mock provider. Records are in memory and clear when the process ends.
