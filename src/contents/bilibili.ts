import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["*://www.bilibili.com/*"],
  all_frames: true
}

const style = document.createElement("style")
style.textContent = `
  .bpx-player-subtitle-panel-text:has(pya),
  .bili-subtitle-x-subtitle-panel-text:has(pya) {
    position: static !important;
    padding-top: 0.6em !important;
  }
`
document.head.appendChild(style)
