import { RubyPosition } from "~constants"

export const ANNOTATION_SCALE_DEFAULT = 100
export const ANNOTATION_SCALE_MIN = 50
export const ANNOTATION_SCALE_MAX = 300
export const ANNOTATION_SCALE_STEP = 25
export const ANNOTATION_SCALE_MARKS = [50, 100, 150, 200, 250, 300] as const
export const ANNOTATION_SCALE_TICKS = Array.from(
  {
    length:
      (ANNOTATION_SCALE_MAX - ANNOTATION_SCALE_MIN) / ANNOTATION_SCALE_STEP + 1
  },
  (_, index) => ANNOTATION_SCALE_MIN + index * ANNOTATION_SCALE_STEP
)
export const SCALE_TEXT_TOGETHER_DEFAULT = false

const BASE_ANNOTATION_FONT_SIZE_EM = 0.5
const RIGHT_SIDE_ANNOTATION_FONT_SIZE_EM = 0.4

export function clampAnnotationScale(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return ANNOTATION_SCALE_DEFAULT
  }

  return Math.min(
    ANNOTATION_SCALE_MAX,
    Math.max(ANNOTATION_SCALE_MIN, Math.round(value))
  )
}

export function snapAnnotationScaleToStep(value: number | undefined): number {
  const clampedValue = clampAnnotationScale(value)

  return Math.min(
    ANNOTATION_SCALE_MAX,
    ANNOTATION_SCALE_MIN +
      Math.round(
        (clampedValue - ANNOTATION_SCALE_MIN) / ANNOTATION_SCALE_STEP
      ) *
        ANNOTATION_SCALE_STEP
  )
}

export function getBaseAnnotationFontSizeEm(
  rubyPosition: RubyPosition | undefined
): number {
  return rubyPosition === RubyPosition.RIGHT
    ? RIGHT_SIDE_ANNOTATION_FONT_SIZE_EM
    : BASE_ANNOTATION_FONT_SIZE_EM
}

export function getAnnotationFontSizeEm(
  value: number | undefined,
  rubyPosition?: RubyPosition,
  scaleTextTogether: boolean = false
): string {
  const scaledValue =
    (getBaseAnnotationFontSizeEm(rubyPosition) *
      (scaleTextTogether
        ? ANNOTATION_SCALE_DEFAULT
        : clampAnnotationScale(value))) /
    100

  return `${Number(scaledValue.toFixed(3))}em`
}

export function getScaledTextFontSize(
  value: number | undefined,
  scaleTextTogether: boolean = false
): string {
  return scaleTextTogether ? `${clampAnnotationScale(value)}%` : "100%"
}

export function getScaledTextLineHeight(
  value: number | undefined,
  rubyPosition?: RubyPosition,
  scaleTextTogether: boolean = false
): string {
  if (rubyPosition === RubyPosition.RIGHT) {
    return "inherit"
  }

  const scaleRatio = clampAnnotationScale(value) / 100
  if (scaleRatio <= 1) {
    return "inherit"
  }

  const multiplier = scaleTextTogether ? 0.35 : 0.18
  return `${Number((1 + (scaleRatio - 1) * multiplier).toFixed(2))}`
}
