import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { StorageKey, UserAction, type UserPreferences } from "~constants"
import { t, useI18n } from "~lib/i18n"

interface MonitorModeOptionProps {
  communicateWithContentScript: (
    action: UserAction,
    data?: UserPreferences
  ) => void
  disabled?: boolean
}

const MonitorModeOption: React.FC<MonitorModeOptionProps> = ({
  communicateWithContentScript,
  disabled = false
}) => {
  useI18n()

  const [observerEnabled, setObserverEnabled] = useStorage<boolean>(
    StorageKey.observerEnabled,
    true
  )

  const handleObserverEnabledChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = e.target.checked
    setObserverEnabled(isChecked)
    communicateWithContentScript(UserAction.UpdateOptions, {
      observerEnabled: isChecked
    })
  }

  return (
    <div
      className={`option-row${disabled ? " is-disabled" : ""}`}
      title={t("monitorModeTooltip")}>
      <span className="text-strong" style={{ fontSize: "13px" }}>
        {t("monitorModeTitle")}
      </span>
      <label className="switch">
        <input
          type="checkbox"
          disabled={disabled}
          checked={observerEnabled}
          onChange={handleObserverEnabledChange}
        />
        <span className="switch-slider"></span>
      </label>
    </div>
  )
}

export default MonitorModeOption
