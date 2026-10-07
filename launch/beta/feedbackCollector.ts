/**
 * feedbackCollector.ts
 * Stores a short note. Email and phone patterns are removed.
 */

export interface Feedback {
  user: string;
  message: string;
}

const feedback: Feedback[] = [];

/** Store feedback. Contact patterns are stripped. Empty text is rejected. */
export function submitFeedback(user: string, message: string): Feedback {
  const cleaned = message
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/\b\d{8,}\b/g, "[number]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
  if (!cleaned) throw new Error("No feedback to store.");
  const item = { user, message: cleaned };
  feedback.push(item);
  return item;
}
