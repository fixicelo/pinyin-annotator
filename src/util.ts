import { pinyin as pinyinConverter } from "pinyin-pro"

import {
  BACKDROP_ATTR,
  CHINESE_CLASS,
  IS_ANNOTATED_ATTR,
  NON_CHINESE_CLASS,
  PINYIN_CLASS,
  PronunciationSystem,
  RESULT_CLASS,
  TAG_NAME,
  type HtmlOptions
} from "~constants"
import { tradToSimplified } from "~lib/trad-simp"

export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/** Matches any Han character, including extensions outside the BMP. */
const HAN_CHARACTER = /\p{Script=Han}/u

/**
 * Elements whose text the page itself owns. A live editor's text nodes hold
 * the caret and feed the editor's own model, and a select's options are not
 * content to wrap in markup: rewriting either breaks the page rather than the
 * text. An explicitly non-editable element inside an editor stays annotatable.
 */
const UNTOUCHABLE_CONTENT_SELECTOR =
  'select, option, [contenteditable]:not([contenteditable="false"])'

export function containsChinese(text: string): boolean {
  return HAN_CHARACTER.test(text)
}

/**
 * Collects the text nodes under `root` that hold Han characters and belong to
 * the annotator. The ignored node names come from the caller, which merges the
 * user's preferences with the extension's own defaults.
 */
