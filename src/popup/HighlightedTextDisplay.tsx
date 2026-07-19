import { useStorage } from "@plasmohq/storage/hook";
import { useEffect, useState } from "react";
import { PREDEFINED_DICT_LINK, PronunciationSystem, RubyPosition, StorageKey, ToneType, type HtmlOptions } from "~constants";
import { convertTextContentToHtml } from "~util";

function getTextFromRange(range: Range): string {
  const container = range.commonAncestorContainer

  if (container.nodeType === Node.TEXT_NODE) {
    return container.textContent.substring(range.startOffset, range.endOffset)
  }

  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        if (!range.intersectsNode(node)) return NodeFilter.FILTER_REJECT

        if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = node.nodeName.toUpperCase()
          if (tagName === "RP" || tagName === "RT") return NodeFilter.FILTER_REJECT
          return NodeFilter.FILTER_SKIP
        }
        return NodeFilter.FILTER_ACCEPT
      }
    }
  )

  let text = ""
  let currentNode = walker.nextNode()
  while (currentNode) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      let val = currentNode.textContent
      if (currentNode === range.endContainer) {
        val = val.substring(0, range.endOffset)
      }
      if (currentNode === range.startContainer) {
        val = val.substring(range.startOffset)
      }
      text += val
    }
    currentNode = walker.nextNode()
  }
  return text
}

function getSelectionText(removeAnnotations: boolean = true) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    return
  }

  if (!removeAnnotations) {
    return selection.toString()
  }

  let text = ""
  for (let i = 0; i < selection.rangeCount; i++) {
    text += getTextFromRange(selection.getRangeAt(i))
  }
  return text
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
  const [pronunciationSystem] = useStorage<PronunciationSystem>(
    StorageKey.pronunciationSystem,
    PronunciationSystem.Pinyin
  )
  const [selectedText, setSelectedText] = useState("")
  const [dictLinkEnabled] = useStorage<boolean>(StorageKey.dictLinkEnabled, true);
  const [selectedDict] = useStorage<string>(StorageKey.selectedDict, PREDEFINED_DICT_LINK[0].site);
  const [customDictUrl] = useStorage<string>(StorageKey.customDictUrl, "");
  const [rubyPosition] = useStorage<RubyPosition>(StorageKey.rubyPosition, RubyPosition.OVER);

  let dictLink = "";
  if (dictLinkEnabled) {
    if (selectedDict === "custom") {
      dictLink = customDictUrl;
    } else {
      dictLink = PREDEFINED_DICT_LINK.find((dict) => dict.site === selectedDict)?.url;
    }
  }

  const htmlOptions: HtmlOptions = { toneType, dictLink, pronunciationSystem }
  const htmlString = convertTextContentToHtml(selectedText, htmlOptions)
  const fontSizePx = 40
  const lineHeightPx = fontSizePx + 30

  useEffect(() => {
    retrieveHighlightedText(setSelectedText)
  }, [])

  return (
    selectedText && (
      <>
        <div className="divider">
          Selected Text
        </div>
        <span
          style={{
            fontSize: `${fontSizePx}px`,
            lineHeight: `${lineHeightPx}px`,
            rubyPosition: rubyPosition
          }}
          dangerouslySetInnerHTML={{ __html: htmlString }}
        />
      </>
    )
  )
}

export default HighlightedTextDisplay
