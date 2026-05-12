# Graph Report - Score game  (2026-05-12)

## Corpus Check
- 8 files · ~5,353 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 130 nodes · 123 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7ccd5373`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Game Logic & State|Game Logic & State]]
- [[_COMMUNITY_App UI Components|App UI Components]]
- [[_COMMUNITY_Setup & Design Specs|Setup & Design Specs]]
- [[_COMMUNITY_Project Vision & Roadmap|Project Vision & Roadmap]]
- [[_COMMUNITY_Linting Config|Linting Config]]
- [[_COMMUNITY_Build Config|Build Config]]
- [[_COMMUNITY_Visual Assets|Visual Assets]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 13|Community 13]]

## God Nodes (most connected - your core abstractions)
1. `Design System Inspired by Airtable` - 10 edges
2. `🚀 Setup Guide` - 8 edges
3. `🃏 ScoreKeeper — Premium Game Score Tracker` - 6 edges
4. `Design System: Neon-Glass Professional` - 6 edges
5. `🛠️ Hướng dẫn Phát triển & Cài đặt` - 6 edges
6. `🃏 ScoreKeeper — Tool Tính Điểm Trò Chơi` - 6 edges
7. `🛠️ Tech Stack` - 6 edges
8. `2. Color Palette & Roles` - 5 edges
9. `4. Các thành phần chính (Core Components)` - 4 edges
10. `🏗️ Cài đặt cục bộ` - 4 edges

## Surprising Connections (you probably didn't know these)
- `MVP Features` --implements--> `Application Goals`  [INFERRED]
  FEATURES.md → README.md
- `Airtable Design System` --conceptually_related_to--> `Technology Stack`  [INFERRED]
  DESIGN.md → TECH_STACK.md
- `Setup Guide` --references--> `Technology Stack`  [EXTRACTED]
  SETUP.md → TECH_STACK.md
- `Firebase Configuration` --references--> `Technology Stack`  [EXTRACTED]
  SETUP.md → TECH_STACK.md
- `App()` --calls--> `useGameStore`  [EXTRACTED]
  src/App.tsx → src/store/gameStore.ts

## Communities (14 total, 2 thin omitted)

### Community 0 - "Game Logic & State"
Cohesion: 0.12
Nodes (17): 1. Visual Theme & Atmosphere, 2. Color Palette & Roles, 3. Typography Rules, 5. Layout, 6. Depth, 7. Do's and Don'ts, 8. Responsive Behavior, 9. Agent Prompt Guide (+9 more)

### Community 1 - "App UI Components"
Cohesion: 0.14
Nodes (10): App(), copy, Language, PlayerStats, PREVIEW_EMOJIS, GameState, Player, PLAYER_EMOJIS (+2 more)

### Community 2 - "Setup & Design Specs"
Cohesion: 0.12
Nodes (15): 1. Clone & cài dependencies, 2. Cấu hình Firebase, 3. Chạy local, 5. Firestore Security Rules (trước khi production), Bật Firestore, Cấu hình biến môi trường, code:bash (git clone https://github.com/your-username/scorekeeper.git), code:bash (cp .env.example .env) (+7 more)

### Community 3 - "Project Vision & Roadmap"
Cohesion: 0.13
Nodes (14): 1. Triết lý Thiết kế, 2. Bảng màu (Color Palette), 3. Hệ thống Typography, 4. Các thành phần chính (Core Components), 4. Component Stylings, 5. Hiệu ứng Micro-interactions, Buttons, Cards: `1px solid #e0e2e6`, 16px–24px radius (+6 more)

### Community 4 - "Linting Config"
Cohesion: 0.18
Nodes (12): 🛠️ Công nghệ sử dụng, 📂 Cấu trúc dự án, Cấu trúc thư mục, code:text (scorekeeper/), Đối tượng sử dụng, Luồng sử dụng cơ bản, Mục tiêu, 🃏 ScoreKeeper — Premium Game Score Tracker (+4 more)

### Community 5 - "Build Config"
Cohesion: 0.15
Nodes (12): 🏗️ Cài đặt cục bộ, code:bash (git clone https://github.com/your-username/scorekeeper.git), code:bash (npm install), code:bash (npm run dev), code:bash (npm run lint), code:bash (npm run build), code:bash (npm run preview), 🛠️ Hướng dẫn Phát triển & Cài đặt (+4 more)

### Community 6 - "Visual Assets"
Cohesion: 0.15
Nodes (12): Backend / Database, Cài đặt nhanh, code:bash (npm create vite@latest scorekeeper -- --template react-ts), Firebase Firestore, Frontend, React 19 + TypeScript, State Management, Tailwind CSS 4 (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.2
Nodes (9): Bảng xếp hạng, Chia sẻ kết quả, ✅ Features, Màn hình kết quả, Nhập điểm từng ván, Phase 1 — MVP (chơi được ngay), Phase 2 — Kết thúc & báo cáo, Phase 3 — Nice to have (v2) (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.25
Nodes (8): 4. Deploy lên Firebase Hosting, Build & Deploy, Cài Firebase CLI, code:bash (npm install -g firebase-tools), code:bash (firebase init hosting), code:bash (npm run build), code:block8 (https://scorekeeper-app.web.app), Khởi tạo Firebase Hosting trong project

### Community 9 - "Community 9"
Cohesion: 0.5
Nodes (4): Airtable Design System, Firebase Configuration, Setup Guide, Technology Stack

## Knowledge Gaps
- **77 isolated node(s):** `PlayerStats`, `Language`, `PREVIEW_EMOJIS`, `copy`, `Player` (+72 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Design System Inspired by Airtable` connect `Game Logic & State` to `Project Vision & Roadmap`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `🚀 Setup Guide` connect `Setup & Design Specs` to `Community 8`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `PlayerStats`, `Language`, `PREVIEW_EMOJIS` to the rest of the system?**
  _77 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game Logic & State` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `App UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `Setup & Design Specs` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Project Vision & Roadmap` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._