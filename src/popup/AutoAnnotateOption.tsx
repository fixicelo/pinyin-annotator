import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { StorageKey, UserAction, type UserPreferences } from "~constants"
import { t, useI18n } from "~lib/i18n"

interface AutoAnnotateOptionProps {
  communicateWithContentScript: (
    action: UserAction,
    data?: UserPreferences
  ) => void
}

const AutoAnnotateOption: React.FC<AutoAnnotateOptionProps> = ({
  communicateWithContentScript
}) => {
  useI18n()

  const [autoAnnotate, setAutoAnnotate] = useStorage<boolean>(
    StorageKey.autoAnnotate,
    false
  )

  const handleAutoAnnotateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setAutoAnnotate(isChecked)
    communicateWithContentScript(UserAction.UpdateOptions, {
      autoAnnotate: isChecked
    })
  }

  return (
    <div
      className="flex items-center justify-between"
      style={{ padding: "12px 0" }}
      title={t("autoAnnotateTooltip")}>
      <span className="text-strong" style={{ fontSize: "13px" }}>
        {t("autoAnnotateTitle")}
      </span>
      <label className="switch">
        <input
          type="checkbox"
          checked={autoAnnotate}
          onChange={handleAutoAnnotateChange}
        />
        <span className="switch-slider"></span>
      </label>
    </div>
  )
}

export default AutoAnnotateOption
