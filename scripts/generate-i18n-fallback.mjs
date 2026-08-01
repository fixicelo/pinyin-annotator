import { readFileSync, writeFileSync } from "node:fs"

const EN_PATH = "locales/en/messages.json"
const OUT_PATH = "src/lib/i18n-fallback.ts"

const en = JSON.parse(readFileSync(EN_PATH, "utf8"))

const map = Object.fromEntries(
  Object.entries(en).map(([key, value]) => [key, value.message])
)

const output = `// GENERATED FILE — do not edit by hand.
// Run \`npm run gen:i18n\` to regenerate from locales/en/messages.json.

export const i18nFallback: Record<string, string> = ${JSON.stringify(
  map,
  null,
  2
)}
`

writeFileSync(OUT_PATH, output)
console.log(`Generated ${OUT_PATH} with ${Object.keys(map).length} keys.`)
