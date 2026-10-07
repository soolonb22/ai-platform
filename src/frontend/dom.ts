/**
 * dom.ts
 * Tiny element helper used by the shell components.
 */

export type Child = Node | string | null | false;

export function el(
  tag: string,
  attrs: Record<string, string> = {},
  children: Child[] = [],
): HTMLElement {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) {
    if (child === null || child === false) continue;
    node.append(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

export function on<K extends keyof HTMLElementEventMap>(
  node: HTMLElement,
  type: K,
  handler: (event: HTMLElementEventMap[K]) => void,
): HTMLElement {
  node.addEventListener(type, handler);
  return node;
}
