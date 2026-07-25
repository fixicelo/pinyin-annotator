import { useCallback, useEffect, useMemo, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import {
  PREDEFINED_DICT_LINK,
  PronunciationSystem,
  RubyPosition,
  StorageKey,
  Theme,
  ToneType,
  type HtmlOptions
} from "~constants"

import { useTheme } from "./popup/useTheme"
import { convertTextContentToHtml, debounce } from "./util"

import "./popup/design-system.css"

const SAMPLE_TEXT = "你好！今天天氣真好。"

function Options() {
  useTheme()

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
  const [shortcut, setShortcut] = useState("Alt+Shift+P")

  useEffect(() => {
    chrome.commands.getAll((commands) => {
      const toggle = commands.find((c) => c.name === "toggle-annotation")
      if (toggle?.shortcut) {
        setShortcut(toggle.shortcut)
      }
    })
  }, [])

  const handleToneTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToneType(e.target.checked ? ToneType.Symbol : ToneType.None)
  }

  const handlePronunciationSystemChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPronunciationSystem(e.target.value as PronunciationSystem)
  }

  const handleObserverEnabledChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setObserverEnabled(e.target.checked)
  }

  const handleAutoAnnotateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoAnnotate(e.target.checked)
  }

  const debouncedSetIgnoredNodes = useCallback(
    debounce((newIgnoredNodesInput: string) => {
      const newIgnoredNodes = newIgnoredNodesInput
        .split(",")
        .map((node) => node.trim())
        .filter(Boolean)
      setIgnoredNodes(newIgnoredNodes)
      setNotification("Saved")
      setTimeout(() => setNotification(null), 2000)
    }, 1000),
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

  useEffect(() => {
    setIgnoredNodesInput(ignoredNodes.join(","))
  }, [ignoredNodes])

  const previewHtml = useMemo(() => {
    const opts: HtmlOptions = { toneType, pronunciationSystem }
    return convertTextContentToHtml(SAMPLE_TEXT, opts)
  }, [toneType, pronunciationSystem])

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-layout)",
        padding: "40px 20px"
      }}>
      <style>{`pya { ruby-position: ${rubyPosition}; }`}</style>

      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              margin: "0 0 4px 0",
              fontSize: "28px",
              fontWeight: 600
            }}>
            Pinyin Annotator
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "24px",
            alignItems: "start"
          }}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="card">
              <div className="card-header">
                <h4>Appearance</h4>
              </div>
              <div className="card-body">
                <div className="settings-row">
                  <div className="settings-row-content">
                    <span className="settings-row-title">Writing system</span>
                    <span className="settings-row-desc">
                      Pinyin uses letters you can type. Zhuyin uses symbols used
                      in Taiwan.
                    </span>
                  </div>
                  <div className="settings-row-action">
                    <select
                      className="select"
                      value={pronunciationSystem}
                      onChange={handlePronunciationSystemChange}
                      style={{ width: "120px" }}>
                      <option value={PronunciationSystem.Pinyin}>Pinyin</option>
                      <option value={PronunciationSystem.Zhuyin}>Zhuyin</option>
                    </select>
                  </div>
                </div>

                {pronunciationSystem === PronunciationSystem.Pinyin && (
                  <div className="settings-row">
                    <div className="settings-row-content">
                      <span className="settings-row-title">Tone marks</span>
                      <span className="settings-row-desc">
                        Show tone marks (ā á ǎ à) instead of no tones.
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
                    <span className="settings-row-title">Placement</span>
                    <span className="settings-row-desc">
                      Show annotations above or below each character.
                    </span>
                  </div>
                  <div className="settings-row-action">
                    <select
                      className="select"
                      value={rubyPosition}
                      onChange={handleRubyPositionChange}
                      style={{ width: "120px" }}>
                      <option value={RubyPosition.OVER}>Above</option>
                      <option value={RubyPosition.UNDER}>Below</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h4>Behavior</h4>
              </div>
              <div className="card-body">
                <div className="settings-row">
                  <div className="settings-row-content">
                    <span className="settings-row-title">
                      Auto-annotate: On every page
                    </span>
                    <span className="settings-row-desc">
                      Automatically annotate whenever you open a new page.
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
                      Monitor Mode: Keep annotating, especially on video
                      subtitles
                    </span>
                    <span className="settings-row-desc">
                      Netflix, Disney+, YouTube, Bilibili — CC subtitles update
                      live.
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
                    <span className="settings-row-title">Word lookup</span>
                    <span className="settings-row-desc">
                      Click a word in the popup to open a dictionary.
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
                        Which dictionary
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
                      <span className="settings-row-title">URL pattern</span>
                      <span className="settings-row-desc">
                        {"{word}"} will be replaced with the selected text.
                      </span>
                    </div>
                    <div
                      className="settings-row-action"
                      style={{ width: "250px" }}>
                      <input
                        className="input"
                        value={customDictUrl}
                        onChange={handleCustomDictUrlChange}
                        placeholder="https://example.com/dict/{word}"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h4>Appearance</h4>
              </div>
              <div className="card-body">
                <div className="settings-row">
                  <div className="settings-row-content">
                    <span className="settings-row-title">Theme</span>
                    <span className="settings-row-desc">
                      Match your system, or pick light or dark.
                    </span>
                  </div>
                  <div className="settings-row-action">
                    <select
                      className="select"
                      value={theme}
                      onChange={handleThemeChange}
                      style={{ width: "120px" }}>
                      <option value={Theme.System}>Auto</option>
                      <option value={Theme.Light}>Light</option>
                      <option value={Theme.Dark}>Dark</option>
                    </select>
                  </div>
                </div>
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
                Keyboard shortcut
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
                  to toggle annotations on any page.
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
                        alert(
                          "Open about:addons → Gear → Manage Extension Shortcuts"
                        )
                      }
                    }
                  }}
                  style={{
                    fontSize: "12px",
                    height: "auto",
                    padding: "2px 8px"
                  }}>
                  Change
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h4>Advanced</h4>
              </div>
              <div className="card-body" style={{ padding: "20px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <span className="settings-row-title">
                    Skip these elements
                  </span>
                  <span className="settings-row-desc">
                    HTML tags to skip when annotating. Comma-separated,
                    uppercase.
                  </span>
                </div>

                <textarea
                  className="textarea"
                  value={ignoredNodesInput}
                  onChange={handleIgnoredNodesChange}
                  placeholder="TEXTAREA,CODE,PRE,KBD,INPUT"
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
                  Report a bug
                </a>
                {" · "}Pinyin Annotator © {new Date().getFullYear()}
              </span>
            </div>
          </div>

          <div style={{ position: "sticky", top: "40px" }}>
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
                  Preview
                </h4>
                <span className="text-secondary text-small">
                  {pronunciationSystem === PronunciationSystem.Pinyin
                    ? toneType === ToneType.Symbol
                      ? "with tones"
                      : "without tones"
                    : "zhuyin"}
                  {" · "}
                  {rubyPosition === RubyPosition.OVER ? "above" : "below"}
                </span>
              </div>
              <div
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
