import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["*://www.youtube.com/*"],
  all_frames: true
}

function injectStyles() {
  // Inject styles to prevent captions from wrapping
  let style = document.createElement("style")
  style.innerHTML = `span.ytp-caption-segment {
    white-space: nowrap !important;
  }`
  document.head.appendChild(style)
}

injectStyles()
