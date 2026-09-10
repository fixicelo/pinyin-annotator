import cnchar from "cnchar"
import trad from "cnchar-trad"
import { describe, expect, it } from "vitest"

import { tradToSimplified, TRAD_SIMP_ENTRIES } from "~lib/trad-simp"

cnchar.use(trad)

describe("tradToSimplified", () => {
  it("converts traditional characters to simplified forms", () => {
    expect(tradToSimplified("漢語拼音")).toBe("汉语拼音")
    expect(tradToSimplified("繁體字轉換")).toBe("繁体字转换")
  })

  it("leaves simplified text, latin and punctuation untouched", () => {
    const input = "简体字 already fine，。!? 123"
    expect(tradToSimplified(input)).toBe(input)
  })

  it("preserves string length so pinyin indices stay aligned", () => {
    // The annotation pipeline indexes pinyin results against code points of the
    // original text, so conversion must be strictly one character to one
    // character.
    const input = "漢語拼音轉換測試"
    expect([...tradToSimplified(input)].length).toBe([...input].length)
  })

  it("handles astral characters without corrupting them", () => {
    const input = "漢\u{2000B}語"
    expect(tradToSimplified(input)).toBe("汉\u{2000B}语")
  })

  it("contains the expected number of pairs", () => {
    expect(TRAD_SIMP_ENTRIES).toBe(2667)
  })

  // Guards against the committed table drifting from its source of truth.
  // cnchar-trad is a devDependency used only here and by the generator script.
  it("matches cnchar-trad across the whole mapped range", () => {
    const mismatches: string[] = []
    for (const [lo, hi] of [
      [0x3400, 0x4dbf],
      [0x4e00, 0x9fff],
      [0xf900, 0xfaff]
    ]) {
      for (let cp = lo; cp <= hi; cp++) {
        const char = String.fromCodePoint(cp)
        const expected = cnchar.convert.tradToSimple(char)
        const actual = tradToSimplified(char)
        if (expected !== actual && mismatches.length < 10) {
          mismatches.push(`U+${cp.toString(16)} ${char}: ${expected} != ${actual}`)
        }
      }
    }
    expect(mismatches).toEqual([])
  })
})
