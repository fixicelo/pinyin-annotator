import { useCallback, useEffect, useRef } from "react"

import {
  ResponseStatus,
  RESTRICTED_URL_PATTERNS,
  TAB_ANNOTATION_MESSAGE,
  TabStatus,
  UserAction,
  type Response,
  type UserPreferences
} from "~constants"
import {
  collectFrameStatus,
  type FrameStatusCollector
} from "~lib/frame-status"

export function isRestrictedUrl(url: string | undefined): boolean {
  if (!url) return false
  return RESTRICTED_URL_PATTERNS.some((pattern) => pattern.test(url))
}

async function isDocumentAnnotatable(tabId: number): Promise<boolean> {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        try {
          return document.contentType ?? ""
        } catch {
          return ""
        }
      }
    })
    const contentType = results?.[0]?.result as string | undefined
    return typeof contentType === "string" && /html|xml/i.test(contentType)
  } catch {
    return false
  }
}

const useCommunicateWithContentScript = (
  callback?: (response: Response) => void,
  onTabStatusChange?: (status: TabStatus) => void
) => {
  const latestRequestId = useRef(0)
  const activeFrameStatus = useRef<FrameStatusCollector | null>(null)

  useEffect(
    () => () => {
      activeFrameStatus.current?.dispose()
      activeFrameStatus.current = null
    },
    []
  )

  const publishStatus = useCallback(
    (requestId: number, isAnnotated: boolean) => {
      // A newer action has superseded this one.
      if (requestId !== latestRequestId.current) {
        return
      }
      callback?.({
        status: isAnnotated
          ? ResponseStatus.Annotated
          : ResponseStatus.NotAnnotated
      })
    },
    [callback]
  )

  return useCallback(
    async (action: UserAction, data: UserPreferences = {}) => {
      let tab: chrome.tabs.Tab | undefined
      try {
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true
        })
        tab = tabs[0]

        if (!tab?.id) {
          onTabStatusChange?.(TabStatus.RestrictedPage)
          return
        }

        if (isRestrictedUrl(tab.url)) {
          onTabStatusChange?.(TabStatus.RestrictedPage)
          return
        }

        const requestId = ++latestRequestId.current
        activeFrameStatus.current?.dispose()
        const frameStatus = collectFrameStatus(tab.id, requestId, {
          onAnnotated: () => publishStatus(requestId, true)
        })
        activeFrameStatus.current = frameStatus

        // Recorded before delivery: a frame that is not ready yet — the player
        // iframe a streaming site creates later — reads it when it starts.
        if (action === UserAction.Annotate || action === UserAction.Clear) {
          void chrome.runtime
            .sendMessage({
              type: TAB_ANNOTATION_MESSAGE,
              annotating: action === UserAction.Annotate,
              tabId: tab.id
            })
            .catch(() => {})
        }

        let response: Response | undefined
        try {
          response = await chrome.tabs.sendMessage(tab.id, {
            action,
            data,
            requestId
          })
        } catch (error) {
          frameStatus.dispose()
          if (activeFrameStatus.current === frameStatus) {
            activeFrameStatus.current = null
          }
          throw error
        }

        if (response) {
          frameStatus.record(response.status)
        }
        onTabStatusChange?.(TabStatus.Available)
        // A response only carries one frame's answer, so the merged value is
        // what gets published. Frames that answer later report themselves.
        publishStatus(requestId, frameStatus.isAnnotated())
      } catch (error) {
        console.debug(
          "Content script communication failed:",
          error instanceof Error ? error.message : error
        )
        if (!tab?.id) {
          onTabStatusChange?.(TabStatus.RestrictedPage)
          return
        }
        const annotatable = await isDocumentAnnotatable(tab.id)
        onTabStatusChange?.(
          annotatable ? TabStatus.NeedsRefresh : TabStatus.RestrictedPage
        )
      }
    },
    [onTabStatusChange, publishStatus]
  )
}

export default useCommunicateWithContentScript
