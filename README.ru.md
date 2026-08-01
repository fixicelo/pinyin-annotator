# Pinyin Annotator | Анотатор пиньинь

> **🌐 Язык / Language:** [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Tiếng Việt](README.vi.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · **Русский** · [Deutsch](README.de.md) · [Italiano](README.it.md)

Анотатор пиньинь — это расширение браузера, которое накладывает аннотации **ханьюй пиньинь** или **чжуинь (бопомофо)** на китайские иероглифы на веб-страницах и в субтитрах видео, делая ваше изучение китайского языка более эффективным.

## ⏩ Быстрый старт

1. Перейдите в магазин расширений вашего браузера.

- [Chrome](https://chromewebstore.google.com/detail/pinyin-annotator/ajacnabcdcbcdoijcakhgglokndlnpak)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/pinyin-annotator/gigdgpgkjekfbafagikeghoflcachldl)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/pinyin-annotator/)

2. Нажмите `Add to Chrome`, `Add to Firefox` или аналогичную кнопку для вашего браузера.

## ✨ Ключевые функции

- 📖 **Пиньинь и чжуинь**: Поддерживает **ханьюй пиньинь** (латиница, 漢語拼音) и **чжуинь / бопомофо** (注音符號) с точными тоновыми знаками.
- 🎦 **Улучшенный просмотр видео**: Добавляет аннотации к китайским субтитрам (скрытым титрам) на таких платформах, как Netflix, Disney+, YouTube, Bilibili и других.
- 🌐 **Кросс-браузерность**: Работает в Firefox и браузерах на базе Chromium (Chrome, Edge, Opera, Brave).
- 🀄 **Упрощённый и традиционный китайский**: Поддержка упрощённого (简体) и традиционного (繁體) китайского.
- ✌️ **Простой доступ**: Выделите текст и нажмите на значок расширения, чтобы увидеть аннотации для выбранного текста, не аннотируя всю страницу.
- ⌨️ **Сочетание клавиш**: `Alt` (`Option` на macOS) + `Shift` + `P` для включения/выключения аннотаций (настраивается).
- ⚡ **Авто-аннотирование**: Опционально аннотировать страницы автоматически при загрузке.
- 📃 **Открытый исходный код**: Просматривайте и участвуйте в разработке кода на [GitHub](https://github.com/fixicelo/pinyin-annotator).

## 🔮 Планируемые функции (приветствуются pull request'ы)

- Поддержка Safari
- Jyutping (粵拼)

## 🚩 Известные проблемы

- **YouTube**: Некорректные заголовки видео при переходе между страницами YouTube.
- **Режим Google AI**: Обрезание предложений в режиме Google AI при включённом авто-аннотировании.
- **Bilibili**: Шапка навигации может исчезать при включённом авто-аннотировании.

## 🔨 Создание производственной сборки


```bash
pnpm install
pnpm package:all
```

Это соберёт и упакует релизы для Chrome и Firefox (`build/chrome-mv3-prod.zip` и `build/firefox-mv3-prod.zip`). Нужна одна цель? Выполните `pnpm build --target=chrome-mv3`, затем `pnpm package --target=chrome-mv3` (или аналог для `firefox-mv3`).

Для локального тестирования загрузите несобранную сборку (`pnpm build:all`):
- Chrome: `chrome://extensions` → Режим разработчика → Загрузить распакованное расширение → `build/chrome-mv3-prod/`
- Firefox: `about:debugging#/runtime/this-firefox` → Загрузить временное дополнение → `build/firefox-mv3-prod/manifest.json`

Для справки обратитесь к [документации Plasmo](https://docs.plasmo.com/framework).

## 🍵 Поддержка

Это полностью бесплатное расширение без рекламы. Если вы хотите проявить щедрость, вы можете [угостить меня чаем](https://www.buymeacoffee.com/fixicelo). Это помогает компенсировать плату разработчика Apple, которую я плачу каждый год за поддержку расширения Safari.
