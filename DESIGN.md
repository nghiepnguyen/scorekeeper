# Design System: Neon-Glass Professional

Hệ thống thiết kế ScoreKeeper — glassmorphism tối, accent neon, tối ưu mobile và PC nhỏ.

## Triết lý

- **Glassmorphism:** Panel mờ `backdrop-filter: blur(20px)`, viền sáng mờ.
- **Neon accents:** Tím `#7c6dff`, emerald thành công, vàng champion.
- **Grain overlay:** Noise SVG trên `body::before` — giảm độ gắt OLED.
- **Compact rhythm:** Spacing scale qua CSS variables, thu gọn theo breakpoint.

## Màu & biến CSS

Định nghĩa trong `:root` (`src/index.css`):

| Token | Mục đích |
|-------|----------|
| `--theme_bg` | Nền deep `#03030b` |
| `--theme_surface` | Panel glass |
| `--theme_cta-primary` | Accent chính |
| `--space-shell-*`, `--space-panel` | Padding shell/panel (responsive) |
| `--radius-card`, `--radius-button` | Bo góc |

## Typography

- **Display:** Outfit — tiêu đề, điểm số lớn.
- **Body:** Inter — form, mô tả, nút.

Kích thước dùng `--type-display` … `--type-caption`, giảm dần ở `max-width: 1024px` và `640px`.

## Thành phần UI

### Panel & Button

- Panel: glass + shadow inset nhẹ.
- Primary: nền trắng, chữ tối.
- Ghost / success / danger: viền và nền trong suốt theo ngữ cảnh.

### Ranking

- `rank-row` — hàng gọn; `top-one` / `leader` highlight.
- `score-updated` — pulse khi điểm vừa đổi (live ranking).

### Victory overlay

Khi đạt mốc chiến thắng (`VictoryPopup`):

| Lớp | z-index | Vai trò |
|-----|---------|---------|
| `victory-backdrop` | 0 | Mờ + blur, click để đóng |
| `fireworks-layer` | 1 | Pháo hoa CSS (`Fireworks.tsx`) |
| `confetti-layer` | 2 | Confetti rơi |
| `victory-card` | 3 | Nội dung chúc mừng + CTA |

Animation: `fireworkRocket` → `fireworkFlash` → `fireworkParticle`; card `victoryCardIn`.

### Layout chơi game

- Desktop rộng: `content-grid` 2 cột (nhập điểm | xếp hạng).
- ≤1024px: 1 cột xếp chồng.
- Mobile: `score-player-grid` 2 cột; `score-actions` lưới 2×2 nút.

## Micro-interactions

- `page-transition` — vào setup / summary.
- Hover rank row (chỉ thiết bị có `hover: hover`).
- Confetti ngắn trên Summary sau khi đóng popup.

## Accessibility

- Popup: `role="dialog"`, `aria-modal`, `aria-labelledby`.
- `prefers-reduced-motion: reduce` — tắt pháo hoa, confetti, pulse.
- Input `font-size: 16px` trên mobile (tránh zoom iOS).
- Touch target nút ≥ 44px trên mobile.

---

Mọi thay đổi UI nên dùng biến trong `index.css`, tránh hard-code spacing/type lẻ tẻ.
