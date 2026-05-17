# Hướng dẫn phát triển

Cách chạy local, build production và chỉnh sửa các phần quan trọng của ScoreKeeper.

## Yêu cầu

- Node.js >= 20 LTS (khuyên dùng 22+)
- npm >= 10
- Trình duyệt hỗ trợ CSS `backdrop-filter`, Grid, custom properties

## Cài đặt & chạy local

```bash
git clone <repo-url>
cd scorekeeper
npm install
npm run dev
```

Mặc định: `http://localhost:5173`

## Kiểm tra trước khi deploy

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run preview   # tùy chọn — xem bản dist/
```

## Scripts

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Dev server + HMR |
| `npm run build` | Typecheck + build Vite → `dist/` |
| `npm run preview` | Phục vụ thư mục `dist/` |
| `npm run lint` | ESLint |
| `graphify update .` | Cập nhật knowledge graph (`graphify-out/`) |

## Cấu trúc mã nguồn

### Luồng ứng dụng (`App.tsx`)

1. **Setup** — tên người chơi, điểm khởi tạo, mốc thắng (optional).
2. **Playing** — `ScoreInput` + `Ranking` (live), grid 2 cột trên desktop rộng, 1 cột trên mobile.
3. **Victory popup** — khi đạt mốc thắng: `VictoryPopup` (pháo hoa + confetti) → nút «Xem kết quả».
4. **Summary** — thống kê, champion card, chia sẻ text.

### State (`src/store/gameStore.ts`)

Zustand: `players`, `rounds`, `gameStarted`, actions `startGame`, `addRound`, `updateLastRound`, `deleteLastRound`, `resetGame`.

### Đa ngôn ngữ (`src/lib/copy.ts`)

Toàn bộ chuỗi UI VI/EN. Khi đổi title hiển thị:

- VI: `Bảng ghi điểm`
- EN: `Scoreboard`

Cập nhật song song `index.html` (title, `og:title`, `twitter:title`) nếu muốn SEO khớp UI.

### Logic điểm (`src/lib/roundScoring.ts`)

- `reachesWinningScore` — kiểm tra mốc thắng sau mỗi ván.
- `sortPlayers`, `simulateScoresAfterAdd` / `EditLast`.

## SEO & metadata

Chỉnh trong **`index.html`** (SPA một trang, không đổi meta theo route):

```html
<title>ScoreKeeper - Bảng ghi điểm</title>
<meta property="og:image" content="https://thanhnghiep.top/CVMatcher/scorekeeper.jpeg" />
<link rel="canonical" href="https://gs.thanhnghiep.top/" />
```

File tĩnh:

- `public/robots.txt` — Allow + Sitemap URL
- `public/sitemap.xml` — URL production

**Lưu ý:** Không thêm `aggregateRating` giả vào JSON-LD. Ảnh OG phải trả HTTP 200 khi share.

## Responsive

Breakpoint và spacing trong `src/index.css`:

- `≤1024px` — typography & padding compact, grid chơi 1 cột.
- `≤640px` — lưới nhập điểm 2 cột, nút thao tác 2×2, touch target ≥44px.
- `≤420px` — lưới điểm 1 cột trên màn rất hẹp.
- `prefers-reduced-motion` — tắt pháo hoa/confetti animation.

## Firebase (tùy chọn)

Hiện tại state chỉ trong memory (reset khi reload). Có thể mở rộng Firestore sync — xem plan riêng nếu triển khai backend.

---

Mọi thay đổi nên pass `npm run lint` và `npm run build` trước khi commit.
