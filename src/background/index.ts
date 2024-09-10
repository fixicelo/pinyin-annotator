import { UserAction } from "~constants"
import { convertTextContentToHtml } from "~util"

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "requestAnnotation") {
    const html = convertTextContentToHtml(request.text, request.htmlOptions)
    sendResponse({ action: "receiveAnnotation", html })
  }
  return true
})

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-annotation") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: UserAction.Toggle })
    })
  }
})
