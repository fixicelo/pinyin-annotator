import { UserAction, type Response, type UserPreferences } from "~constants"

const useCommunicateWithContentScript = (
  callback?: (response: Response) => void
) => {
  return async (action: UserAction, data: UserPreferences = {}) => {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      const response = await chrome.tabs.sendMessage(tabs[0].id, {
        action,
        data
      })
      callback && callback(response)
    } catch (error) {
      console.info("Error communicating with content script:", error)
    }
  }
}

export default useCommunicateWithContentScript
