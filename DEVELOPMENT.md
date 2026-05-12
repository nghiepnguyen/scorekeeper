# 🛠️ Hướng dẫn Phát triển & Cài đặt

Tài liệu này hướng dẫn cách thiết lập môi trường phát triển cục bộ và quy trình build cho ScoreKeeper.

## 💻 Yêu cầu hệ thống
- **Node.js**: >= 20 LTS (Khuyên dùng v23+)
- **npm**: >= 10
- **Trình duyệt**: Các trình duyệt hiện đại hỗ trợ CSS Nesting và Glassmorphism.

## 🏗️ Cài đặt cục bộ

1. **Clone dự án:**
   ```bash
   git clone https://github.com/your-username/scorekeeper.git
   cd scorekeeper
   ```

2. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

3. **Chạy server phát triển:**
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại: `http://localhost:5173`

## 📦 Quy trình Build & Production

1. **Kiểm tra lỗi & Kiểu dữ liệu:**
   ```bash
   npm run lint
   npx tsc --noEmit
   ```

2. **Build bản chính thức:**
   ```bash
   npm run build
   ```
   Kết quả build sẽ nằm trong thư mục `dist/`.

3. **Xem trước bản build:**
   ```bash
   npm run preview
   ```

## 🔌 Tích hợp Firebase (Tùy chọn)
Mặc dù hiện tại dự án sử dụng `localStorage` để lưu trữ dữ liệu (Zustand Persistence), cấu trúc đã sẵn sàng để tích hợp Firebase Firestore cho tính năng đồng bộ hóa giữa các thiết bị.

- **Cấu hình**: Xem `SETUP_FIREBASE_PLAN.md` (nếu cần triển khai backend).
- **Hosting**: Có thể deploy lên Firebase Hosting bằng lệnh `firebase deploy`.

## 🛠️ Scripts quan trọng
| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Khởi động môi trường dev với HMR |
| `npm run build` | Tối ưu hóa bundle và build cho production |
| `npm run lint` | Kiểm tra tiêu chuẩn code với ESLint |
| `graphify update .` | Cập nhật bản đồ tri thức cho dự án |

---
*Lưu ý: Mọi thay đổi về code nên được chạy qua bộ kiểm tra lint trước khi commit.*
