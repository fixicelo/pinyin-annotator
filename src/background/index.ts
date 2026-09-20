import { RESTRICTED_URL_PATTERNS, StorageKey, UserAction } from "~constants"
import { collectFrameStatus } from "~lib/frame-status"
import { applyLanguage, t } from "~lib/i18n"
import { TabAnnotationRegistry } from "~lib/tab-annotation"

const CONTEXT_MENU_ID = "toggle-annotation-context-menu"

/** Request ids only need to be unique among the actions this context starts. */
let nextRequestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)

/** Which tabs were asked to annotate, so their later frames can join in. */
const tabAnnotations = new TabAnnotationRegistry()

function isRestrictedUrl(url: string): boolean {
  if (!url) return true
  return RESTRICTED_URL_PATTERNS.some((pattern) => pattern.test(url))
}

/**
 * Toggles every frame of the tab together.
 *
 * A bare "toggle" is decided by each frame on its own, which leaves the page in
 * both states at once when the page's Chinese text lives in a player iframe and
 * the top frame has none: the top frame's own annotate is a no-op, so it always
 * chooses to annotate and never reaches the clear that the captions need.
 * Asking the frames for their status first keeps them consistent.
 */
async function sendToggleToTab(tabId: number, tabUrl?: string) {
  if (isRestrictedUrl(tabUrl)) {
    return
  }
  try {
    const requestId = ++nextRequestId
    const frameStatus = collectFrameStatus(tabId, requestId)
    try {
      await chrome.tabs.sendMessage(tabId, {
        action: UserAction.Check,
        requestId
      })
    } catch {
      // Content script not injected — tab needs refresh; popup will show the message
      frameStatus.dispose()
      return
    }

    const isAnnotated = await frameStatus.resolve()
    frameStatus.dispose()
    tabAnnotations.set(tabId, !isAnnotated)
    await chrome.tabs.sendMessage(tabId, {
      action: isAnnotated ? UserAction.Clear : UserAction.Annotate
    })
  } catch {
    // The tab navigated away or closed between the two messages.
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Extension pages have no tab of their own and pass one along instead.
  const tabId = sender.tab?.id ?? message?.tabId
  const response = tabAnnotations.handleMessage(message, tabId)
  if (response) {
    sendResponse(response)
  }
})

chrome.tabs.onRemoved?.addListener((tabId) => tabAnnotations.forget(tabId))

chrome.tabs.onUpdated?.addListener((tabId, changeInfo) => {
  // A top-level navigation is a new page, which starts unannotated like any
  // other first visit. Frames created inside it keep answering to this tab.
  if (changeInfo.status === "loading") {
    tabAnnotations.forget(tabId)
  }
})

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
