# ScoreKeeper — Bảng ghi điểm

## Tổng quan

ScoreKeeper là ứng dụng web theo dõi điểm cho trò chơi nhóm (board game, bài, mạt chược…) với giao diện **Neon-Glass**. Tối ưu cho mobile và màn hình PC nhỏ, chạy hoàn toàn trên trình duyệt.

- **URL:** [https://gs.thanhnghiep.top/](https://gs.thanhnghiep.top/)
- **Ngôn ngữ:** Tiếng Việt / English (chuyển đổi trong app)

## Tính năng chính

- **Thiết lập phòng:** 2–16 người chơi, điểm khởi tạo, mốc chiến thắng tùy chọn.
- **Nhập điểm theo ván:** Bảng xếp hạng cập nhật realtime, highlight khi điểm thay đổi.
- **Sửa / xóa ván:** Chỉnh ván vừa nhập hoặc xóa ván cuối.
- **Chiến thắng tự động:** Khi đạt mốc điểm → popup chúc mừng (pháo hoa + confetti) → màn tổng kết.
- **Thống kê:** Thắng/thua/hòa, điểm cao nhất/thấp nhất từng người.
- **Chia sẻ:** Sao chép bảng kết quả dạng text (Zalo, Messenger, Telegram…).

## Công nghệ

| Lớp | Stack |
|-----|--------|
| UI | React 19 + TypeScript |
| Build | Vite 8 |
| Style | Vanilla CSS (Neon-Glass, CSS variables) |
| State | Zustand 5 |
| Deploy | Vercel + custom domain |

## Cấu trúc dự án

```text
scorekeeper/
├── src/
│   ├── components/       # UI: Setup, ScoreInput, Ranking, Summary, VictoryPopup…
│   ├── lib/              # copy (i18n), roundScoring, playerStats, shareText
│   ├── store/            # gameStore (Zustand)
│   ├── types/            # Player, Round, Language…
│   ├── App.tsx           # Điều phối luồng game
│   └── index.css         # Design system + responsive
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   └── favicon.svg
├── index.html            # SEO, Open Graph, JSON-LD
├── README.md
├── DEVELOPMENT.md
└── DESIGN.md
```

## SEO & chia sẻ mạng xã hội

Metadata cấu hình trong `index.html`:

| Mục | Giá trị |
|-----|---------|
| Title | ScoreKeeper - Bảng ghi điểm |
| Canonical | `https://gs.thanhnghiep.top/` |
| OG image | `https://thanhnghiep.top/CVMatcher/scorekeeper.jpeg` (1280×720) |
| Schema | `SoftwareApplication` (JSON-LD) |

Sau khi đổi meta hoặc ảnh OG, nên debug lại preview (Facebook Sharing Debugger) để xóa cache.

## Triển khai

Production: **https://gs.thanhnghiep.top/**

```bash
npm run build   # output: dist/
```

Chi tiết môi trường dev: [DEVELOPMENT.md](./DEVELOPMENT.md). Triết lý UI: [DESIGN.md](./DESIGN.md).
