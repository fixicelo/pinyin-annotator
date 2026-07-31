import type { Storage } from "@plasmohq/storage"

import {
  PronunciationSystem,
  RubyPosition,
  StorageKey,
  ToneType,
  type UserPreferences
} from "~constants"

type StoredPreferences = UserPreferences & { ignoredNodes: string[] }

export async function loadUserPreferences(
  storage: Storage
): Promise<StoredPreferences> {
  const [
    toneType,
    pronunciationSystem,
    observerEnabled,
    rubyPosition,
    autoAnnotate,
    annotationScale,
    scaleTextTogether,
    scaleTextTogetherTouched,
    ignoredNodes
  ] = await Promise.all([
    storage.get<ToneType>(StorageKey.toneType),
    storage.get<PronunciationSystem>(StorageKey.pronunciationSystem),
    storage.get<boolean>(StorageKey.observerEnabled),
    storage.get<RubyPosition>(StorageKey.rubyPosition),
    storage.get<boolean>(StorageKey.autoAnnotate),
    storage.get<number>(StorageKey.annotationScale),
    storage.get<boolean>(StorageKey.scaleTextTogether),
    storage.get<boolean>(StorageKey.scaleTextTogetherTouched),
    storage.get<string[]>(StorageKey.ignoredNodes)
  ])

  return {
    toneType,
    pronunciationSystem,
    observerEnabled,
    rubyPosition,
    autoAnnotate,
    annotationScale,
    scaleTextTogether,
    scaleTextTogetherTouched,
    ignoredNodes: ignoredNodes || []
  }
}

export async function saveUserPreferences(
  storage: Storage,
  options: UserPreferences
) {
  if (options?.toneType !== undefined) {
    await storage.set(StorageKey.toneType, options.toneType)
  }
  if (options?.pronunciationSystem !== undefined) {
    await storage.set(
      StorageKey.pronunciationSystem,
      options.pronunciationSystem
    )
  }
  if (options?.observerEnabled !== undefined) {
    await storage.set(StorageKey.observerEnabled, options.observerEnabled)
  }
  if (options?.autoAnnotate !== undefined) {
    await storage.set(StorageKey.autoAnnotate, options.autoAnnotate)
  }
  if (options?.rubyPosition !== undefined) {
    await storage.set(StorageKey.rubyPosition, options.rubyPosition)
  }
  if (options?.annotationScale !== undefined) {
    await storage.set(StorageKey.annotationScale, options.annotationScale)
  }
  if (options?.scaleTextTogether !== undefined) {
    await storage.set(StorageKey.scaleTextTogether, options.scaleTextTogether)
  }
  if (options?.scaleTextTogetherTouched !== undefined) {
    await storage.set(
      StorageKey.scaleTextTogetherTouched,
      options.scaleTextTogetherTouched
    )
  }
}
