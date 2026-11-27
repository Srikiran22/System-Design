# NEET



NEET is an early-stage learning project focused on systems thinking, system design, and practical engineering. This repository contains course material, exercises, projects, and a source-backed knowledge pack.

## Tech Stack

- **Framework**: TanStack Start, TanStack Router, TanStack Query v5, React 19, TypeScript 5.8
- **Styling & UI**: Tailwind CSS v4, Radix UI, Lucide icons
- **Data & Auth**: Supabase PostgreSQL + Auth (production canonical store) · `node:sqlite` + server-side `scrypt`/HMAC-SHA256 cookies (local dev/test only)
- **Testing & Quality**: Vitest, ESLint, Prettier, `scripts/validate-pack.ts`

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Key Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production client and server bundles |
| `npm test` | Run Vitest unit & security test suites |
| `npm run lint` | Run ESLint across the codebase |
| `npm run validate:pack` | Verify canonical `content/pack/` URLs, citation integrity, audit breakdown, and mirror parity |
| `npm run generate:sources` | Regenerate `src/lib/neet/sourceEnrichment.ts` from canonical `content/pack/` |
| `npm run seed:sqlite` | Rebuild local `data/neet.db` from `content/pack/` |

## Architecture & Governance Docs

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — Runtime stack, security boundaries, and module map
- [`docs/DATABASE_AND_DATA_FLOW.md`](./docs/DATABASE_AND_DATA_FLOW.md) — Canonical persistence, durable outbox sync, and Lovable Cloud schema specification
- [`docs/COMPETENCY_AND_ASSESSMENT.md`](./docs/COMPETENCY_AND_ASSESSMENT.md) — 16-competency DAG, Proceed Scale v2, rubrics, scenarios, and Capstone
- [`docs/CONTENT_GOVERNANCE.md`](./docs/CONTENT_GOVERNANCE.md) — Canonical pack provenance, explicit vs. related citations, and update workflow
