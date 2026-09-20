import { describe, expect, it } from "vitest"

import {
  TAB_ANNOTATION_MESSAGE,
  TAB_ANNOTATION_QUERY,
  type TabAnnotationQuery,
  type TabAnnotationReport
} from "~constants"
import {
  isTabAnnotationMessage,
  TabAnnotationRegistry,
  type SessionStorageArea
} from "~lib/tab-annotation"

/** The key the registry persists under. */
const STORAGE_KEY = "pya-annotating-tabs"

const query: TabAnnotationQuery = { type: TAB_ANNOTATION_QUERY }

function report(annotating: boolean, tabId?: number): TabAnnotationReport {
  return { type: TAB_ANNOTATION_MESSAGE, annotating, tabId }
}

/** Stands in for chrome.storage.session, which outlives the service worker. */
function createStorage(initial: number[] = []) {
  const data: Record<string, unknown> = { [STORAGE_KEY]: initial }
  const area: SessionStorageArea & { data: Record<string, unknown> } = {
    data,
    get: async (key: string) => ({ [key]: data[key] }),
    set: async (items: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(items)) {
        data[key] = value
      }
    }
  }
  return area
}

function storedTabs(area: { data: Record<string, unknown> }): unknown {
  return area.data[STORAGE_KEY]
}

describe("TabAnnotationRegistry", () => {
  it("remembers the tab that was asked to annotate", async () => {
    const registry = new TabAnnotationRegistry(createStorage())

    await registry.set(7, true)

    await expect(registry.isAnnotating(7)).resolves.toBe(true)
    await expect(registry.isAnnotating(8)).resolves.toBe(false)
  })

  it("answers a frame asking about its own tab", async () => {
    const registry = new TabAnnotationRegistry(createStorage())
    await registry.set(7, true)

    await expect(registry.handleMessage(query, 7)).resolves.toEqual({
      annotating: true
    })
    await expect(registry.handleMessage(query, 8)).resolves.toEqual({
      annotating: false
    })
  })

  it("answers no when the sender has no tab", async () => {
    const registry = new TabAnnotationRegistry(createStorage())

    await expect(registry.handleMessage(query, undefined)).resolves.toEqual({
      annotating: false
    })
  })

  it("records what an extension page reports for its tab", async () => {
    const registry = new TabAnnotationRegistry(createStorage())

    await registry.handleMessage(report(true, 7), undefined)

    await expect(registry.isAnnotating(7)).resolves.toBe(true)
  })

  it("records what a frame reports for the tab it belongs to", async () => {
    const registry = new TabAnnotationRegistry(createStorage())

    await registry.handleMessage(report(true), 7)
    await expect(registry.isAnnotating(7)).resolves.toBe(true)

    await registry.handleMessage(report(false), 7)
    await expect(registry.isAnnotating(7)).resolves.toBe(false)
  })

  it("resolves without a response for a report", async () => {
    const registry = new TabAnnotationRegistry(createStorage())

    await expect(
      registry.handleMessage(report(true), 7)
    ).resolves.toBeUndefined()
  })

  it("forgets a tab once it closes or navigates", async () => {
    const storage = createStorage()
    const registry = new TabAnnotationRegistry(storage)
    await registry.set(7, true)

    await registry.forget(7)

    await expect(registry.isAnnotating(7)).resolves.toBe(false)
    expect(storedTabs(storage)).toEqual([])
  })

  it("keeps the record across a service worker restart", async () => {
    // The background worker is stopped when it goes idle, and the player iframe
    // that asks afterwards has to find the request still there.
    const storage = createStorage()
    await new TabAnnotationRegistry(storage).set(7, true)

    const restarted = new TabAnnotationRegistry(storage)

    await expect(restarted.isAnnotating(7)).resolves.toBe(true)
    await expect(restarted.handleMessage(query, 7)).resolves.toEqual({
      annotating: true
    })
  })

  it("merges with what is already stored before writing", async () => {
    // Recording a request for one tab must not drop another tab's record.
    const storage = createStorage([7])

    await new TabAnnotationRegistry(storage).set(8, true)

    expect(storedTabs(storage)).toEqual([7, 8])
  })

  it("writes nothing when the request is already recorded", async () => {
    const storage = createStorage()
    const registry = new TabAnnotationRegistry(storage)
    await registry.set(7, true)
    const recorded = storedTabs(storage)

    await registry.set(7, true)

    expect(storedTabs(storage)).toBe(recorded)
  })

  it("works without a storage area", async () => {
    const registry = new TabAnnotationRegistry()

    await registry.set(7, true)

    await expect(registry.isAnnotating(7)).resolves.toBe(true)
  })

  it("ignores messages it does not own", async () => {
    const registry = new TabAnnotationRegistry(createStorage())

    await expect(
      registry.handleMessage({ type: "something-else" }, 7)
    ).resolves.toBeUndefined()
    await expect(registry.handleMessage(null, 7)).resolves.toBeUndefined()
    await expect(
      registry.handleMessage({ type: TAB_ANNOTATION_MESSAGE }, 7)
    ).resolves.toBeUndefined()
    await expect(
      registry.handleMessage(report(true), undefined)
    ).resolves.toBeUndefined()

    await expect(registry.isAnnotating(7)).resolves.toBe(false)

    expect(isTabAnnotationMessage(query)).toBe(true)
    expect(isTabAnnotationMessage({ type: "something-else" })).toBe(false)
  })
})
