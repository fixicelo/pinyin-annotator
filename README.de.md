# Pinyin Annotator

> **🌐 Sprache / Language:** [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Tiếng Việt](README.vi.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · **Deutsch** · [Italiano](README.it.md)

Der Pinyin-Annotator ist eine Browser-Erweiterung, die **Hanyu-Pinyin-** oder **Zhuyin- (Bopomofo-)** Annotationen über chinesische Zeichen in Webseiten und Video-Untertiteln legt und so deine Reise zum Chinesischlernen unterstützt.

## ⏩ Schnellstart

1. Öffne den Erweiterungs-Store deines Browsers.

- [Chrome](https://chromewebstore.google.com/detail/pinyin-annotator/ajacnabcdcbcdoijcakhgglokndlnpak)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/pinyin-annotator/gigdgpgkjekfbafagikeghoflcachldl)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/pinyin-annotator/)

2. Klicke auf `Add to Chrome`, `Add to Firefox` oder das Äquivalent für deinen Browser.

## ✨ Hauptfunktionen

- 📖 **Pinyin und Zhuyin**: Unterstützt **Hanyu-Pinyin** (lateinisches Alphabet, 漢語拼音) und **Zhuyin / Bopomofo** (注音符號) mit präzisen Tonmarkierungen.
- 🎦 **Verbessertes Video-Streaming**: Integriert Annotationen in chinesische Untertitel (Closed Captions) auf Plattformen wie Netflix, Disney+, YouTube, Bilibili und mehr.
- 🌐 **Cross-Browser**: Funktioniert in Firefox und Chromium-basierten Browsern (Chrome, Edge, Opera, Brave).
- 🀄 **Vereinfachtes und traditionelles Chinesisch**: Unterstützt sowohl vereinfachtes (简体) als auch traditionelles (繁體) Chinesisch.
- ✌️ **Einfacher Zugriff**: Markiere Text und klicke auf das Erweiterungssymbol, um Annotationen für den ausgewählten Text zu sehen, ohne die gesamte Seite zu annotieren.
- ⌨️ **Tastenkombination**: `Alt` (`Option` unter macOS) + `Shift` + `P` zum Ein-/Ausschalten der Annotation (anpassbar).
- ⚡ **Auto-Annotation**: Optional Seiten beim Laden automatisch annotieren.
- 📃 **Open Source**: Code auf [GitHub](https://github.com/fixicelo/pinyin-annotator) ansehen und beitragen.

## 🔮 Geplante Funktionen (Pull Requests willkommen)

- Safari-Unterstützung
- Jyutping (粵拼)

## 🚩 Bekannte Probleme

- **YouTube**: Falsche Videotitel beim Wechsel zwischen Seiten auf YouTube.
- **Google-KI-Modus**: Abgeschnittene Sätze im Google-KI-Modus, wenn die Auto-Annotation aktiviert ist.
- **Bilibili**: Die Navigationsleiste kann verschwinden, wenn die Auto-Annotation aktiviert ist.

## 🔨 Produktions-Build erstellen


```bash
pnpm install
pnpm package:all
```

Dies baut und zippt die Releases für Chrome und Firefox (`build/chrome-mv3-prod.zip` und `build/firefox-mv3-prod.zip`). Nur ein Ziel? Führe `pnpm build --target=chrome-mv3` und dann `pnpm package --target=chrome-mv3` aus (oder das Pendant für `firefox-mv3`).

Für lokale Tests lade den ungepackten Build (`pnpm build:all`):
- Chrome: `chrome://extensions` → Entwicklermodus → Entpackte Erweiterung laden → `build/chrome-mv3-prod/`
- Firefox: `about:debugging#/runtime/this-firefox` → Temporäres Add-on laden → `build/firefox-mv3-prod/manifest.json`

Weitere Referenzen findest du in der [Plasmo-Dokumentation](https://docs.plasmo.com/framework).

## 🍵 Unterstützen

Dies ist eine völlig kostenlose und werbefreie Browser-Erweiterung. Wenn du großzügig sein möchtest, kannst du mir immer [einen Tee ausgeben](https://www.buymeacoffee.com/fixicelo). Das hilft, die Apple-Entwicklergebühr auszugleichen, die ich jedes Jahr zahle, um die Safari-Erweiterung zu pflegen.
