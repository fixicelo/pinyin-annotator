import React, { useCallback } from "react"

import { UserAction, type UserPreferences } from "~constants"
import { t, useI18n } from "~lib/i18n"

interface ButtonGroupProps {
  isAnnotated: boolean
  communicateWithContentScript: (
    action: UserAction,
    payload?: UserPreferences
  ) => void
  disabled?: boolean
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  isAnnotated,
  communicateWithContentScript,
  disabled = false
}) => {
  useI18n()

  const performAnnotation = useCallback(
    () => communicateWithContentScript(UserAction.Annotate),
    [communicateWithContentScript]
  )
  const removeAnnotations = useCallback(
    () => communicateWithContentScript(UserAction.Clear),
    [communicateWithContentScript]
  )

  return (
    <div className="actions">
      <button
        className="btn btn-outlined"
        onClick={removeAnnotations}
        disabled={disabled || !isAnnotated}>
        {t("buttonClear")}
      </button>
      <button
        className="btn btn-primary btn-primary-wide"
        onClick={performAnnotation}
        disabled={disabled}>
        {t("buttonAnnotate")}
      </button>
    </div>
  )
}

export default ButtonGroup
