import cnchar from "cnchar"
import poly from "cnchar-poly"
import trad from "cnchar-trad"
import {
  html as convertToPinyinHtml,
  pinyin as pinyinConverter
} from "pinyin-pro"

import { Storage } from "@plasmohq/storage"

import {
  CHINESE_CLASS,
  DEFAULT_IGNORED_NODES,
  IS_ANNOTATED_ATTR,
  NON_CHINESE_CLASS,
  PINYIN_CLASS,
  RESULT_CLASS,
  StorageKey,
  TAG_NAME,
  type HtmlOptions
} from "~constants"

cnchar.use(poly, trad)

export function debounce<T extends (...args: any) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }

  //   let frameId: number
  //   return (...args: Parameters<T>) => {
  //     cancelAnimationFrame(frameId)
  //     frameId = requestAnimationFrame(() => func.apply(null, args))
  //   }
}

export function isElementVisible(node: Node) {
  if (!(node instanceof HTMLElement)) {
    return false
  }

  const style = window.getComputedStyle(node)
  const isVisible =
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0"
  return isVisible
}

export function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text)
}

export async function getIgnoredNodes(): Promise<string[]> {
  const storage = new Storage()
  const userDefinedIgnoredNodes =
    (await storage.get<string[]>(StorageKey.ignoredNodes)) || []

  return userDefinedIgnoredNodes.length === 0
    ? DEFAULT_IGNORED_NODES
    : [...userDefinedIgnoredNodes, TAG_NAME.toUpperCase()]
}

export const findTextNodesWithContent = async (
  root: Node,
  ignoredNodes?: string[]
): Promise<Node[]> => {
  if (!root) {
    return []
  }

  const resolvedIgnoredNodes = ignoredNodes ?? await getIgnoredNodes()

  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      // Check if direct parent should be ignored
      if (resolvedIgnoredNodes.includes(node.parentElement.nodeName)) {
        return NodeFilter.FILTER_REJECT
      }
      
      // Check if node is inside our annotation structure (check immediate 3 levels up)
      // This prevents re-processing while allowing AJAX-replaced content
      let ancestor = node.parentElement
      for (let depth = 0; depth < 3 && ancestor && ancestor !== root; depth++) {
        if (ancestor.nodeName === TAG_NAME.toUpperCase()) {
          return NodeFilter.FILTER_REJECT
        }
        ancestor = ancestor.parentElement
      }
      
      return containsChinese(node.textContent)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
    }
  })

  const nodes = []
  let currentNode = treeWalker.nextNode()
  while (currentNode) {
    nodes.push(currentNode)
    currentNode = treeWalker.nextNode()
  }

  return nodes
}

export function convertTextContentToHtmlPinyinPro(
  text: string,
  htmlOptions: HtmlOptions
): string {
  /* Example: Result of `convertToPinyinHtml('A,漢，汉', {wrapNonChinese: true, toneType: 'symbol'})`
  ```html
  <span class="py-non-chinese-item">A</span>
  <span class="py-non-chinese-item">,</span>
  <span class="py-result-item">
    <ruby>
      <span class="py-chinese-item">漢</span>
      <rp>(</rp> <rt class="py-pinyin-item">hàn</rt><rp>)</rp>
    </ruby>
  </span>
  <span class="py-non-chinese-item">，</span>
  <span class="py-result-item">
    <ruby>
      <span class="py-chinese-item">汉</span>
      <rp>(</rp> <rt class="py-pinyin-item">hàn</rt><rp>)</rp>
    </ruby>
  </span>
  ```

  // Next steps:
  // const parsedHtml = convertHtmlToDocument(markup)
  // convertTag(parsedHtml, CHINESE_CLASS)
  // convertTag(parsedHtml, NON_CHINESE_CLASS)
  // convertTag(parsedHtml, RESULT_CLASS, true)
  */
  const markup = convertToPinyinHtml(text, htmlOptions)
  return markup
}

function convertTag(
  doc: Document,
  className: string,
  addAnnotatedAttribute: boolean = false
) {
  doc.querySelectorAll(`span.${className}`).forEach((node) => {
    const newElement = document.createElement(TAG_NAME)
    newElement.className = className
    if (addAnnotatedAttribute) {
      newElement.setAttribute(IS_ANNOTATED_ATTR, "true")
    }

    // Move all children from the old node to the new one
    while (node.firstChild) {
      newElement.appendChild(node.firstChild)
    }

    // Replace the old node with the new one
    node.parentNode.replaceChild(newElement, node)
  })
}

