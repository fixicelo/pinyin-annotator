// @vitest-environment happy-dom
import { describe, expect, it } from "vitest"

import {
  BACKDROP_ATTR,
  CHINESE_CLASS,
  DEFAULT_IGNORED_NODES,
  NON_CHINESE_CLASS,
  PronunciationSystem,
  RESULT_CLASS,
  TAG_NAME,
  ToneType
} from "~constants"
import {
  buildAnnotatedFragment,
  clearAnnotation,
  createReadingContextCache,
  findReadingContext,
  findTextNodesWithContent,
  isAnnotated,
  isTransparentColor,
  markBackdropHost,
  segmentText
} from "~util"

const SYMBOL = { toneType: ToneType.Symbol }

/** Renders `text` into a detached container the way the content script does. */
function annotate(text: string, options = SYMBOL) {
  const container = document.createElement("div")
  container.textContent = text
  container.replaceChildren(buildAnnotatedFragment(text, options))
  return container
}

describe("segmentText", () => {
  it("separates annotated characters from plain runs", () => {
    expect(segmentText("你好abc世界", SYMBOL)).toEqual([
      { type: "annotated", char: "你", pinyin: "nǐ" },
      { type: "annotated", char: "好", pinyin: "hǎo" },
      { type: "plain", text: "abc" },
      { type: "annotated", char: "世", pinyin: "shì" },
      { type: "annotated", char: "界", pinyin: "jiè" }
    ])
  })

  it("keeps a whole non-Chinese input as one plain segment", () => {
    expect(segmentText("Hello world", SYMBOL)).toEqual([
      { type: "plain", text: "Hello world" }
    ])
  })

  it("returns nothing for empty input", () => {
    expect(segmentText("", SYMBOL)).toEqual([])
  })

  it("converts traditional text before reading it", () => {
    // 為 on its own resolves to "wéi"; the phrase dictionary used after
    // traditional-to-simplified conversion resolves 因為 to "wèi".
    const [first, second] = segmentText("因為", SYMBOL)
    expect(first).toEqual({ type: "annotated", char: "因", pinyin: "yīn" })
    expect(second).toEqual({ type: "annotated", char: "為", pinyin: "wèi" })
  })

  it("produces zhuyin when that system is selected", () => {
    expect(
      segmentText("你好", { pronunciationSystem: PronunciationSystem.Zhuyin })
    ).toEqual([
      { type: "annotated", char: "你", pinyin: "ㄋㄧˇ" },
      { type: "annotated", char: "好", pinyin: "ㄏㄠˇ" }
    ])
  })
})

describe("buildAnnotatedFragment", () => {
  it("builds ruby markup with a reading per Chinese character", () => {
    const container = annotate("你")

    const result = container.firstElementChild
    expect(result.tagName.toLowerCase()).toBe(TAG_NAME)
    expect(result.classList.contains(RESULT_CLASS)).toBe(true)
    expect(result.innerHTML).toBe(
      '<ruby><pya class="py-chinese-item">你</pya>' +
        '<rt class="py-pinyin-item">nǐ</rt></ruby>'
    )
  })

  it("does not emit legacy <rp> fallback elements", () => {
    expect(annotate("你好").querySelectorAll("rp")).toHaveLength(0)
  })

  it("merges adjacent non-Chinese characters into one wrapper", () => {
    const container = annotate("Hello world")

    expect(container.children).toHaveLength(1)
    const wrapper = container.firstElementChild
    expect(wrapper.classList.contains(NON_CHINESE_CLASS)).toBe(true)
    expect(wrapper.textContent).toBe("Hello world")
  })

  it("keeps plain runs on both sides of an annotated character", () => {
    const container = annotate("hi 你 ok")
    const wrappers = container.children

    expect(wrappers).toHaveLength(3)
    expect(wrappers[0].textContent).toBe("hi ")
    expect(wrappers[0].classList.contains(NON_CHINESE_CLASS)).toBe(true)
    expect(wrappers[1].classList.contains(RESULT_CLASS)).toBe(true)
    expect(wrappers[2].textContent).toBe(" ok")
  })

  it("keeps a grapheme cluster inside a single wrapper", () => {
    // 👨‍👩‍👧 is one grapheme built from five code points. Wrapping each code
    // point separately used to split it into five siblings, which stops the
    // sequence rendering as a single glyph.
    const family = "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}"
    const container = annotate(family + "家庭")

    const graphemes = [
      ...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(family)
    ]
    expect(graphemes).toHaveLength(1)

    const plain = container.firstElementChild
    expect(plain.textContent).toBe(family)
    expect(container.children).toHaveLength(3)
  })

  it("links annotated characters when a dictionary url is configured", () => {
    const container = annotate("你", {
      ...SYMBOL,
      dictLink: "https://dict.example/{word}"
    })

    const link = container.querySelector(`.${CHINESE_CLASS} a`)
    expect(link.getAttribute("href")).toBe("https://dict.example/你")
    expect(link.getAttribute("target")).toBe("_blank")
  })

  it("reports the item as annotated", () => {
    expect(isAnnotated(annotate("你好"))).toBe(true)
    expect(isAnnotated(document.createElement("div"))).toBe(false)
  })
})

