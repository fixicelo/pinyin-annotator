import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { StorageKey, type UserAction, type UserPreferences } from "~constants"
import {
  ANNOTATION_SCALE_DEFAULT,
  clampAnnotationScale
} from "~lib/annotation-scale"
import { t, useI18n } from "~lib/i18n"

import AnnotationScaleControl from "./AnnotationScaleControl"

interface AppearanceSectionProps {
  communicateWithContentScript: (
    action: UserAction,
    data?: UserPreferences
  ) => void
  onPreviewChange?: (preview: {
    annotationScale: number
    scaleTextTogether: boolean
  }) => void
  syncWithCurrentTab: boolean
}

/**
 * The reading size and its preview, folded away: someone opening the popup for
 * the first time is looking for the annotation, not for a slider.
 */
const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  communicateWithContentScript,
  onPreviewChange,
  syncWithCurrentTab
}) => {
  useI18n()
  const [annotationScale] = useStorage<number>(
    StorageKey.annotationScale,
    ANNOTATION_SCALE_DEFAULT
  )

  return (
    <details className="appearance">
      <summary>
        <span>{t("optionsAppearanceTitle")}</span>
        <span className="appearance-value">
          {clampAnnotationScale(annotationScale)}%
        </span>
      </summary>
      <div className="appearance-body">
        <AnnotationScaleControl
          embedded
          communicateWithContentScript={communicateWithContentScript}
          onPreviewChange={onPreviewChange}
          syncWithCurrentTab={syncWithCurrentTab}
        />
      </div>
    </details>
  )
}

export default AppearanceSection
