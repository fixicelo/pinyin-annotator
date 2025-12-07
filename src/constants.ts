export enum ToneType {
  Symbol = "symbol",
  Num = "num",
  None = "none"
}

export enum RubyPosition {
  OVER = "over",
  UNDER = "under"
}

export enum UserAction {
  Annotate = "annotate",
  Clear = "clear",
  Check = "check",
  UpdateOptions = "update_options",
  Toggle = "toggle"
}

export enum ResponseStatus {
  Annotated = "annotated",
  NotAnnotated = "not_annotated"
}

export enum StorageKey {
  toneType = "toneType",
  observerEnabled = "observerEnabled",
  ignoredNodes = "ignoredNodes",
  dictLinkEnabled = "dictLinkEnabled",
  selectedDict = "selectedDict",
  customDictUrl = "customDictUrl",
  rubyPosition = "rubyPosition",
  autoAnnotate = "autoAnnotate"
}

export interface UserPreferences {
  toneType?: ToneType
  observerEnabled?: boolean
  rubyPosition?: RubyPosition
  autoAnnotate?: boolean
}

export interface Response {
  status: ResponseStatus
}

export type HtmlOptions = {
  wrapNonChinese?: boolean
  toneType?: ToneType
  dictLink?: string
}

export const TAG_NAME = "pya"
export const RESULT_CLASS = "py-result-item"
export const CHINESE_CLASS = "py-chinese-item"
export const PINYIN_CLASS = "py-pinyin-item"
export const NON_CHINESE_CLASS = "py-non-chinese-item"
export const IS_ANNOTATED_ATTR = "data-pya-is-annotated"

export const DEFAULT_IGNORED_NODES = [
  TAG_NAME.toUpperCase(),
  "RP",
  "RT",
  "RUBY",
  "SCRIPT",
  "STYLE",
  "CODE",
  "PRE",
  "KBD",
  "INPUT",
  "TEXTAREA"
]

export const ANNOTATION_TYPE = {
  PINYIN: {
    id: "PINYIN",
    example: "pīn"
  },
  PINYIN_NONE: {
    id: "PINYIN_NONE",
    example: "pin"
  },
  PINYIN_NUM: {
    id: "PINYIN_NUM",
    example: "pin1"
  }
}

export const PREDEFINED_DICT_LINK = [
  { url: "https://www.zdic.net/hans/{word}", desc: "汉典", site: "zdic.net" },
  { url: "https://www.moedict.tw/{word}", desc: "萌典", site: "moedict.tw" },
  {
    url: "https://www.mdbg.net/chinese/dictionary?page=worddict&wdqb={word}",
    desc: "MDBG",
    site: "mdbg.net"
  },
  {
    url: "https://dictionary.cambridge.org/dictionary/chinese-traditional-english/{word}",
    desc: "Cambridge",
    site: "dictionary.cambridge.org"
  },
  {
    url: "https://hk.dictionary.search.yahoo.com/search?p={word}",
    desc: "Yahoo",
    site: "hk.dictionary.search.yahoo.com"
  },
  {
    url: "https://translate.google.com/?hl=zh-TW&sl=zh-TW&tl=en&text={word}&op=translate",
    desc: "Google Translate",
    site: "translate.google.com"
  },
  {
    url: "https://www.putonghuaweb.com/charDict/{word}",
    desc: "Putonghua Web",
    site: "putonghuaweb.com"
  },
  { url: "", desc: "Custom", site: "custom" },
]
