import { useCallback } from "react"

import {
  RESTRICTED_URL_PATTERNS,
  TabStatus,
  UserAction,
  type Response,
  type UserPreferences
} from "~constants"

export function isRestrictedUrl(url: string | undefined): boolean {
  if (!url) return false
  return RESTRICTED_URL_PATTERNS.some((pattern) => pattern.test(url))
}

const useCommunicateWithContentScript = (
  callback?: (response: Response) => void,
  onTabStatusChange?: (status: TabStatus) => void
) => {
  return useCallback(
    async (action: UserAction, data: UserPreferences = {}) => {
      try {
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true
        })
        const tab = tabs[0]

        if (!tab?.id) {
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

        if (chrome.runtime.lastError) {
          throw new Error(chrome.runtime.lastError.message)
        }

        onTabStatusChange?.(TabStatus.Available)
        callback?.(response)
      } catch (error) {
        console.debug(
          "Content script communication failed:",
          error instanceof Error ? error.message : error
        )
        onTabStatusChange?.(TabStatus.NeedsRefresh)
      }
    },
    [callback, onTabStatusChange]
  )
}

export default useCommunicateWithContentScript
