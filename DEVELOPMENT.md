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
npm test
npm run build
npm run preview   # tùy chọn — xem bản dist/
npm audit --audit-level=high
```

## Scripts

| Lệnh | Mô tả |
| --- | --- |
| `npm run dev` | Dev server + HMR |
| `npm run build` | Typecheck (`tsc -b`) + build Vite → `dist/` |
| `npm run preview` | Phục vụ thư mục `dist/` |
| `npm run lint` | ESLint |
| `npm test` | Chạy toàn bộ test Vitest 1 lần (CI mode) |
| `npm run test:watch` | Vitest watch mode (dev) |
| `graphify update .` | Cập nhật knowledge graph (`graphify-out/`) |

## Kiến trúc tổng quan

Ứng dụng **thuần frontend (SPA)** — không có backend/API server riêng. Toàn bộ logic chạy trong trình duyệt; điểm số và tiến trình ván đấu được lưu **local** trên máy người chơi.

```text
Browser
 ├── React app (src/) ──> Zustand store ──> localStorage (persist)
 ├── GA4 (gtag.js, khai báo trong index.html) ──> Google Analytics
 └── @vercel/analytics (src/main.tsx) ──> Vercel Web Analytics
```

### Frontend

| Lớp | File/Thư mục | Vai trò |
| --- | --- | --- |
| Điều phối luồng | `src/App.tsx` | State máy: Setup → Playing → Victory popup → Summary |
| UI components | `src/components/*.tsx` | `AppHeader`, `Setup`, `ScoreInput`, `Ranking`, `VictoryPopup`, `Summary`, `Confetti`, `Fireworks` |
| Business logic thuần | `src/lib/roundScoring.ts`, `src/lib/playerStats.ts`, `src/lib/shareText.ts` | Tính điểm, thắng/thua/hòa, dựng text chia sẻ — không phụ thuộc DOM/React, dễ test |
| i18n | `src/lib/copy.ts` | Toàn bộ chuỗi UI VI/EN, truy cập qua `getCopy(language)` |
| State toàn cục | `src/store/gameStore.ts` | Zustand + middleware `persist` |
| Types | `src/types/*.ts` | `Player`, `Round`, `PlayerStats`, `Language` |

**Luồng ứng dụng (`App.tsx`):**

1. **Setup** — tên người chơi, điểm khởi tạo, mốc thắng (optional).
2. **Playing** — `ScoreInput` + `Ranking` (live), grid 2 cột trên desktop rộng, 1 cột trên mobile.
3. **Victory popup** — khi đạt mốc thắng: `VictoryPopup` (pháo hoa + confetti) → nút «Xem kết quả».
4. **Summary** — thống kê, champion card, chia sẻ text.

**State & persistence (`src/store/gameStore.ts`):**

Zustand store `useGameStore`: `players`, `rounds`, `gameStarted`, `startingScore`, actions `startGame`, `addRound`, `updateLastRound`, `deleteLastRound`, `resetGame`.

Dùng middleware `persist` (`zustand/middleware`) ghi xuống `localStorage` dưới key `scorekeeper-game-state` (`partialize`: `gameStarted`, `startingScore`, `players`, `rounds`). Nghĩa là **reload trang không mất ván đang chơi** — khác với hành vi memory-only trước đây. Xóa thủ công qua `localStorage.removeItem('scorekeeper-game-state')` hoặc `resetGame()`.

**Đa ngôn ngữ (`src/lib/copy.ts`):**

Khi đổi title hiển thị:

- VI: `Bảng ghi điểm`
- EN: `Scoreboard`

Cập nhật song song `index.html` (title, `og:title`, `twitter:title`) nếu muốn SEO khớp UI.

**Logic điểm (`src/lib/roundScoring.ts`):**

- `reachesWinningScore` — kiểm tra mốc thắng sau mỗi ván.
- `sortPlayers`, `simulateScoresAfterAdd` / `EditLast`.

### Backend / API

Không có backend. Không có API tự viết (REST/GraphQL) — chỉ gọi ra 2 dịch vụ bên thứ ba (xem [Analytics](#analytics--tracking)). Nếu cần sync nhiều thiết bị/nhiều người xem chung 1 phòng, sẽ cần thêm backend (Firestore/WebSocket) — hiện chưa triển khai, xem ghi chú "Firebase (tùy chọn)" bên dưới.

### Analytics & Tracking

Hai kênh, độc lập nhau:

| Kênh | Khai báo | Mục đích |
| --- | --- | --- |
| Google Analytics 4 | `index.html` (script `gtag.js`, measurement ID `G-KV2KS6RJY0`) + `src/lib/analytics.ts` | Custom event theo hành vi chơi game |
| Vercel Web Analytics | `src/main.tsx` (`<Analytics />` từ `@vercel/analytics/react`) | Page view/traffic mặc định, tự động, không cần code thêm |

`src/lib/analytics.ts` bọc `window.gtag` qua các hàm `trackXxx`, no-op an toàn nếu `gtag` chưa load (ví dụ chặn bởi ad-blocker). Event hiện có, gọi từ `App.tsx`:

| Hàm | Event GA4 | Khi nào bắn |
| --- | --- | --- |
| `trackGameStart` | `game_start` | Bắt đầu phòng chơi mới |
| `trackRoundAdd` | `round_add` | Lưu 1 ván mới |
| `trackRoundEditLast` | `round_edit_last` | Sửa ván cuối |
| `trackRoundDeleteLast` | `round_delete_last` | Xóa ván cuối |
| `trackVictoryPopupView` | `victory_popup_view` | Popup chiến thắng hiện ra |
| `trackVictoryContinue` | `victory_continue` | Bấm "Xem kết quả" trên popup |
| `trackGameEnd` | `game_end` | Kết thúc trận (thủ công hoặc chạm mốc thắng) |
| `trackShareResult` | `share_result` | Copy kết quả (thành công/thất bại) |
| `trackGameReset` | `game_reset` | Tạo phòng mới từ match/summary |
| `trackSummaryBackToMatch` | `summary_back_to_match` | Quay lại trận từ màn tổng kết |
| `trackLanguageChange` | `language_change` | Đổi ngôn ngữ VI/EN |
| `trackSetupPlayerChange` | `setup_player_change` | Thêm/bớt ô nhập tên người chơi ở Setup |

Thêm event mới: viết hàm `trackXxx` trong `analytics.ts` (theo pattern `gtagEvent(name, params)`), gọi tại điểm hành động tương ứng trong `App.tsx`. Không log PII (tên người chơi) vào params.

## Testing

Vitest (`vite.config.ts` → field `test`, `defineConfig` import từ `vitest/config`), môi trường `jsdom` (cần cho `localStorage`, `crypto.randomUUID` trong `gameStore`).

```bash
npm test          # 1 lần, CI
npm run test:watch
```

| File test | Bao phủ |
| --- | --- |
| `src/lib/roundScoring.test.ts` | Chuẩn hoá input, kiểm tra mốc thắng, mô phỏng điểm, sắp xếp bảng hạng |
| `src/lib/playerStats.test.ts` | Tính thắng/thua/hòa, điểm cao nhất/thấp nhất mỗi ván |
| `src/lib/shareText.test.ts` | Dựng text chia sẻ, fallback khi không có mốc thắng / chưa có ván nào |
| `src/store/gameStore.test.ts` | `startGame`, `addRound`, `updateLastRound`, `deleteLastRound`, `resetGame` |

Quy ước: test cho logic thuần trong `src/lib` và `src/store`, không test UI/component (chưa có Testing Library). Tính năng mới trong các file này nên theo TDD — viết test fail trước, code sau.

## Workflow / CI-CD

`.github/workflows/ci.yml` — chạy trên push/PR vào `main`:

```text
checkout → setup-node@22 (cache npm) → npm ci → npm run lint → npm run build
```

**Lưu ý:** CI hiện chưa chạy `npm test` — nếu thêm test mới, cân nhắc bổ sung bước `npm test` vào workflow để CI chặn được regression logic.

Deploy: Vercel, tự động khi push `main` (xem `vercel.json` — build command, output `dist/`, SPA rewrite). Không có bước deploy thủ công riêng ngoài Vercel.

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
