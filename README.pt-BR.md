# Pinyin Annotator | Anotador Pinyin

> **🌐 Idioma / Language:** [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Tiếng Việt](README.vi.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · **Português (Brasil)** · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Italiano](README.it.md)

O Anotador Pinyin é uma extensão de navegador que sobrepõe anotações de **pinyin** ou **zhuyin (bopomofo)** sobre caracteres chineses em páginas da web e legendas de vídeo, enriquecendo sua jornada de aprendizado da língua chinesa.

## ⏩ Início rápido

1. Acesse a loja de extensões do seu navegador.

- [Chrome](https://chromewebstore.google.com/detail/pinyin-annotator/ajacnabcdcbcdoijcakhgglokndlnpak)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/pinyin-annotator/gigdgpgkjekfbafagikeghoflcachldl)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/pinyin-annotator/)

2. Clique em `Add to Chrome`, `Add to Firefox` ou o equivalente do seu navegador.

## ✨ Principais recursos

- 📖 **Pronúncia dupla**: Suporta **pinyin** (alfabeto latino, 漢語拼音) e **zhuyin / bopomofo** (注音符號) com marcas de tom precisas.
- 🎦 **Streaming de vídeo aprimorado**: Integra anotações em legendas chinesas (closed captions) em plataformas como Netflix, Disney+, YouTube, Bilibili e outras.
- 🌐 **Multi-navegador**: Funciona no Firefox e em navegadores baseados em Chromium (Chrome, Edge, Opera, Brave).
- 🀄 **Chinês simplificado e tradicional**: Suporta chinês simplificado (简体) e tradicional (繁體).
- ✌️ **Fácil acesso**: Selecione o texto e clique no ícone da extensão para ver as anotações do texto selecionado sem anotar a página inteira.
- ⌨️ **Atalho de teclado**: `Alt` (`Option` no macOS) + `Shift` + `P` para ativar/desativar a anotação (personalizável).
- ⚡ **Auto-anotação**: Opcionalmente, anote as páginas automaticamente ao carregar.
- 📃 **Código aberto**: Revise e contribua com o código no [GitHub](https://github.com/fixicelo/pinyin-annotator).

## 🔮 Recursos planejados (pull requests são bem-vindos)

- Suporte ao Safari
- Jyutping (粵拼)

## 🚩 Problemas conhecidos

- **YouTube**: Títulos de vídeo incorretos ao alternar entre páginas no YouTube.
- **Modo de IA do Google**: Frases truncadas no modo de IA do Google quando a auto-anotação está ativada.
- **Bilibili**: O cabeçalho de navegação pode desaparecer quando a auto-anotação está ativada.

## 🔨 Criando um build de produção


```bash
pnpm install
pnpm package:all
```

Isso compila e empacota as versões para Chrome e Firefox (`build/chrome-mv3-prod.zip` e `build/firefox-mv3-prod.zip`). Prefere um único alvo? Execute `pnpm build --target=chrome-mv3` e depois `pnpm package --target=chrome-mv3` (ou o equivalente `firefox-mv3`).

Para testes locais, carregue o build não empacotado (`pnpm build:all`):
- Chrome: `chrome://extensions` → Modo do desenvolvedor → Carregar sem compactação → `build/chrome-mv3-prod/`
- Firefox: `about:debugging#/runtime/this-firefox` → Carregar complemento temporário → `build/firefox-mv3-prod/manifest.json`

Para mais referências, consulte a [documentação do Plasmo](https://docs.plasmo.com/framework).

## 🍵 Patrocínio

Esta é uma extensão de navegador totalmente gratuita e sem anúncios. Se você estiver se sentindo generoso, pode sempre [me comprar um chá](https://www.buymeacoffee.com/fixicelo). Isso ajuda a compensar a taxa de desenvolvedor da Apple que pago todos os anos para manter a extensão do Safari.
