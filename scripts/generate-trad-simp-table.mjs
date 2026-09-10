// Generates src/lib/trad-simp.ts — a traditional-to-simplified character table.
//
// The extension needs traditional-to-simplified conversion before pinyin lookup
// because pinyin-pro resolves polyphones through a phrase dictionary that is
// keyed on simplified forms. Feeding it traditional text directly degrades to
// per-character default readings (e.g. 因為 -> "yīn wéi" instead of "yīn wèi").
//
// This mapping is a stable linguistic fact, so the table is generated once and
// committed. Regenerate with:
//
//   node scripts/generate-trad-simp-table.mjs
//
// The script uses cnchar/cnchar-trad, which are devDependencies only — they are
// deliberately absent from the shipped bundle.
import { writeFileSync } from "node:fs"

import cnchar from "cnchar"
import trad from "cnchar-trad"

cnchar.use(trad)

// Ranges scanned for characters that have a distinct simplified form.
const RANGES = [
  [0x3400, 0x4dbf], // CJK Unified Ideographs Extension A
  [0x4e00, 0x9fff], // CJK Unified Ideographs
  [0xf900, 0xfaff], // CJK Compatibility Ideographs
  [0x2f800, 0x2fa1f] // CJK Compatibility Ideographs Supplement
]

const from = []
const to = []
const seen = new Set()

for (const [lo, hi] of RANGES) {
  for (let cp = lo; cp <= hi; cp++) {
    const char = String.fromCodePoint(cp)
    let simplified
    try {
      simplified = cnchar.convert.tradToSimple(char)
    } catch {
      continue
    }
    if (!simplified || simplified === char) continue
    if (seen.has(char)) continue
    seen.add(char)
    from.push(char)
    to.push(simplified)
  }
}

// Sanity checks: the table must be unambiguous and every mapping must be a
// single character, otherwise the per-character lookup below is wrong.
const known = [
  ["漢", "汉"],
  ["語", "语"],
  ["為", "为"],
  ["應", "应"],
  ["傳", "传"]
]
for (const [t, s] of known) {
  const i = from.indexOf(t)
  if (i === -1 || to[i] !== s) {
    throw new Error(`self-check failed: expected ${t} -> ${s}`)
  }
}
for (let i = 0; i < to.length; i++) {
  if ([...to[i]].length !== 1) {
    throw new Error(
      `mapping for ${from[i]} is not a single character: ${JSON.stringify(to[i])}`
    )
  }
}

const output = `// GENERATED FILE — do not edit by hand.
// Run \`node scripts/generate-trad-simp-table.mjs\` to regenerate.
//
// Traditional-to-simplified character map (${from.length} pairs). Conversion is a
// prerequisite for correct polyphone resolution: pinyin-pro disambiguates
// readings through a simplified-keyed phrase dictionary, so traditional input
// has to be normalised first.

const TRADITIONAL = ${JSON.stringify(from.join(""))}
const SIMPLIFIED = ${JSON.stringify(to.join(""))}

const TABLE = new Map<string, string>()
for (let i = 0; i < TRADITIONAL.length; i++) {
  TABLE.set(TRADITIONAL[i], SIMPLIFIED[i])
}

/** Number of characters in the table, exposed for tests. */
export const TRAD_SIMP_ENTRIES = ${from.length}

/**
 * Converts traditional Chinese characters to their simplified forms. Characters
 * that are already simplified (or are not Chinese) are returned unchanged.
 */
export function tradToSimplified(text: string): string {
  let result = ""
  for (const char of text) {
    result += TABLE.get(char) ?? char
  }
  return result
}
`

writeFileSync("src/lib/trad-simp.ts", output)
console.log(`Generated src/lib/trad-simp.ts with ${from.length} pairs.`)
