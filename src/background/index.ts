import { Storage } from "@plasmohq/storage"

import {
  ResponseStatus,
  RESTRICTED_URL_PATTERNS,
  StorageKey,
  UserAction,
  type AnnotatorActionMessage
} from "~constants"
import { markFirstRunNotice } from "~lib/first-run"
import { collectFrameStatus, isFrameStatusReport } from "~lib/frame-status"
import { applyLanguage, t } from "~lib/i18n"
import {
  isTabAnnotationMessage,
  TabAnnotationRegistry
} from "~lib/tab-annotation"
import { saveUserPreferences } from "~lib/user-preferences"

const CONTEXT_MENU_ID = "toggle-annotation-context-menu"

/** Request ids only need to be unique among the actions this context starts. */
let nextRequestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)

/**
 * Which tabs were asked to annotate, so their later frames can join in. The
 * record outlives this worker in session storage; the browser clears it.
 */
const tabAnnotations = new TabAnnotationRegistry(chrome.storage?.session)

function isRestrictedUrl(url: string): boolean {
  if (!url) return true
  return RESTRICTED_URL_PATTERNS.some((pattern) => pattern.test(url))
}

/**
 * Puts the state of the tab on the toolbar icon. Without it the only way to
 * tell whether a page is annotated is to open the popup, which leaves a user
 * who just switched tabs guessing.
 */
function updateBadge(tabId: number, annotating: boolean) {
  void chrome.action?.setBadgeText({ tabId, text: annotating ? "拼" : "" })
  if (annotating) {
    void chrome.action?.setBadgeBackgroundColor({ tabId, color: "#2563eb" })
  }
}

/**
 * A fresh install annotates pages from the start rather than waiting to be
 * discovered in the popup, which is where an install that appears to do nothing
 * ends. A profile that already stored a choice keeps it.
 */
async function enableAnnotationsOnFirstRun() {
  const storage = new Storage()
  const stored = await storage.get<boolean>(StorageKey.autoAnnotate)
  if (stored !== undefined) {
    return
  }

  await saveUserPreferences(storage, { autoAnnotate: true })
  await markFirstRunNotice()
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
      const check: AnnotatorActionMessage = {
        action: UserAction.Check,
        requestId
      }
      await chrome.tabs.sendMessage(tabId, check)
    } catch {
      // Content script not injected — tab needs refresh; popup will show the message
      frameStatus.dispose()
      return
    }

    const isAnnotated = await frameStatus.resolve()
    frameStatus.dispose()
    await tabAnnotations.set(tabId, !isAnnotated)
    updateBadge(tabId, !isAnnotated)
    const action: AnnotatorActionMessage = {
      action: isAnnotated ? UserAction.Clear : UserAction.Annotate
    }
    await chrome.tabs.sendMessage(tabId, action)
  } catch {
    // The tab navigated away or closed between the two messages.
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // A frame that ended up annotated says so on its own, whatever asked for it —
  // an action, Monitor mode following a page, or Auto-Annotate. Only the
  // positive report moves the badge: a frame with no Chinese in it reports the
  // opposite and would otherwise fight the frame that has the captions.
  if (isFrameStatusReport(message) && sender.tab?.id !== undefined) {
    if (message.status === ResponseStatus.Annotated) {
      updateBadge(sender.tab.id, true)
    }
    return false
  }

  if (!isTabAnnotationMessage(message)) {
    return false
  }

  // Reading the record is asynchronous, so the channel stays open for the
  // answer. Reports resolve without one, which closes it just as well.
  void tabAnnotations
    .handleMessage(message, sender.tab?.id)
    .then((response) => sendResponse(response))
    .catch(() => sendResponse(undefined))
  return true
})

chrome.tabs.onRemoved?.addListener((tabId) => {
  void tabAnnotations.forget(tabId)
})

chrome.tabs.onUpdated?.addListener((tabId, changeInfo) => {
  // A top-level navigation is a new page, which starts unannotated like any
  // other first visit. Frames created inside it keep answering to this tab.
  if (changeInfo.status === "loading") {
    void tabAnnotations.forget(tabId)
    updateBadge(tabId, false)
  }
})

chrome.tabs.onActivated?.addListener(({ tabId }) => {
  void tabAnnotations.isAnnotating(tabId).then((annotating) => {
    updateBadge(tabId, annotating)
  })
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

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  const lang = await readUILanguage()
  await applyLanguage(lang)
  if (reason === "install") {
    await enableAnnotationsOnFirstRun()
  }
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
