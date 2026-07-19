import cnchar from "cnchar"
import poly from "cnchar-poly"
import trad from "cnchar-trad"
import { pinyin as pinyinConverter } from "pinyin-pro"

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

  const resolvedIgnoredNodes = ignoredNodes ?? (await getIgnoredNodes())

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
  const isZhuyin =
    htmlOptions.pronunciationSystem === PronunciationSystem.Zhuyin
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
  b: "ㄅ",
  p: "ㄆ",
  m: "ㄇ",
  f: "ㄈ",
  d: "ㄉ",
  t: "ㄊ",
  n: "ㄋ",
  l: "ㄌ",
  g: "ㄍ",
  k: "ㄎ",
  h: "ㄏ",
  j: "ㄐ",
  q: "ㄑ",
  x: "ㄒ",
  zh: "ㄓ",
  ch: "ㄔ",
  sh: "ㄕ",
  r: "ㄖ",
  z: "ㄗ",
  c: "ㄘ",
  s: "ㄙ"
}

const PINYIN_FINALS: Record<string, string> = {
  i: "ㄧ",
  u: "ㄨ",
  ü: "ㄩ",
  a: "ㄚ",
  o: "ㄛ",
  e: "ㄜ",
  ê: "ㄝ",
  ai: "ㄞ",
  ei: "ㄟ",
  ao: "ㄠ",
  ou: "ㄡ",
  an: "ㄢ",
  en: "ㄣ",
  ang: "ㄤ",
  eng: "ㄥ",
  er: "ㄦ",
  ia: "ㄧㄚ",
  ie: "ㄧㄝ",
  iao: "ㄧㄠ",
  iu: "ㄧㄡ",
  ian: "ㄧㄢ",
  in: "ㄧㄣ",
  iang: "ㄧㄤ",
  ing: "ㄧㄥ",
  ua: "ㄨㄚ",
  uo: "ㄨㄛ",
  uai: "ㄨㄞ",
  ui: "ㄨㄟ",
  uan: "ㄨㄢ",
  un: "ㄨㄣ",
  uang: "ㄨㄤ",
  ong: "ㄨㄥ",
  üe: "ㄩㄝ",
  ün: "ㄩㄣ",
  üan: "ㄩㄢ",
  iong: "ㄩㄥ"
}

const SYLLABIC_CONSONANTS: Record<string, string> = {
  zhi: "ㄓ",
  chi: "ㄔ",
  shi: "ㄕ",
  ri: "ㄖ",
  zi: "ㄗ",
  ci: "ㄘ",
  si: "ㄙ"
}

const ZERO_INITIAL_FORMS: Record<string, string> = {
  yi: "ㄧ",
  wu: "ㄨ",
  yu: "ㄩ",
  ya: "ㄧㄚ",
  ye: "ㄧㄝ",
  yao: "ㄧㄠ",
  you: "ㄧㄡ",
  yan: "ㄧㄢ",
  yin: "ㄧㄣ",
  yang: "ㄧㄤ",
  ying: "ㄧㄥ",
  wa: "ㄨㄚ",
  wo: "ㄨㄛ",
  wai: "ㄨㄞ",
  wei: "ㄨㄟ",
  wan: "ㄨㄢ",
  wen: "ㄨㄣ",
  wang: "ㄨㄤ",
  weng: "ㄨㄥ",
  yue: "ㄩㄝ",
  yuan: "ㄩㄢ",
  yun: "ㄩㄣ",
  yong: "ㄩㄥ",
  a: "ㄚ",
  o: "ㄛ",
  e: "ㄜ",
  ê: "ㄝ",
  ai: "ㄞ",
  ei: "ㄟ",
  ao: "ㄠ",
  ou: "ㄡ",
  an: "ㄢ",
  en: "ㄣ",
  ang: "ㄤ",
  eng: "ㄥ",
  er: "ㄦ",
  r: "ㄦ"
}

const ZHUYIN_TONES: Record<string, string> = {
  "1": "",
  "2": "ˊ",
  "3": "ˇ",
  "4": "ˋ",
  "5": "˙"
}

const INITIAL_KEYS = Object.keys(PINYIN_INITIALS).sort(
  (a, b) => b.length - a.length
)
const FINAL_KEYS = Object.keys(PINYIN_FINALS).sort(
  (a, b) => b.length - a.length
)

export function pinyinToZhuyin(pinyin: string): string {
  if (!pinyin) return ""

  let syllable = pinyin.toLowerCase().replace(/v|u:/g, "ü")
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

  result = result.replace(/^(ㄐ|ㄑ|ㄒ)ㄨ/, "$1ㄩ")

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
  const isZhuyin =
    htmlOptions.pronunciationSystem === PronunciationSystem.Zhuyin
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
