# Pinyin Annotator | Annotateur Pinyin

> **🌐 Langue / Language:** [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Tiếng Việt](README.vi.md) · [Español](README.es.md) · **Français** · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Italiano](README.it.md)

Annotateur Pinyin est une extension de navigateur qui superpose des annotations de **pinyin** ou de **zhuyin (bopomofo)** sur les caractères chinois des pages web et des sous-titres vidéo, pour enrichir votre apprentissage du chinois.

## ⏩ Démarrage rapide

1. Rendez-vous sur la boutique d'extensions de votre navigateur.

- [Chrome](https://chromewebstore.google.com/detail/pinyin-annotator/ajacnabcdcbcdoijcakhgglokndlnpak)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/pinyin-annotator/gigdgpgkjekfbafagikeghoflcachldl)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/pinyin-annotator/)

2. Cliquez sur `Add to Chrome`, `Add to Firefox` ou l'équivalent pour votre navigateur.

## ✨ Fonctionnalités clés

- 📖 **Pinyin et zhuyin** : prend en charge le **pinyin** (alphabet latin, 漢語拼音) et le **zhuyin / bopomofo** (注音符號) avec des marques de ton précises.
- 🎦 **Lecture vidéo améliorée** : intègre les annotations dans les sous-titres chinois (sous-titres codés) sur des plateformes comme Netflix, Disney+, YouTube, Bilibili, etc.
- 🌐 **Multi-navigateur** : fonctionne sur Firefox et les navigateurs basés sur Chromium (Chrome, Edge, Opera, Brave).
- 🀄 **Chinois simplifié et traditionnel** : prend en charge le chinois simplifié (简体) et traditionnel (繁體).
- ✌️ **Accessibilité facile** : surlignez du texte et cliquez sur l'icône de l'extension pour voir les annotations du texte sélectionné sans annoter toute la page.
- ⌨️ **Raccourci clavier** : `Alt` (`Option` sur macOS) + `Shift` + `P` pour activer/désactiver l'annotation (personnalisable).
- ⚡ **Auto-annotation** : annotez les pages automatiquement au chargement (optionnel).
- 📃 **Open source** : consultez et contribuez au code sur [GitHub](https://github.com/fixicelo/pinyin-annotator).

## 🔮 Fonctionnalités prévues (les pull requests sont les bienvenues)

- Prise en charge de Safari
- Jyutping (粵拼)

## 🚩 Problèmes connus

- **YouTube** : titres de vidéos incorrects lors du changement de page sur YouTube.
- **Mode IA de Google** : phrases tronquées dans le mode IA de Google lorsque l'auto-annotation est activée.
- **Bilibili** : l'en-tête de navigation peut disparaître lorsque l'auto-annotation est activée.

## 🔨 Créer une compilation de production


```bash
pnpm install
pnpm package:all
```

Cela compile et empaquette les versions Chrome et Firefox (`build/chrome-mv3-prod.zip` et `build/firefox-mv3-prod.zip`). Une seule cible ? Exécutez `pnpm build --target=chrome-mv3` puis `pnpm package --target=chrome-mv3` (ou l'équivalent `firefox-mv3`).

Pour les tests locaux, chargez la compilation non empaquetée (`pnpm build:all`) :
- Chrome : `chrome://extensions` → Mode développeur → Charger l'extension non empaquetée → `build/chrome-mv3-prod/`
- Firefox : `about:debugging#/runtime/this-firefox` → Charger un module complémentaire temporaire → `build/firefox-mv3-prod/manifest.json`

Pour plus de références, consultez la [documentation Plasmo](https://docs.plasmo.com/framework).

## 🍵 Parrainage

C'est une extension de navigateur entièrement gratuite et sans publicité. Si vous vous sentez généreux, vous pouvez toujours [m'offrir un thé](https://www.buymeacoffee.com/fixicelo). Cela aide à compenser les frais de développeur Apple que je paie chaque année pour maintenir l'extension Safari.
