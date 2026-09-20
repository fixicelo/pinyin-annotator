import { useEffect } from "react"

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

import AppTitle from "../popup/AppTitle"
import { openOptionsPage } from "../popup/openOptionsPage"
import {
  ExtensionsMenuStep,
  PinStep,
  PopupStep
} from "../components/onboarding-illustrations"

import "./welcome.css"

const PAGE_SAMPLE = "你好，世界！这是一段网页文字。"
const CAPTION_SAMPLE = "字幕也会自动标注拼音。"

/**
 * The one screen a fresh install opens.
 *
 * The popup can only describe the page the user happens to be looking at, and a
 * page without Chinese shows nothing at all — so the effect is demonstrated
 * here instead, with the reader's own tone and reading settings.
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

  useEffect(() => {
    applyLanguage(uiLanguage)
  }, [uiLanguage])

  useEffect(() => {
    // The page itself is the onboarding; the popup does not need to repeat it.
    void clearFirstRunNotice()
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
        <div className="demo-label">{t("welcomeDemoPage")}</div>
        <p
          className="demo-sample"
          dangerouslySetInnerHTML={{
            __html: convertTextContentToHtml(PAGE_SAMPLE, htmlOptions)
          }}
        />

        <div className="demo-label">{t("welcomeDemoCaption")}</div>
        <div className="caption-stage">
          <span
            className="caption-cue"
            dangerouslySetInnerHTML={{
              __html: convertTextContentToHtml(CAPTION_SAMPLE, htmlOptions)
            }}
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
            <PopupStep />
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
