import { useEffect, useMemo, useState } from "react"

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

import {
  ExtensionsMenuStep,
  PinStep,
  PopupStep
} from "../components/onboarding-illustrations"
import AppTitle from "../popup/AppTitle"
import { openOptionsPage } from "../popup/openOptionsPage"

import "./welcome.css"

const PAGE_SAMPLE = "讀音落在字上，一頁書就有了聲音。"
/** A short line of subtitles, and the next ones a video would cut to. */
const CAPTION_SAMPLES = [
  "影片開始了，字幕會一句一句出現。",
  "每個漢字的上方，都標好了讀音。",
  "換到下一句時，讀音也跟著更新。"
]

const CAPTION_INTERVAL_MS = 4200

/**
 * The one screen a fresh install opens.
 *
 * The popup can only describe the page the user happens to be looking at, and a
 * page without Chinese shows nothing at all, so the effect is demonstrated
 * here: the popup drawn in step 3 is the real thing and works, and the samples
 * below it answer to it. Nothing is annotated until the reader presses
 * Annotate, which is how the extension behaves too.
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
    // The captions run from the moment the page opens, the way a video that is
    // already playing would.
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
        <div className="welcome-lang-row">
          <select
            className="select welcome-language-select"
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
        <AppTitle />
        <p className="welcome-intro">{t("welcomeIntro")}</p>
      </header>

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
              annotated={isAnnotated}
              onAnnotate={() => setIsAnnotated(true)}
              onClear={() => setIsAnnotated(false)}
            />
          </li>
        </ol>

        <div className="demo-area">
          <div className="demo-head">
            <span className="demo-label">{t("welcomeDemoPage")}</span>
            {!isAnnotated && (
              <span className="demo-hint">{t("welcomeDemoHint")}</span>
            )}
          </div>
          <p
            className={`demo-sample${isAnnotated ? " is-revealed" : ""}`}
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
        </div>

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
