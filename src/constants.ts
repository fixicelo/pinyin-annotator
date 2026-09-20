export enum ToneType {
  Symbol = "symbol",
  Num = "num",
  None = "none"
}

export enum PronunciationSystem {
  Pinyin = "pinyin",
  Zhuyin = "zhuyin"
}

export enum Theme {
  System = "system",
  Light = "light",
  Dark = "dark"
}

export enum RubyPosition {
  OVER = "over",
  UNDER = "under",
  RIGHT = "inter-character"
}

export enum UserAction {
  Annotate = "annotate",
  Clear = "clear",
  Check = "check",
  UpdateOptions = "update_options"
}

export enum ResponseStatus {
  Annotated = "annotated",
  NotAnnotated = "not_annotated"
}

export enum TabStatus {
  Loading = "loading",
  Available = "available",
  RestrictedPage = "restricted_page",
  NeedsRefresh = "needs_refresh"
}

export const RESTRICTED_URL_PATTERNS = [
  /^chrome:/,
  /^chrome-extension:/,
  /^edge:/,
  /^about:/,
  /^brave:/,
  /^vivaldi:/,
  /^opera:/,
  /^moz-extension:/,
  /^https:\/\/chromewebstore\.google\.com/,
  /^https:\/\/microsoftedge\.microsoft\.com\/addons/,
  /^https:\/\/addons\.mozilla\.org/
]

export enum StorageKey {
  toneType = "toneType",
  pronunciationSystem = "pronunciationSystem",
  theme = "theme",
  observerEnabled = "observerEnabled",
  ignoredNodes = "ignoredNodes",
  dictLinkEnabled = "dictLinkEnabled",
  selectedDict = "selectedDict",
  customDictUrl = "customDictUrl",
  rubyPosition = "rubyPosition",
  autoAnnotate = "autoAnnotate",
  annotationScale = "annotationScale",
  scaleTextTogether = "scaleTextTogether",
  scaleTextTogetherTouched = "scaleTextTogetherTouched",
  uiLanguage = "uiLanguage"
}

export interface UserPreferences {
  toneType?: ToneType
  pronunciationSystem?: PronunciationSystem
  observerEnabled?: boolean
  rubyPosition?: RubyPosition
  autoAnnotate?: boolean
  annotationScale?: number
  scaleTextTogether?: boolean
  scaleTextTogetherTouched?: boolean
}

export interface Response {
  status: ResponseStatus
}

/**
 * An action sent to every content script of a tab. Each frame that handles it
 * reports the status it ended up in, and `requestId` ties those reports back to
 * the action that asked for them.
 */
export interface AnnotatorActionMessage {
  action: UserAction
  data?: UserPreferences
  requestId?: number
}

/**
 * Every frame that handled an action broadcasts how it ended up, because
 * tabs.sendMessage only resolves with the first frame's response. Captions
 * usually live in a player iframe the top frame cannot read, so without these
 * reports a page whose subtitles are annotated still looks untouched.
 */
export const FRAME_STATUS_MESSAGE = "pya-frame-status"

export interface FrameStatusReport {
  type: typeof FRAME_STATUS_MESSAGE
  /** The action being answered, or absent for a frame that reported itself. */
  requestId?: number
  status: ResponseStatus
}

/**
 * Remembering that a tab was asked to annotate lets frames that appear later
 * join in — a streaming site creates its player iframe, and navigates it,
 * long after the click that asked for annotations.
 */
export const TAB_ANNOTATION_MESSAGE = "pya-tab-annotation"
export const TAB_ANNOTATION_QUERY = "pya-tab-annotation-query"

export interface TabAnnotationReport {
  type: typeof TAB_ANNOTATION_MESSAGE
  annotating: boolean
  /** Set by extension pages, which do not carry a tab of their own. */
  tabId?: number
}

export interface TabAnnotationQuery {
  type: typeof TAB_ANNOTATION_QUERY
}

export type HtmlOptions = {
  toneType?: ToneType
  dictLink?: string
  pronunciationSystem?: PronunciationSystem
}

export const TAG_NAME = "pya"
export const RESULT_CLASS = "py-result-item"
export const CHINESE_CLASS = "py-chinese-item"
export const PINYIN_CLASS = "py-pinyin-item"
export const NON_CHINESE_CLASS = "py-non-chinese-item"
export const IS_ANNOTATED_ATTR = "data-pya-is-annotated"
export const BACKDROP_ATTR = "data-pya-backdrop"

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
  { url: "", desc: "Custom", site: "custom" }
]
