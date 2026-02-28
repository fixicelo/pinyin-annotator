import {
  RESTRICTED_URL_PATTERNS,
  TabStatus,
  UserAction,
  type Response,
  type UserPreferences
} from "~constants"

export function isRestrictedUrl(url: string): boolean {
  if (!url) return true
  return RESTRICTED_URL_PATTERNS.some((pattern) => pattern.test(url))
}

const useCommunicateWithContentScript = (
  callback?: (response: Response) => void,
  onTabStatusChange?: (status: TabStatus) => void
) => {
  return async (action: UserAction, data: UserPreferences = {}) => {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      const tab = tabs[0]

      if (!tab) {
        onTabStatusChange?.(TabStatus.RestrictedPage)
        return
      }

      if (isRestrictedUrl(tab.url)) {
        onTabStatusChange?.(TabStatus.RestrictedPage)
        return
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        action,
        data
      })
      onTabStatusChange?.(TabStatus.Available)
      callback?.(response)
    } catch (error) {
      console.info("Error communicating with content script:", error)
      onTabStatusChange?.(TabStatus.NeedsRefresh)
    }
  }
}

export default useCommunicateWithContentScript
