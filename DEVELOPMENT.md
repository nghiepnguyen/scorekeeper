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
 │                                  └──> Firestore (rooms/{roomCode}) ── đồng bộ realtime, tùy chọn
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
2. **Playing** — `ScoreInput` + `Ranking` (live), grid 2 cột trên desktop rộng, 1 cột trên mobile. Nếu đang xem phòng người khác (`roomCode` set, `isHost === false`) thì `ScoreInput` bị ẩn hoàn toàn — chỉ còn `Ranking` căn giữa (`content-grid.single`), không có form nhập điểm nào lộ ra.
3. **Victory popup** — khi đạt mốc thắng: `VictoryPopup` (pháo hoa + confetti) → nút «Xem kết quả».
4. **Summary** — thống kê, champion card, chia sẻ text.

**State & persistence (`src/store/gameStore.ts`):**

Zustand store `useGameStore`: `players`, `rounds`, `gameStarted`, `startingScore`, `winningScore`, `gameEnded`, `roomCode`, `deviceId`, `isHost`, `syncStatus`, actions `startGame`, `addRound`, `updateLastRound`, `deleteLastRound`, `setGameEnded`, `resetGame`, `leaveRoom`, `createRoom`, `joinRoom`, `applyRemoteState`.

Dùng middleware `persist` (`zustand/middleware`) ghi xuống `localStorage` dưới key `scorekeeper-game-state` (`partialize`: `gameStarted`, `startingScore`, `winningScore`, `gameEnded`, `players`, `rounds`, `roomCode`). Nghĩa là **reload trang không mất ván đang chơi**, và nếu đang ở trong 1 phòng sync thì reload vẫn tự kết nối lại phòng đó. Xóa thủ công qua `localStorage.removeItem('scorekeeper-game-state')` hoặc `resetGame()` (chỉ host mới `resetGame()` được khi đang ở trong phòng — xem mục Firebase bên dưới).

`winningScore` và `gameEnded` từng chỉ là state cục bộ trong `App.tsx` (không đồng bộ) — đã chuyển vào store để viewer cũng tính đúng "ai đang thắng" và tự chuyển sang màn `Summary` khi host kết thúc trận, thay vì chỉ host mới thấy. `setGameEnded(ended)` là action host-gated (giống `addRound`...) dùng cho cả 2 chiều: host bấm "Kết thúc game"/xác nhận popup chiến thắng (`true`) lẫn "Quay lại trận đấu" từ màn Summary (`false`) — viewer không có quyền gọi, 2 nút tương ứng trong `Summary.tsx` bị `disabled` khi `readOnly`.

`resetGame()` và `leaveRoom()` khác nhau: `resetGame()` là hành động của host — reset toàn bộ (kể cả xóa `roomCode`/`isHost` cục bộ), bị chặn nếu gọi từ máy không phải host. `leaveRoom()` là lối thoát cho viewer — không cần quyền host, chỉ xóa state cục bộ (không đụng Firestore), dùng khi viewer muốn rời phòng đang xem (nút "Rời phòng" luôn hiện phía trên `AppHeader` khi `roomCode` set và `isHost === false`, xem `App.tsx`).

`deviceId` (localStorage key riêng `scorekeeper-device-id`, tạo 1 lần bằng `crypto.randomUUID()`) dùng để xác định ai là host của 1 phòng — xem chi tiết ở mục "Firebase / đồng bộ nhiều thiết bị".

**Đa ngôn ngữ (`src/lib/copy.ts`):**

Khi đổi title hiển thị:

- VI: `Bảng ghi điểm`
- EN: `Scoreboard`

Cập nhật song song `index.html` (title, `og:title`, `twitter:title`) nếu muốn SEO khớp UI.

**Logic điểm (`src/lib/roundScoring.ts`):**

- `reachesWinningScore` — kiểm tra mốc thắng sau mỗi ván.
- `sortPlayers`, `simulateScoresAfterAdd` / `EditLast`.

### Backend / API

Không có backend tự viết (REST/GraphQL). Có 2 dịch vụ bên thứ ba gọi trực tiếp từ browser:

