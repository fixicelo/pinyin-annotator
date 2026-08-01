# Pinyin Annotator | 拼音标注工具

> **🌐 语言 / Language:** [English](README.md) · **简体中文** · [繁體中文](README.zh-TW.md) · [Tiếng Việt](README.vi.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Italiano](README.it.md)

拼音标注工具是一款浏览器扩展，在网页与视频字幕中的汉字上叠加**汉语拼音**或**注音（Bopomofo）**标注，助你更好地学习中文。

## ⏩ 快速开始

1. 前往你的浏览器扩展商店。

- [Chrome](https://chromewebstore.google.com/detail/pinyin-annotator/ajacnabcdcbcdoijcakhgglokndlnpak)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/pinyin-annotator/gigdgpgkjekfbafagikeghoflcachldl)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/pinyin-annotator/)

2. 点击 `Add to Chrome`、`Add to Firefox` 或对应你浏览器的选项。

## ✨ 主要功能

- 📖 **拼音与注音**：支持**汉语拼音**（拉丁字母，漢語拼音）与**注音 / Bopomofo**（注音符號），并配有准确的声调标记。
- 🎦 **视频增强**：在 Netflix、Disney+、YouTube、Bilibili 等平台的视频字幕（隐藏字幕）中集成标注。
- 🌐 **跨浏览器**：支持 Firefox 及 Chromium 内核浏览器（Chrome、Edge、Opera、Brave）。
- 🀄 **简繁中文**：同时支持简体（简体）与繁体（繁體）中文。
- ✌️ **轻松使用**：选中文字并点击扩展图标即可查看所选文字的标注，无需标注整个页面。
- ⌨️ **键盘快捷键**：`Alt`（macOS 上为 `Option`）+ `Shift` + `P` 切换标注开关（可自定义）。
- ⚡ **自动标注**：可选项，在页面加载时自动标注。
- 📃 **开源**：在 [GitHub](https://github.com/fixicelo/pinyin-annotator) 上查看代码并参与贡献。

## 🔮 计划中的功能（欢迎 Pull Request）

- Safari 支持
- 粤拼（粵拼）

## 🚩 已知问题

- **YouTube**：在 YouTube 页面间切换时视频标题不正确。
- **Google AI 模式**：开启自动标注时，Google AI 模式中的句子会被截断。
- **Bilibili**：开启自动标注时，导航栏可能会消失。

## 🔨 制作生产构建


```bash
pnpm install
pnpm package:all
```

这会构建并打包 Chrome 与 Firefox 两个版本的发布包（`build/chrome-mv3-prod.zip` 和 `build/firefox-mv3-prod.zip`）。只想打包单个目标？先运行 `pnpm build --target=chrome-mv3` 再 `pnpm package --target=chrome-mv3`（或 `firefox-mv3`）。

本地测试请加载未打包构建（`pnpm build:all`）：
- Chrome：`chrome://extensions` → 开发者模式 → 加载已解压的扩展程序 → `build/chrome-mv3-prod/`
- Firefox：`about:debugging#/runtime/this-firefox` → 临时载入附加组件 → `build/firefox-mv3-prod/manifest.json`

更多参考，请查阅 [Plasmo 文档](https://docs.plasmo.com/framework)。

## 🍵 赞助

这是一个完全免费且无广告的浏览器扩展。如果你愿意慷慨解囊，可以[请我喝杯茶](https://www.buymeacoffee.com/fixicelo)。这有助于抵消我每年为维持 Safari 扩展而支付的 Apple 开发者费用。
