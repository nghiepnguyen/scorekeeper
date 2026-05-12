# Design System: Neon-Glass Professional

Hệ thống thiết kế của ScoreKeeper được xây dựng theo phong cách **Neon-Glass**, kết hợp giữa sự chuyên nghiệp tối giản và hiệu ứng chiều sâu hiện đại.

## 1. Triết lý Thiết kế
- **Glassmorphism**: Sử dụng các lớp phủ mờ (blur) để tạo cảm giác không gian và chiều sâu.
- **Neon Accents**: Sử dụng các dải màu Gradient neon (Blue, Emerald, Purple) để tạo điểm nhấn cho hành động.
- **High-Craft Polish**: Tích hợp lớp phủ **Grain Texture** (nhiễu hạt) giúp giao diện trông sang trọng và chân thực hơn.

## 2. Bảng màu (Color Palette)

### Nền & Chữ
- **Bg Deep**: `#04040a` (Xanh đen cực tối)
- **Text Primary**: `#ffffff` (Trắng tinh khiết)
- **Text Secondary**: `rgba(255, 255, 255, 0.7)` (Trắng mờ)
- **Border**: `rgba(255, 255, 255, 0.08)` (Viền kính mờ)

### Màu nhấn (Accents)
- **Primary Blue**: `#7c6dff` (Neon Blue/Purple)
- **Emerald**: `#10b981` (Xanh lục cho các hành động thành công)
- **Red/Danger**: `#ef4444` (Đỏ cho các hành động xóa/nguy hiểm)

## 3. Hệ thống Typography
Sử dụng bộ đôi font chữ cao cấp từ Google Fonts:

- **Display (Tiêu đề)**: `Outfit` — Font chữ hiện đại, hình học, tạo cảm giác công nghệ.
- **Body (Nội dung)**: `Inter` — Font chữ tinh chuẩn, cực kỳ dễ đọc trên mọi kích thước màn hình.

| Cấp độ | Font | Kích thước | Trọng lượng |
|--------|------|------------|-------------|
| Display | Outfit | 3.5rem | 700 |
| Section | Outfit | 2.5rem | 700 |
| Subhead | Outfit | 1.75rem | 600 |
| Card Title | Outfit | 1.25rem | 600 |
| Body | Inter | 1rem | 400 |

## 4. Các thành phần chính (Core Components)

### Panel (Bảng nội dung)
- **Background**: `rgba(255, 255, 255, 0.04)`
- **Backdrop-filter**: `blur(20px)`
- **Border-radius**: `24px`

### Buttons
- **Primary**: Nền trắng, chữ đen, bo góc 12px.
- **Ghost/Secondary**: Viền mờ, nền trong suốt, đổi màu khi hover.

### Rank Row (Dòng xếp hạng)
- Tự động highlight người dẫn đầu (Champion) với hiệu ứng gradient vàng/đồng.
- Hiệu ứng **Score Pulse** khi điểm số thay đổi.

## 5. Hiệu ứng Micro-interactions
- **Page Transitions**: Chuyển cảnh mượt mà giữa các stage.
- **Interactive Hover**: Các thẻ và nút bấm có hiệu ứng di chuyển nhẹ (lift-up) và thay đổi độ mờ.
- **Grain Overlay**: Một lớp SVG noise được phủ cố định để giảm độ gắt của màn hình OLED và tạo cảm giác "Premium Matte".

---
*Mọi thay đổi UI nên tuân thủ nghiêm ngặt hệ thống biến CSS trong `index.css` để đảm bảo tính nhất quán.*
