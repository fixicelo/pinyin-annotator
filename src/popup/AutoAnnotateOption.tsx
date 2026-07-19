import { useStorage } from "@plasmohq/storage/hook"
import React from "react"

import { StorageKey, UserAction } from "~constants"

interface AutoAnnotateOptionProps {
  communicateWithContentScript: (action: UserAction, data?: any) => void
}

const AutoAnnotateOption: React.FC<AutoAnnotateOptionProps> = ({
  communicateWithContentScript
}) => {
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
      title="Automatically annotate pinyin on every page load."
    >
      <span className="text-strong" style={{ fontSize: "13px" }}>Auto-Annotate</span>
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
