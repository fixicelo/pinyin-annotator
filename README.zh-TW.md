# Pinyin Annotator | 拼音標註工具

> **🌐 語言 / Language:** [English](README.md) · [简体中文](README.zh-CN.md) · **繁體中文** · [Tiếng Việt](README.vi.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Italiano](README.it.md)

拼音標註工具是一款瀏覽器擴充功能，在網頁與影片字幕中的漢字上疊加**漢語拼音**或**注音（Bopomofo）**標註，助你更好地學習中文。

## ⏩ 快速開始

1. 前往你的瀏覽器擴充功能商店。

- [Chrome](https://chromewebstore.google.com/detail/pinyin-annotator/ajacnabcdcbcdoijcakhgglokndlnpak)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/pinyin-annotator/gigdgpgkjekfbafagikeghoflcachldl)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/pinyin-annotator/)

2. 點擊 `Add to Chrome`、`Add to Firefox` 或對應你瀏覽器的選項。

## ✨ 主要功能

- 📖 **雙重發音**：支援**漢語拼音**（拉丁字母，漢語拼音）與**注音 / Bopomofo**（注音符號），並配有準確的聲調標記。
- 🎦 **影片增強**：在 Netflix、Disney+、YouTube、Bilibili 等平台的影片字幕（隱藏字幕）中整合標註。
- 🌐 **跨瀏覽器**：支援 Firefox 及 Chromium 核心瀏覽器（Chrome、Edge、Opera、Brave）。
- 🀄 **簡繁中文**：同時支援簡體（簡體）與繁體（繁體）中文。
- ✌️ **輕鬆使用**：選取文字並點擊擴充功能圖示即可查看所選文字的標註，無需標註整個頁面。
- ⌨️ **鍵盤快捷鍵**：`Alt`（macOS 上為 `Option`）+ `Shift` + `P` 切換標註開關（可自訂）。
- ⚡ **自動標註**：可選項，在頁面載入時自動標註。
- 📃 **開源**：在 [GitHub](https://github.com/fixicelo/pinyin-annotator) 上檢視程式碼並參與貢獻。

## 🔮 計劃中的功能（歡迎 Pull Request）

- Safari 支援
- 粵拼（粵拼）

## 🚩 已知問題

- **YouTube**：在 YouTube 頁面間切換時影片標題不正確。
- **Google AI 模式**：開啟自動標註時，Google AI 模式中的句子會被截斷。
- **Bilibili**：開啟自動標註時，導覽列可能會消失。

## 🔨 製作正式建置


```bash
pnpm install
pnpm package:all
```

這會建置並打包 Chrome 與 Firefox 兩個版本的發行包（`build/chrome-mv3-prod.zip` 和 `build/firefox-mv3-prod.zip`）。只想打包單一目標？先執行 `pnpm build --target=chrome-mv3` 再 `pnpm package --target=chrome-mv3`（或 `firefox-mv3`）。

本地測試請載入未打包建置（`pnpm build:all`）：
- Chrome：`chrome://extensions` → 開發者模式 → 載入未封裝擴充功能 → `build/chrome-mv3-prod/`
- Firefox：`about:debugging#/runtime/this-firefox` → 臨時載入附加元件 → `build/firefox-mv3-prod/manifest.json`

更多參考，請查閱 [Plasmo 文件](https://docs.plasmo.com/framework)。

## 🍵 贊助

這是一個完全免費且無廣告的瀏覽器擴充功能。如果你願意慷慨解囊，可以[請我喝杯茶](https://www.buymeacoffee.com/fixicelo)。這有助於抵消我每年為維持 Safari 擴充功能而支付的 Apple 開發者費用。