describe("clearAnnotation", () => {
  const cases = [
    "你好世界",
    "Hello world",
    "你好，世界！Hello, 世界 123。",
    "漢語拼音與繁體字",
    "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}家庭",
    "a < b & c \"d\" 'e'",
    "   leading and trailing   ",
    "中文\n換行\t定位",
    ""
  ]

  it.each(cases)("restores %j exactly", (text) => {
    for (const options of [
      SYMBOL,
      { ...SYMBOL, dictLink: "https://dict.example/{word}" }
    ]) {
      const container = annotate(text, options)
      clearAnnotation(container)
      expect(container.textContent).toBe(text)
    }
  })

  it("removes all annotation markup", () => {
    const container = annotate("你好abc")
    clearAnnotation(container)

    expect(container.querySelectorAll(TAG_NAME)).toHaveLength(0)
    expect(isAnnotated(container)).toBe(false)
  })

  it("does not throw when the inner Chinese element is missing", () => {
    // Page scripts are free to rewrite our markup while it is on screen.
    const container = document.createElement("div")
    const orphan = document.createElement(TAG_NAME)
    orphan.className = RESULT_CLASS
    orphan.textContent = "你"
    container.appendChild(orphan)

    expect(() => clearAnnotation(container)).not.toThrow()
    expect(container.textContent).toBe("你")
  })

  it("leaves unrelated siblings untouched", () => {
    const container = document.createElement("div")
    const before = document.createElement("b")
    before.textContent = "keep"
    container.appendChild(before)
    container.appendChild(buildAnnotatedFragment("你好", SYMBOL))
    const after = document.createElement("i")
    after.textContent = "also keep"
    container.appendChild(after)

    clearAnnotation(container)

    expect(container.firstElementChild).toBe(before)
    expect(container.lastElementChild).toBe(after)
    expect(container.textContent).toBe("keep你好also keep")
  })

  it("is a no-op on a tree without annotations", () => {
    const container = document.createElement("div")
    container.textContent = "plain"
    expect(() => clearAnnotation(container)).not.toThrow()
    expect(container.textContent).toBe("plain")
  })
})

describe("findTextNodesWithContent", () => {
  it("finds only text nodes containing Chinese", () => {
    const container = document.createElement("div")
    const chinese = document.createTextNode("你好")
    container.append(
      chinese,
      document.createTextNode("plain"),
      document.createTextNode("")
    )

    const found = findTextNodesWithContent(container, DEFAULT_IGNORED_NODES)

    expect(found).toEqual([chinese])
  })

  it("skips ignored elements", () => {
    const container = document.createElement("div")
    for (const tag of ["script", "style", "code", "pre"]) {
      const element = document.createElement(tag)
      element.textContent = "中文"
      container.appendChild(element)
    }

    expect(findTextNodesWithContent(container, DEFAULT_IGNORED_NODES)).toEqual(
      []
    )
  })

  it("skips its own annotation markup so it is not reprocessed", () => {
    const container = annotate("你好")

    expect(findTextNodesWithContent(container, DEFAULT_IGNORED_NODES)).toEqual(
      []
    )
  })

  it("skips text the page itself owns", () => {
    const container = document.createElement("div")

    const menu = document.createElement("select")
    const option = document.createElement("option")
    option.textContent = "菜單"
    menu.appendChild(option)

    const editor = document.createElement("div")
    editor.setAttribute("contenteditable", "true")
    editor.textContent = "編輯器內容"

    const frozen = document.createElement("span")
    frozen.setAttribute("contenteditable", "false")
    frozen.textContent = "不可編輯"

    container.append(menu, editor, frozen)

    const found = findTextNodesWithContent(container, DEFAULT_IGNORED_NODES)

    // Only the element that opts out of editing stays annotatable.
    expect(found.map((node) => node.parentElement?.tagName)).toEqual(["SPAN"])
  })

  it("does not throw when a text node has no element parent", () => {
    // parentElement is null inside a DocumentFragment, which used to make the
    // TreeWalker filter throw on node.parentElement.nodeName.
    const fragment = document.createDocumentFragment()
    const node = document.createTextNode("孤立中文")
    fragment.appendChild(node)

    expect(findTextNodesWithContent(fragment, DEFAULT_IGNORED_NODES)).toEqual([
      node
    ])
  })
})

