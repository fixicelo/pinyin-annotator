import { addDict } from "pinyin-pro"
import ModernDictPath from "raw:@pinyin-pro/data/json/modern.json"

import { RESTRICTED_URL_PATTERNS, UserAction } from "~constants"

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

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-annotation") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      if (tab) {
        sendToggleToTab(tab.id, tab.url)
      }
    })
  }
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "toggle-annotation-context-menu",
    title: "Toggle Annotation",
    contexts: ["all"]
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "toggle-annotation-context-menu") {
    sendToggleToTab(tab.id, tab.url)
  }
})

fetch(ModernDictPath)
  .then((response) => response.json())
  .then((dict) => {
    addDict(dict)
  })
  .catch((error) => {
    console.error("Failed to load ModernDict", error)
  })
