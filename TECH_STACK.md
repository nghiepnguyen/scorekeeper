# 🛠️ Tech Stack

## Frontend

### React 19 + TypeScript
- **Lý do chọn:** Ecosystem lớn, dễ vibe code, TypeScript giúp tránh bug khi tính toán điểm số
- **Phiên bản:** `react@^19.1.0`, `react-dom@^19.1.0`

### Vite 6
- **Lý do chọn:** Build nhanh, HMR tức thì, config tối giản — lý tưởng cho project nhỏ
- **Phiên bản:** `vite@^6.3.2`

### Tailwind CSS 4
- **Lý do chọn:** Viết UI nhanh không cần đặt tên class, responsive mobile-first sẵn
- **Phiên bản:** `tailwindcss@^4.0.0`

---

## State Management

### Zustand
- **Lý do chọn:** Nhẹ hơn Redux rất nhiều, không cần boilerplate, phù hợp app nhỏ
- **Phiên bản:** `zustand@^5.0.0`

---

## Backend / Database

### Firebase Firestore
- **Lý do chọn:** Realtime sync không cần viết backend, free tier đủ dùng cho app nhỏ, dễ setup
- **Phiên bản:** `firebase@^11.6.1`
- **Tính năng dùng:**
  - Firestore — lưu phòng chơi, danh sách ván, điểm số
  - Firebase Hosting — deploy static site

---

## Tooling

| Tool | Phiên bản | Mục đích |
|------|-----------|----------|
| Node.js | >= 20 LTS | Runtime |
| npm | >= 10 | Package manager |
| ESLint | ^9 | Linting |
| firebase-tools | latest | Deploy CLI |

---

## Cài đặt nhanh

```bash
npm create vite@latest scorekeeper -- --template react-ts
cd scorekeeper
npm install firebase zustand
npm install -D tailwindcss @tailwindcss/vite
```
