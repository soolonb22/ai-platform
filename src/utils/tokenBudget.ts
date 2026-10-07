/**
 * tokenBudget.ts
 * Caps text before it is sent onward.
 * Token count is a word proxy: one whitespace-separated word = one token.
 * Not a model tokenizer. Safe trim never cuts inside a word.
 *
 * Exports: estimateTokens, trimToBudget
 */

export type BudgetResult = {
  text: string;
  estimatedTokens: number;
  trimmed: boolean;
};

/** Word-count proxy. Empty input is zero. */
export function estimateTokens(input: string): number {
  if (!input) return 0;
  const words = input.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

/**
 * Trim to maxTokens on a word boundary.
 * maxTokens below 1 returns an empty result.
 * Appends an ellipsis only when text was cut.
 */
export function trimToBudget(input: string, maxTokens: number): BudgetResult {
  const source = input ?? "";
  if (maxTokens < 1) {
    return { text: "", estimatedTokens: 0, trimmed: source.trim().length > 0 };
  }
  const words = source.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxTokens) {
    return { text: words.join(" "), estimatedTokens: words.length, trimmed: false };
  }
  const kept = words.slice(0, maxTokens).join(" ");
  return {
    text: `${kept}...`,
    estimatedTokens: maxTokens,
    trimmed: true,
  };
}
