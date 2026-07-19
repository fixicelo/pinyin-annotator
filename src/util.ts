import cnchar from "cnchar"
import poly from "cnchar-poly"
import trad from "cnchar-trad"
import {
  pinyin as pinyinConverter
} from "pinyin-pro"

import { Storage } from "@plasmohq/storage"

import {
  CHINESE_CLASS,
  DEFAULT_IGNORED_NODES,
  IS_ANNOTATED_ATTR,
  NON_CHINESE_CLASS,
  PINYIN_CLASS,
  PronunciationSystem,
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

export function convertTextContentToHtml(
  text: string,
  htmlOptions: HtmlOptions
): string {
  const simplifiedText = cnchar.convert.tradToSimple(text)
  const isZhuyin = htmlOptions.pronunciationSystem === PronunciationSystem.Zhuyin
  const toneType = isZhuyin ? "num" : htmlOptions.toneType
  const rawPinyin = pinyinConverter(simplifiedText, {
    type: "array",
    toneType
  })
  const words = [...text]
  const lookup = words.map((word, index) => {
    const raw = rawPinyin[index]
    const isPinyin = word !== raw
    if (!isPinyin) return [word, null] as const
    const display = isZhuyin ? pinyinToZhuyin(raw) : raw
    return [word, display] as const
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

const PINYIN_INITIALS: Record<string, string> = {
  b: "\u3105", p: "\u3106", m: "\u3107", f: "\u3108",
  d: "\u3109", t: "\u310A", n: "\u310B", l: "\u310C",
  g: "\u310D", k: "\u310E", h: "\u310F",
  j: "\u3110", q: "\u3111", x: "\u3112",
  zh: "\u3113", ch: "\u3114", sh: "\u3115", r: "\u3116",
  z: "\u3117", c: "\u3118", s: "\u3119"
}

const PINYIN_FINALS: Record<string, string> = {
  i: "\u3127", u: "\u3128", "\u00FC": "\u3129",
  a: "\u312A", o: "\u312B", e: "\u312C", "\u00EA": "\u311D",
  ai: "\u311E", ei: "\u311F", ao: "\u3120", ou: "\u3121",
  an: "\u3122", en: "\u3123", ang: "\u3124", eng: "\u3125",
  er: "\u3126",
  ia: "\u3127\u312A", ie: "\u3127\u311D", iao: "\u3127\u3120",
  iu: "\u3127\u3121", ian: "\u3127\u3122", in: "\u3127\u3123",
  iang: "\u3127\u3124", ing: "\u3127\u3125",
  ua: "\u3128\u312A", uo: "\u3128\u312B", uai: "\u3128\u311E",
  ui: "\u3128\u311F", uan: "\u3128\u3122", un: "\u3128\u3123",
  uang: "\u3128\u3124", ong: "\u3128\u3125",
  "\u00FCe": "\u3129\u311D", "\u00FCn": "\u3129\u3123",
  "\u00FCan": "\u3129\u3122", iong: "\u3129\u3125"
}

const SYLLABIC_CONSONANTS: Record<string, string> = {
  zhi: "\u3113", chi: "\u3114", shi: "\u3115", ri: "\u3116",
  zi: "\u3117", ci: "\u3118", si: "\u3119"
}

const ZERO_INITIAL_FORMS: Record<string, string> = {
  yi: "\u3127", wu: "\u3128", yu: "\u3129",
  ya: "\u3127\u312A", ye: "\u3127\u311D", yao: "\u3127\u3120",
  you: "\u3127\u3121", yan: "\u3127\u3122", yin: "\u3127\u3123",
  yang: "\u3127\u3124", ying: "\u3127\u3125",
  wa: "\u3128\u312A", wo: "\u3128\u312B", wai: "\u3128\u311E",
  wei: "\u3128\u311F", wan: "\u3128\u3122", wen: "\u3128\u3123",
  wang: "\u3128\u3124", weng: "\u3128\u3125",
  yue: "\u3129\u311D", yuan: "\u3129\u3122",
  yun: "\u3129\u3123", yong: "\u3129\u3125",
  a: "\u312A", o: "\u312B", e: "\u312C", "\u00EA": "\u311D",
  ai: "\u311E", ei: "\u311F", ao: "\u3120", ou: "\u3121",
  an: "\u3122", en: "\u3123", ang: "\u3124", eng: "\u3125",
  er: "\u3126", r: "\u3126"
}

const ZHUYIN_TONES: Record<string, string> = {
  "1": "", "2": "\u02CA", "3": "\u02C7", "4": "\u02CB", "5": "\u02D9"
}

const INITIAL_KEYS = Object.keys(PINYIN_INITIALS).sort(
  (a, b) => b.length - a.length
)
const FINAL_KEYS = Object.keys(PINYIN_FINALS).sort(
  (a, b) => b.length - a.length
)

export function pinyinToZhuyin(pinyin: string): string {
  if (!pinyin) return ""

  let syllable = pinyin.toLowerCase().replace(/v|u:/g, "\u00FC")
  let tone = "1"

  const toneMatch = syllable.match(/[1-5]$/)
  if (toneMatch) {
    tone = toneMatch[0]
    syllable = syllable.slice(0, -1)
  }

  let result = ""

  if (syllable in SYLLABIC_CONSONANTS) {
    result = SYLLABIC_CONSONANTS[syllable]
  } else if (syllable in ZERO_INITIAL_FORMS) {
    result = ZERO_INITIAL_FORMS[syllable]
  } else {
    let remaining = syllable
    let initial = ""
    for (const ik of INITIAL_KEYS) {
      if (remaining.startsWith(ik)) {
        initial = PINYIN_INITIALS[ik]
        remaining = remaining.slice(ik.length)
        break
      }
    }
    const finalZhuyin = PINYIN_FINALS[remaining] ?? ""
    result = initial + finalZhuyin
  }

  result = result.replace(/^(\u3110|\u3111|\u3112)\u3128/, "$1\u3129")

  if (tone === "5") {
    result = ZHUYIN_TONES[tone] + result
  } else if (tone !== "1") {
    result = result + ZHUYIN_TONES[tone]
  }

  return result
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
  const isZhuyin = htmlOptions.pronunciationSystem === PronunciationSystem.Zhuyin
  const toneType = isZhuyin ? "num" : htmlOptions.toneType
  const rawPinyin = pinyinConverter(simplifiedText, {
    type: "array",
    toneType
  })
  const words = [...text]
  const dictLink =
    htmlOptions.dictLink && htmlOptions.dictLink !== ""
      ? htmlOptions.dictLink
      : undefined

  const frag = document.createDocumentFragment()
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const raw = rawPinyin[i]
    const hasPinyin = word !== raw
    const displayPinyin = hasPinyin
      ? isZhuyin
        ? pinyinToZhuyin(raw)
        : raw
      : null
    const element = createAnnotationElement(word, displayPinyin, dictLink)
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
