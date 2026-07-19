import { useCallback, useEffect, useState } from "react"

import {
  ResponseStatus,
  TabStatus,
  UserAction,
  type Response
} from "~constants"

import AnnotationStatus from "./AnnotationStatus"
import AppTitle from "./AppTitle"
import AutoAnnotateOption from "./AutoAnnotateOption"
import ButtonGroup from "./ButtonGroup"
import HighlightedTextDisplay from "./HighlightedTextDisplay"
import MonitorModeOption from "./MonitorModeOption"
import { useTheme } from "./useTheme"

import "./popup.css"

import useCommunicateWithContentScript from "./useCommunicateWithContentScript"

function Popup() {
  useTheme()

  const [isAnnotated, setIsAnnotated] = useState(false)
  const [tabStatus, setTabStatus] = useState<TabStatus>(TabStatus.Loading)

  const communicateWithContentScript = useCommunicateWithContentScript(
    (response: Response) => {
      if (response) {
        setIsAnnotated(response.status === ResponseStatus.Annotated)
      }
    },
    setTabStatus
  )

  const isAvailable = tabStatus === TabStatus.Available

  const checkStatus = useCallback(() => {
    communicateWithContentScript(UserAction.Check, {})
  }, [communicateWithContentScript])

  useEffect(() => {
    checkStatus()
  }, [])

  const handleRefresh = useCallback(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab) return
    chrome.tabs.reload(tab.id)
    window.close()
  }, [])

  return (
    <div className="popup">
      <AppTitle />
      <AnnotationStatus
        isAnnotated={isAnnotated}
        tabStatus={tabStatus}
        onRefresh={handleRefresh}
      />

      {isAvailable && (
        <div
          className="card"
          style={{ marginBottom: "8px", padding: "0 16px" }}>
          <MonitorModeOption
            communicateWithContentScript={communicateWithContentScript}
          />
          <AutoAnnotateOption
            communicateWithContentScript={communicateWithContentScript}
          />
        </div>
      )}

      <ButtonGroup
        isAnnotated={isAnnotated}
        communicateWithContentScript={communicateWithContentScript}
        disabled={!isAvailable}
      />
      <HighlightedTextDisplay />
    </div>
  )
}

export default Popup
