# 🃏 ScoreKeeper — Tool Tính Điểm Trò Chơi

## Tổng quan

ScoreKeeper là ứng dụng web đơn giản giúp theo dõi điểm số trong các trò chơi có nhiều người và nhiều ván như đánh bài, mạt chược, cờ tỷ phú, hay bất kỳ trò nào cần cộng/trừ điểm theo từng lượt.

Không cần đăng nhập, không cần cài đặt — mở ra chơi ngay.

## Mục tiêu

- Thay thế việc ghi điểm bằng giấy bút hoặc Notes trên điện thoại
- Tính toán tự động, tránh nhầm lẫn khi cộng trừ tay
- Hiển thị xếp hạng realtime ngay sau mỗi ván
- Xuất kết quả nhanh để chia sẻ nhóm chat

## Đối tượng sử dụng

- Nhóm bạn bè chơi bài, mạt chược, board game cuối tuần
- Bất kỳ ai cần một bảng điểm đơn giản, nhanh gọn trên điện thoại

## Luồng sử dụng cơ bản

1. Tạo phòng → nhập tên người chơi + điểm xuất phát
2. Sau mỗi ván → nhập điểm +/- cho từng người
3. Xem bảng xếp hạng cập nhật realtime
4. Kết thúc → xem thống kê + copy kết quả chia sẻ

## Cấu trúc thư mục

```
scorekeeper/
├── src/
│   ├── components/       # UI components
│   ├── pages/            # Các màn hình chính
│   ├── store/            # State management (Zustand)
│   ├── firebase/         # Cấu hình & hooks Firebase
│   └── utils/            # Helper functions
├── public/
├── .env.example
├── firebase.json
└── vite.config.ts
```
