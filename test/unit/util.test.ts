import { describe, expect, it } from "vitest"

import { PronunciationSystem, ToneType } from "~constants"
import {
  containsChinese,
  convertTextContentToHtml,
  pinyinToZhuyin
} from "~util"

describe("containsChinese", () => {
  it("detects Chinese characters", () => {
    expect(containsChinese("你好")).toBe(true)
    expect(containsChinese("中文abc")).toBe(true)
  })

  it("rejects non-Chinese text", () => {
    expect(containsChinese("hello")).toBe(false)
    expect(containsChinese("")).toBe(false)
  })
})

describe("pinyinToZhuyin", () => {
  it("returns an empty string for empty input", () => {
    expect(pinyinToZhuyin("")).toBe("")
  })

  it("converts pinyin with tone numbers", () => {
    expect(pinyinToZhuyin("ni3")).toBe("ㄋㄧˇ")
    expect(pinyinToZhuyin("hao3")).toBe("ㄏㄠˇ")
    expect(pinyinToZhuyin("zhong1")).toBe("ㄓㄨㄥ")
    expect(pinyinToZhuyin("wen2")).toBe("ㄨㄣˊ")
  })

  it("handles the neutral tone marker prefix", () => {
    expect(pinyinToZhuyin("ma5")).toBe("˙ㄇㄚ")
  })

  it("handles syllabic consonants", () => {
    expect(pinyinToZhuyin("zhi1")).toBe("ㄓ")
    expect(pinyinToZhuyin("zi5")).toBe("˙ㄗ")
  })

  it("handles zero-initial forms", () => {
    expect(pinyinToZhuyin("yu2")).toBe("ㄩˊ")
    expect(pinyinToZhuyin("a1")).toBe("ㄚ")
  })

  it("normalizes case and ü spellings", () => {
    expect(pinyinToZhuyin("NI3")).toBe("ㄋㄧˇ")
    expect(pinyinToZhuyin("lv4")).toBe("ㄌㄩˋ")
    expect(pinyinToZhuyin("jv4")).toBe("ㄐㄩˋ")
  })
})

describe("convertTextContentToHtml", () => {
  it("annotates Chinese characters with pinyin", () => {
    const html = convertTextContentToHtml("你好", {})
    expect(html).toContain('class="py-result-item"')
    expect(html).toContain('data-pya-is-annotated="true"')
    expect(html).toContain('<rt class="py-pinyin-item">nǐ</rt>')
    expect(html).toContain('<rt class="py-pinyin-item">hǎo</rt>')
  })

  it("merges adjacent non-Chinese characters into a single wrapper", () => {
    const html = convertTextContentToHtml("A！", {})
    expect(html).toBe('<pya class="py-non-chinese-item">A！</pya>')
  })

  it("keeps unannotated runs on both sides of an annotated character", () => {
    const html = convertTextContentToHtml("hi 你 ok", {})
    expect(html).toContain('<pya class="py-non-chinese-item">hi </pya>')
    expect(html).toContain('<pya class="py-non-chinese-item"> ok</pya>')
    expect(html.match(/py-non-chinese-item/g)).toHaveLength(2)
  })

  it("escapes markup so merged runs cannot break out of the wrapper", () => {
    const html = convertTextContentToHtml('a < b & "c"', {})
    expect(html).not.toContain("< b")
    expect(html).toContain("a &lt; b &amp; &quot;c&quot;")
  })

  it("omits the legacy <rp> fallback elements", () => {
    const html = convertTextContentToHtml("你好", {})
    expect(html).not.toContain("<rp>")
  })

  it("omits tone marks when toneType is none", () => {
    const html = convertTextContentToHtml("你", { toneType: ToneType.None })
    expect(html).toContain('<rt class="py-pinyin-item">ni</rt>')
  })

  it("outputs zhuyin when the zhuyin system is selected", () => {
    const html = convertTextContentToHtml("你好", {
      pronunciationSystem: PronunciationSystem.Zhuyin
    })
    expect(html).toContain('<rt class="py-pinyin-item">ㄋㄧˇ</rt>')
    expect(html).toContain('<rt class="py-pinyin-item">ㄏㄠˇ</rt>')
  })

  it("wraps annotated characters in a dict link when configured", () => {
    const html = convertTextContentToHtml("你", {
      dictLink: "https://dict.example/{word}"
    })
    expect(html).toContain('<a href="https://dict.example/你" target="_blank">')
  })
})