export const findTextNodesWithContent = (
  root: Node,
  ignoredNodes: string[]
): Node[] => {
  if (!root) {
    return []
  }

  const resolvedIgnoredNodes = ignoredNodes

  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      // A text node's parent is not always an element -- a document fragment or
      // the document itself can hold one -- so parentNode is used rather than
      // parentElement.
      const parent = node.parentNode
      if (parent && resolvedIgnoredNodes.includes(parent.nodeName)) {
        return NodeFilter.FILTER_REJECT
      }

      if (node.parentElement?.closest(UNTOUCHABLE_CONTENT_SELECTOR)) {
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

/**
 * A run of text that carries no annotation, or a single character together with
 * its reading. Adjacent unannotated characters are merged into one segment so
 * that the DOM keeps scripts, grapheme clusters (emoji ZWJ sequences, combining
 * marks) and word boundaries intact instead of boxing up every code point.
 *
 * Readings come from `readingContext` when the caller has one, which is what
 * lets a word split by inline markup keep its phrase reading.
 */
export type AnnotationSegment =
  | { type: "annotated"; char: string; pinyin: string }
  | { type: "plain"; text: string }

export function segmentText(
  text: string,
  htmlOptions: HtmlOptions,
  readingContext?: ReadingContext
): AnnotationSegment[] {
  if (!text) {
    return []
  }

  const isZhuyin =
    htmlOptions.pronunciationSystem === PronunciationSystem.Zhuyin
  const rawPinyin = pinyinConverter(
    tradToSimplified(readingContext?.text ?? text),
    {
      type: "array",
      toneType: isZhuyin ? "num" : htmlOptions.toneType
    }
  )
  const readingOffset = readingContext?.offset ?? 0

  const segments: AnnotationSegment[] = []
  let plain = ""

  const flushPlain = () => {
    if (plain) {
      segments.push({ type: "plain", text: plain })
      plain = ""
    }
  }

  const chars = [...text]
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]
    const raw = rawPinyin[readingOffset + i]
    // pinyin-pro echoes a character back when it has no reading for it, which
    // is how non-Chinese text is recognised.
    if (raw === undefined || char === raw) {
      plain += char
      continue
    }
    flushPlain()
    segments.push({
      type: "annotated",
      char,
      pinyin: isZhuyin ? pinyinToZhuyin(raw) : raw
    })
  }
  flushPlain()

  return segments
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function convertTextContentToHtml(
  text: string,
  htmlOptions: HtmlOptions
): string {
  const dictLink =
    htmlOptions.dictLink && htmlOptions.dictLink !== ""
      ? htmlOptions.dictLink
      : undefined

  return segmentText(text, htmlOptions)
    .map((segment) => {
      if (segment.type === "plain") {
        return `<${TAG_NAME} class="${NON_CHINESE_CLASS}">${escapeHtml(segment.text)}</${TAG_NAME}>`
      }

      const char = escapeHtml(segment.char)
      const base = dictLink
        ? `<${TAG_NAME} class="${CHINESE_CLASS}"><a href="${escapeHtml(dictLink.replace("{word}", segment.char))}" target="_blank">${char}</a></${TAG_NAME}>`
        : `<${TAG_NAME} class="${CHINESE_CLASS}">${char}</${TAG_NAME}>`

      return `<${TAG_NAME} class="${RESULT_CLASS}" ${IS_ANNOTATED_ATTR}="true"><ruby>${base}<rt class="${PINYIN_CLASS}">${escapeHtml(segment.pinyin)}</rt></ruby></${TAG_NAME}>`
    })
    .join("")
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

export function pinyinToZhuyin(pinyin: string): string {
  if (!pinyin) return ""

  let syllable = pinyin.toLowerCase().replace(/v|u:/g, "ü")
  let tone = "1"

  const toneMatch = syllable.match(/[1-5]$/)
  if (toneMatch) {
    tone = toneMatch[0]
    syllable = syllable.slice(0, -1)
  }

  let result: string

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

function createAnnotatedElement(
  char: string,
  pinyin: string,
  dictLink?: string
): HTMLElement {
  const wrapper = document.createElement(TAG_NAME)
  wrapper.className = RESULT_CLASS
  wrapper.setAttribute(IS_ANNOTATED_ATTR, "true")

  const ruby = document.createElement("ruby")

  const base = document.createElement(TAG_NAME)
  base.className = CHINESE_CLASS
  if (dictLink) {
    const link = document.createElement("a")
    link.href = dictLink.replace("{word}", char)
    link.target = "_blank"
    link.textContent = char
    base.appendChild(link)
  } else {
    base.textContent = char
  }

  const rt = document.createElement("rt")
  rt.className = PINYIN_CLASS
  rt.textContent = pinyin

  ruby.appendChild(base)
  ruby.appendChild(rt)
  wrapper.appendChild(ruby)

  return wrapper
}

function createPlainElement(text: string): HTMLElement {
  const wrapper = document.createElement(TAG_NAME)
  wrapper.className = NON_CHINESE_CLASS
  wrapper.textContent = text
  return wrapper
}

export function buildAnnotatedFragment(
  text: string,
  htmlOptions: HtmlOptions,
  readingContext?: ReadingContext
): DocumentFragment {
  const dictLink =
    htmlOptions.dictLink && htmlOptions.dictLink !== ""
      ? htmlOptions.dictLink
      : undefined

  const fragment = document.createDocumentFragment()
  for (const segment of segmentText(text, htmlOptions, readingContext)) {
    fragment.appendChild(
      segment.type === "annotated"
        ? createAnnotatedElement(segment.char, segment.pinyin, dictLink)
        : createPlainElement(segment.text)
    )
  }

  return fragment
}

/** The original text a wrapper was built from. */
function annotationText(wrapper: Element): string {
  if (wrapper.classList.contains(RESULT_CLASS)) {
    const chinese = wrapper.querySelector(`${TAG_NAME}.${CHINESE_CLASS}`)
    // Fall back to the wrapper's own text if the inner element is missing —
    // page scripts are free to rewrite our markup while it is on screen.
    return chinese?.textContent ?? wrapper.textContent ?? ""
  }
  return wrapper.textContent ?? ""
}

/**
 * The text a reading is chosen from, and where the annotated text starts in it.
 *
 * pinyin depends on word boundaries, and markup splits words: reading a text
 * node on its own turns the 银 of `<b>银</b>行` into yín xíng instead of the
 * yín háng the phrase calls for.
 */
export interface ReadingContext {
  text: string
  /** Offset of the annotated text in `text`, counted in code points. */
  offset: number
}

export interface ReadingContextCache {
  /** Offsets of every text node of a context element, built once each. */
  indexes: Map<Element, { text: string; offsets: Map<Node, number> }>
  /** The element a reading is chosen from, resolved once per parent. */
  owners: Map<Element, Element>
}

export function createReadingContextCache(): ReadingContextCache {
  return { indexes: new Map(), owners: new Map() }
}

function isInlineLevel(element: Element): boolean {
  const { display } = getComputedStyle(element)
  return display.startsWith("inline") || display === "contents"
}

function resolveReadingOwner(
  element: Element,
  cache: ReadingContextCache
): Element {
  const cached = cache.owners.get(element)
  if (cached) {
    return cached
  }

  let owner = element
  while (isInlineLevel(owner) && owner.parentElement) {
    owner = owner.parentElement
  }
  cache.owners.set(element, owner)
  return owner
}

function resolveReadingIndex(
  owner: Element,
  cache: ReadingContextCache
): { text: string; offsets: Map<Node, number> } {
  const cached = cache.indexes.get(owner)
  if (cached) {
    return cached
  }

  const offsets = new Map<Node, number>()
  const walker = document.createTreeWalker(owner, NodeFilter.SHOW_TEXT)
  let offset = 0
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    offsets.set(node, offset)
    offset += [...(node.textContent ?? "")].length
  }

  const index = { text: owner.textContent ?? "", offsets }
  cache.indexes.set(owner, index)
  return index
}

/**
 * Finds the text a node's characters should be read in, by walking out of the
 * inline elements that split a phrase from the block that holds it. A node
 * without an element parent has no context and is read on its own.
 */
export function findReadingContext(
  node: Node,
  cache: ReadingContextCache = createReadingContextCache()
): ReadingContext | undefined {
  const parent = node.parentElement
  if (!parent) {
    return undefined
  }

  const owner = resolveReadingOwner(parent, cache)
  const index = resolveReadingIndex(owner, cache)
  const offset = index.offsets.get(node)
  if (offset === undefined) {
    return undefined
  }

  return { text: index.text, offset }
}

/** True for a computed colour that paints nothing. */
export function isTransparentColor(color: string): boolean {
  if (!color || color === "transparent") {
    return true
  }

  const match = color.match(/^rgba?\(([^)]+)\)$/)
  if (!match) {
    return false
  }

  const parts = match[1].split(/[\s,/]+/).filter(Boolean)
  const alpha = parts.length > 3 ? Number(parts[3]) : 1
  return !(alpha > 0)
}

/**
 * Marks the element that paints the backdrop around the text it holds, so the
 * stylesheet can give it room for the reading above that text.
 *
 * Only an inline box needs it: an inline box paints its backdrop behind the
 * glyphs, so a reading above them falls outside it, while a block box already
 * paints behind its whole line box.
 *
 * Returns whether the element was marked.
 */
export function markBackdropHost(element: Element | null): boolean {
  if (!element || element.hasAttribute(BACKDROP_ATTR)) {
    return false
  }

  const style = getComputedStyle(element)
  if (style.display !== "inline" || isTransparentColor(style.backgroundColor)) {
    return false
  }

  element.setAttribute(BACKDROP_ATTR, "")
  return true
}

export function clearAnnotation(root: Element) {
  for (const host of root.querySelectorAll(`[${BACKDROP_ATTR}]`)) {
    host.removeAttribute(BACKDROP_ATTR)
  }
  if (root.hasAttribute(BACKDROP_ATTR)) {
    root.removeAttribute(BACKDROP_ATTR)
  }

  const wrappers = Array.from(
    root.querySelectorAll(
      `${TAG_NAME}.${RESULT_CLASS}, ${TAG_NAME}.${NON_CHINESE_CLASS}`
    )
  )
  if (wrappers.length === 0) {
    return
  }

  const own = new Set<Node>(wrappers)
  const parents = new Set<Node>()
  for (const wrapper of wrappers) {
    if (wrapper.parentNode) {
      parents.add(wrapper.parentNode)
    }
  }

  // Collapse every run of adjacent wrappers into a single text node before
  // removing anything. Unwrapping one element at a time with replaceWith()
  // shifts the sibling list on each call, which makes clearing quadratic in the
  // number of annotated characters; inserting the text first and removing the
  // wrappers afterwards keeps it linear.
  for (const parent of parents) {
    const children = Array.from(parent.childNodes)
    for (let i = 0; i < children.length; i++) {
      if (!own.has(children[i])) {
        continue
      }
      let text = ""
      let end = i
      while (end < children.length && own.has(children[end])) {
        text += annotationText(children[end] as Element)
        end++
      }
      parent.insertBefore(document.createTextNode(text), children[i])
      i = end - 1
    }
  }

  for (const wrapper of wrappers) {
    wrapper.remove()
  }

  // normalize() walks the whole subtree, so it must run once per parent rather
  // than once per removed element.
  for (const parent of parents) {
    parent.normalize()
  }
}

export function isAnnotated(root: Element) {
  return !!root.querySelector(TAG_NAME)
}
