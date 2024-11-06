# Pinyin Annotator

Pinyin Annotator is a browser extension that overlays Hanyu Pinyin annotations over Chinese characters in web pages and video closed captions, enhancing your Chinese language learning journey.

## ⏩ Quick Start

1. Navigate to your browser's extension store.

- [Chrome](https://chromewebstore.google.com/detail/pinyin-annotator/ajacnabcdcbcdoijcakhgglokndlnpak)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/pinyin-annotator/gigdgpgkjekfbafagikeghoflcachldl)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/pinyin-annotator/)

2. Click `Add to Chrome`, `Add to Firefox`, or the equivalent for your browser.

## ✨ Key Features

- 🎦 **Enhanced Video Streaming**: Integrate pinyin into Chinese subtitles (closed captions) on platforms like Netflix, Disney+, YouTube, Bilibili, and more for an enriched viewing experience.
- 🌐 **Cross-Browser**: Works on Firefox and Chromium-based browsers (Chrome, Edge, Opera, Brave). Safari support coming soon.
- 🀄 **Simplified and Traditional Chinese**: Support both Simplified (简体) and Traditional (繁體) Chinese.
- ✌️ **Easy Accessibility**: Highlight text and click the extension icon to view the pinyin of the selected text without disrupting the entire page. Click to look up the word in a dictionary.
- 📃 **Open-Source**: You can review and contribute to the code on GitHub.
- ⌨️ **Keyboard shortcut**: Use `Alt`(`Option` on macOS) + `Shift` + `P` to toggle annotation (customizable).

## 🔮 Planned Features (Pull Requests are Welcome)

- Safari Support
- Bopomofo (注音) / Jyutping (粵拼)
- Right click to toggle annotation
- Automatic annotation

## 🚩 Known Issues (Pull Requests are Welcome)

- Incorrect video titles when transitioning between pages on YouTube.

## 🔨 Making production build

Apart from obtaining the extension from your browser's dedicated extension store, you can clone this repository and build it yourself.

```bash
pnpm install
pnpm build

# or

npm install
npm run build
```

This should create a production bundle for your extension, and ready to be loaded into your browser. For further reference, you may consult the [Plasmo documentation](https://docs.plasmo.com/framework).

## 🍵 Sponsor

This is a totally free and ad-free browser extension. But if you are feeling generous, you could always [buy me a tea](https://www.buymeacoffee.com/fixicelo). This would help offset the 99 bucks Apple developer fee I have to pay each year to keep the Safari extension going.
