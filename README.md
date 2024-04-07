# Pinyin Annotator

Pinyin Annotator is a browser extension that seamlessly overlays Hanyu Pinyin annotations on Chinese characters throughout web pages and video subtitles, thereby augmenting your online Chinese learning experience.

## Quick Start

To install Pinyin Annotator for your browser:

1. Navigate to your browser's extension store.

2. Enter `Pinyin Annotator` in the search bar.

3. Click on `Add to Chrome`, `Add to Firefox`, or the equivalent for your browser.

## Key Features

- **Enhanced Video Streaming**: Integrate pinyin into Chinese subtitles (closed captions) on video streaming platforms such as Netflix, Disney+, YouTube, Bilibili, and more for an enriched viewing experience.
- **Cross-Browser Compatibility**: Works smoothly on on Firefox and Chromium-based browsers (Chrome, Edge, Opera, Brave, and so forth), with forthcoming support for Safari.
- **Support for Simplified and Traditional Chinese**: Accommodates both Simplified (汉) and Traditional (漢) Chinese.
- **Easy Accessibility**: If you wish to view the pinyin of a few words only, simply highlight them and click the extension icon. This allows you to view the pinyin of the selected text without disrupting the entire page.
- **Transparent and Open-Source**: Unlike many browser extensions that do not disclose their code, leaving you uncertain about their operations, this extension allows you to review every line of code. Furthermore, you can build it yourself or contribute to it on GitHub.
- **Flexible Display Options**: Choose to display or hide pinyin tone marks as per your preference.

## Making production build

Apart from obtaining the extension from your browser's dedicated extension store, you can clone this repository and build it yourself.

```bash
pnpm install
pnpm build

# or

npm install
npm run build
```

This should create a production bundle for your extension, and ready to be loaded into your browser. For further reference, you may consult the [Plasmo documentation](https://docs.plasmo.com/framework).

## Sponsor

This is a totally free and ad-free browser extension. But if you are feeling generous, you could always [buy me a tea](https://www.buymeacoffee.com/fixicelo). This would help offset the 99 bucks Apple developer fee I have to pay each year to keep the Safari extension going.
