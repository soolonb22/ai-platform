/**
 * productCatalog.ts
 * One-off products. Prices are mock amounts.
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

export const products: Product[] = [
  {
    id: "progress-note",
    name: "Progress Note Generator",
    description: "Rewrites a redacted note into a short progress note.",
    price: 40,
  },
  {
    id: "sensory-profile",
    name: "Sensory Profile Mapper",
    description: "Maps sensory cues to a short support menu.",
    price: 35,
  },
  {
    id: "trauma-decoder",
    name: "Trauma Pattern Decoder",
    description: "Lists pattern cues and a planning hint. Not a diagnosis.",
    price: 50,
  },
];

export function getProductList(): Product[] {
  return products.map((product) => ({ ...product }));
}

export function findProduct(id: string): Product {
  const product = products.find((item) => item.id === id);
  if (!product) throw new Error("Unknown product.");
  return product;
}
