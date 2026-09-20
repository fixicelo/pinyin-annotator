import { useEffect, useMemo, useState } from "react"
import chineseFindIconUrl from "url:~/assets/chinese-find.png"
import iconUrl from "url:~/assets/icon.png"

import { useStorage } from "@plasmohq/storage/hook"

import {
  NON_CHINESE_CLASS,
  PronunciationSystem,
  RESULT_CLASS,
  RubyPosition,
  StorageKey,
  ToneType,
  type HtmlOptions
} from "~constants"
import {
  ANNOTATION_SCALE_DEFAULT,
  clampAnnotationScale,
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
import { useCommandShortcut } from "~lib/use-command-shortcut"
import { convertTextContentToHtml } from "~util"

import { BrowserMock, Pointer } from "../components/browser-mock"
import { openOptionsPage } from "../popup/openOptionsPage"

import "./welcome.css"

const REPO_URL = "https://github.com/fixicelo/pinyin-annotator"
const FEEDBACK_URL = "https://github.com/fixicelo/pinyin-annotator/issues/new"

/**
 * Chinese Find, the sibling extension. This guide is the mirror of its own:
 * there this extension is the one being recommended, here it is the one being
 * pinned and Chinese Find is the row that links out.
 */
const CHINESE_FIND_STORES = {
  chrome:
    "https://chrome.google.com/webstore/detail/ggdpaigngdljdilmcbdeeffahjpmgema",
  edge: "https://microsoftedge.microsoft.com/addons/detail/peebdkhlndmpmhdlgalnkcmkklipockf",
  firefox: "https://addons.mozilla.org/addon/chinese-find/"
} as const
const CHINESE_FIND_UTM = "?utm_source=pinyin-annotator&utm_medium=onboarding"

function chineseFindUrl(): string {
  const ua = navigator.userAgent
  const store = ua.includes("Firefox/")
    ? "firefox"
    : ua.includes("Edg/")
      ? "edge"
      : "chrome"
  return CHINESE_FIND_STORES[store] + CHINESE_FIND_UTM
}

const PAGE_SAMPLE = "讀音落在字上，一頁書就有了聲音。"
const CAPTION_SAMPLES = [
  "影片開始了，字幕會一句一句出現。",
  "每個漢字的上方，都標好了讀音。",
  "換到下一句時，讀音也跟著更新。"
]
const CAPTION_INTERVAL_MS = 4200

const PIN_FILLED = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <g transform="rotate(45 12 12)">
      <path d="M16 9V4h1a1 1 0 0 0 0-2H7a1 1 0 0 0 0 2h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" />
    </g>
  </svg>
)

const PIN_OUTLINE = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinejoin="round"
    aria-hidden="true">
    <g transform="rotate(45 12 12)">
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1z" />
    </g>
  </svg>
)

/** The guide opens in its own tab, which window.close() may not close. */
async function closeGuide() {
  try {
    const tab = await chrome.tabs.getCurrent()
    if (tab?.id !== undefined) {
      await chrome.tabs.remove(tab.id)
      return
    }
  } catch {
    // Fall through to closing the window.
  }
  window.close()
}

/**
 * The guide a fresh install opens, laid out like the one Chinese Find ships:
 * browser windows drawn step by step, the real popup on the last step driving a
 * live demonstration, then what else the extension does.
 */
