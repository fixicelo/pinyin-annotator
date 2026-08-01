import { memo } from "react"

import { TabStatus } from "~constants"
import { t, useI18n } from "~lib/i18n"

interface AnnotationStatusProps {
  isAnnotated: boolean
  tabStatus: TabStatus
  onRefresh?: () => void
}

const AnnotationStatus = memo(
  ({ isAnnotated, tabStatus, onRefresh }: AnnotationStatusProps) => {
    useI18n()
    if (tabStatus === TabStatus.RestrictedPage) {
      return (
        <div className="alert alert-warning">
          <div>
            <div className="alert-title">{t("statusRestrictedTitle")}</div>
            <div className="alert-desc">{t("statusRestrictedDesc")}</div>
          </div>
        </div>
      )
    }

    if (tabStatus === TabStatus.NeedsRefresh) {
      return (
        <div className="alert alert-info">
          <div>
            <div className="alert-title">{t("statusRefreshTitle")}</div>
            <div className="alert-desc">
              {t("statusRefreshDesc")}
              <div style={{ marginTop: "8px" }}>
                <a onClick={onRefresh} className="refresh-link btn-text">
                  {t("statusRefreshAction")}
                </a>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <p className={`status ${isAnnotated ? "annotated" : "not-annotated"}`}>
        {t("statusLabel")}:{" "}
        {t(isAnnotated ? "statusAnnotated" : "statusNotAnnotated")}
      </p>
    )
  }
)

export default AnnotationStatus
