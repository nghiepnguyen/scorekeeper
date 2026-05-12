# 🃏 ScoreKeeper — Premium Game Score Tracker

## 🌟 Tổng quan
ScoreKeeper là ứng dụng web hiện đại giúp theo dõi điểm số cho các trò chơi nhiều người (đánh bài, board games, mạt chược...) với phong cách **Neon-Glass Professional**. Ứng dụng tập trung vào tốc độ, tính toán chính xác và trải nghiệm người dùng cao cấp ngay trên trình duyệt di động.

- **URL Vận hành:** [https://gs.thanhnghiep.top/](https://gs.thanhnghiep.top/)
- **Trạng thái:** Production Ready (v1.0)

## ✨ Tính năng chính
- **Thiết lập nhanh**: Tạo phòng chơi từ 2-8 người với điểm khởi tạo tùy chỉnh.
- **Tính điểm Real-time**: Nhập điểm sau mỗi ván, bảng xếp hạng tự động cập nhật ngay lập tức.
- **Quản lý ván đấu**: Cho phép sửa hoặc xóa ván vừa nhập để tránh sai sót.
- **Thống kê chuyên sâu**: Tổng kết thắng/thua, điểm cao nhất/thấp nhất của từng người chơi.
- **Chia sẻ kết quả**: Sao chép bảng tổng kết đẹp mắt để gửi qua Zalo/Messenger/Telegram.
- **Giao diện Premium**: Hiệu ứng Glassmorphism, chuyển cảnh mượt mà và tối ưu hóa cho di động.

## 🛠️ Công nghệ sử dụng
- **Frontend**: React 19 + TypeScript.
- **Build Tool**: Vite 8 (Hot Module Replacement siêu tốc).
- **Styling**: Vanilla CSS (Custom Design System với hiệu ứng Neon & Grain Texture).
- **State Management**: Zustand 5 (Quản lý trạng thái game & Persistence).
- **Analytics**: Vercel Analytics.
- **Deployment**: Tối ưu hóa cho Vercel & Custom Domain.

## 📂 Cấu trúc dự án
```text
scorekeeper/
├── src/
│   ├── store/            # Quản lý trạng thái game (Zustand)
│   ├── App.tsx           # Logic chính & UI toàn bộ ứng dụng
│   ├── index.css         # Hệ thống thiết kế (Design System)
│   └── main.tsx          # Điểm khởi đầu ứng dụng
├── public/               # Tài nguyên tĩnh (Sitemap, Robots, Icons)
├── index.html            # Cấu hình SEO & Metadata
└── vite.config.ts        # Cấu hình build & tối ưu hóa bundle
```

## 🚀 Triển khai (Deployment)
Ứng dụng hiện đang được vận hành tại: **`https://gs.thanhnghiep.top/`**

- **Hạ tầng**: Vercel Edge Network.
- **SEO**: Đã tối ưu hóa Metadata, OpenGraph và JSON-LD (SoftwareApplication) cho hiển thị tốt trên Google/Social Media.
- **PWA Ready**: Có thể thêm vào màn hình chính điện thoại để dùng như một ứng dụng native.

---
*Để biết thêm chi tiết về cách chạy local, xem [DEVELOPMENT.md](file:///Users/nghiepnguyen/My%20Files/Score%20game/DEVELOPMENT.md). Để hiểu về triết lý thiết kế, xem [DESIGN.md](file:///Users/nghiepnguyen/My%20Files/Score%20game/DESIGN.md).*
