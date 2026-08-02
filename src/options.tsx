import { useEffect, useMemo, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import {
  NON_CHINESE_CLASS,
  PREDEFINED_DICT_LINK,
  PronunciationSystem,
  RESULT_CLASS,
  RubyPosition,
  StorageKey,
  Theme,
  ToneType,
  type HtmlOptions
} from "~constants"
import {
  ANNOTATION_SCALE_DEFAULT,
  getAnnotationFontSizeEm,
  getScaledTextFontSize,
  getScaledTextLineHeight,
  SCALE_TEXT_TOGETHER_DEFAULT
} from "~lib/annotation-scale"
import {
  applyLanguage,
  LOCALE_NAMES,
  SUPPORTED_LOCALES,
  t,
  useI18n
} from "~lib/i18n"

import AnnotationScaleControl from "./popup/AnnotationScaleControl"
import { useTheme } from "./popup/useTheme"
import { convertTextContentToHtml, debounce } from "./util"

import "./popup/design-system.css"

const SAMPLE_TEXT = "你好！"

function Options() {
  useTheme()
  const i18nVersion = useI18n()

  const [uiLanguage, setUILanguage] = useStorage<string>(
    StorageKey.uiLanguage,
    ""
  )

  const [toneType, setToneType] = useStorage<ToneType>(
    StorageKey.toneType,
    ToneType.Symbol
  )
  const [pronunciationSystem, setPronunciationSystem] =
    useStorage<PronunciationSystem>(
      StorageKey.pronunciationSystem,
      PronunciationSystem.Pinyin
    )
  const [observerEnabled, setObserverEnabled] = useStorage<boolean>(
    StorageKey.observerEnabled,
    true
  )
  const [autoAnnotate, setAutoAnnotate] = useStorage<boolean>(
    StorageKey.autoAnnotate,
    false
  )
  const [ignoredNodes, setIgnoredNodes] = useStorage<string[]>(
    StorageKey.ignoredNodes,
    []
  )
  const [ignoredNodesInput, setIgnoredNodesInput] = useState(
    ignoredNodes.join(",")
  )
  const [prevIgnoredNodes, setPrevIgnoredNodes] = useState(ignoredNodes)
  if (ignoredNodes !== prevIgnoredNodes) {
    setPrevIgnoredNodes(ignoredNodes)
    setIgnoredNodesInput(ignoredNodes.join(","))
  }
  const [notification, setNotification] = useState<string | null>(null)
  const [dictLinkEnabled, setDictLinkEnabled] = useStorage<boolean>(
    StorageKey.dictLinkEnabled,
    true
  )
  const [selectedDict, setSelectedDict] = useStorage<string>(
    StorageKey.selectedDict,
    PREDEFINED_DICT_LINK[0].site
  )
  const [customDictUrl, setCustomDictUrl] = useStorage<string>(
    StorageKey.customDictUrl,
    ""
  )
  const [rubyPosition, setRubyPosition] = useStorage<RubyPosition>(
    StorageKey.rubyPosition,
    RubyPosition.OVER
  )
  const [theme, setTheme] = useStorage<Theme>(StorageKey.theme, Theme.System)
  const [annotationScale] = useStorage<number>(
    StorageKey.annotationScale,
    ANNOTATION_SCALE_DEFAULT
  )
  const [scaleTextTogether] = useStorage<boolean>(
    StorageKey.scaleTextTogether,
    SCALE_TEXT_TOGETHER_DEFAULT
  )
  const [scaleTextTogetherTouched] = useStorage<boolean>(
    StorageKey.scaleTextTogetherTouched,
    false
  )
  const [shortcut, setShortcut] = useState("Alt+Shift+P")
  const [previewAnnotationScale, setPreviewAnnotationScale] = useState<number>()
  const [previewScaleTextTogether, setPreviewScaleTextTogether] =
    useState<boolean>()
  const resolvedScaleTextTogether = scaleTextTogetherTouched
    ? scaleTextTogether
    : SCALE_TEXT_TOGETHER_DEFAULT
  const effectiveAnnotationScale = previewAnnotationScale ?? annotationScale
  const effectiveScaleTextTogether =
    previewScaleTextTogether ?? resolvedScaleTextTogether
  const annotationFontSize = getAnnotationFontSizeEm(
    effectiveAnnotationScale,
    rubyPosition,
    effectiveScaleTextTogether
  )
  const scaledTextFontSize = getScaledTextFontSize(
    effectiveAnnotationScale,
    effectiveScaleTextTogether
  )
  const scaledTextLineHeight = getScaledTextLineHeight(
    effectiveAnnotationScale,
    rubyPosition,
    effectiveScaleTextTogether
  )

  useEffect(() => {
    applyLanguage(uiLanguage)
  }, [uiLanguage])

  useEffect(() => {
    document.title = t("extensionName")
  }, [i18nVersion])

  useEffect(() => {
    if (!chrome.commands?.getAll) return
    chrome.commands.getAll((commands) => {
      const toggle = commands.find((c) => c.name === "toggle-annotation")
      if (toggle?.shortcut) {
        setShortcut(toggle.shortcut)
      }
    })
  }, [])

  const handleUILanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUILanguage(e.target.value)
  }

  const handlePreviewChange = ({
    annotationScale: nextAnnotationScale,
    scaleTextTogether: nextScaleTextTogether
  }: {
    annotationScale: number
    scaleTextTogether: boolean
  }) => {
    setPreviewAnnotationScale(nextAnnotationScale)
    setPreviewScaleTextTogether(nextScaleTextTogether)
  }

  const handleToneTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToneType(e.target.checked ? ToneType.Symbol : ToneType.None)
  }

  const handlePronunciationSystemChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value as PronunciationSystem
    setPronunciationSystem(value)
    if (
      value === PronunciationSystem.Pinyin &&
      rubyPosition === RubyPosition.RIGHT
    ) {
      setRubyPosition(RubyPosition.OVER)
    }
  }

  const handleObserverEnabledChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setObserverEnabled(e.target.checked)
  }

  const handleAutoAnnotateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoAnnotate(e.target.checked)
  }

  // The storage setter is bound to a fixed key, so capturing the initial
  // instance once keeps the debounced function stable across re-renders.
  const debouncedSetIgnoredNodes = useMemo(
    () =>
      debounce((newIgnoredNodesInput: string) => {
        const newIgnoredNodes = newIgnoredNodesInput
          .split(",")
          .map((node) => node.trim())
          .filter(Boolean)
        setIgnoredNodes(newIgnoredNodes)
        setNotification(t("notificationSaved"))
        setTimeout(() => setNotification(null), 2000)
      }, 1000),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setter is stable by design
    []
  )

  const handleIgnoredNodesChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newIgnoredNodesInput = event.target.value.trim().toUpperCase()
    setIgnoredNodesInput(newIgnoredNodesInput)
    debouncedSetIgnoredNodes(newIgnoredNodesInput)
  }

  const handleDictLinkToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDictLinkEnabled(e.target.checked)
  }

  const handleDictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDict(e.target.value)
  }

  const handleCustomDictUrlChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomDictUrl(event.target.value)
  }

  const handleRubyPositionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRubyPosition(e.target.value as RubyPosition)
  }

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as Theme)
  }

  const previewHtml = useMemo(() => {
    const opts: HtmlOptions = { toneType, pronunciationSystem }
    return convertTextContentToHtml(SAMPLE_TEXT, opts)
  }, [toneType, pronunciationSystem])

  return (
    <div className="options-page">
      <style>{`
        body {
          background: var(--bg-layout);
        }
        .options-page {
          min-height: 100vh;
          min-height: 100dvh;
          background: var(--bg-layout);
          padding: 40px 20px;
        }
        .options-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
          align-items: start;
          max-width: 100%;
        }
        .options-layout > * {
          min-width: 0;
        }
        .options-preview {
          max-width: 100%;
          overflow-x: auto;
        }
        .options-preview-col {
          position: sticky;
          top: 40px;
        }
        .options-preview pya { ruby-position: ${rubyPosition}; }
        .options-preview .${RESULT_CLASS}[data-pya-is-annotated],
        .options-preview .${NON_CHINESE_CLASS} {
          font-size: ${scaledTextFontSize};
          line-height: ${scaledTextLineHeight};
        }
        .options-preview rt {
          font-size: ${annotationFontSize};
        }
        ${
          rubyPosition === RubyPosition.RIGHT
            ? `
        @supports not (ruby-position: inter-character) {
          .options-preview .py-result-item[data-pya-is-annotated] {
            display: inline-flex; align-items: center;
          }
          .options-preview .py-result-item[data-pya-is-annotated] ruby {
            display: contents;
          }
          .options-preview .py-result-item[data-pya-is-annotated] rp {
            display: none;
          }
          .options-preview .py-result-item[data-pya-is-annotated] rt {
            display: inline-block;
            writing-mode: vertical-lr;
            text-orientation: upright;
            font-size: ${annotationFontSize};
            line-height: 1;
            padding-left: 1px;
          }
        }`
            : ""
        }
        @media (max-width: 900px) {
          .options-layout {
            grid-template-columns: 1fr;
          }
          .options-preview-col {
            position: static;
            order: -1;
          }
        }
      `}</style>

      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              margin: "0 0 4px 0",
              fontSize: "28px",
              fontWeight: 600
            }}>
            {t("extensionName")}
          </h2>
        </div>

        <div className="options-layout">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="card">
              <div className="card-header">
                <h4>{t("optionsAppearanceTitle")}</h4>
              </div>
              <div className="card-body">
                <div className="settings-row">
                  <div className="settings-row-content">
                    <span className="settings-row-title">
                      {t("optionsWritingSystem")}
                    </span>
                    <span className="settings-row-desc">
                      {t("optionsWritingSystemDesc")}
                    </span>
                  </div>
                  <div className="settings-row-action">
                    <select
                      className="select"
                      value={pronunciationSystem}
                      onChange={handlePronunciationSystemChange}
                      style={{ width: "120px" }}>
                      <option value={PronunciationSystem.Pinyin}>
                        {t("optionPinyin")}
                      </option>
                      <option value={PronunciationSystem.Zhuyin}>
                        {t("optionZhuyin")}
                      </option>
                    </select>
                  </div>
                </div>

                {pronunciationSystem === PronunciationSystem.Pinyin && (
                  <div className="settings-row">
                    <div className="settings-row-content">
                      <span className="settings-row-title">
                        {t("optionsToneMarks")}
                      </span>
                      <span className="settings-row-desc">
                        {t("optionsToneMarksDesc")}
                      </span>
                    </div>
                    <div className="settings-row-action">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={toneType === ToneType.Symbol}
                          onChange={handleToneTypeChange}
                        />
                        <span className="switch-slider"></span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="settings-row">
                  <div className="settings-row-content">
                    <span className="settings-row-title">
                      {t("optionsPlacement")}
                    </span>
                    <span className="settings-row-desc">
                      {rubyPosition === RubyPosition.RIGHT
                        ? t("optionsPlacementDescRight")
                        : t("optionsPlacementDescOver")}
                    </span>
                  </div>
                  <div className="settings-row-action">
                    <select
                      className="select"
                      value={rubyPosition}
                      onChange={handleRubyPositionChange}
                      style={{ width: "120px" }}>
                      <option value={RubyPosition.OVER}>
                        {t("optionAbove")}
                      </option>
                      <option value={RubyPosition.UNDER}>
                        {t("optionBelow")}
                      </option>
                      {pronunciationSystem === PronunciationSystem.Zhuyin && (
                        <option value={RubyPosition.RIGHT}>
                          {t("optionRight")}
                        </option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-row-content">
                    <span className="settings-row-title">
                      {t("optionsLanguage")}
                    </span>
                    <span className="settings-row-desc">
                      {t("optionsLanguageDesc")}
                    </span>
                  </div>
                  <div className="settings-row-action">
                    <select
                      className="select"
                      value={uiLanguage}
                      onChange={handleUILanguageChange}
                      style={{ width: "180px" }}>
                      <option value="">{t("optionsFollowSystem")}</option>
                      {SUPPORTED_LOCALES.map((locale) => (
                        <option key={locale} value={locale}>
                          {LOCALE_NAMES[locale]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="appearance-scale-section">
                  <AnnotationScaleControl
                    communicateWithContentScript={() => {}}
                    syncWithCurrentTab={false}
                    onPreviewChange={handlePreviewChange}
                    embedded
                  />
                </div>

                <div className="settings-row">
                  <div className="settings-row-content">
                    <span className="settings-row-title">
                      {t("optionsTheme")}
                    </span>
                    <span className="settings-row-desc">
                      {t("optionsThemeDesc")}
                    </span>
                  </div>
                  <div className="settings-row-action">
                    <select
                      className="select"
                      value={theme}
                      onChange={handleThemeChange}
                      style={{ width: "120px" }}>
                      <option value={Theme.System}>{t("optionAuto")}</option>
                      <option value={Theme.Light}>{t("optionLight")}</option>
                      <option value={Theme.Dark}>{t("optionDark")}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h4>{t("optionsBehaviorTitle")}</h4>
              </div>
              <div className="card-body">
                <div className="settings-row">
                  <div className="settings-row-content">
                    <span className="settings-row-title">
                      {t("optionsAutoAnnotateTitle")}
                    </span>
                    <span className="settings-row-desc">
                      {t("optionsAutoAnnotateDesc")}
                    </span>
                  </div>
                  <div className="settings-row-action">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={autoAnnotate}
                        onChange={handleAutoAnnotateChange}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-row-content">
                    <span className="settings-row-title">
                      {t("optionsMonitorTitle")}
                    </span>
                    <span className="settings-row-desc">
                      {t("optionsMonitorDesc")}
                    </span>
                  </div>
                  <div className="settings-row-action">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={observerEnabled}
                        onChange={handleObserverEnabledChange}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-row-content">
                    <span className="settings-row-title">
                      {t("optionsWordLookup")}
                    </span>
                    <span className="settings-row-desc">
                      {t("optionsWordLookupDesc")}
                    </span>
                  </div>
                  <div className="settings-row-action">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={dictLinkEnabled}
                        onChange={handleDictLinkToggle}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>

                {dictLinkEnabled && (
                  <div
                    className="settings-row"
                    style={{
                      background: "var(--bg-hover)",
                      margin: "0 16px 16px",
                      borderRadius: "var(--border-radius-sm)",
                      border: "none"
                    }}>
                    <div className="settings-row-content">
                      <span className="settings-row-title">
                        {t("optionsWhichDict")}
                      </span>
                    </div>
                    <div className="settings-row-action">
                      <select
                        className="select"
                        value={selectedDict}
                        onChange={handleDictChange}
                        style={{ width: "200px" }}>
                        {PREDEFINED_DICT_LINK.map((dict) => (
                          <option key={dict.site} value={dict.site}>
                            {dict.desc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {dictLinkEnabled && selectedDict === "custom" && (
                  <div
                    className="settings-row"
                    style={{
                      background: "var(--bg-hover)",
                      margin: "-8px 16px 16px",
                      borderRadius: "var(--border-radius-sm)",
                      border: "none"
                    }}>
                    <div className="settings-row-content">
                      <span className="settings-row-title">
                        {t("optionsUrlPattern")}
                      </span>
                      <span className="settings-row-desc">
                        {t("optionsUrlPatternDesc")}
                      </span>
                    </div>
                    <div
                      className="settings-row-action"
                      style={{ width: "250px" }}>
                      <input
                        className="input"
                        value={customDictUrl}
                        onChange={handleCustomDictUrlChange}
                        placeholder={t("optionsUrlPatternPlaceholder")}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                background: "var(--bg-card)",
                borderRadius: "var(--border-radius-lg)",
                border: "1px solid var(--border-color)",
                padding: "16px 20px"
              }}>
              <span
                className="settings-row-title"
                style={{ marginBottom: "6px" }}>
                {t("optionsShortcutTitle")}
              </span>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                <span className="text-secondary" style={{ fontSize: "13px" }}>
                  <span className="keyboard">{shortcut || "Alt+Shift+P"}</span>{" "}
                  {t("optionsShortcutDesc")}
                </span>
                <button
                  className="btn btn-text"
                  onClick={async () => {
                    try {
                      await chrome.tabs.create({
                        url: "chrome://extensions/shortcuts",
                        active: true
                      })
                    } catch {
                      const cmd = chrome.commands as typeof chrome.commands & {
                        openShortcutSettings?: () => Promise<void>
                      }
                      if (typeof cmd.openShortcutSettings === "function") {
                        await cmd.openShortcutSettings()
                      } else {
                        alert(t("shortcutChangeInstructions"))
                      }
                    }
                  }}
                  style={{
                    fontSize: "12px",
                    height: "auto",
                    padding: "2px 8px"
                  }}>
                  {t("buttonChange")}
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h4>{t("optionsAdvancedTitle")}</h4>
              </div>
              <div className="card-body" style={{ padding: "20px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <span className="settings-row-title">
                    {t("optionsSkipTitle")}
                  </span>
                  <span className="settings-row-desc">
                    {t("optionsSkipDesc")}
                  </span>
                </div>

                <textarea
                  className="textarea"
                  value={ignoredNodesInput}
                  onChange={handleIgnoredNodesChange}
                  placeholder={t("optionsSkipPlaceholder")}
                  style={{ minHeight: "80px" }}
                />
                {notification && (
                  <div
                    className="alert alert-success"
                    style={{ marginTop: "12px" }}>
                    <div>{notification}</div>
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                paddingBottom: "20px"
              }}>
              <span className="text-secondary text-small">
                <a
                  href="https://github.com/fixicelo/pinyin-annotator/issues"
                  target="_blank"
                  rel="noopener noreferrer">
                  {t("optionsReportBug")}
                </a>
                {" · "}
                {t("optionsFooterCopyright", String(new Date().getFullYear()))}
              </span>
            </div>
          </div>

          <div className="options-preview-col">
            <div className="card">
              <div
                style={{
                  padding: "12px 20px",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}>
                  {t("optionsPreviewTitle")}
                </h4>
                <span className="text-secondary text-small">
                  {pronunciationSystem === PronunciationSystem.Pinyin
                    ? toneType === ToneType.Symbol
                      ? t("optionsPreviewWithTones")
                      : t("optionsPreviewWithoutTones")
                    : t("optionsPreviewZhuyin")}
                  {" · "}
                  {rubyPosition === RubyPosition.RIGHT
                    ? t("optionsPreviewRight")
                    : rubyPosition === RubyPosition.OVER
                      ? t("optionsPreviewAbove")
                      : t("optionsPreviewBelow")}
                  {" · "}
                  {effectiveAnnotationScale}%{" · "}
                  {effectiveScaleTextTogether
                    ? t("optionsPreviewTextAndAnnotation")
                    : t("optionsPreviewAnnotationOnly")}
                </span>
              </div>
              <div
                className="options-preview"
                style={{
                  padding: "32px 24px",
                  fontSize: "22px",
                  lineHeight: "2",
                  minHeight: "140px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  background: "var(--bg-base)"
                }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Options
