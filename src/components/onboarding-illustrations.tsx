import React from "react"
import iconUrl from "url:~/assets/icon.png"

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

const Puzzle: React.FC = () => (
  <svg className="illus-glyph" viewBox="0 0 20 20" aria-hidden="true">
    <path
      d="M8 3.2a1.8 1.8 0 0 1 3.6 0v.6h1.9c.5 0 .9.4.9.9v2h.6a1.8 1.8 0 0 1 0 3.6h-.6v2.9c0 .5-.4.9-.9.9h-2.9v-.6a1.8 1.8 0 0 0-3.6 0v.6H4.1a.9.9 0 0 1-.9-.9v-2.9h.6a1.8 1.8 0 0 0 0-3.6h-.6V4.7c0-.5.4-.9.9-.9H8z"
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

/**
 * Drawings of the browser chrome a new user has to navigate: the extensions
 * menu is where the toolbar button lives, and nothing on the popup says so.
 */
export const ExtensionsMenuStep: React.FC = () => (
  <div className="illus illus-toolbar" aria-hidden="true">
    <span className="illus-address">example.com</span>
    <span className="illus-target">
      <Puzzle />
      <span className="illus-ring" />
      <Cursor />
    </span>
  </div>
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

export const PopupStep: React.FC = () => (
  <div className="illus illus-popup-wrap" aria-hidden="true">
    <div className="illus-popup">
      <span className="illus-pill" />
      <span className="illus-button" />
      <span className="illus-switch" />
    </div>
    <Cursor />
  </div>
)
