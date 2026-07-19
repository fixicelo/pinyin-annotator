import { useCallback, useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import {
  PREDEFINED_DICT_LINK,
  PronunciationSystem,
  RubyPosition,
  StorageKey,
  Theme,
  ToneType
} from "~constants"

import { useTheme } from "./popup/useTheme"
import { debounce } from "./util"

import "./popup/design-system.css"

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
      setNotification("Auto-saved")
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-layout)",
        padding: "40px 20px"
      }}>
      <div className="container" style={{ padding: 0 }}>
        <div style={{ marginBottom: "32px", padding: "0 4px" }}>
          <h2
            style={{ margin: "0 0 4px 0", fontSize: "28px", fontWeight: 600 }}>
            Settings
          </h2>
          <div className="text-secondary" style={{ fontSize: "14px" }}>
            Configure your Pinyin Annotator experience.
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4>General Settings</h4>
          </div>
          <div className="card-body">
            <div className="settings-row">
              <div className="settings-row-content">
                <span className="settings-row-title">Monitor Mode</span>
                <span className="settings-row-desc">
                  Works with CC (subtitles) on video streaming platforms such as
                  Netflix, Disney+, YouTube, and Bilibili.
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
                <span className="settings-row-title">Auto-Annotate</span>
                <span className="settings-row-desc">
                  Automatically annotate pinyin on every page load.
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
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4>Appearance</h4>
          </div>
          <div className="card-body">
            <div className="settings-row">
              <div className="settings-row-content">
                <span className="settings-row-title">Pronunciation</span>
                <span className="settings-row-desc">
                  Choose between Pinyin (Latin alphabet) or Zhuyin (Bopomofo)
                  annotation.
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
                  <span className="settings-row-title">Tone Marks</span>
                  <span className="settings-row-desc">
                    Show tone marks (ā á ǎ à) instead of numbers or no tones.
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
                <span className="settings-row-title">Annotation Position</span>
                <span className="settings-row-desc">
                  Display pinyin above or below the characters.
                </span>
              </div>
              <div className="settings-row-action">
                <select
                  className="select"
                  value={rubyPosition}
                  onChange={handleRubyPositionChange}
                  style={{ width: "120px" }}>
                  <option value={RubyPosition.OVER}>Top</option>
                  <option value={RubyPosition.UNDER}>Bottom</option>
                </select>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-content">
                <span className="settings-row-title">Theme</span>
                <span className="settings-row-desc">
                  Choose between light, dark, or follow your system preference.
                </span>
              </div>
              <div className="settings-row-action">
                <select
                  className="select"
                  value={theme}
                  onChange={handleThemeChange}
                  style={{ width: "120px" }}>
                  <option value={Theme.System}>System</option>
                  <option value={Theme.Light}>Light</option>
                  <option value={Theme.Dark}>Dark</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4>Dictionary</h4>
          </div>
          <div className="card-body">
            <div
              className="settings-row"
              style={{
                borderBottom: dictLinkEnabled
                  ? "1px solid var(--border-color)"
                  : "none"
              }}>
              <div className="settings-row-content">
                <span className="settings-row-title">Dictionary Link</span>
                <span className="settings-row-desc">
                  Add a link to an online dictionary for each word in the
                  "Selected Text" area.
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
              <>
                <div className="settings-row">
                  <div className="settings-row-content">
                    <span className="settings-row-title">
                      Select Dictionary
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

                {selectedDict === "custom" && (
                  <div className="settings-row">
                    <div className="settings-row-content">
                      <span className="settings-row-title">
                        Custom Dictionary URL
                      </span>
                      <span className="settings-row-desc">
                        Use {"{word}"} as a placeholder.
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

                {selectedDict !== "custom" && (
                  <div className="settings-row">
                    <div className="settings-row-content">
                      <span className="settings-row-title">
                        Current URL Pattern
                      </span>
                    </div>
                    <div className="settings-row-action">
                      <span
                        className="text-secondary text-small"
                        style={{
                          userSelect: "all",
                          background: "rgba(0,0,0,0.04)",
                          padding: "4px 8px",
                          borderRadius: "4px"
                        }}>
                        {
                          PREDEFINED_DICT_LINK.find(
                            (dict) => dict.site === selectedDict
                          )?.url
                        }
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4>Shortcuts</h4>
          </div>
          <div className="card-body">
            <div className="settings-row">
              <div className="settings-row-content">
                <span className="settings-row-title">Keyboard Shortcuts</span>
                <span className="settings-row-desc">
                  Default: <span className="keyboard">Alt</span> +{" "}
                  <span className="keyboard">Shift</span> +{" "}
                  <span className="keyboard">P</span>
                </span>
                <div style={{ marginTop: "12px" }}>
                  <span className="text-secondary text-small">
                    To customize, visit:
                  </span>
                  <ul
                    className="text-secondary text-small"
                    style={{
                      paddingLeft: "20px",
                      marginTop: "4px",
                      marginBottom: 0
                    }}>
                    <li>
                      Chrome/Edge: <code>chrome://extensions/shortcuts</code>
                    </li>
                    <li>
                      Firefox: <code>about:addons</code> &gt; Gear Icon &gt;
                      Manage Extension Shortcuts
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4>Support</h4>
          </div>
          <div className="card-body">
            <div className="settings-row">
              <div className="settings-row-content">
                <span className="settings-row-title">
                  Feedback & Bug Report
                </span>
                <span className="settings-row-desc">
                  Found a bug or have a feature request?
                  <a
                    href="https://github.com/fixicelo/pinyin-annotator/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: "4px", fontWeight: 500 }}>
                    Visit our GitHub repository
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4>Advanced</h4>
          </div>
          <div className="card-body" style={{ padding: "20px" }}>
            <div style={{ marginBottom: "12px" }}>
              <span className="settings-row-title">Ignored Tags</span>
              <span className="settings-row-desc">
                Enter the tag names of nodes to ignore (separated by commas).
              </span>
            </div>

            <textarea
              className="textarea"
              value={ignoredNodesInput}
              onChange={handleIgnoredNodesChange}
              placeholder="TEXTAREA,CODE,PRE,KBD,INPUT,RP,RT,RUBY,SCRIPT,STYLE"
              style={{ minHeight: "80px" }}
            />
            {notification && (
              <div
                className="alert alert-success"
                style={{ marginTop: "16px" }}>
                <div>{notification}</div>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "40px",
            paddingBottom: "20px"
          }}>
          <span className="text-secondary text-small">
            Pinyin Annotator © {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Options
