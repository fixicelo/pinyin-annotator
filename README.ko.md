# Pinyin Annotator | 병음 주석 도구

> **🌐 언어 / Language:** [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Tiếng Việt](README.vi.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · **한국어** · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Italiano](README.it.md)

병음 주석 도구는 웹 페이지와 동영상 자막의 한자 위에 **한어병음** 또는 **주음(보포모포)** 주석을 표시하는 브라우저 확장 프로그램으로, 중국어 학습을 더욱 풍성하게 만들어 줍니다.

## ⏩ 빠른 시작

1. 브라우저의 확장 프로그램 스토어로 이동합니다.

- [Chrome](https://chromewebstore.google.com/detail/pinyin-annotator/ajacnabcdcbcdoijcakhgglokndlnpak)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/pinyin-annotator/gigdgpgkjekfbafagikeghoflcachldl)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/pinyin-annotator/)

2. `Add to Chrome`, `Add to Firefox` 또는 브라우저에 해당하는 버튼을 클릭합니다.

## ✨ 주요 기능

- 📖 **이중 발음**: **한어병음**(라틴 문자, 漢語拼音)과 **주음/보포모포**(注音符號)를 정확한 성조 기호와 함께 지원합니다.
- 🎦 **동영상 스트리밍 강화**: Netflix, Disney+, YouTube, Bilibili 등 플랫폼의 중국어 자막(닫힌 캡션)에 주석을 통합합니다.
- 🌐 **크로스 브라우저**: Firefox 및 Chromium 기반 브라우저(Chrome, Edge, Opera, Brave)에서 작동합니다.
- 🀄 **간체 및 번체 중국어**: 간체(简体)와 번체(繁體) 중국어를 모두 지원합니다.
- ✌️ **간편한 사용**: 텍스트를 선택하고 확장 프로그램 아이콘을 클릭하면 전체 페이지에 주석을 달지 않고 선택한 텍스트의 주석을 볼 수 있습니다.
- ⌨️ **키보드 단축키**: `Alt`(macOS에서는 `Option`) + `Shift` + `P`로 주석을 켜고 끕니다(사용자 지정 가능).
- ⚡ **자동 주석**: 페이지 로드 시 자동으로 주석을 달 수 있습니다(선택 사항).
- 📃 **오픈 소스**: [GitHub](https://github.com/fixicelo/pinyin-annotator)에서 코드를 확인하고 기여할 수 있습니다.

## 🔮 계획된 기능 (Pull Request 환영)

- Safari 지원
- 월병(粵拼)

## 🚩 알려진 문제

- **YouTube**: YouTube에서 페이지 전환 시 동영상 제목이 잘못 표시됩니다.
- **Google AI 모드**: 자동 주석이 활성화되면 Google AI 모드에서 문장이 잘립니다.
- **Bilibili**: 자동 주석이 활성화되면 내비게이션 헤더가 사라질 수 있습니다.

## 🔨 프로덕션 빌드 만들기


```bash
pnpm install
pnpm package:all
```

Chrome과 Firefox 릴리스를 빌드하고 압축합니다(`build/chrome-mv3-prod.zip` 및 `build/firefox-mv3-prod.zip`). 단일 타깃만 필요하면 `pnpm build --target=chrome-mv3`를 실행한 후 `pnpm package --target=chrome-mv3`(또는 `firefox-mv3`)를 실행하세요.

로컬 테스트에는 압축하지 않은 빌드(`pnpm build:all`)를 로드합니다:
- Chrome: `chrome://extensions` → 개발자 모드 → 압축 해제된 확장 프로그램 로드 → `build/chrome-mv3-prod/`
- Firefox: `about:debugging#/runtime/this-firefox` → 임시 부가 기능 로드 → `build/firefox-mv3-prod/manifest.json`

자세한 내용은 [Plasmo 문서](https://docs.plasmo.com/framework)를 참조하세요.

## 🍵 후원

이 확장 프로그램은 완전히 무료이며 광고가 없습니다. 기분이 좋다면 [차 한 잔 사주시면](https://www.buymeacoffee.com/fixicelo) 됩니다. Safari 확장 프로그램을 유지하기 위해 매년 지불하는 Apple 개발자 수수료를 충당하는 데 도움이 됩니다.
