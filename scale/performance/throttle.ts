/**
 * throttle.ts
 * Runs fn at most once per delay. Later calls wait.
 */

/** Return a function that waits out the delay between runs. */
export function throttle<T extends unknown[]>(fn: (...args: T) => void, delay: number): (...args: T) => void {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: T | null = null;

  return (...args: T) => {
    const now = Date.now();
    const wait = delay - (now - last);
    if (wait <= 0) {
      last = now;
      fn(...args);
      return;
    }
    pending = args;
    if (timer) return;
    timer = setTimeout(() => {
      last = Date.now();
      timer = null;
      if (pending) fn(...pending);
      pending = null;
    }, wait);
  };
}
