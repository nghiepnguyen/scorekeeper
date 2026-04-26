# 🚀 Setup Guide

## Yêu cầu

- Node.js >= 20 LTS
- npm >= 10
- Tài khoản Google (để dùng Firebase)

---

## 1. Clone & cài dependencies

```bash
git clone https://github.com/your-username/scorekeeper.git
cd scorekeeper
npm install
```

---

## 2. Cấu hình Firebase

### Tạo project Firebase

1. Vào [console.firebase.google.com](https://console.firebase.google.com)
2. Tạo project mới → đặt tên (vd: `scorekeeper-app`)
3. Tắt Google Analytics (không cần thiết)
4. Vào **Project Settings** → tab **General** → kéo xuống **Your apps**
5. Bấm **Add app** → chọn **Web** (`</>`)
6. Đặt tên app → copy đoạn `firebaseConfig`

### Bật Firestore

1. Sidebar → **Firestore Database** → **Create database**
2. Chọn **Start in test mode** (để dev)
3. Chọn region gần nhất (vd: `asia-southeast1` — Singapore)

### Cấu hình biến môi trường

```bash
cp .env.example .env
```

Mở `.env` và điền vào:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ Không commit file `.env` lên git. File `.env.example` đã được exclude sẵn trong `.gitignore`.

---

## 3. Chạy local

```bash
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`

---

## 4. Deploy lên Firebase Hosting

### Cài Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### Khởi tạo Firebase Hosting trong project

```bash
firebase init hosting
```

Trả lời các câu hỏi:
- **Public directory:** `dist`
- **Single-page app:** `Yes`
- **GitHub auto-deploy:** tuỳ (có thể bỏ qua)

### Build & Deploy

```bash
npm run build
firebase deploy
```

Sau khi deploy xong, Firebase sẽ cho URL dạng:
```
https://scorekeeper-app.web.app
```

---

## 5. Firestore Security Rules (trước khi production)

Mặc định test mode cho phép tất cả read/write. Trước khi public, vào **Firestore → Rules** và cập nhật:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read, write: if true; // thêm auth sau nếu cần
    }
  }
}
```

---

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production |
| `npm run preview` | Preview bản build |
| `firebase deploy` | Deploy lên Firebase Hosting |
