# Pinyin Annotator | Annotatore Pinyin

> **🌐 Lingua / Language:** [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Tiếng Việt](README.vi.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · **Italiano**

L'Annotatore Pinyin è un'estensione del browser che sovrappone annotazioni di **pinyin** o **zhuyin (bopomofo)** sui caratteri cinesi nelle pagine web e nei sottotitoli dei video, migliorando il tuo percorso di apprendimento del cinese.

## ⏩ Guida rapida

1. Vai allo store di estensioni del tuo browser.

- [Chrome](https://chromewebstore.google.com/detail/pinyin-annotator/ajacnabcdcbcdoijcakhgglokndlnpak)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/pinyin-annotator/gigdgpgkjekfbafagikeghoflcachldl)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/pinyin-annotator/)

2. Fai clic su `Add to Chrome`, `Add to Firefox` o l'equivalente per il tuo browser.

## ✨ Caratteristiche principali

- 📖 **Doppia pronuncia**: Supporta **pinyin** (alfabeto latino, 漢語拼音) e **zhuyin / bopomofo** (注音符號) con segni di tono precisi.
- 🎦 **Streaming video migliorato**: Integra le annotazioni nei sottotitoli cinesi (closed captions) su piattaforme come Netflix, Disney+, YouTube, Bilibili e altre.
- 🌐 **Multi-browser**: Funziona su Firefox e sui browser basati su Chromium (Chrome, Edge, Opera, Brave).
- 🀄 **Cinese semplificato e tradizionale**: Supporta sia il cinese semplificato (简体) che quello tradizionale (繁體).
- ✌️ **Facile accesso**: Evidenzia il testo e fai clic sull'icona dell'estensione per vedere le annotazioni del testo selezionato senza annotare l'intera pagina.
- ⌨️ **Scorciatoia da tastiera**: `Alt` (`Option` su macOS) + `Shift` + `P` per attivare/disattivare l'annotazione (personalizzabile).
- ⚡ **Auto-annotazione**: Annulla le pagine automaticamente al caricamento (opzionale).
- 📃 **Open source**: Rivedi e contribuisci al codice su [GitHub](https://github.com/fixicelo/pinyin-annotator).

## 🔮 Funzionalità pianificate (pull request benvenute)

- Supporto Safari
- Jyutping (粵拼)

## 🚩 Problemi noti

- **YouTube**: Titoli video errati quando si passa da una pagina all'altra su YouTube.
- **Modalità IA di Google**: Frasi troncate nella modalità IA di Google quando l'auto-annotazione è attivata.
- **Bilibili**: L'intestazione di navigazione può sparire quando l'auto-annotazione è attivata.

## 🔨 Creare una build di produzione


```bash
pnpm install
pnpm package:all
```

Questo compila e impacchetta le release per Chrome e Firefox (`build/chrome-mv3-prod.zip` e `build/firefox-mv3-prod.zip`). Preferisci un solo target? Esegui `pnpm build --target=chrome-mv3` e poi `pnpm package --target=chrome-mv3` (o l'equivalente `firefox-mv3`).

Per i test locali, carica la build non impacchettata (`pnpm build:all`):
- Chrome: `chrome://extensions` → Modalità sviluppatore → Carica estensione non pacchettizzata → `build/chrome-mv3-prod/`
- Firefox: `about:debugging#/runtime/this-firefox` → Carica componente aggiuntivo temporaneo → `build/firefox-mv3-prod/manifest.json`

Per ulteriori riferimenti, consulta la [documentazione di Plasmo](https://docs.plasmo.com/framework).

## 🍵 Sponsorizzazione

Questa è un'estensione del browser completamente gratuita e senza pubblicità. Se ti senti generoso, puoi sempre [offrirmi un tè](https://www.buymeacoffee.com/fixicelo). Questo aiuta a compensare la quota per sviluppatori Apple che pago ogni anno per mantenere l'estensione Safari.
