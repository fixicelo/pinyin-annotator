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

fetch(ModernDictPath)
  .then((response) => response.json())
  .then((dict) => {
    addDict(dict)
  })
  .catch((error) => {
    console.error("Failed to load ModernDict", error)
  })
