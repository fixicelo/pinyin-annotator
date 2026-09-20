/**
 * Coalesces DOM mutations into a single flush.
 *
 * The flush is scheduled on a microtask rather than on a timer: player caption
 * renderers rewrite their cue elements every time the cue changes, and a timer
 * would let that rewritten, still unannotated text reach a paint before the
 * reading comes back — the flicker captions show on streaming sites. A
 * microtask runs before the next paint, so the reading returns in the same
 * frame the player removed it.
 */
export interface MutationBatcher {
  /** Queues mutations; `version` is the one the batch will be flushed with. */
  push(mutations: MutationRecord[], version: number): void
  /** Drops everything queued, for an annotation that is being cleared. */
  cancel(): void
}

export function createMutationBatcher(
  flush: (mutations: MutationRecord[], version: number) => void,
  schedule: (task: () => void) => void = queueMicrotask
): MutationBatcher {
  let pending: MutationRecord[] = []
  let isScheduled = false
  let scheduledVersion = 0

  return {
    push(mutations, version) {
      pending.push(...mutations)
      if (isScheduled) {
        return
      }

      isScheduled = true
      // Captured now so a flush that lands after a clear is discarded instead
      // of re-annotating what was just removed.
      scheduledVersion = version
      schedule(() => {
        isScheduled = false
        const batch = pending
        pending = []
        flush(batch, scheduledVersion)
      })
    },
    cancel() {
      pending = []
    }
  }
}
