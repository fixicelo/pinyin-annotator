import { addDict } from "pinyin-pro"
import ModernDictPath from "raw:@pinyin-pro/data/json/modern.json"

import { UserAction } from "~constants"

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-annotation") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: UserAction.Toggle })
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
    chrome.tabs.sendMessage(tab.id, { action: UserAction.Toggle })
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
