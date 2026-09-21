import React, { useCallback, useEffect, useRef, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import {
  ResponseStatus,
  StorageKey,
  TabStatus,
  UserAction,
  type Response
} from "~constants"
import { applyLanguage, useI18n } from "~lib/i18n"
import { useCommandShortcut } from "~lib/use-command-shortcut"

import { openOptionsPage } from "./openOptionsPage"
import PopupView from "./PopupView"
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
    <PopupView
      isAnnotated={isAnnotated}
      tabStatus={tabStatus}
      shortcut={shortcut}
      onRefresh={handleRefresh}
      onOpenOptions={openOptionsPage}
      communicateWithContentScript={communicateWithContentScript}
      onPreviewChange={handlePreviewChange}
      previewAnnotationScale={previewAnnotationScale}
      previewScaleTextTogether={previewScaleTextTogether}
    />
  )
}

export default Popup
