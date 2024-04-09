export enum ToneType {
  Symbol = "symbol",
  Num = "num",
  None = "none"
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

export enum StorageKey {
  toneType = "toneType",
  observerEnabled = "observerEnabled"
}

export interface UserPreferences {
  toneType?: ToneType
  observerEnabled?: boolean
}

export interface Response {
  status: ResponseStatus
}

export type HtmlOptions = {
  wrapNonChinese?: boolean
  toneType?: ToneType
}

export const TAG_NAME = "pya"
export const RESULT_CLASS = "py-result-item"
export const CHINESE_CLASS = "py-chinese-item"
export const PINYIN_CLASS = "py-pinyin-item"
export const NON_CHINESE_CLASS = "py-non-chinese-item"
export const IS_ANNOTATED_ATTR = "data-pya-is-annotated"

export const IGNORED_NODES = [
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
