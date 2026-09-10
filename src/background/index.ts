import { RESTRICTED_URL_PATTERNS, StorageKey, UserAction } from "~constants"
import { applyLanguage, t } from "~lib/i18n"

const CONTEXT_MENU_ID = "toggle-annotation-context-menu"

function isRestrictedUrl(url: string): boolean {
  if (!url) return true
  return RESTRICTED_URL_PATTERNS.some((pattern) => pattern.test(url))
}

async function sendToggleToTab(tabId: number, tabUrl?: string) {
  if (isRestrictedUrl(tabUrl)) {
    return
  }
  try {
    await chrome.tabs.sendMessage(tabId, { action: UserAction.Toggle })
  } catch {
    // Content script not injected — tab needs refresh; popup will show the message
  }
}

function deserializeLanguage(raw: unknown): string {
  if (typeof raw !== "string") return ""
  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === "string" ? parsed : ""
  } catch {
    return ""
  }
}

function readUILanguage(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(StorageKey.uiLanguage, (result) => {
      resolve(deserializeLanguage(result[StorageKey.uiLanguage]))
    })
  })
}

function updateContextMenuTitle() {
  try {
    chrome.contextMenus
      ?.update?.(CONTEXT_MENU_ID, {
        title: t("contextMenuToggle")
      })
      ?.catch?.(() => {})
  } catch {
    // Menu item may not exist yet (e.g., before onInstalled creates it).
  }
}

async function syncUILanguage(lang?: string) {
  const resolved = lang ?? (await readUILanguage())
  await applyLanguage(resolved)
  updateContextMenuTitle()
}

chrome.commands?.onCommand?.addListener((command) => {
  if (command === "toggle-annotation") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      if (tab) {
        sendToggleToTab(tab.id, tab.url)
      }
    })
  }
})

chrome.runtime.onInstalled.addListener(async () => {
  const lang = await readUILanguage()
  await applyLanguage(lang)
  chrome.contextMenus?.create({
    id: CONTEXT_MENU_ID,
    title: t("contextMenuToggle"),
    contexts: ["all"]
  })
})

chrome.contextMenus?.onClicked?.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID) {
    sendToggleToTab(tab.id, tab.url)
  }
})

chrome.storage.onChanged?.addListener((changes, area) => {
  if (area === "sync" && changes[StorageKey.uiLanguage]) {
    syncUILanguage(deserializeLanguage(changes[StorageKey.uiLanguage].newValue))
  }
})
