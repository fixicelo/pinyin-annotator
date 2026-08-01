import { describe, expect, it } from "vitest"

import { RubyPosition } from "~constants"
import {
  ANNOTATION_SCALE_DEFAULT,
  ANNOTATION_SCALE_MAX,
  ANNOTATION_SCALE_MIN,
  clampAnnotationScale,
  getAnnotationFontSizeEm,
  getBaseAnnotationFontSizeEm,
  getScaledTextFontSize,
  getScaledTextLineHeight,
  snapAnnotationScaleToStep
} from "~lib/annotation-scale"

describe("clampAnnotationScale", () => {
  it("falls back to the default for non-finite values", () => {
    expect(clampAnnotationScale(undefined)).toBe(ANNOTATION_SCALE_DEFAULT)
    expect(clampAnnotationScale(Number.NaN)).toBe(ANNOTATION_SCALE_DEFAULT)
  })

  it("clamps to the supported range", () => {
    expect(clampAnnotationScale(10)).toBe(ANNOTATION_SCALE_MIN)
    expect(clampAnnotationScale(999)).toBe(ANNOTATION_SCALE_MAX)
    expect(clampAnnotationScale(50)).toBe(50)
    expect(clampAnnotationScale(300)).toBe(300)
  })

  it("rounds fractional values", () => {
    expect(clampAnnotationScale(137.6)).toBe(138)
  })
})

describe("snapAnnotationScaleToStep", () => {
  it("snaps to the nearest 25-step", () => {
    expect(snapAnnotationScaleToStep(100)).toBe(100)
    expect(snapAnnotationScaleToStep(125)).toBe(125)
    expect(snapAnnotationScaleToStep(120)).toBe(125)
    expect(snapAnnotationScaleToStep(110)).toBe(100)
  })

  it("stays within the range", () => {
    expect(snapAnnotationScaleToStep(10)).toBe(50)
    expect(snapAnnotationScaleToStep(999)).toBe(300)
  })
})

describe("getBaseAnnotationFontSizeEm", () => {
  it("uses a smaller base for right-side placement", () => {
    expect(getBaseAnnotationFontSizeEm(RubyPosition.RIGHT)).toBe(0.4)
    expect(getBaseAnnotationFontSizeEm(RubyPosition.OVER)).toBe(0.5)
    expect(getBaseAnnotationFontSizeEm(undefined)).toBe(0.5)
  })
})

describe("getAnnotationFontSizeEm", () => {
  it("scales the annotation size", () => {
    expect(getAnnotationFontSizeEm(100)).toBe("0.5em")
    expect(getAnnotationFontSizeEm(200)).toBe("1em")
    expect(getAnnotationFontSizeEm(50)).toBe("0.25em")
  })

  it("uses the default scale when scaling text together", () => {
    expect(getAnnotationFontSizeEm(200, RubyPosition.OVER, true)).toBe("0.5em")
  })

  it("applies the right-side base size", () => {
    expect(getAnnotationFontSizeEm(200, RubyPosition.RIGHT)).toBe("0.8em")
  })
})

describe("getScaledTextFontSize", () => {
  it("returns the scale only when scaling text together", () => {
    expect(getScaledTextFontSize(200, true)).toBe("200%")
    expect(getScaledTextFontSize(200, false)).toBe("100%")
  })
})

describe("getScaledTextLineHeight", () => {
  it("returns inherit when not scaling up or using right placement", () => {
    expect(getScaledTextLineHeight(100)).toBe("inherit")
    expect(getScaledTextLineHeight(200, RubyPosition.RIGHT)).toBe("inherit")
  })

  it("computes a growing line height", () => {
    expect(getScaledTextLineHeight(200, RubyPosition.OVER, false)).toBe("1.18")
    expect(getScaledTextLineHeight(200, RubyPosition.OVER, true)).toBe("1.35")
  })
})
