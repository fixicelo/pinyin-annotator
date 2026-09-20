import { describe, expect, it, vi } from "vitest"

import { createMutationBatcher } from "~lib/mutation-batcher"

function createScheduler() {
  const tasks: Array<() => void> = []
  return {
    schedule: (task: () => void) => {
      tasks.push(task)
    },
    run: () => {
      for (const task of tasks.splice(0)) {
        task()
      }
    }
  }
}

function mutation(type: string): MutationRecord {
  return { type } as unknown as MutationRecord
}

describe("createMutationBatcher", () => {
  it("waits for the scheduled task before flushing", () => {
    const scheduler = createScheduler()
    const flush = vi.fn()
    const batcher = createMutationBatcher(flush, scheduler.schedule)

    batcher.push([mutation("childList")], 1)
    expect(flush).not.toHaveBeenCalled()

    scheduler.run()
    expect(flush).toHaveBeenCalledTimes(1)
  })

  it("coalesces everything queued into a single flush", () => {
    const scheduler = createScheduler()
    const flush = vi.fn()
    const batcher = createMutationBatcher(flush, scheduler.schedule)

    const first = mutation("childList")
    const second = mutation("characterData")
    const third = mutation("childList")
    batcher.push([first, second], 7)
    batcher.push([third], 7)
    scheduler.run()

    expect(flush).toHaveBeenCalledTimes(1)
    expect(flush).toHaveBeenCalledWith([first, second, third], 7)
  })

  it("flushes with the version captured when the batch was queued", () => {
    // A batch queued before a clear has to be discarded by the version check
    // the flush performs, even if it lands afterwards.
    const scheduler = createScheduler()
    const flush = vi.fn()
    const batcher = createMutationBatcher(flush, scheduler.schedule)

    batcher.push([mutation("childList")], 3)
    batcher.push([mutation("childList")], 4)
    scheduler.run()

    expect(flush).toHaveBeenCalledWith(expect.anything(), 3)
  })

  it("schedules again once a flush has run", () => {
    const scheduler = createScheduler()
    const flush = vi.fn()
    const batcher = createMutationBatcher(flush, scheduler.schedule)

    batcher.push([mutation("childList")], 1)
    scheduler.run()
    batcher.push([mutation("childList")], 1)
    scheduler.run()

    expect(flush).toHaveBeenCalledTimes(2)
  })

  it("drops queued mutations when cancelled", () => {
    const scheduler = createScheduler()
    const flush = vi.fn()
    const batcher = createMutationBatcher(flush, scheduler.schedule)

    batcher.push([mutation("childList")], 1)
    batcher.cancel()
    scheduler.run()

    expect(flush).toHaveBeenCalledWith([], 1)
  })
})
