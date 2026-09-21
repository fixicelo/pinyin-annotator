import React from "react"

import { TabStatus, UserAction, type UserPreferences } from "~constants"
import { t, useI18n } from "~lib/i18n"

import AnnotationStatus from "./AnnotationStatus"
import AppearanceSection from "./AppearanceSection"
import AppTitle from "./AppTitle"
import AutoAnnotateOption from "./AutoAnnotateOption"
import ButtonGroup from "./ButtonGroup"
import FollowChangesOption from "./FollowChangesOption"
import HighlightedTextDisplay from "./HighlightedTextDisplay"

export interface PopupViewProps {
  isAnnotated: boolean
  tabStatus: TabStatus
  shortcut: string
  onRefresh: () => void
  onOpenOptions: () => void
  communicateWithContentScript: (
    action: UserAction,
    data?: UserPreferences
  ) => void
  onPreviewChange?: (preview: {
    annotationScale: number
    scaleTextTogether: boolean
  }) => void
  previewAnnotationScale?: number
  previewScaleTextTogether?: boolean
}

/**
 * Everything the popup shows, with the wiring left to the caller.
 *
 * The guide draws the same component, so what a new reader is shown is the
 * panel itself rather than a picture of it — and it cannot drift out of date.
 */
const PopupView: React.FC<PopupViewProps> = ({
  isAnnotated,
  tabStatus,
  shortcut,
  onRefresh,
  onOpenOptions,
  communicateWithContentScript,
  onPreviewChange,
  previewAnnotationScale,
  previewScaleTextTogether
}) => {
  useI18n()
  const isAvailable = tabStatus === TabStatus.Available

  return (
    <div className="popup">
      <AppTitle />

      <AnnotationStatus
        isAnnotated={isAnnotated}
        tabStatus={tabStatus}
        onRefresh={onRefresh}
      />

      <ButtonGroup
        isAnnotated={isAnnotated}
        communicateWithContentScript={communicateWithContentScript}
        disabled={!isAvailable}
      />

      <div className="card behavior-card">
        <FollowChangesOption
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
        onPreviewChange={onPreviewChange}
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
        <button className="btn btn-text" onClick={onOpenOptions}>
          {t("buttonOptions")}
        </button>
      </footer>
    </div>
  )
}

export default PopupView
