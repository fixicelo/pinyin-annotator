# Pinyin Annotator

> **🌐 Language / 語言:** English · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Tiếng Việt](README.vi.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Italiano](README.it.md)

Pinyin Annotator is a browser extension that overlays **Hanyu Pinyin** or **Zhuyin (Bopomofo)** annotations over Chinese characters in web pages and video closed captions, enhancing your Chinese language learning journey.

## ⏩ Quick Start

1. Navigate to your browser's extension store.

- [Chrome](https://chromewebstore.google.com/detail/pinyin-annotator/ajacnabcdcbcdoijcakhgglokndlnpak)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/pinyin-annotator/gigdgpgkjekfbafagikeghoflcachldl)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/pinyin-annotator/)

2. Click `Add to Chrome`, `Add to Firefox`, or the equivalent for your browser.

## ✨ Key Features

- 📖 **Dual Pronunciation**: Supports both **Hanyu Pinyin** (Latin alphabet, 漢語拼音) and **Zhuyin / Bopomofo** (注音符號) with accurate tone marks.
- 🎦 **Enhanced Video Streaming**: Integrate annotations into Chinese subtitles (closed captions) on platforms like Netflix, Disney+, YouTube, Bilibili, and more.
- 🌐 **Cross-Browser**: Works on Firefox and Chromium-based browsers (Chrome, Edge, Opera, Brave).
- 🀄 **Simplified and Traditional Chinese**: Support both Simplified (简体) and Traditional (繁體) Chinese.
- ✌️ **Easy Accessibility**: Highlight text and click the extension icon to view annotations for the selected text without annotating the entire page.
- ⌨️ **Keyboard shortcut**: `Alt`(`Option` on macOS) + `Shift` + `P` to toggle annotation on/off (customizable).
- ⚡ **Auto-Annotate**: Optionally annotate pages automatically on load.
- 📃 **Open-Source**: Review and contribute to the code on [GitHub](https://github.com/fixicelo/pinyin-annotator).

## 🔮 Planned Features (Pull Requests are Welcome)

- Safari Support
- Jyutping (粵拼)

## 🚩 Known Issues

- **YouTube**: Incorrect video titles when transitioning between pages on YouTube.
- **Google AI mode**: Sentences truncated in Google AI mode when the Auto-Annotate is enabled.
- **Bilibili**: Navigation header may disappear when Auto-Annotate is enabled.

## 🔨 Making a Production Build


```bash
pnpm install
pnpm package:all
```

This builds and zips both Chrome and Firefox releases into `build/chrome-mv3-prod.zip` and `build/firefox-mv3-prod.zip`. For a single target, run `pnpm build --target=chrome-mv3` then `pnpm package --target=chrome-mv3` (or the `firefox-mv3` equivalent).

For local testing, load the unpacked build (`pnpm build:all`):
- Chrome: `chrome://extensions` → Developer mode → Load unpacked → `build/chrome-mv3-prod/`
- Firefox: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → `build/firefox-mv3-prod/manifest.json`

For further reference, consult the [Plasmo documentation](https://docs.plasmo.com/framework).

## 🍵 Sponsor

This is a totally free and ad-free browser extension. If you are feeling generous, you could always [buy me a tea](https://www.buymeacoffee.com/fixicelo). This helps offset the Apple developer fee I pay each year to keep the Safari extension going.
