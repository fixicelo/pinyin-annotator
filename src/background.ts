import { convertTextContentToHtml } from "~util"

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "requestAnnotation") {
    const html = convertTextContentToHtml(request.text, request.htmlOptions)
    sendResponse({ action: "receiveAnnotation", html })
  }
  return true
})