export function convertTextContentToHtml(
  text: string,
  htmlOptions: HtmlOptions
): string {
  const simplifiedText = cnchar.convert.tradToSimple(text)
  const pinyinArray = pinyinConverter(simplifiedText, {
    type: "array",
    toneType: htmlOptions.toneType
  })
  const words = [...text]
  const lookup = words.map((word, index) => {
    const pinyin = pinyinArray[index]
    return word === pinyin ? [word, null] : [word, pinyin]
  })
  const markup = lookup
    .map(([word, pinyin]) => {
      if (pinyin) {
        if (htmlOptions.dictLink && htmlOptions.dictLink != "") {
          return `<${TAG_NAME} class="${RESULT_CLASS}" ${IS_ANNOTATED_ATTR}="true"><ruby><${TAG_NAME} class="${CHINESE_CLASS}"><a href="${htmlOptions.dictLink.replace("{word}", word)}" target="_blank">${word}</a></${TAG_NAME}><rp>(</rp><rt class="${PINYIN_CLASS}">${pinyin}</rt><rp>)</rp></ruby></${TAG_NAME}>`
        }
        return `<${TAG_NAME} class="${RESULT_CLASS}" ${IS_ANNOTATED_ATTR}="true"><ruby><${TAG_NAME} class="${CHINESE_CLASS}">${word}</${TAG_NAME}><rp>(</rp><rt class="${PINYIN_CLASS}">${pinyin}</rt><rp>)</rp></ruby></${TAG_NAME}>`
      }
      return `<${TAG_NAME} class="${NON_CHINESE_CLASS}">${word}</${TAG_NAME}>`
    })
    .join("")

  return markup
}

function createAnnotationElement(
  word: string,
  pinyin: string | null,
  dictLink?: string
): HTMLElement {
  const wrapper = document.createElement(TAG_NAME)

  if (pinyin) {
    wrapper.className = RESULT_CLASS
    wrapper.setAttribute(IS_ANNOTATED_ATTR, "true")

    const ruby = document.createElement("ruby")

    const chineseWrapper = document.createElement(TAG_NAME)
    chineseWrapper.className = CHINESE_CLASS

    if (dictLink) {
      const link = document.createElement("a")
      link.href = dictLink.replace("{word}", word)
      link.target = "_blank"
      link.textContent = word
      chineseWrapper.appendChild(link)
    } else {
      chineseWrapper.textContent = word
    }

    const rpOpen = document.createElement("rp")
    rpOpen.textContent = "("

    const rt = document.createElement("rt")
    rt.className = PINYIN_CLASS
    rt.textContent = pinyin

    const rpClose = document.createElement("rp")
    rpClose.textContent = ")"

    ruby.appendChild(chineseWrapper)
    ruby.appendChild(rpOpen)
    ruby.appendChild(rt)
    ruby.appendChild(rpClose)
    wrapper.appendChild(ruby)
  } else {
    wrapper.className = NON_CHINESE_CLASS
    wrapper.textContent = word
  }

  return wrapper
}

export function buildAnnotatedFragment(
  text: string,
  htmlOptions: HtmlOptions
): DocumentFragment {
  const simplifiedText = cnchar.convert.tradToSimple(text)
  const pinyinArray = pinyinConverter(simplifiedText, {
    type: "array",
    toneType: htmlOptions.toneType
  })
  const words = [...text]
  const dictLink =
    htmlOptions.dictLink && htmlOptions.dictLink !== ""
      ? htmlOptions.dictLink
      : undefined

  const frag = document.createDocumentFragment()
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const pinyin = pinyinArray[i]
    const hasPinyin = word !== pinyin
    const element = createAnnotationElement(
      word,
      hasPinyin ? pinyin : null,
      dictLink
    )
    frag.appendChild(element)
  }

  return frag
}

export function clearAnnotation(root: Element) {
  const tagResultList = root.querySelectorAll(`${TAG_NAME}.${RESULT_CLASS}`)

  tagResultList.forEach((tagResult) => {
    const tagChinese = tagResult.querySelector(`${TAG_NAME}.${CHINESE_CLASS}`)
    const tagChineseText = tagChinese.textContent
    const parent = tagResult.parentElement
    tagResult.replaceWith(tagChineseText)
    parent.normalize()
  })
  root
    .querySelectorAll(`${TAG_NAME}.${NON_CHINESE_CLASS}`)
    .forEach((element) => {
      const parent = element.parentElement
      element.replaceWith(element?.textContent)
      parent.normalize()
    })
}

export function isAnnotated(root: Element) {
  return !!root.querySelector(TAG_NAME)
}
