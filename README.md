# UX Audit AI 🔍🤖

UX Audit AI is an AI-powered website auditing tool that helps founders and product teams understand **why users drop off** from their websites by analyzing **UX structure, accessibility, and performance**, and generating **actionable improvement suggestions**.

---

## ✨ Features

- Paste a website URL to run an automated audit
- UX signal extraction (CTAs, headings, navigation, forms)
- Accessibility & performance analysis (Lighthouse)
- AI-generated UX insights and recommendations
- Before vs After UX comparison (visual)
- Clean dashboard with UX score and issue breakdown
- Async background processing for long-running audits

---

## 🧠 High-Level Architecture

```

React Client (Vite)
↓
Node API (Express + Better Auth)
↓
Redis Queue (BullMQ)
↓
Worker (Playwright + Lighthouse + AI)
↓
PostgreSQL (Prisma)

```

---

## 🗂️ Monorepo Structure

```

ux-audit-ai/
├── apps/
│ ├── client/ # React frontend (Vite)
│ ├── api/ # Backend API (Node + Express)
│ └── worker/ # Background jobs (Playwright, Lighthouse, AI)
│
├── packages/
│ ├── db/ # Prisma schema & client (shared)
│ └── types/ # Shared TypeScript types
│
├── pnpm-workspace.yaml
├── package.json
└── README.md

```

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, Better Auth
- **Worker:** Playwright, Lighthouse, BullMQ
- **Database:** PostgreSQL, Prisma
- **Monorepo:** pnpm workspaces
- **Language:** TypeScript

---

## 📦 Prerequisites

Make sure you have the following installed:

- Node.js `>= 18`
- pnpm `>= 8`

Check versions:

```bash
node -v
pnpm -v
```

---

## ⚙️ Environment Variables

Create a `.env` file in the **root directory**:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/uxaudit
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_key
BETTER_AUTH_SECRET=your_secret
```

---

## 📥 Install Dependencies

From the **root of the project**:

```bash
pnpm install
```

This installs dependencies for **all apps and shared packages**.

---

## ▶️ Running the Project

### 🔹 Run Everything (Client + API + Worker)

```bash
pnpm dev
```

This starts:

- React client
- Backend API
- Background worker

---

### 🔹 Run Applications Individually

#### 🖥️ Frontend (React Client)

```bash
pnpm --filter client dev
```

Runs at:

```
http://localhost:5173
```

---

#### 🔌 Backend API

```bash
pnpm --filter api dev
```

Runs at:

```
http://localhost:4000
```

---

#### ⚙️ Background Worker

```bash
pnpm --filter worker dev
```

Runs background audit jobs (no HTTP server).

---

## 🔁 How Components Communicate

- **Client → API:** HTTP requests (`/api/*`)
- **API → Worker:** Redis queue (BullMQ)
- **Worker → DB:** Stores audit results using Prisma
- **Client → API:** Polls audit status and results

---

## 🧪 Useful pnpm Commands

```bash
# Run all applications
pnpm dev

# Run a specific app
pnpm --filter client dev
pnpm --filter api dev
pnpm --filter worker dev

# Add a dependency to a specific app
pnpm --filter api add express

# Add a shared dependency at the root
pnpm add -w prisma
```

---

## 🧠 Why This Architecture?

- Clear separation of concerns
- Scalable async processing
- Real-world SaaS-style backend
- Easy to explain in interviews
- Resume-friendly system design

---

## 🚧 Project Status

MVP in progress. Planned improvements:

- PDF export of audit reports
- Mobile UX analysis
- Competitor comparison
- Audit history & analytics

---
