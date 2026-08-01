# Pinyin Annotator | Chú thích Pinyin

> **🌐 Ngôn ngữ / Language:** [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · **Tiếng Việt** · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · [Deutsch](README.de.md) · [Italiano](README.it.md)

Chú thích Pinyin là tiện ích mở rộng trình duyệt giúp thêm chú thích **Hán ngữ Pinyin** hoặc **Zhuyin (Bopomofo)** lên các ký tự tiếng Trung trong trang web và phụ đề video, hỗ trợ hành trình học tiếng Trung của bạn.

## ⏩ Bắt đầu nhanh

1. Đi đến cửa hàng tiện ích của trình duyệt của bạn.

- [Chrome](https://chromewebstore.google.com/detail/pinyin-annotator/ajacnabcdcbcdoijcakhgglokndlnpak)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/pinyin-annotator/gigdgpgkjekfbafagikeghoflcachldl)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/pinyin-annotator/)

2. Nhấp `Add to Chrome`, `Add to Firefox` hoặc tương đương cho trình duyệt của bạn.

## ✨ Tính năng chính

- 📖 **Pinyin & Zhuyin**: Hỗ trợ cả **Hán ngữ Pinyin** (bảng chữ cái Latinh, 漢語拼音) và **Zhuyin / Bopomofo** (注音符號) với dấu thanh chính xác.
- 🎦 **Xem video nâng cao**: Tích hợp chú thích vào phụ đề tiếng Trung (phụ đề đóng) trên các nền tảng như Netflix, Disney+, YouTube, Bilibili, v.v.
- 🌐 **Đa trình duyệt**: Hoạt động trên Firefox và các trình duyệt dựa trên Chromium (Chrome, Edge, Opera, Brave).
- 🀄 **Tiếng Trung giản thể và phồn thể**: Hỗ trợ cả tiếng Trung giản thể (简体) và phồn thể (繁體).
- ✌️ **Dễ truy cập**: Bôi đen văn bản và nhấp biểu tượng tiện ích để xem chú thích cho đoạn đã chọn mà không cần chú thích toàn trang.
- ⌨️ **Phím tắt**: `Alt` (`Option` trên macOS) + `Shift` + `P` để bật/tắt chú thích (có thể tùy chỉnh).
- ⚡ **Tự động chú thích**: Tùy chọn tự động chú thích trang khi tải.
- 📃 **Mã nguồn mở**: Xem và đóng góp mã trên [GitHub](https://github.com/fixicelo/pinyin-annotator).

## 🔮 Tính năng dự kiến (Hoan nghênh Pull Request)

- Hỗ trợ Safari
- Jyutping (粵拼)

## 🚩 Sự cố đã biết

- **YouTube**: Tựa đề video sai khi chuyển giữa các trang trên YouTube.
- **Google AI mode**: Câu bị cắt trong Google AI mode khi bật Tự động chú thích.
- **Bilibili**: Thanh điều hướng có thể biến mất khi bật Tự động chú thích.

## 🔨 Tạo bản build production


```bash
pnpm install
pnpm package:all
```

Lệnh này sẽ xây dựng và đóng gói cả hai bản phát hành Chrome và Firefox (`build/chrome-mv3-prod.zip` và `build/firefox-mv3-prod.zip`). Muốn đóng gói một mục tiêu? Chạy `pnpm build --target=chrome-mv3` rồi `pnpm package --target=chrome-mv3` (hoặc tương ứng `firefox-mv3`).

Để kiểm tra cục bộ, tải bản build chưa đóng gói (`pnpm build:all`):
- Chrome: `chrome://extensions` → Chế độ nhà phát triển → Load unpacked → `build/chrome-mv3-prod/`
- Firefox: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → `build/firefox-mv3-prod/manifest.json`

Tham khảo thêm tại [tài liệu Plasmo](https://docs.plasmo.com/framework).

## 🍵 Ủng hộ

Đây là tiện ích mở rộng hoàn toàn miễn phí và không có quảng cáo. Nếu bạn cảm thấy hào phóng, bạn có thể [mua cho tôi một ly trà](https://www.buymeacoffee.com/fixicelo). Điều này giúp bù đắp phí nhà phát triển Apple tôi trả mỗi năm để duy trì tiện ích Safari.
