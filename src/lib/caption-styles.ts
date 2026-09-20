import { BACKDROP_ATTR, RubyPosition } from "~constants"

/**
 * How much room the reading needs above the text, relative to the reading's own
 * font size.
 *
 * Measured over base sizes of 16–72px, a ruby annotation's top sits 0.81–0.88
 * of its own font size above the text's content box, so the rest is slack for
 * the font metric differences between platforms. It is deliberately not
 * measured at runtime: that would mean reading layout for every annotation —
 * and again whenever the page resizes or the scale changes — to save a few
 * pixels of backdrop.
 */
const READING_SPACE_RATIO = 1.2

/**
 * Styles for a caption that paints a backdrop around the text it holds.
 *
 * An inline box paints that backdrop behind the glyphs only, so a reading above
 * them lands outside it. The marked element is given room above the text, and
 * its own backdrop then covers the reading; vertical padding on an inline box
 * paints without moving anything around it.
 *
 * Extending the backdrop is not enough on its own. A ruby annotation is painted
 * before the backdrop of the boxes around it — measured on JW Player, where a
 * caption whose backdrop reached the reading left it grey, and an opaque
 * backdrop hid it outright — so the reading is also lifted into the positioned
 * layer, which leaves it exactly where ruby placed it.
 *
 * Both declarations are !important because players style the same elements
 * themselves and load their stylesheet after this one: JW Player ships
 * `.jw-text-track-cue { padding: .1em 0 }`, which has the same specificity as
 * the padding rule and would otherwise win. A reading written to the side of
 * the text needs none of this, so that position gets no rules.
 */
export function buildCaptionBackdropCss(
  rubyPosition: RubyPosition,
  annotationFontSize: string
): string {
  const side =
    rubyPosition === RubyPosition.OVER
      ? "padding-top"
      : rubyPosition === RubyPosition.UNDER
        ? "padding-bottom"
        : ""

  if (!side) {
    return ""
  }

  return `
      [${BACKDROP_ATTR}] {
        ${side}: calc(${annotationFontSize} * ${READING_SPACE_RATIO}) !important;
      }
      [${BACKDROP_ATTR}] rt {
        position: relative !important;
      }
    `
}
