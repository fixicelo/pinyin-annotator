import { describe, expect, it } from "vitest"

import { BACKDROP_ATTR, RubyPosition } from "~constants"
import { buildCaptionBackdropCss } from "~lib/caption-styles"

describe("buildCaptionBackdropCss", () => {
  it("makes room above the text for a reading over it", () => {
    const css = buildCaptionBackdropCss(RubyPosition.OVER, "0.5em")

    expect(css).toContain(`[${BACKDROP_ATTR}] {`)
    expect(css).toContain("padding-top: calc(0.5em * 1.2) !important;")
    expect(css).not.toContain("padding-bottom")
  })

  it("makes room below the text for a reading under it", () => {
    const css = buildCaptionBackdropCss(RubyPosition.UNDER, "0.75em")

    expect(css).toContain("padding-bottom: calc(0.75em * 1.2) !important;")
    expect(css).not.toContain("padding-top")
  })

  it("lifts the reading into the positioned layer", () => {
    // The backdrop of a caption is painted over a ruby annotation, which left
    // white readings grey on JW Player.
    expect(buildCaptionBackdropCss(RubyPosition.OVER, "0.5em")).toContain(
      `[${BACKDROP_ATTR}] rt {\n        position: relative !important;`
    )
  })

  it("adds nothing when the reading sits beside the text", () => {
    expect(buildCaptionBackdropCss(RubyPosition.RIGHT, "0.5em")).toBe("")
  })

  it("never paints a backdrop of its own", () => {
    // The caption's own colour is what has to show through, so the rules must
    // not carry one.
    expect(buildCaptionBackdropCss(RubyPosition.OVER, "0.5em")).not.toMatch(
      /rgba?\(/
    )
  })
})
