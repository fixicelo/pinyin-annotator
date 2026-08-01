import { useCallback, useEffect, useState } from "react"

import {
  ResponseStatus,
  TabStatus,
  UserAction,
  type Response
} from "~constants"

import AnnotationScaleControl from "./AnnotationScaleControl"
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

  useEffect(() => {
    if (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) {
      document.documentElement.classList.add("is-mobile")
    }
  }, [])

  const [isAnnotated, setIsAnnotated] = useState(false)
  const [tabStatus, setTabStatus] = useState<TabStatus>(TabStatus.Loading)
  const [previewAnnotationScale, setPreviewAnnotationScale] = useState<number>()
  const [previewScaleTextTogether, setPreviewScaleTextTogether] =
    useState<boolean>()

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

  const handlePreviewChange = useCallback(
    ({
      annotationScale,
      scaleTextTogether
    }: {
      annotationScale: number
      scaleTextTogether: boolean
    }) => {
      setPreviewAnnotationScale(annotationScale)
      setPreviewScaleTextTogether(scaleTextTogether)
    },
    []
  )

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
      <AnnotationScaleControl
        communicateWithContentScript={communicateWithContentScript}
        onPreviewChange={handlePreviewChange}
        syncWithCurrentTab={isAvailable}
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
      <HighlightedTextDisplay
        annotationScaleOverride={previewAnnotationScale}
        scaleTextTogetherOverride={previewScaleTextTogether}
      />
    </div>
  )
}

export default Popup