function Welcome() {
  useI18n()
  const [uiLanguage, setUiLanguage] = useStorage<string>(
    StorageKey.uiLanguage,
    ""
  )
  const [toneType] = useStorage<ToneType>(StorageKey.toneType, ToneType.Symbol)
  const [pronunciationSystem] = useStorage<PronunciationSystem>(
    StorageKey.pronunciationSystem,
    PronunciationSystem.Pinyin
  )
  const [rubyPosition] = useStorage<RubyPosition>(
    StorageKey.rubyPosition,
    RubyPosition.OVER
  )
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
  const shortcut = useCommandShortcut()
  const [isAnnotated, setIsAnnotated] = useState(false)
  const [captionIndex, setCaptionIndex] = useState(0)

  useEffect(() => {
    applyLanguage(uiLanguage)
  }, [uiLanguage])

  useEffect(() => {
    // The captions run from the moment the guide opens, the way a video that is
    // already playing would.
    const timer = setInterval(
      () => setCaptionIndex((index) => (index + 1) % CAPTION_SAMPLES.length),
      CAPTION_INTERVAL_MS
    )
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        void closeGuide()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const scale = clampAnnotationScale(annotationScale)
  const resolvedScaleTextTogether = scaleTextTogetherTouched
    ? scaleTextTogether
    : SCALE_TEXT_TOGETHER_DEFAULT

  const htmlOptions: HtmlOptions = { toneType, pronunciationSystem }
  const annotationFontSize = getAnnotationFontSizeEm(
    scale,
    rubyPosition,
    resolvedScaleTextTogether
  )
  const scaledTextFontSize = getScaledTextFontSize(
    scale,
    resolvedScaleTextTogether
  )
  const scaledTextLineHeight = getScaledTextLineHeight(
    scale,
    rubyPosition,
    resolvedScaleTextTogether
  )

  const pageHtml = useMemo(
    () => convertTextContentToHtml(PAGE_SAMPLE, htmlOptions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toneType, pronunciationSystem]
  )
  const captionHtml = useMemo(
    () =>
      CAPTION_SAMPLES.map((line) =>
        convertTextContentToHtml(line, htmlOptions)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toneType, pronunciationSystem]
  )
  const bankHtml = useMemo(
    () => [
      convertTextContentToHtml("銀行", htmlOptions),
      convertTextContentToHtml("行走", htmlOptions)
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toneType, pronunciationSystem]
  )
  const chineseFindHref = useMemo(() => chineseFindUrl(), [])
  const shortcutParts = shortcut ? shortcut.split("+") : []

  return (
    <main className="onboarding-shell">
      <style>{`
        .demo-sample, .caption-cue, .mini-annotated {
          ruby-position: ${rubyPosition};
        }
        .demo-sample .${RESULT_CLASS}[data-pya-is-annotated],
        .demo-sample .${NON_CHINESE_CLASS},
        .caption-cue .${RESULT_CLASS}[data-pya-is-annotated],
        .caption-cue .${NON_CHINESE_CLASS},
        .mini-annotated .${RESULT_CLASS}[data-pya-is-annotated],
        .mini-annotated .${NON_CHINESE_CLASS} {
          font-size: ${scaledTextFontSize};
          line-height: ${scaledTextLineHeight};
        }
        .demo-sample rt, .caption-cue rt, .mini-annotated rt {
          font-size: ${annotationFontSize};
          position: relative;
        }
      `}</style>

      <header className="onboarding-header">
        <img src={iconUrl} alt="" />
        <div>
          <h1>拼音標註工具</h1>
          <p>
            漢字上方自動加上讀音，網頁與影片字幕都看得懂。預設不會自動標註，按下
            Annotate 才會生效。
          </p>
          <p className="hero-tags">網頁標註 · 影片字幕 · 拼音與注音 · 快捷鍵</p>
        </div>
        <div className="onboarding-lang">
          <select
            className="lang-select"
            aria-label={t("optionsLanguage")}
            value={uiLanguage}
            onChange={(event) => setUiLanguage(event.target.value)}>
            <option value="">{t("optionsFollowSystem")}</option>
            {SUPPORTED_LOCALES.map((locale) => (
              <option key={locale} value={locale}>
                {LOCALE_NAMES[locale]}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className="steps">
        <article className="step">
          <header className="step-head">
            <span className="step-number">1</span>
            <h2>開啟擴充功能選單</h2>
          </header>
          <BrowserMock
            mode="puzzle"
            tab="新手指南"
            url="github.com/fixicelo/pinyin-annotator"
            href={REPO_URL}>
            <div className="mock-page-text">
              <p>擴充功能收在網址列右邊的拼圖選單裡，點一下拼圖就會展開。</p>
            </div>
          </BrowserMock>
        </article>

        <article className="step">
          <header className="step-head">
            <span className="step-number">2</span>
            <h2>把「拼音標註工具」釘選起來</h2>
          </header>
          <BrowserMock
            mode="menu"
            tab="新手指南"
            url="github.com/fixicelo/pinyin-annotator"
            href={REPO_URL}>
            <div className="mock-page-text">
              <p>
                在清單裡找到「拼音標註工具」，按下右邊的釘選圖示，它就會固定在工具列上。
              </p>
            </div>
            <div className="ext-menu">
              <a
                className="ext-row ext-row-link"
                href={chineseFindHref}
                target="_blank"
                rel="noopener"
                aria-label="繁簡易搜（在擴充功能商店開啟，另開新分頁）">
                <img className="ext-icon" src={chineseFindIconUrl} alt="" />
                <span className="ext-name">繁簡易搜</span>
                <span className="ext-pin" aria-hidden="true">
                  {PIN_FILLED}
                </span>
              </a>
              <div className="ext-row is-active" aria-hidden="true">
                <img className="ext-icon" src={iconUrl} alt="" />
                <span className="ext-name">拼音標註工具</span>
                <span className="ext-pin is-target">
                  {PIN_OUTLINE}
                  <span className="mock-badge">釘選</span>
                  <Pointer />
                </span>
              </div>
              <div className="ext-menu-sep" aria-hidden="true"></div>
              <div className="ext-row manage" aria-hidden="true">
                <span className="ext-name">管理擴充功能</span>
              </div>
            </div>
          </BrowserMock>
        </article>

        <article className="step">
          <header className="step-head">
            <span className="step-number">3</span>
            <h2>按 Annotate，頁面就有了讀音</h2>
          </header>
          <BrowserMock
            mode="popup"
            tab="新手指南"
            url="github.com/fixicelo/pinyin-annotator"
            href={REPO_URL}>
            <div className="mock-page-text">
              <p>這個 popup 是真的，可以直接按。按一下 Annotate。</p>
            </div>
            <p
              className={`demo-sample${isAnnotated ? " is-revealed" : ""}`}
              dangerouslySetInnerHTML={{ __html: pageHtml }}
            />
            <div className="caption-stage">
              <span
                key={captionIndex}
                className="caption-cue"
                dangerouslySetInnerHTML={{ __html: captionHtml[captionIndex] }}
              />
            </div>
            <div className="popup-mock">
              <div className="popup">
                <p
                  className={`status ${
                    isAnnotated ? "annotated" : "not-annotated"
                  }`}>
                  {t("statusLabel")}:{" "}
                  {t(isAnnotated ? "statusAnnotated" : "statusNotAnnotated")}
                </p>
                <div className="actions">
                  <button
                    className="btn btn-outlined"
                    onClick={() => setIsAnnotated(false)}
                    disabled={!isAnnotated}>
                    {t("buttonClear")}
                  </button>
                  <span
                    className={`illus-annotate-wrap${
                      isAnnotated ? "" : " is-inviting"
                    }`}>
                    <button
                      className="btn btn-primary btn-primary-wide"
                      onClick={() => setIsAnnotated(true)}>
                      {t("buttonAnnotate")}
                    </button>
                    {!isAnnotated && <Pointer />}
                  </span>
                </div>
                <div className="popup-footer">
                  <span />
                  <button
                    className="btn btn-text"
                    onClick={() => void openOptionsPage()}>
                    {t("buttonOptions")}
                  </button>
                </div>
              </div>
            </div>
          </BrowserMock>
          <p className="privacy">
            所有標註都在你的裝置上完成，不會上傳任何頁面內容。
          </p>
        </article>
      </section>

      <section className="feature-tour">
        <div className="section-head">
          <h2>更多功能</h2>
          <p>裝好之後，這些也都在。</p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <h3>影片字幕</h3>
            <p>
              播放器換句時，字幕上的讀音也跟著更新。YouTube、Bilibili、Netflix
              這類播放器的字幕都適用。
            </p>
            <div className="mini-demo">
              <div className="caption-stage is-mini">
                <span
                  className="caption-cue"
                  dangerouslySetInnerHTML={{ __html: captionHtml[0] }}
                />
              </div>
            </div>
          </article>

          <article className="feature-card">
            <h3>讀音樣式與大小</h3>
            <p>
              拼音或注音、要不要標聲調、字級大小與標註位置，都能在設定裡調整。
            </p>
            <div className="mini-chips">
              <span>pīn yīn</span>
              <span>pin yin</span>
              <span>ㄆㄧㄣ ㄧㄣ</span>
              <span>標註大小 100%</span>
            </div>
          </article>

          <article className="feature-card">
            <h3>快捷鍵與右鍵選單</h3>
            <p>一鍵切換當前頁面的標註；也可以在頁面上按右鍵，從選單切換。</p>
            <div className="mini-demo">
              <div className="ctx-mock">
                <div className="ctx-menu">
                  <div className="ctx-item is-muted">上一頁</div>
                  <div className="ctx-item is-muted">重新整理</div>
                  <div className="ctx-sep"></div>
                  <div className="ctx-item is-parent">
                    拼音標註工具<span className="ctx-arrow">›</span>
                    <div className="ctx-submenu">
                      <div className="ctx-item is-active">標註這個頁面</div>
                      <div className="ctx-item">清除標註</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="mini-shortcut">
              <span>切換快捷鍵</span>
              <span className="mini-shortcut-keys">
                {shortcutParts.length > 0 ? (
                  shortcutParts.map((part) => <kbd key={part}>{part}</kbd>)
                ) : (
                  <kbd>未設定</kbd>
                )}
              </span>
            </p>
          </article>

          <article className="feature-card">
            <h3>多音字讀得對</h3>
            <p>詞語裡的破音字會依上下文讀對音，不是一個字一個字猜。</p>
            <div className="mini-demo mini-pairs">
              <span
                className="mini-annotated"
                dangerouslySetInnerHTML={{ __html: bankHtml[0] }}
              />
              <span
                className="mini-annotated"
                dangerouslySetInnerHTML={{ __html: bankHtml[1] }}
              />
            </div>
          </article>

          <article className="feature-card">
            <h3>完全還原</h3>
            <p>
              按 Clear 就把頁面還原成原樣，不留任何標記，也不會改動原始內容。
            </p>
            <div className="mini-demo">
              <p className="mini-after">讀音落在字上，一頁書就有了聲音。</p>
              <p className="mini-before">讀音落在字上，一頁書就有了聲音。</p>
            </div>
            <p className="feature-note">上：標註後，下：Clear 之後</p>
          </article>
        </div>

        <a
          className="feedback"
          href={FEEDBACK_URL}
          target="_blank"
          rel="noopener">
          <svg
            className="feedback-icon"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          <span className="feedback-copy">
            <span className="feedback-title">有建議，或遇到問題？</span>
            <span className="feedback-sub">
              到 GitHub 專案頁開 issue 告訴我
            </span>
          </span>
          <svg
            className="feedback-arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true">
            <path d="M7 17 17 7" />
            <path d="M9 7h8v8" />
          </svg>
        </a>
      </section>

      <footer className="onboarding-footer">
        <p>讀音樣式、大小與其他設定，之後都能在擴充功能的設定頁調整。</p>
        <div className="onboarding-footer-actions">
          <button
            className="button secondary"
            type="button"
            onClick={() => void openOptionsPage()}>
            開啟設定
          </button>
          <button
            className="button primary"
            type="button"
            onClick={() => void closeGuide()}>
            開始使用
          </button>
        </div>
      </footer>
    </main>
  )
}

export default Welcome
