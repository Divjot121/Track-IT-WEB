# ⚡ TrackIT Web — CBSE Class 10 Board Exam Preparation Hub

> **A modern, desktop-first, Linear-grade preparation workspace built for CBSE Class 10 board exams (single annual board exam 2026–27).**

TrackIT Web combines an offline-first architecture (IndexedDB via Dexie.js) with additive Supabase cross-device sync, a Pomodoro/Stopwatch focus workbench with physical clock manual entry, spaced repetition tracking, timetable scheduling, mock paper benchmarking, and full PWA mobile responsiveness.

---

## 🌟 Key Highlights

- **Linear/Notion-Grade Aesthetic**: Curated dark & light modes, glassmorphism, fluid Framer Motion transitions, and micro-interactions.
- **Offline-First & Cross-Device Sync**:
  - Full local-first persistence with zero latency via Dexie.js (IndexedDB).
  - Additive Supabase cloud synchronization with optimistic UI, offline mutation queue, and Last-Write-Wins conflict resolution.
- **CBSE Class 10 Board Syllabus Tracker**:
  - Full unit-by-unit syllabus with marks weightage for Mathematics (Standard/Basic), Science, Social Science, English Language & Literature, and Hindi Course A.
  - Interactive preparation statuses: *Not Started*, *In Progress*, *Revision Due*, and *Mastered*.
  - Subject readiness percentage mathematically weighted by CBSE board examination marks weightage.
- **Study Timer & Manual Session Logger**:
  - Dual-mode Focus Timer: **Pomodoro** intervals or continuous **Stopwatch**.
  - **Manual Session Logger**: Log past sessions counted on a normal desk clock, wristwatch, or wall clock with duration presets, mode, backdating, and study notes.
  - Streak tracking, study velocity charts, and daily history logs.
- **Spaced Repetition Engine**:
  - Leitner/SM-2-inspired spaced revision schedules (Days: +1, +3, +7, +14, +30).
  - Revision alert badges and quick review workflows.
- **Weekly Timetable & Smart Auto-Scheduler**:
  - Drag-and-drop study slot allocation on desktop + single-day mobile tab switcher with 1-tap subject assignment.
  - Smart presets prioritizing high-weightage subjects.
- **Mock Test Benchmark & Analytics**:
  - Track score percentages, CBSE question patterns, and study heatmaps.
- **PWA & Mobile-Optimized**:
  - Installable standalone Progressive Web App with custom service worker caching.
  - Native-feeling mobile navigation (bottom tab bar, slide-up drawer, single-column chapter drill-down with back action).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom Glassmorphic Design System
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database / Local Persistence**: [Dexie.js](https://dexie.org/) (IndexedDB)
- **Cloud Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security, Magic-Link Auth)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) + [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Divjot121/Track-IT-WEB.git
cd Track-IT-WEB

# Install dependencies
npm install

# Setup environment variables (optional for cloud sync)
cp .env.example .env.local

# Run local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 Database Setup (Supabase Sync)

If using cross-device sync, run the initial migration script in your Supabase SQL Editor:
- [`supabase/migrations/20260905000000_init_sync.sql`](supabase/migrations/20260905000000_init_sync.sql)

---

## 📜 License

MIT License. Designed and developed for CBSE Class 10 students.
