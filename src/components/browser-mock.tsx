import React, { useEffect, useRef, useState } from "react"
import iconUrl from "url:~/assets/icon.png"

/** The pointer drawn on the thing the reader is being told to click. */
export const Pointer: React.FC = () => (
  <svg className="cursor" viewBox="0 0 20 22" aria-hidden="true">
    <path
      d="M2 2v15.4l3.9-3.8 2.5 5.6 2.6-1.2-2.4-5.5H14z"
      fill="#1f2937"
      stroke="#ffffff"
      strokeWidth="1.3"
      strokeLinejoin="round"
      paintOrder="stroke"
    />
  </svg>
)

const NavBack: React.FC = () => (
  <span className="nav-btn">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14.5 6.5 9 12l5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
)

const NavForward: React.FC = () => (
  <span className="nav-btn">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9.5 6.5 15 12l-5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
)

const NavReload: React.FC = () => (
  <span className="nav-btn">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M19.5 12a7.5 7.5 0 1 1-2.3-5.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M19.6 4.4V10h-5.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
)

const Puzzle: React.FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4a2 2 0 0 0-2 2v4h1.5a2.5 2.5 0 0 0 0 5H2v4a2 2 0 0 0 2 2h4v-1.5a2.5 2.5 0 0 1 5 0V22h4a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 0-5Z"
      fill="currentColor"
    />
  </svg>
)

interface BrowserMockProps {
  /** Which affordance the step is about. */
  mode: "puzzle" | "menu" | "popup"
  tab: string
  url: string
  href: string
  /** Clicking the window moves on to the next step. */
  onAdvance?: () => void
  /** A pinned extension in the toolbar, drawn as already there. */
  pinnedPromo?: React.ReactNode
  children: React.ReactNode
}

/**
 * A Chrome window, drawn from the same markup in every step: only what is
 * highlighted changes, so the three steps read as the same browser.
 */
export const BrowserMock: React.FC<BrowserMockProps> = ({
  mode,
  tab,
  url,
  href,
  onAdvance,
  pinnedPromo,
  children
}) => {
  const mockRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const mock = mockRef.current
    if (!mock) {
      return
    }
    // The highlighted control pulses, and the popup slides in, only while the
    // window they belong to is being looked at. The state is React's, because
    // the demonstration re-renders and would otherwise drop a class set here.
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 }
    )
    observer.observe(mock)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={mockRef}
      className={`browser-mock${inView ? " in-view" : ""}`}
      data-browser={mode}
      data-advance={onAdvance ? "" : undefined}
      onClick={(event) => {
        // The extensions menu holds a real store link; that click wins.
        if ((event.target as HTMLElement).closest("a")) {
          return
        }
        onAdvance?.()
      }}>
      <div className="browser-tabstrip" aria-hidden="true">
        <div className="browser-tab is-active">
          <img className="tab-favicon" src={iconUrl} alt="" />
          <span className="tab-title">{tab}</span>
          <svg className="tab-close" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="browser-newtab">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="browser-toolbar" aria-hidden="true">
        <div className="browser-nav">
          <NavBack />
          <NavForward />
          <NavReload />
        </div>
        <div className="browser-omnibox">
          <svg className="omnibox-lock" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm-3 8V6a3 3 0 1 1 6 0v3H9Z" />
          </svg>
          <a
            className="address-text"
            href={href}
            target="_blank"
            rel="noopener"
            tabIndex={-1}>
            {url}
          </a>
        </div>
        <div className="browser-actions">
          <span className="tool-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="m12 3.7 2.6 5.3 5.9.9-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.9z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {pinnedPromo && (
            <span className="tool-btn pinned-btn">{pinnedPromo}</span>
          )}
          {mode === "popup" && (
            <span className="tool-btn pinned-btn is-target">
              <img src={iconUrl} alt="" />
            </span>
          )}
          <span
            className={`tool-btn puzzle-btn${mode === "menu" ? " is-open" : ""}${
              mode === "puzzle" ? " is-target" : ""
            }`}>
            <Puzzle />
            {mode === "puzzle" && <Pointer />}
          </span>
          <span className="tool-btn avatar-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9.2" fill="#2563eb" />
              <circle cx="12" cy="9.6" r="3.1" fill="#eff6ff" />
              <path
                d="M12 14.2c-3 0-5.4 1.7-5.9 4.2a9.2 9.2 0 0 0 11.8 0c-.5-2.5-2.9-4.2-5.9-4.2z"
                fill="#eff6ff"
              />
            </svg>
          </span>
          <span className="tool-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="5" r="1.6" fill="currentColor" />
              <circle cx="12" cy="12" r="1.6" fill="currentColor" />
              <circle cx="12" cy="19" r="1.6" fill="currentColor" />
            </svg>
          </span>
        </div>
      </div>

      <div className="browser-view">{children}</div>
    </div>
  )
}
