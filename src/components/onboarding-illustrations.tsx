import React from "react"
import iconUrl from "url:~/assets/icon.png"

import { t } from "~lib/i18n"

const Cursor: React.FC = () => (
  <svg className="illus-cursor" viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M3 1.5 L3 13.5 L6.2 10.6 L8.3 15 L10.7 14 L8.6 9.7 L13 9.4 Z"
      fill="#111827"
      stroke="#ffffff"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
)

/** The puzzle piece a browser uses for its extensions menu. */
const ExtensionsGlyph: React.FC = () => (
  <svg className="illus-glyph" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4a2 2 0 0 0-2 2v3.8h1.5a2.7 2.7 0 0 1 0 5.4H2V20a2 2 0 0 0 2 2h3.8v-1.5a2.7 2.7 0 0 1 5.4 0V22H17a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z"
      fill="currentColor"
    />
  </svg>
)

const Pin: React.FC = () => (
  <svg className="illus-pin" viewBox="0 0 20 20" aria-hidden="true">
    <path
      d="M12.6 2.2 17.8 7.4l-1.6 1.6-.9-.3-2.4 2.4.4 2.3-1.5 1.5-3.1-3.1-3.6 4.4-.8-.8 4.4-3.6-3.1-3.1 1.5-1.5 2.3.4L10 7.1l-.3-.9z"
      fill="currentColor"
    />
  </svg>
)

const Toolbar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="illus illus-toolbar" aria-hidden="true">
    <span className="illus-address">example.com</span>
    <span className="illus-target">{children}</span>
  </div>
)

/**
 * Drawings of the browser chrome a new user has to navigate: the extensions
 * menu hides the toolbar button, and nothing in the popup says so.
 */
export const ExtensionsMenuStep: React.FC = () => (
  <Toolbar>
    <ExtensionsGlyph />
    <span className="illus-ring" />
    <Cursor />
  </Toolbar>
)

export const PinStep: React.FC = () => (
  <div className="illus illus-menu" aria-hidden="true">
    <div className="illus-row">
      <span className="illus-dot" />
      <span className="illus-bar" />
    </div>
    <div className="illus-row illus-row-target">
      <img className="illus-app-icon" src={iconUrl} alt="" />
      <span className="illus-app-name">Pinyin Annotator</span>
      <Pin />
    </div>
    <div className="illus-row">
      <span className="illus-dot" />
      <span className="illus-bar illus-bar-short" />
    </div>
  </div>
)

interface PopupStepProps {
  annotated: boolean
  onAnnotate: () => void
  onClear: () => void
}

/**
 * The pinned button with the popup it opens hanging under it. The popup is the
 * real one — same markup and stylesheet as the panel — and it works: pressing
 * its buttons drives the demonstration below.
 *
 * Only what the step is about is drawn: nothing is annotated yet, and the
 * button that changes that keeps asking to be pressed.
 */
export const PopupStep: React.FC<PopupStepProps> = ({
  annotated,
  onAnnotate,
  onClear
}) => (
  <div className="illus illus-opened">
    <Toolbar>
      <img className="illus-app-icon" src={iconUrl} alt="" />
      <span className="illus-ring" />
      <Cursor />
    </Toolbar>

    <div className="illus-popup-frame">
      <div className="popup illus-popup-card">
        <p className={`status ${annotated ? "annotated" : "not-annotated"}`}>
          {t("statusLabel")}:{" "}
          {t(annotated ? "statusAnnotated" : "statusNotAnnotated")}
        </p>

        <div className="actions">
          <button
            className="btn btn-outlined"
            onClick={onClear}
            disabled={!annotated}>
            {t("buttonClear")}
          </button>
          <span className="illus-annotate-wrap">
            <button
              className={`btn btn-primary btn-primary-wide${
                annotated ? "" : " is-inviting"
              }`}
              onClick={onAnnotate}>
              {t("buttonAnnotate")}
            </button>
            {!annotated && <Cursor />}
          </span>
        </div>

        <div className="popup-footer">
          <span />
          <span className="illus-option-name">{t("buttonOptions")}</span>
        </div>
      </div>
    </div>
  </div>
)