- Analytics (xem [Analytics](#analytics--tracking)).
- Firestore (Firebase) — đồng bộ điểm realtime nhiều thiết bị, tùy chọn, xem mục "Firebase / đồng bộ nhiều thiết bị" bên dưới.

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
| `src/store/gameStore.sync.test.ts` | Gate quyền host cho `addRound`/`resetGame` khi có `roomCode`, hành vi `createRoom`/`joinRoom` (mock `src/lib/roomSync`, không gọi Firestore thật) |

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

## Firebase / đồng bộ nhiều thiết bị

Cho phép 1 host nhập điểm, người khác mở link/nhập mã phòng để xem điểm cập nhật realtime (không cần F5). Toàn bộ code nằm ở `src/lib/firebase.ts`, `src/lib/roomSync.ts`, `src/lib/deviceId.ts`, `src/lib/roomUrl.ts`, `src/hooks/useRoomSync.ts`.

UI liên quan (style trong `src/index.css`, section "Room / realtime sync UI"): `.room-bar` (thanh trạng thái đồng bộ — dùng cả cho khối chia sẻ phòng của host trong `ScoreInput.tsx` lẫn thanh "Rời phòng" của viewer trong `App.tsx`), `.room-code-pill` (mã phòng dạng pill monospace), `.sync-error-banner` (banner lỗi sync), `.join-room-bar` (khối nhập mã phòng ở màn Setup), `.content-grid.single` (căn giữa `Ranking` khi viewer không có `ScoreInput`).

### Cài đặt

1. Copy `.env.example` → `.env.local`, điền các giá trị từ Firebase Console → Project settings → General → phần "Your apps" (Web app):
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
   - `VITE_FIREBASE_DATABASE_ID`: mặc định `(default)`. Nếu tạo Firestore database với tên riêng (multi-database, ví dụ đặt tên `scorekeeper-db` lúc tạo trên Firebase/GCP Console) thì phải điền đúng tên đó, không thì client báo lỗi `NOT_FOUND` khi kết nối. Kiểm tra tên database thật bằng `firebase firestore:databases:list --project <project-id>`.
2. Firestore phải ở **Standard edition** (đủ cho nhu cầu app — đọc/ghi 1 document theo room code, không cần Enterprise/Pipelines).
3. Firestore (kể cả nằm trong free quota) vẫn yêu cầu project gắn **billing** (chuyển sang plan Blaze) mới cho phép kết nối — không gắn billing sẽ gặp lỗi `PERMISSION_DENIED: billing`.
4. `.env.local` đã bị gitignore (`.env.*` trừ `.env.example`) — không commit key thật.

### Data model

Collection `rooms`, document id = room code (6 ký tự, bỏ ký tự dễ nhầm `0/O/1/I/L`). Field: `roomCode`, `hostDeviceId`, `gameStarted`, `startingScore`, `winningScore`, `gameEnded`, `players`, `rounds`, `allowGuestScoring`, `createdAt`, `updatedAt` — xem type `RoomState` trong `src/lib/roomSync.ts`.

### Luồng

1. Host bấm "Chia sẻ phòng (đồng bộ)" (`ScoreInput.tsx`) → `useGameStore.createRoom()` → sinh room code, ghi document, set `isHost = true`. `useRoomSync` thấy `roomCode` đổi → tự thêm `?room=<code>` vào URL (`setRoomCodeInUrl`).
2. Người khác mở link (hoặc gõ mã ở khối "Có mã phòng?" trên màn Setup) → `useRoomSync` đọc `?room=` từ URL → `joinRoom(code)` → `isHost = (hostDeviceId === deviceId cục bộ)` → luôn `false` cho người vào sau.
3. `useRoomSync` (`src/hooks/useRoomSync.ts`) subscribe `onSnapshot` theo `roomCode` hiện tại trong store — mọi thay đổi trên Firestore tự đẩy vào `applyRemoteState()`, không cần refresh.
4. Mọi action đổi điểm/trạng thái (`addRound`, `updateLastRound`, `deleteLastRound`, `startGame`, `setGameEnded`, `resetGame`) đều no-op nếu `roomCode` đang set và `isHost === false` — chặn ở tầng store, không chỉ ẩn UI. Nhờ `winningScore`/`gameEnded` cũng nằm trong state đồng bộ, viewer tự tính đúng "ai đang thắng" (banner `winner-notice` hiện ngay cả khi chỉ còn màn `Ranking`) và tự chuyển sang `Summary` khi host kết thúc trận — không cần logic riêng cho viewer.
5. Rời phòng: host gọi `resetGame()` (nút "Tạo phòng mới"), viewer gọi `leaveRoom()` (nút "Rời phòng", luôn hiện phía trên header khi đang xem phòng người khác). Cả hai đều xóa `?room=` khỏi URL (`clearRoomCodeFromUrl`, gọi tự động trong `useRoomSync` khi `roomCode` về `null`) — tránh bug cũ: URL giữ mã phòng cũ, F5 xong bị tự động join lại phòng đã rời.
6. Ghi lên Firestore (`writeRoomStateSafely` trong `gameStore.ts`) không `await`/chặn UI (fire-and-forget), nhưng có bắt lỗi: ghi thất bại thì log `console.error('[roomSync] writeRoomState failed', ...)` và set `syncStatus = 'error'` — hiển thị thành banner đỏ trong `room-bar` (ScoreInput cho host, thanh trạng thái đầu trang cho viewer).

### Firestore rules

Không còn ở test mode. Rules thật nằm ở `firestore.rules` (root), config deploy ở `firebase.json` (`firestore.database: "scorekeeper-db"`) + `.firebaserc` (project mặc định `scorekeeper-2026`). Deploy bằng:

```bash
firebase deploy --only firestore:rules --dry-run   # validate trước, không đẩy thật
firebase deploy --only firestore:rules             # đẩy thật lên production
```

Rules hiện tại (`match /rooms/{roomCode}`):

- `allow read: if true` — ai có room code cũng đọc được (đúng thiết kế: xem điểm không cần đăng nhập).
- `allow create/update` — validate đúng shape document (đủ field, đúng kiểu, giới hạn `players` ≤ 32 và `rounds` ≤ 3000 để chặn ghi rác/phình document vô hạn), và `update` không cho đổi `hostDeviceId`/`createdAt` của document đã tồn tại.
- `allow delete: if false` — không document nào bị xóa qua client (app cũng không có code gọi `deleteDoc`).
- Path khác ngoài `rooms/{roomCode}` bị chặn hoàn toàn (`match /{document=**} { allow read, write: if false }`).

**Giới hạn bảo mật vẫn còn (đọc trước khi public app):** rules trên chỉ chặn *sai định dạng*, không chặn *giả mạo host*. `isHost` so khớp `deviceId` (UUID lưu localStorage) với field `hostDeviceId` — ai có room code và tự gọi Firestore SDK/REST API trực tiếp (với đúng `apiKey`/`projectId`, vốn luôn lộ trong bundle client) vẫn ghi đúng-định-dạng được vào document đó, vì rules không có cách xác thực "ai đang gọi" khi chưa có Firebase Auth (`request.auth` luôn null). Chấp nhận đánh đổi này có chủ đích (ưu tiên chạy được trước) — muốn chặn thật phải thêm Firebase Anonymous Auth + sửa rules kiểm tra `request.auth.uid == resource.data.hostUid`, ngoài phạm vi hiện tại.

### Debug nhanh

- Lỗi `NOT_FOUND` khi connect → sai `VITE_FIREBASE_PROJECT_ID` hoặc sai `VITE_FIREBASE_DATABASE_ID` (database không tên `(default)`).
- Lỗi `PERMISSION_DENIED: billing` → project chưa gắn billing (Blaze plan).
- Cập nhật giữa các tab chậm hoặc **đứng hẳn sau ván đầu tiên** → do mạng (VPN/proxy) chặn kiểu kết nối gRPC/WebChannel mặc định, khiến chế độ tự dò (`experimentalAutoDetectLongPolling`) bị treo sau lần fallback đầu. Đã đổi sang ép long-polling luôn (`experimentalForceLongPolling: true` trong `src/lib/firebase.ts`) — bỏ qua bước dò, ổn định hơn trên mạng hạn chế.
- Ghi Firestore thất bại (viewer không thấy cập nhật dù local host vẫn đúng) → mở DevTools Console ở tab host, tìm dòng `[roomSync] writeRoomState failed` (xem `gameStore.ts` → `writeRoomStateSafely`) để biết lỗi thật thay vì đoán.
- Reset xong vẫn bị tự động join lại phòng cũ → kiểm tra `roomUrl.ts`/`useRoomSync.ts` có gọi `clearRoomCodeFromUrl()` khi `roomCode` về `null` không (đã fix, xem mục Luồng bước 5).

---

Mọi thay đổi nên pass `npm run lint` và `npm run build` trước khi commit.
