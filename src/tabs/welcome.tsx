import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore
} from "react"

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
import { clearFirstRunNotice } from "~lib/first-run"
import { applyLanguage, t, useI18n } from "~lib/i18n"
import { useCommandShortcut } from "~lib/use-command-shortcut"
import { convertTextContentToHtml } from "~util"

import {
  ExtensionsMenuStep,
  PinStep,
  PopupStep
} from "../components/onboarding-illustrations"
import AppTitle from "../popup/AppTitle"
import { openOptionsPage } from "../popup/openOptionsPage"

import "./welcome.css"

const PAGE_SAMPLE = "你好，世界！这是一段网页文字。"
/** Short enough to read like a cue, and different enough to notice the swap. */
const CAPTION_SAMPLES = [
  "字幕一句一句地出现，拼音也一起出现。",
  "换到下一句时，上面的拼音会跟着更新。",
  "影片里的中文，都看得懂读音。"
]

const CAPTION_INTERVAL_MS = 4200

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia?.(REDUCED_MOTION_QUERY)
  if (!query) {
    return () => {}
  }
  query.addEventListener?.("change", onChange)
  return () => query.removeEventListener?.("change", onChange)
}

function getPrefersReducedMotion(): boolean {
  return window.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getPrefersReducedMotion,
    () => false
  )
}

/**
 * The one screen a fresh install opens.
 *
 * The popup can only describe the page the user happens to be looking at, and a
 * page without Chinese shows nothing at all — so the effect is shown here
 * instead, with the reader's own tone and reading settings: readings appear
 * over a sentence, and a subtitle swaps to the next line while its readings
 * follow, the way they do while a video plays.
 */
function Welcome() {
  useI18n()
  const [uiLanguage] = useStorage<string>(StorageKey.uiLanguage, "")
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
  const prefersReducedMotion = usePrefersReducedMotion()

  // Bumped to replay the reveal: the sample remounts and the CSS animation in
  // welcome.css runs again, so no timer has to be kept in step with it.
  const [revealRun, setRevealRun] = useState(0)
  const [captionIndex, setCaptionIndex] = useState(0)

  useEffect(() => {
    applyLanguage(uiLanguage)
  }, [uiLanguage])

  useEffect(() => {
    // The page itself is the onboarding; the popup does not need to repeat it.
    void clearFirstRunNotice()
  }, [])

  useEffect(() => {
    const timer = setInterval(
      () => setCaptionIndex((index) => (index + 1) % CAPTION_SAMPLES.length),
      CAPTION_INTERVAL_MS
    )
    return () => clearInterval(timer)
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

  const replay = useCallback(() => setRevealRun((run) => run + 1), [])

  return (
    <div className="welcome">
      <style>{`
        .demo-sample, .caption-cue {
          ruby-position: ${rubyPosition};
        }
        .demo-sample .${RESULT_CLASS}[data-pya-is-annotated],
        .demo-sample .${NON_CHINESE_CLASS},
        .caption-cue .${RESULT_CLASS}[data-pya-is-annotated],
        .caption-cue .${NON_CHINESE_CLASS} {
          font-size: ${scaledTextFontSize};
          line-height: ${scaledTextLineHeight};
        }
        .demo-sample rt, .caption-cue rt {
          font-size: ${annotationFontSize};
          position: relative;
        }
      `}</style>

      <header className="welcome-header">
        <AppTitle />
        <p className="welcome-intro">{t("welcomeIntro")}</p>
      </header>

      <section className="welcome-card">
        <div className="demo-head">
          <span className="demo-label">{t("welcomeDemoPage")}</span>
          <button className="btn btn-text demo-replay" onClick={replay}>
            {t("welcomeDemoReplay")}
          </button>
        </div>
        <p
          key={revealRun}
          className={`demo-sample${prefersReducedMotion ? "" : " is-animated"}`}
          dangerouslySetInnerHTML={{ __html: pageHtml }}
        />

        <div className="demo-label">{t("welcomeDemoCaption")}</div>
        <div className="caption-stage">
          <span
            key={captionIndex}
            className="caption-cue"
            dangerouslySetInnerHTML={{ __html: captionHtml[captionIndex] }}
          />
        </div>
      </section>

      <section className="welcome-card">
        <h2 className="welcome-section-title">{t("welcomeHowTitle")}</h2>
        <ol className="steps">
          <li className="step">
            <div className="step-head">
              <span className="step-number">1</span>
              <span className="step-title">{t("welcomeStep1Title")}</span>
            </div>
            <p className="step-desc">{t("welcomeStep1Desc")}</p>
            <ExtensionsMenuStep />
          </li>
          <li className="step">
            <div className="step-head">
              <span className="step-number">2</span>
              <span className="step-title">{t("welcomeStep2Title")}</span>
            </div>
            <p className="step-desc">{t("welcomeStep2Desc")}</p>
            <PinStep />
          </li>
          <li className="step">
            <div className="step-head">
              <span className="step-number">3</span>
              <span className="step-title">{t("welcomeStep3Title")}</span>
            </div>
            <p className="step-desc">{t("welcomeStep3Desc")}</p>
            <PopupStep
              popup={
                <div className="popup illus-popup-card">
                  <p className="status annotated">
                    {t("statusLabel")}: {t("statusAnnotated")}
                  </p>
                  <div className="actions">
                    <span className="btn btn-outlined">{t("buttonClear")}</span>
                    <span className="btn btn-primary btn-primary-wide">
                      {t("buttonAnnotate")}
                    </span>
                  </div>
                  <div className="card behavior-card">
                    <div className="option-row">
                      <span className="illus-option-name">
                        {t("monitorModeTitle")}
                      </span>
                      <span className="switch">
                        <input type="checkbox" checked disabled readOnly />
                        <span className="switch-slider"></span>
                      </span>
                    </div>
                    <div className="option-row option-row-last">
                      <span className="illus-option-name">
                        {t("autoAnnotateTitle")}
                      </span>
                      <span className="switch">
                        <input type="checkbox" checked disabled readOnly />
                        <span className="switch-slider"></span>
                      </span>
                    </div>
                  </div>
                  <div className="appearance illus-appearance">
                    <span>{t("optionsAppearanceTitle")}</span>
                    <span className="appearance-value">
                      {clampAnnotationScale(scale)}%
                    </span>
                  </div>
                  <div className="popup-footer">
                    <span />
                    <span className="btn btn-text">{t("buttonOptions")}</span>
                  </div>
                </div>
              }
            />
          </li>
        </ol>

        <ul className="welcome-tips">
          <li>{t("welcomeTipAuto")}</li>
          <li>
            {shortcut ? <kbd className="keyboard">{shortcut}</kbd> : null}
            {t("welcomeShortcutNote")}
          </li>
          <li>{t("welcomeTipRefresh")}</li>
        </ul>
      </section>

      <footer className="welcome-actions">
        <button className="btn btn-primary" onClick={() => window.close()}>
          {t("welcomeStart")}
        </button>
        <button className="btn btn-text" onClick={openOptionsPage}>
          {t("buttonOptions")}
        </button>
      </footer>
    </div>
  )
}

export default Welcome
