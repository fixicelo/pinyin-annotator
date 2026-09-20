import React, { useCallback, useEffect, useRef, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import {
  ResponseStatus,
  StorageKey,
  TabStatus,
  UserAction,
  type Response
} from "~constants"
import { applyLanguage, t, useI18n } from "~lib/i18n"
import { useCommandShortcut } from "~lib/use-command-shortcut"

import AnnotationStatus from "./AnnotationStatus"
import AppearanceSection from "./AppearanceSection"
import AppTitle from "./AppTitle"
import AutoAnnotateOption from "./AutoAnnotateOption"
import ButtonGroup from "./ButtonGroup"
import FirstRunNotice from "./FirstRunNotice"
import HighlightedTextDisplay from "./HighlightedTextDisplay"
import MonitorModeOption from "./MonitorModeOption"
import { openOptionsPage } from "./openOptionsPage"
import { useTheme } from "./useTheme"

import "./popup.css"

import useCommunicateWithContentScript from "./useCommunicateWithContentScript"

function Popup() {
  useTheme()
  useI18n()

  const [uiLanguage] = useStorage<string>(StorageKey.uiLanguage, "")

  useEffect(() => {
    if (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) {
      document.documentElement.classList.add("is-mobile")
    }
  }, [])

  useEffect(() => {
    applyLanguage(uiLanguage)
  }, [uiLanguage])

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
  const shortcut = useCommandShortcut()

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

  const checkStatusRef = useRef(checkStatus)
  useEffect(() => {
    checkStatusRef.current = checkStatus
  }, [checkStatus])
  useEffect(() => {
    checkStatusRef.current()
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
      <FirstRunNotice />
      <AnnotationStatus
        isAnnotated={isAnnotated}
        tabStatus={tabStatus}
        onRefresh={handleRefresh}
      />

      <ButtonGroup
        isAnnotated={isAnnotated}
        communicateWithContentScript={communicateWithContentScript}
        disabled={!isAvailable}
      />

      <div className="card behavior-card">
        <MonitorModeOption
          communicateWithContentScript={communicateWithContentScript}
          disabled={!isAvailable}
        />
        <AutoAnnotateOption
          communicateWithContentScript={communicateWithContentScript}
          disabled={!isAvailable}
        />
      </div>

      <AppearanceSection
        communicateWithContentScript={communicateWithContentScript}
        onPreviewChange={handlePreviewChange}
        syncWithCurrentTab={isAvailable}
      />

      <HighlightedTextDisplay
        annotationScaleOverride={previewAnnotationScale}
        scaleTextTogetherOverride={previewScaleTextTogether}
      />

      <footer className="popup-footer">
        {shortcut ? (
          <span className="shortcut-hint">
            {t("optionsShortcutTitle")}
            <kbd className="keyboard">{shortcut}</kbd>
          </span>
        ) : (
          <span />
        )}
        <button className="btn btn-text" onClick={openOptionsPage}>
          {t("buttonOptions")}
        </button>
      </footer>
    </div>
  )
}

export default Popup
