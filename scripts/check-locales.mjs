import { readdirSync, readFileSync } from "node:fs"

const LOCALES_DIR = "locales"

const locales = readdirSync(LOCALES_DIR).filter((dir) =>
  dir.match(/^[a-z]{2,3}(_[A-Z]{2})?$/)
)

if (locales.length === 0) {
  console.error("No locale folders found.")
  process.exit(1)
}

const baseLocale = locales.includes("en")
  ? "en"
  : locales.sort((a, b) => a.localeCompare(b))[0]

const readKeys = (locale) =>
  new Set(
    Object.keys(
      JSON.parse(readFileSync(`${LOCALES_DIR}/${locale}/messages.json`, "utf8"))
    )
  )

const baseKeys = readKeys(baseLocale)
let hasErrors = false

const readMessages = (locale) =>
  JSON.parse(readFileSync(`${LOCALES_DIR}/${locale}/messages.json`, "utf8"))

// Caps the manifest description at 132 characters.
const DESCRIPTION_LIMIT = 132
const DESCRIPTION_KEYS = ["extensionDescription", "extensionName"]

for (const locale of locales) {
  const messages = readMessages(locale)
  const keys = new Set(Object.keys(messages))

  const missing = [...baseKeys].filter((key) => !keys.has(key))
  const extra = [...keys].filter((key) => !baseKeys.has(key))

  if (missing.length > 0 || extra.length > 0) {
    hasErrors = true
    if (missing.length > 0) {
      console.error(`[${locale}] missing keys: ${missing.join(", ")}`)
    }
    if (extra.length > 0) {
      console.error(`[${locale}] extra keys: ${extra.join(", ")}`)
    }
  }

  for (const key of DESCRIPTION_KEYS) {
    const value = messages[key]?.message
    if (typeof value === "string" && value.length > DESCRIPTION_LIMIT) {
      hasErrors = true
      console.error(
        `[${locale}] ${key} is ${value.length} chars, exceeds ${DESCRIPTION_LIMIT}`
      )
    }
  }
}

const total = baseKeys.size
console.log(
  hasErrors
    ? `FAIL: ${locales.length} locales checked against ${baseLocale} (${total} keys).`
    : `OK: ${locales.length} locales all match ${baseLocale} (${total} keys).`
)

process.exit(hasErrors ? 1 : 0)
