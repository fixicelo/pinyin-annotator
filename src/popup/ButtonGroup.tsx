import React, { useCallback } from "react"

import { UserAction } from "~constants"

interface ButtonGroupProps {
  isAnnotated: boolean
  communicateWithContentScript: (action: UserAction, payload?: any) => void
  disabled?: boolean
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  isAnnotated,
  communicateWithContentScript,
  disabled = false
}) => {
  const performAnnotation = useCallback(
    () => communicateWithContentScript(UserAction.Annotate),
    [communicateWithContentScript]
  )
  const removeAnnotations = useCallback(
    () => communicateWithContentScript(UserAction.Clear),
    [communicateWithContentScript]
  )

  const openOptionsPage = async () => {
    let opened = false
    try {
      const url = chrome.runtime.getURL("options.html")
      const existingTabs = await chrome.tabs.query({ url })
      const existingTab = existingTabs.find((tab) => tab.id != null)
      const tab =
        existingTab ?? (await chrome.tabs.create({ url, active: true }))
      if (tab?.id) {
        await chrome.tabs.update(tab.id, { active: true })
        opened = true
      }
      if (opened && tab.windowId && chrome.windows?.update) {
        await chrome.windows.update(tab.windowId, { focused: true })
      }
    } catch (error) {
      if (!opened) {
        chrome.runtime.openOptionsPage()
      }
    } finally {
      if (opened) window.close()
    }
  }

  return (
    <div className="flex gap-md justify-end">
      <button className="btn btn-text" onClick={openOptionsPage}>
        Options
      </button>
      <button
        className="btn btn-outlined"
        onClick={removeAnnotations}
        disabled={disabled || !isAnnotated}>
        Clear
      </button>
      <button
        className="btn btn-primary"
        onClick={performAnnotation}
        disabled={disabled}>
        Annotate
      </button>
    </div>
  )
}

export default ButtonGroup
