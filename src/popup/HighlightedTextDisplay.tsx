import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import { useStorage } from "@plasmohq/storage/hook"
import parse from "html-react-parser"
import { useEffect, useState } from "react"
import { PREDEFINED_DICT_LINK, StorageKey, ToneType, type HtmlOptions } from "~constants"
import { convertTextContentToHtml } from "~util"

function getSelectionText(removeAnnotations: boolean = true) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    return
  }

  if (!removeAnnotations) {
    return selection.toString()
  }

  const range = selection.getRangeAt(0)
  const clonedSelection = range.cloneContents()
  const div = document.createElement("div")
  div.appendChild(clonedSelection)
  const rps = div.getElementsByTagName("rp")
  const rts = div.getElementsByTagName("rt")
  while (rps.length) {
    rps[0].parentNode.removeChild(rps[0])
  }
  while (rts.length) {
    rts[0].parentNode.removeChild(rts[0])
  }
  return div.textContent
}

const retrieveHighlightedText = (setSelectedText) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0].id) return
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: getSelectionText
      },
      function (results) {
        if (chrome.runtime.lastError) {
          console.info(chrome.runtime.lastError)
        } else {
          const text = results[0].result
          if (text?.trim().length > 0) {
            setSelectedText(text)
          }
        }
      }
    )
  })
}

const HighlightedTextDisplay = () => {
  const [toneType] = useStorage<ToneType>(StorageKey.toneType, ToneType.Symbol)
  const [selectedText, setSelectedText] = useState("")
  const [dictLinkEnabled] = useStorage<boolean>(StorageKey.dictLinkEnabled, true);
  const [selectedDict] = useStorage<string>(StorageKey.selectedDict, PREDEFINED_DICT_LINK[0].site);
  const [customDictUrl] = useStorage<string>(StorageKey.customDictUrl, "");

  let dictLink = "";
  if (dictLinkEnabled) {
    if (selectedDict === "custom") {
      dictLink = customDictUrl;
    } else {
      dictLink = PREDEFINED_DICT_LINK.find((dict) => dict.site === selectedDict)?.url;
    }
  }

  const htmlOptions: HtmlOptions = { toneType, dictLink }
  const htmlString = convertTextContentToHtml(selectedText, htmlOptions)
  const fontSizePx = 40
  const lineHeightPx = fontSizePx + 30

  useEffect(() => {
    retrieveHighlightedText(setSelectedText)
  }, [retrieveHighlightedText])

  return (
    selectedText && (
      <>
        <Divider>
          <Chip label="Selected Text" size="medium" />
        </Divider>
        <span
          style={{
            fontSize: `${fontSizePx}px`,
            lineHeight: `${lineHeightPx}px`
          }}
        >
          {parse(htmlString)}
        </span>
      </>
    )
  )
}

export default HighlightedTextDisplay
