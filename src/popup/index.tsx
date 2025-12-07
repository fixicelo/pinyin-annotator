import { useEffect, useState } from "react"
import { ResponseStatus, UserAction, type Response } from "~constants"
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

  const communicateWithContentScript = useCommunicateWithContentScript(
    (response: Response) => {
      if (response) {
        setIsAnnotated(response.status === ResponseStatus.Annotated)
      }
    }
  )

  useEffect(() => {
    communicateWithContentScript(UserAction.Check, {})
  }, [])

  return (
    <div className="popup">
      <AppTitle />
      <AnnotationStatus isAnnotated={isAnnotated} />
      <MonitorModeOption />
      <AutoAnnotateOption />
      <ButtonGroup
        isAnnotated={isAnnotated}
        communicateWithContentScript={communicateWithContentScript}
      />
      <HighlightedTextDisplay />
    </div>
  )
}

export default Popup