describe("reading context", () => {
  /** Annotates in place the way the content script does, and returns readings. */
  function annotateInPlace(root: Element) {
    const contexts = createReadingContextCache()
    for (const node of findTextNodesWithContent(root, DEFAULT_IGNORED_NODES)) {
      const fragment = buildAnnotatedFragment(
        node.textContent ?? "",
        SYMBOL,
        findReadingContext(node, contexts)
      )
      node.parentNode?.replaceChild(fragment, node)
    }
    return [...root.querySelectorAll("rt")].map((rt) => rt.textContent)
  }

  it("reaches out of inline markup to the block holding the phrase", () => {
    // happy-dom has no default stylesheet, so the inline display a browser
    // gives <b> is spelled out here.
    const container = document.createElement("div")
    container.innerHTML = '我<b style="display: inline">银</b>行卡'
    document.body.appendChild(container)

    const bold = container.querySelector("b")?.firstChild ?? null

    expect(findReadingContext(bold as Node)).toEqual({
      text: "我银行卡",
      offset: 1
    })
  })

  it("has no context for a node without an element parent", () => {
    const fragment = document.createDocumentFragment()
    const node = document.createTextNode("孤立")
    fragment.appendChild(node)

    expect(findReadingContext(node)).toBeUndefined()
  })

  it("reads a word the markup split as the phrase it belongs to", () => {
    // 行 on its own is xíng; inside 银行卡 it is háng.
    const container = document.createElement("div")
    container.innerHTML = '我<b style="display: inline">银</b>行卡'
    document.body.appendChild(container)

    expect(annotateInPlace(container)).toEqual(["wǒ", "yín", "háng", "kǎ"])
  })

  it("keeps readings on their own when a node stands alone", () => {
    const container = document.createElement("div")
    container.textContent = "音乐"
    document.body.appendChild(container)

    expect(annotateInPlace(container)).toEqual(["yīn", "yuè"])
  })
})

describe("isTransparentColor", () => {
  it("recognises colours that paint nothing", () => {
    expect(isTransparentColor("")).toBe(true)
    expect(isTransparentColor("transparent")).toBe(true)
    expect(isTransparentColor("rgba(0, 0, 0, 0)")).toBe(true)
    expect(isTransparentColor("rgb(0 0 0 / 0)")).toBe(true)
  })

  it("keeps colours that paint something", () => {
    expect(isTransparentColor("rgb(0, 0, 0)")).toBe(false)
    expect(isTransparentColor("rgba(0, 0, 0, 0.5)")).toBe(false)
    expect(isTransparentColor("rgb(0 0 0 / 0.5)")).toBe(false)
    expect(isTransparentColor("rgb(255, 255, 255)")).toBe(false)
  })
})

describe("markBackdropHost", () => {
  /** A caption cue: text only, inline, painting its own backdrop. */
  function createCue(styles: Partial<CSSStyleDeclaration> = {}) {
    const cue = document.createElement("div")
    cue.textContent = "一切都是为了提高存活率"
    cue.style.display = "inline"
    cue.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
    Object.assign(cue.style, styles)
    document.body.appendChild(cue)
    return cue
  }

  it("marks an inline element that paints a backdrop", () => {
    const cue = createCue()

    expect(markBackdropHost(cue)).toBe(true)
    expect(cue.hasAttribute(BACKDROP_ATTR)).toBe(true)
  })

  it("ignores text on a block box, which already paints behind its line box", () => {
    const block = createCue({ display: "block" })

    expect(markBackdropHost(block)).toBe(false)
    expect(block.hasAttribute(BACKDROP_ATTR)).toBe(false)
  })

  it("ignores text whose backdrop is transparent", () => {
    const plain = createCue({ backgroundColor: "transparent" })

    expect(markBackdropHost(plain)).toBe(false)
  })

  it("does not mark the same host twice", () => {
    const cue = createCue()

    expect(markBackdropHost(cue)).toBe(true)
    expect(markBackdropHost(cue)).toBe(false)
  })

  it("is unmarked again once the annotation is cleared", () => {
    const cue = createCue()
    markBackdropHost(cue)
    cue.replaceChildren(buildAnnotatedFragment("你好", SYMBOL))

    clearAnnotation(cue)

    expect(cue.hasAttribute(BACKDROP_ATTR)).toBe(false)
    expect(cue.textContent).toBe("你好")
  })
})
