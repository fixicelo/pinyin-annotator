import { describe, expect, it } from "vitest"

import {
  TAB_ANNOTATION_MESSAGE,
  TAB_ANNOTATION_QUERY,
  type TabAnnotationQuery,
  type TabAnnotationReport
} from "~constants"
import { TabAnnotationRegistry } from "~lib/tab-annotation"

const query: TabAnnotationQuery = { type: TAB_ANNOTATION_QUERY }

function report(annotating: boolean, tabId?: number): TabAnnotationReport {
  return { type: TAB_ANNOTATION_MESSAGE, annotating, tabId }
}

describe("TabAnnotationRegistry", () => {
  it("remembers the tab that was asked to annotate", () => {
    const registry = new TabAnnotationRegistry()

    registry.set(7, true)

    expect(registry.isAnnotating(7)).toBe(true)
    expect(registry.isAnnotating(8)).toBe(false)
  })

  it("answers a frame asking about its own tab", () => {
    const registry = new TabAnnotationRegistry()
    registry.set(7, true)

    expect(registry.handleMessage(query, 7)).toEqual({ annotating: true })
    expect(registry.handleMessage(query, 8)).toEqual({ annotating: false })
  })

  it("answers no when the sender has no tab", () => {
    const registry = new TabAnnotationRegistry()

    expect(registry.handleMessage(query, undefined)).toEqual({
      annotating: false
    })
  })

  it("records what an extension page reports for its tab", () => {
    const registry = new TabAnnotationRegistry()

    registry.handleMessage(report(true, 7), undefined)

    expect(registry.isAnnotating(7)).toBe(true)
  })

  it("records what a frame reports for the tab it belongs to", () => {
    const registry = new TabAnnotationRegistry()

    registry.handleMessage(report(true), 7)
    expect(registry.isAnnotating(7)).toBe(true)

    registry.handleMessage(report(false), 7)
    expect(registry.isAnnotating(7)).toBe(false)
  })

  it("forgets a tab once it closes or navigates", () => {
    const registry = new TabAnnotationRegistry()
    registry.set(7, true)

    registry.forget(7)

    expect(registry.isAnnotating(7)).toBe(false)
  })

  it("ignores messages it does not own", () => {
    const registry = new TabAnnotationRegistry()

    expect(
      registry.handleMessage({ type: "something-else" }, 7)
    ).toBeUndefined()
    expect(registry.handleMessage(null, 7)).toBeUndefined()
    expect(
      registry.handleMessage({ type: TAB_ANNOTATION_MESSAGE }, 7)
    ).toBeUndefined()
    expect(registry.handleMessage(report(true), undefined)).toBeUndefined()
    expect(registry.isAnnotating(7)).toBe(false)
  })
})
