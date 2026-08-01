import { useSyncExternalStore } from "react"

import { i18nFallback } from "~lib/i18n-fallback"

export const SUPPORTED_LOCALES = [
  "en",
  "zh_CN",
  "zh_TW",
  "vi",
  "es",
  "fr",
  "ja",
  "ko",
  "pt_BR",
  "ru",
  "de",
  "it"
] as const

export const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  zh_CN: "简体中文",
  zh_TW: "繁體中文",
  vi: "Tiếng Việt",
  es: "Español",
  fr: "Français",
  ja: "日本語",
  ko: "한국어",
  pt_BR: "Português (Brasil)",
  ru: "Русский",
  de: "Deutsch",
  it: "Italiano"
}

let uiLanguage = ""
let messages: Record<string, string> = {}
let version = 0
const listeners = new Set<() => void>()

function emit() {
  version++
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getVersion(): number {
  return version
}

export function getUILanguage(): string {
  return uiLanguage
}

function normalizeLang(lang: string): string {
  return lang.replace(/-/g, "_")
}

function expandLang(lang: string): string[] {
  const result: string[] = []
  const normalized = normalizeLang(lang)
  if (
    SUPPORTED_LOCALES.includes(normalized as (typeof SUPPORTED_LOCALES)[number])
  ) {
    result.push(normalized)
  }
  const base = normalized.split("_")[0]
  if (
    base !== normalized &&
    SUPPORTED_LOCALES.includes(base as (typeof SUPPORTED_LOCALES)[number])
  ) {
    result.push(base)
  }
  return result
}

function getBrowserLanguage(): string {
  try {
    return chrome.i18n?.getUILanguage?.() ?? ""
  } catch {
    return ""
  }
}

async function loadMessages(lang: string): Promise<Record<string, string>> {
  try {
    const url = chrome.runtime.getURL(`_locales/${lang}/messages.json`)
    const response = await fetch(url)
    if (!response.ok) {
      return {}
    }
    const json = await response.json()
    const map: Record<string, string> = {}
    for (const [key, value] of Object.entries(json)) {
      map[key] = (value as { message?: string }).message ?? ""
    }
    return map
  } catch {
    return {}
  }
}

async function refresh(): Promise<void> {
  const candidates: string[] = []
  for (const lang of expandLang(getBrowserLanguage())) {
    if (!candidates.includes(lang)) candidates.push(lang)
  }
  for (const lang of expandLang(uiLanguage)) {
    if (!candidates.includes(lang)) candidates.push(lang)
  }

  let merged: Record<string, string> = {}
  for (const lang of candidates) {
    const loaded = await loadMessages(lang)
    merged = { ...merged, ...loaded }
  }
  messages = merged
}

export async function applyLanguage(lang: string): Promise<void> {
  uiLanguage = lang
  await refresh()
  emit()
}

export function t(key: string, substitutions?: string | string[]): string {
  let value = messages[key] ?? i18nFallback[key] ?? key

  if (substitutions != null) {
    const args = Array.isArray(substitutions) ? substitutions : [substitutions]
    value = value.replace(
      /\$(\d+)/g,
      (match, index) => args[Number(index) - 1] ?? match
    )
  }

  return value
}

export function useI18n(): number {
  return useSyncExternalStore(subscribe, getVersion)
}
