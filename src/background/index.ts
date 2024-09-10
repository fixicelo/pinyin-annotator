import { UserAction } from "~constants"

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-annotation") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: UserAction.Toggle })
    })
  }
})
