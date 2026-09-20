import { afterEach, describe, expect, it, vi } from "vitest"

import {
  FRAME_STATUS_MESSAGE,
  ResponseStatus,
  type FrameStatusReport
} from "~constants"
import { collectFrameStatus, reportFrameStatus } from "~lib/frame-status"

type MessageListener = (
  message: unknown,
  sender: { tab?: { id?: number } }
) => void

function installFakeChrome() {
  const listeners = new Set<MessageListener>()
  const sendMessage = vi.fn(async (_message: unknown) => undefined)

  ;(globalThis as { chrome?: unknown }).chrome = {
    runtime: {
      onMessage: {
        addListener: (listener: MessageListener) => listeners.add(listener),
        removeListener: (listener: MessageListener) =>
          listeners.delete(listener)
      },
      sendMessage
    }
  }

  return {
    sendMessage,
    listenerCount: () => listeners.size,
    report: (requestId: number, status: ResponseStatus, tabId = 1) => {
      const report: FrameStatusReport = {
        type: FRAME_STATUS_MESSAGE,
        requestId,
        status
      }
      for (const listener of [...listeners]) {
        listener(report, { tab: { id: tabId } })
      }
    }
  }
}

afterEach(() => {
  delete (globalThis as { chrome?: unknown }).chrome
})

describe("collectFrameStatus", () => {
  it("reports annotated when any frame annotated itself", async () => {
    const fake = installFakeChrome()
    const collector = collectFrameStatus(1, 7, { timeoutMs: 5 })

    // The top frame has no Chinese text, but the player iframe does.
    fake.report(7, ResponseStatus.NotAnnotated, 1)
    fake.report(7, ResponseStatus.Annotated, 1)

    await expect(collector.resolve()).resolves.toBe(true)
    expect(collector.isAnnotated()).toBe(true)
    collector.dispose()
    expect(fake.listenerCount()).toBe(0)
  })

  it("reports not annotated when no frame claims otherwise", async () => {
    const fake = installFakeChrome()
    const collector = collectFrameStatus(1, 7, { timeoutMs: 5 })

    fake.report(7, ResponseStatus.NotAnnotated, 1)
    fake.report(7, ResponseStatus.NotAnnotated, 2)

    await expect(collector.resolve()).resolves.toBe(false)
    collector.dispose()
  })

  it("ignores reports from other tabs and other requests", async () => {
    const fake = installFakeChrome()
    const collector = collectFrameStatus(1, 7, { timeoutMs: 5 })

    fake.report(7, ResponseStatus.Annotated, 2)
    fake.report(8, ResponseStatus.Annotated, 1)

    await expect(collector.resolve()).resolves.toBe(false)
    collector.dispose()
  })

  it("merges a status recorded outside the broadcast channel", async () => {
    installFakeChrome()
    const collector = collectFrameStatus(1, 7, { timeoutMs: 5 })

    collector.record(ResponseStatus.NotAnnotated)
    expect(collector.isAnnotated()).toBe(false)

    collector.record(ResponseStatus.Annotated)
    expect(collector.isAnnotated()).toBe(true)
    await expect(collector.resolve()).resolves.toBe(true)
    collector.dispose()
  })

  it("still counts a frame that answers after the window", async () => {
    const fake = installFakeChrome()
    const onAnnotated = vi.fn()
    const collector = collectFrameStatus(1, 7, { timeoutMs: 5, onAnnotated })

    await expect(collector.resolve()).resolves.toBe(false)

    // The player iframe annotates its captions long after the top frame did.
    fake.report(7, ResponseStatus.Annotated, 1)

    expect(onAnnotated).toHaveBeenCalledTimes(1)
    expect(collector.isAnnotated()).toBe(true)
    collector.dispose()
    expect(fake.listenerCount()).toBe(0)
  })

  it("stops listening once disposed", () => {
    const fake = installFakeChrome()
    const collector = collectFrameStatus(1, 7, { timeoutMs: 5 })

    expect(fake.listenerCount()).toBe(1)
    collector.dispose()
    expect(fake.listenerCount()).toBe(0)
  })
})

describe("reportFrameStatus", () => {
  it("broadcasts the status with its request id", async () => {
    const fake = installFakeChrome()

    reportFrameStatus(7, ResponseStatus.Annotated)
    await Promise.resolve()

    expect(fake.sendMessage).toHaveBeenCalledWith({
      type: FRAME_STATUS_MESSAGE,
      requestId: 7,
      status: ResponseStatus.Annotated
    })
  })

  it("reports without a request id when no action asked", async () => {
    // A page annotated as it loads still has to reach the toolbar icon.
    const fake = installFakeChrome()

    reportFrameStatus(undefined, ResponseStatus.Annotated)
    await Promise.resolve()

    expect(fake.sendMessage).toHaveBeenCalledWith({
      type: FRAME_STATUS_MESSAGE,
      requestId: undefined,
      status: ResponseStatus.Annotated
    })
  })

  it("survives a send with no receiver", async () => {
    ;(globalThis as { chrome?: unknown }).chrome = {
      runtime: { sendMessage: () => Promise.reject(new Error("no receiver")) }
    }

    expect(() => reportFrameStatus(7, ResponseStatus.Annotated)).not.toThrow()
    await Promise.resolve()
  })

  it("survives a send that throws", () => {
    ;(globalThis as { chrome?: unknown }).chrome = {
      runtime: {
        sendMessage: () => {
          throw new Error("no receiver")
        }
      }
    }

    expect(() => reportFrameStatus(7, ResponseStatus.Annotated)).not.toThrow()
  })
})
