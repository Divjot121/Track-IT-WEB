<div align="center">

# 📘 TrackIT Web

### The modern, minimalist study companion for CBSE Class 10 board exam preparation.

*The desktop-friendly web sibling of the TrackIT Android app — engineered with deeper feature depth, local-first offline resilience, seamless Supabase cross-device sync, and butter-smooth motion.*

<br/>

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_%2B_RLS-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](#-progressive-web-app)
[![License: Personal](https://img.shields.io/badge/License-Personal-gray?style=for-the-badge)](#-license)

<br/>

[Key Features](#-features) • [Tech Stack](#-tech-stack) • [Quickstart](#-getting-started) • [PWA](#-progressive-web-app) • [Architecture](#-project-structure) • [Syllabus](#️-syllabus-coverage)

</div>

---

## ✨ Features

### 📚 Intelligent Syllabus & Chapter Workbench
- **Official CBSE Class 10 (2026–27) Syllabus**: Unit-weighted syllabus seeded for Mathematics (Standard/Basic), Science, Social Science, and English Language & Literature.
- **4-Stage Preparation Lifecycle**: Fluidly toggle chapters between `Not Started` → `In Progress` → `Revision Due` → `Mastered` with celebratory micro-animations.
- **Split-View Desktop Workbench**: Master-detail view with search filter pills, markdown study notes editor, and 1-click focus launcher.

### ⏱️ Dual-Mode Timer & Normal Clock Logger
- **Pomodoro & Stopwatch Modes**: 25/45/60-min interval timers or continuous counting with audio chimes and fullscreen Zen Mode.
- **Manual Clock Study Logger**: Easily log study sessions counted on a physical desk clock, wristwatch, or wall clock with duration presets, backdating, and study notes.
- **Session Auto-Binding**: Every timer block automatically links to its specific subject and chapter.

### 🗓️ Weekly Timetable & Smart Auto-Scheduler
- **Desktop Weekly Grid**: HTML5 drag-and-drop subject allocation across Monday through Sunday.
- **Mobile Day Switcher**: Tap-to-assign subject palette with single-day tab selector.
- **Smart Balanced Preset**: One-click schedule generator prioritizing high-weightage Science and Maths blocks.

### 🔄 Spaced Repetition Engine
- **Automated Retention Loops**: Chapters marked `Mastered` resurface on an automated Leitner schedule (`+3d` → `+7d` → `+14d` → `+30d`).
- **Revision Due Indicators**: Pulse alerts on the mobile drawer and top bar when reviews are due today.

### 📊 Deep Analytics & Study Velocity
- **GitHub-Style Heatmap**: 24-week contribution grid graphing study consistency and active day streaks.
- **Recharts Visualizations**: Interactive subject distribution donut charts and 7-day study velocity bar graphs.
- **Weighted Readiness Metric**: Mathematically weighted preparedness percentage:
  $$\text{Subject Readiness} = \frac{\sum (\text{Status Weight} \times \text{Unit Marks})}{\text{Total Marks}}$$
- **Mock Test Trajectory**: Log sample papers and pre-board scores with target benchmark trajectory lines.

### ☁️ Local-First Offline Storage + Supabase Cloud Sync
- **Zero-Latency IndexedDB**: Instant local reads and writes via Dexie.js — works 100% offline without requiring login.
- **Additive Cloud Synchronization**: Passwordless magic-link sign-in via Supabase with optimistic background queueing.
- **Network Resilience**: Reconnection banner, auto-dismissing toasts, offline mutation queue with Last-Write-Wins conflict resolution.

### 📱 Responsive Mobile & PWA
- **Adaptive Layouts**: Not a scaled-down desktop app — features an iOS/Android-style bottom navigation bar, slide-up action drawer, and single-column drill-down stack.
- **Touch-First ($\ge 44\times 44\text{px}$)**: Built strictly with accessible touch targets and safe-area inset protection (`env(safe-area-inset-bottom)`).
- **Standalone PWA**: Installable app shell with custom Service Worker caching and home screen launcher banner.

### 🎛️ Keyboard Shortcuts & Power Tools
- **Global Command Palette**: Press `⌘ + K` or `Ctrl + K` (or tap search on mobile) to jump to any chapter or action.
- **Quick Hotkeys**: `D` (Dashboard), `S` (Syllabus), `T` (Timer), `P` (Planner), `R` (Revision), `A` (Analytics), `M` (Mock Tests), `1–4` (Chapter Status).
- **Export / Import & Print**: Full JSON backup/restore and printable CBSE board preparation progress report.
- **Curated Theme Engine**: Seamless dark and light themes with OS-level `prefers-reduced-motion` compliance.

---

## 🧱 Tech Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) | React Server & Client Components, modern routing |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict type safety across database schemas & state |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Custom design system with HSL tokens & dark mode |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) | Spring physics, layout animations, modal transitions |
| **State** | [Zustand](https://github.com/pmndrs/zustand) | Ultra-lightweight reactive global stores |
| **Charts** | [Recharts](https://recharts.org/) | Dynamic SVG line, bar, and donut charts |
| **Local DB** | [Dexie.js](https://dexie.org/) | IndexedDB wrapper for offline-first persistence |
| **Backend & Auth** | [Supabase](https://supabase.com/) | PostgreSQL, Magic Link Auth, Row Level Security (RLS) |
| **Icons** | [Lucide React](https://lucide.dev/) | Consistent iconography across views and controls |

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/Divjot121/Track-IT-WEB.git

# Enter project directory
cd Track-IT-WEB

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

*(Note: TrackIT Web works completely offline without Supabase credentials using local IndexedDB. Add your credentials when you wish to enable cross-device cloud sync).*

### 3. Supabase Database Setup

To enable cross-device sync, execute the migration SQL in your Supabase SQL Editor:
- [`supabase/migrations/20260905000000_init_sync.sql`](supabase/migrations/20260905000000_init_sync.sql)

This provisions the tables (`profiles`, `chapter_progress`, `study_sessions`, `planner_blocks`, `mock_scores`, `chapter_notes`) and applies Row Level Security (RLS) policies (`auth.uid() = user_id`).

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Progressive Web App

TrackIT Web is engineered as an installable PWA:

1. **Desktop Chrome / Edge**: Click the install icon in the URL omnibox or use the floating in-app prompt.
2. **iOS Safari**: Tap **Share** $\rightarrow$ **Add to Home Screen**.
3. **Android Chrome**: Tap **Install TrackIT** from the dismissible banner or menu.

The Service Worker (`/sw.js`) pre-caches the application shell and static assets for instant offline launches while bypassing API/WebSocket calls.

---

## 📂 Project Structure

```
Track-IT-WEB/
├── app/
│   ├── globals.css           # Design tokens, status colors, glassmorphism & reduced-motion
│   ├── layout.tsx            # Viewport, PWA metadata & ThemeProvider
│   └── page.tsx              # Root entry point
├── components/
│   ├── analytics/            # Recharts velocity charts & subject distribution
│   ├── auth/                 # Passwordless magic-link modal with shake animations
│   ├── command-palette/      # ⌘K search across all chapters, tools, and actions
│   ├── dashboard/            # Bento grid, readiness cards & recent sessions
│   ├── export/               # Full JSON data backup & restore
│   ├── layout/               # TopBar, Sidebar, MobileBottomBar, MobileDrawer
│   ├── mock-tests/           # Sample paper log & score trajectory chart
│   ├── onboarding/           # 3-step setup wizard with target score slider
│   ├── planner/              # Weekly timetable grid & mobile day tabs
│   ├── pwa/                  # Service worker registration & install banner
│   ├── report/               # Printable official CBSE study summary
│   ├── revision/             # Spaced repetition retention scheduler
│   ├── streak/               # GitHub-style 24-week contribution heatmap
│   ├── sync/                 # Live sync indicator & offline reconnect banners
│   ├── timer/                # Focus dial, manual clock study session modal
│   └── tracker/              # Syllabus tree, split-view workbench & status buttons
├── data/
│   └── subjects.ts           # CBSE Class 10 syllabus seed data & marks weightage
├── lib/
│   ├── db/                   # Dexie.js IndexedDB schema & repository layer
│   ├── stores/               # Zustand app, timer, and sync stores
│   ├── supabase/             # Persistent Supabase client
│   ├── sync/                 # Background offline sync engine & queue
│   ├── types.ts              # Core TypeScript interfaces
│   └── utils.ts              # Mathematical readiness formulas & countdown logic
├── public/
│   ├── icons/                # High-res PWA icons (192, 512, maskable, SVG)
│   ├── manifest.json         # Web App Manifest
│   └── sw.js                 # App shell service worker
└── supabase/
    └── migrations/           # SQL migration with RLS policies
```

---

## 🗂️ Syllabus Coverage

Seeded directly according to the official CBSE 2026–27 curriculum (single annual examination pattern):

| Subject | Code | Weightage | Units / Coverage | Status |
|:---|:---:|:---:|:---|:---:|
| **Mathematics (Standard/Basic)** | `041` | 80 Marks | Real Numbers, Algebra, Coordinate Geometry, Triangles, Circles, Trigonometry, Mensuration, Statistics, Probability | ✅ Complete |
| **Science** | `086` | 80 Marks | Chemical Substances, World of Living, Natural Phenomena, Effects of Current, Natural Resources | ✅ Complete |
| **Social Science** | `087` | 80 Marks | India & Contemporary World II (History), Contemporary India II (Geography), Democratic Politics II (Civics), Understanding Economic Development (Economics) | ✅ Complete |
| **English Language & Literature** | `184` | 80 Marks | First Flight (Prose & Poetry), Footprints Without Feet (Supplementary Reader) | ✅ Complete |
| **Hindi (Course A / B)** | `002` | 80 Marks | Section A (Reading & Grammar), Section B (Literature & Writing) | 🚧 Marked Stubs |
| **Computer Applications** | `165` | 50 Marks | Networking, HTML, Cyberethics | 🚧 Marked Stubs |

---

## 🛠️ Scripts

| Command | Description |
|:---|:---|
| `npm run dev` | Start development server on `http://localhost:3000` |
| `npm run build` | Compile optimized production bundle with type checking |
| `npm run start` | Run production build locally |
| `npm run lint` | Run ESLint validation |

---

## 📄 License

Personal project — all rights reserved. Built for CBSE Class 10 board students.
