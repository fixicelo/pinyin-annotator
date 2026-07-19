import type { Storage } from "@plasmohq/storage"

import {
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
    toneTypeResult,
    observerEnabledResult,
    rubyPositionResult,
    autoAnnotateResult,
    ignoredNodesResult
  ] = await Promise.all([
    storage.get(StorageKey.toneType),
    storage.get(StorageKey.observerEnabled),
    storage.get(StorageKey.rubyPosition),
    storage.get(StorageKey.autoAnnotate),
    storage.get<string[]>(StorageKey.ignoredNodes)
  ])

  return {
    toneType: toneTypeResult as ToneType,
    observerEnabled: observerEnabledResult as unknown as boolean,
    rubyPosition: rubyPositionResult as RubyPosition,
    autoAnnotate: autoAnnotateResult as unknown as boolean,
    ignoredNodes: (ignoredNodesResult as string[]) || []
  }
}

export async function saveUserPreferences(
  storage: Storage,
  options: UserPreferences
) {
  if (options?.toneType !== undefined) {
    await storage.set(StorageKey.toneType, options.toneType)
  }
  if (options?.observerEnabled !== undefined) {
    await storage.set(StorageKey.observerEnabled, options.observerEnabled)
  }
  if (options?.autoAnnotate !== undefined) {
    await storage.set(StorageKey.autoAnnotate, options.autoAnnotate)
  }
}
