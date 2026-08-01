import { describe, expect, it, vi } from "vitest"

import type { Storage } from "@plasmohq/storage"

import {
  PronunciationSystem,
  RubyPosition,
  StorageKey,
  ToneType
} from "~constants"
import { loadUserPreferences, saveUserPreferences } from "~lib/user-preferences"

function createMockStorage(initial: Record<string, unknown> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    get: vi.fn(async (key: string) => data.get(key)),
    set: vi.fn(async (key: string, value: unknown) => {
      data.set(key, value)
    })
  } as unknown as Storage
}

describe("loadUserPreferences", () => {
  it("returns empty values when nothing is stored", async () => {
    const storage = createMockStorage()
    const prefs = await loadUserPreferences(storage)
    expect(prefs).toMatchObject({
      toneType: undefined,
      pronunciationSystem: undefined,
      ignoredNodes: []
    })
  })

  it("reads stored values", async () => {
    const storage = createMockStorage({
      [StorageKey.toneType]: ToneType.Symbol,
      [StorageKey.pronunciationSystem]: PronunciationSystem.Zhuyin,
      [StorageKey.observerEnabled]: false,
      [StorageKey.rubyPosition]: RubyPosition.RIGHT,
      [StorageKey.autoAnnotate]: true,
      [StorageKey.annotationScale]: 175,
      [StorageKey.scaleTextTogether]: true,
      [StorageKey.scaleTextTogetherTouched]: true,
      [StorageKey.ignoredNodes]: ["CODE", "PRE"]
    })
    const prefs = await loadUserPreferences(storage)
    expect(prefs).toMatchObject({
      toneType: ToneType.Symbol,
      pronunciationSystem: PronunciationSystem.Zhuyin,
      observerEnabled: false,
      rubyPosition: RubyPosition.RIGHT,
      autoAnnotate: true,
      annotationScale: 175,
      scaleTextTogether: true,
      scaleTextTogetherTouched: true,
      ignoredNodes: ["CODE", "PRE"]
    })
  })
})

describe("saveUserPreferences", () => {
  it("persists only the provided keys", async () => {
    const storage = createMockStorage()
    await saveUserPreferences(storage, {
      toneType: ToneType.None,
      autoAnnotate: true
    })

    expect(storage.set).toHaveBeenCalledWith(StorageKey.toneType, ToneType.None)
    expect(storage.set).toHaveBeenCalledWith(StorageKey.autoAnnotate, true)
    expect(storage.set).not.toHaveBeenCalledWith(
      StorageKey.pronunciationSystem,
      expect.anything()
    )
    expect(storage.set).not.toHaveBeenCalledWith(
      StorageKey.rubyPosition,
      expect.anything()
    )
  })

  it("does nothing when no keys are provided", async () => {
    const storage = createMockStorage()
    await saveUserPreferences(storage, {})
    expect(storage.set).not.toHaveBeenCalled()
  })
})
