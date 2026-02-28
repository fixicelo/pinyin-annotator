import { useEffect, useState } from "react"
import { ResponseStatus, TabStatus, UserAction, type Response } from "~constants"
import AnnotationStatus from "./AnnotationStatus"
import AppTitle from "./AppTitle"
import AutoAnnotateOption from "./AutoAnnotateOption"
import ButtonGroup from "./ButtonGroup"
import HighlightedTextDisplay from "./HighlightedTextDisplay"
import MonitorModeOption from "./MonitorModeOption"
import "./popup.css"
import useCommunicateWithContentScript from "./useCommunicateWithContentScript"

function Popup() {
  const [isAnnotated, setIsAnnotated] = useState(false)
  const [tabStatus, setTabStatus] = useState<TabStatus>(TabStatus.Loading)

  const communicateWithContentScript = useCommunicateWithContentScript(
    (response: Response) => {
      if (response) {
        setIsAnnotated(response.status === ResponseStatus.Annotated)
      }
    },
    setTabStatus
  )

  const isAvailable = tabStatus === TabStatus.Available

  useEffect(() => {
    communicateWithContentScript(UserAction.Check, {})
  }, [])

  return (
    <div className="popup">
      <AppTitle />
      <AnnotationStatus isAnnotated={isAnnotated} tabStatus={tabStatus} />
      {isAvailable && (
        <>
          <MonitorModeOption />
          <AutoAnnotateOption />
        </>
      )}
      <ButtonGroup
        isAnnotated={isAnnotated}
        communicateWithContentScript={communicateWithContentScript}
        disabled={!isAvailable}
      />
      <HighlightedTextDisplay />
    </div>
  )
}

export default Popup
