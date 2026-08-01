# Pinyin Annotator | ピンイン注釈ツール

> **🌐 言語 / Language:** [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Tiếng Việt](README.vi.md) · [Español](README.es.md) · [Français](README.fr.md) · **日本語** · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Italiano](README.it.md)

ピンイン注釈ツールは、ウェブページや動画のクローズドキャプション内の漢字に**漢語ピンイン**または**注音（ボポモフォ）**の注釈を重ねて表示するブラウザ拡張機能です。中国語学習の旅をより充実させます。

## ⏩ クイックスタート

1. お使いのブラウザの拡張機能ストアに移動します。

- [Chrome](https://chromewebstore.google.com/detail/pinyin-annotator/ajacnabcdcbcdoijcakhgglokndlnpak)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/pinyin-annotator/gigdgpgkjekfbafagikeghoflcachldl)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/pinyin-annotator/)

2. `Add to Chrome`、`Add to Firefox`、またはお使いのブラウザに相当するボタンをクリックします。

## ✨ 主な機能

- 📖 **二つの発音方式**：**漢語ピンイン**（ラテン文字、漢語拼音）と**注音 / ボポモフォ**（注音符號）を正確な声調記号付きでサポートします。
- 🎦 **動画視聴を強化**：Netflix、Disney+、YouTube、Bilibili などのプラットフォームの中国語字幕（クローズドキャプション）に注釈を統合します。
- 🌐 **クロスブラウザ**：Firefox および Chromium ベースのブラウザ（Chrome、Edge、Opera、Brave）で動作します。
- 🀄 **簡体字・繁体字対応**：簡体字（简体）と繁体字（繁體）の両方をサポートします。
- ✌️ **簡単アクセス**：テキストを選択して拡張機能アイコンをクリックすると、ページ全体に注釈を付けることなく選択したテキストの注釈を表示できます。
- ⌨️ **キーボードショートカット**：`Alt`（macOS では `Option`）+ `Shift` + `P` で注釈のオン/オフを切り替えます（カスタマイズ可能）。
- ⚡ **自動注釈**：ページ読み込み時に自動的に注釈を付けるオプション。
- 📃 **オープンソース**：[GitHub](https://github.com/fixicelo/pinyin-annotator) でコードを確認・貢献できます。

## 🔮 計画中の機能（Pull Request 歓迎）

- Safari 対応
- 粤拼（粵拼）

## 🚩 既知の問題

- **YouTube**：YouTube でページ間を移動する際、動画タイトルが正しく表示されないことがあります。
- **Google AI モード**：自動注釈を有効にすると、Google AI モードで文章が途中で切れることがあります。
- **Bilibili**：自動注釈を有効にすると、ナビゲーションヘッダーが消えることがあります。

## 🔨 本番ビルドを作成する


```bash
pnpm install
pnpm package:all
```

Chrome と Firefox の両方のリリースをビルドして ZIP 化します（`build/chrome-mv3-prod.zip` と `build/firefox-mv3-prod.zip`）。単一ターゲットのみの場合は、`pnpm build --target=chrome-mv3` を実行してから `pnpm package --target=chrome-mv3`（または `firefox-mv3`）を実行してください。

ローカルテストでは、未パックのビルド（`pnpm build:all`）を読み込みます：
- Chrome: `chrome://extensions` → デベロッパーモード → 展開して読み込み → `build/chrome-mv3-prod/`
- Firefox: `about:debugging#/runtime/this-firefox` → 一時的なアドオンを読み込む → `build/firefox-mv3-prod/manifest.json`

詳細は [Plasmo ドキュメント](https://docs.plasmo.com/framework) を参照してください。

## 🍵 スポンサー

これは完全に無料で広告のないブラウザ拡張機能です。もし気前よく支援していただけるなら、[お茶をごちそうして](https://www.buymeacoffee.com/fixicelo)ください。Safari 拡張機能を維持するために毎年支払っている Apple デベロッパー料金の補填になります。
