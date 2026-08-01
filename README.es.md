# Pinyin Annotator | Anotador Pinyin

> **🌐 Idioma / Language:** [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Tiếng Việt](README.vi.md) · **Español** · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Italiano](README.it.md)

Anotador Pinyin es una extensión de navegador que superpone anotaciones de **pinyin han** o **zhuyin (bopomofo)** sobre los caracteres chinos en páginas web y subtítulos de vídeo, mejorando tu aprendizaje del idioma chino.

## ⏩ Inicio rápido

1. Ve a la tienda de extensiones de tu navegador.

- [Chrome](https://chromewebstore.google.com/detail/pinyin-annotator/ajacnabcdcbcdoijcakhgglokndlnpak)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/pinyin-annotator/gigdgpgkjekfbafagikeghoflcachldl)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/pinyin-annotator/)

2. Haz clic en `Add to Chrome`, `Add to Firefox` o el equivalente de tu navegador.

## ✨ Funciones principales

- 📖 **Pinyin y zhuyin**: Admite **pinyin han** (alfabeto latino, 漢語拼音) y **zhuyin / bopomofo** (注音符號) con marcas de tono precisas.
- 🎦 **Streaming de vídeo mejorado**: Integra anotaciones en los subtítulos en chino (subtítulos ocultos) de plataformas como Netflix, Disney+, YouTube, Bilibili y más.
- 🌐 **Multiplataforma**: Funciona en Firefox y en navegadores basados en Chromium (Chrome, Edge, Opera, Brave).
- 🀄 **Chino simplificado y tradicional**: Admite tanto el chino simplificado (简体) como el tradicional (繁體).
- ✌️ **Fácil acceso**: Resalta texto y haz clic en el icono de la extensión para ver las anotaciones del texto seleccionado sin anotar toda la página.
- ⌨️ **Atajo de teclado**: `Alt` (`Option` en macOS) + `Shift` + `P` para activar/desactivar la anotación (personalizable).
- ⚡ **Auto-anotación**: Anota las páginas automáticamente al cargar (opcional).
- 📃 **Código abierto**: Revisa y contribuye al código en [GitHub](https://github.com/fixicelo/pinyin-annotator).

## 🔮 Funciones planificadas (se aceptan Pull Requests)

- Soporte para Safari
- Jyutping (粵拼)

## 🚩 Problemas conocidos

- **YouTube**: Títulos de vídeo incorrectos al cambiar de página en YouTube.
- **Modo IA de Google**: Frases truncadas en el modo IA de Google cuando la auto-anotación está activada.
- **Bilibili**: La cabecera de navegación puede desaparecer cuando la auto-anotación está activada.

## 🔨 Crear una compilación de producción


```bash
pnpm install
pnpm package:all
```

Esto crea y empaqueta las versiones de Chrome y Firefox (`build/chrome-mv3-prod.zip` y `build/firefox-mv3-prod.zip`). ¿Prefieres un solo destino? Ejecuta `pnpm build --target=chrome-mv3` y luego `pnpm package --target=chrome-mv3` (o el equivalente `firefox-mv3`).

Para pruebas locales, carga la compilación sin empaquetar (`pnpm build:all`):
- Chrome: `chrome://extensions` → Modo desarrollador → Cargar extensión descomprimida → `build/chrome-mv3-prod/`
- Firefox: `about:debugging#/runtime/this-firefox` → Cargar complemento temporal → `build/firefox-mv3-prod/manifest.json`

Para más referencia, consulta la [documentación de Plasmo](https://docs.plasmo.com/framework).

## 🍵 Patrocinio

Esta es una extensión de navegador totalmente gratuita y sin anuncios. Si te sientes generoso, siempre puedes [invitarme a un té](https://www.buymeacoffee.com/fixicelo). Esto ayuda a cubrir la cuota de desarrollador de Apple que pago cada año para mantener la extensión de Safari.
