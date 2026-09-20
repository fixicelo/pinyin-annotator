import React, { useEffect, useState } from "react"

import { clearFirstRunNotice, shouldShowFirstRunNotice } from "~lib/first-run"
import { t, useI18n } from "~lib/i18n"

/**
 * A fresh install turns Auto-Annotate on, which is otherwise easy to miss on a
 * page that simply comes up annotated. The notice is shown once and dismissed
 * for good.
 */
const FirstRunNotice: React.FC = () => {
  useI18n()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let cancelled = false
    void shouldShowFirstRunNotice().then((shouldShow) => {
      if (!cancelled && shouldShow) {
        setIsVisible(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div className="notice" role="status">
      <div className="notice-head">
        <span className="notice-title">{t("firstRunTitle")}</span>
        <button
          className="btn btn-text notice-dismiss"
          onClick={() => {
            setIsVisible(false)
            void clearFirstRunNotice()
          }}>
          {t("firstRunDismiss")}
        </button>
      </div>
      <p className="notice-desc">{t("firstRunDesc")}</p>
    </div>
  )
}

export default FirstRunNotice
