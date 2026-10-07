/**
 * hooks.ts
 * Minimal state for the shell. No external library.
 * One component instance. Hooks must run in the same order every render.
 */

type Setter<T> = (value: T | ((prev: T) => T)) => void;

type Instance = {
  hooks: unknown[];
  render: () => void;
};

let active: Instance | null = null;
let hookIndex = 0;
let scheduled = false;

export function beginRender(instance: Instance): void {
  active = instance;
  hookIndex = 0;
}

export function endRender(): void {
  active = null;
  hookIndex = 0;
}

function schedule(instance: Instance): void {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    instance.render();
  });
}

export function useState<T>(initial: T): [T, Setter<T>] {
  if (!active) throw new Error("useState called outside render");
  const instance = active;
  const index = hookIndex++;
  if (instance.hooks.length <= index) instance.hooks.push(initial);
  const setState: Setter<T> = (value) => {
    const prev = instance.hooks[index] as T;
    const next = typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
    if (Object.is(prev, next)) return;
    instance.hooks[index] = next;
    schedule(instance);
  };
  return [instance.hooks[index] as T, setState];
}

export function createRoot(render: () => void): Instance {
  const instance: Instance = { hooks: [], render };
  instance.render = () => render();
  return instance;
}
