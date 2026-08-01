import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { StorageKey, UserAction } from "~constants"
import { t, useI18n } from "~lib/i18n"

interface MonitorModeOptionProps {
  communicateWithContentScript: (action: UserAction, data?: any) => void
}

const MonitorModeOption: React.FC<MonitorModeOptionProps> = ({
  communicateWithContentScript
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
      className="flex items-center justify-between"
      style={{
        padding: "12px 0",
        borderBottom: "1px solid var(--border-color)"
      }}
      title={t("monitorModeTooltip")}>
      <span className="text-strong" style={{ fontSize: "13px" }}>
        {t("monitorModeTitle")}
      </span>
      <label className="switch">
        <input
          type="checkbox"
          checked={observerEnabled}
          onChange={handleObserverEnabledChange}
        />
        <span className="switch-slider"></span>
      </label>
    </div>
  )
}

export default MonitorModeOption
