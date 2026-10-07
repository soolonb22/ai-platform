/**
 * batchProcessor.ts
 * Runs tasks in order. A failure is returned, not thrown.
 */

export interface BatchTask<T> {
  id: string;
  run: () => T;
}

export interface BatchItem<T> {
  id: string;
  ok: boolean;
  value?: T;
}

/** Run each task. Keep going after a failure. */
export function batchProcess<T>(tasks: BatchTask<T>[]): BatchItem<T>[] {
  return tasks.map((task) => {
    try {
      return { id: task.id, ok: true, value: task.run() };
    } catch {
      return { id: task.id, ok: false };
    }
  });
}
