/**
 * regulationMenu.ts
 * Classroom options. The student picks. Staff do not assign a regulation task.
 * Export: generateRegulationMenu(need): string[]
 */

const MENU: Record<string, string[]> = {
  safety: ["Seat near an exit.", "Name the adult in the room.", "A pass to step outside."],
  space: ["Quiet corner.", "Task paused with no catch-up speech.", "Work in the hallway spot."],
  predictability: ["Visual order of two steps.", "Timer shown before the start.", "Warning before a change."],
  "sensory-relief": ["Headphones.", "Hat or dimmer seat.", "Move away from the noisy group."],
  connection: ["Work beside a chosen peer.", "Work alone.", "Adult nearby, not talking."],
  control: ["Two task orders to pick from.", "Choice of write or say.", "Choice of seat."],
};

/** Options for a known need, otherwise a small default menu. */
export function generateRegulationMenu(need: string): string[] {
  return MENU[need] ?? ["Break card.", "Two choices.", "Lower noise."];
}
