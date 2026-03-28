# Implementation Plan: Reprise MVP: Show Browser & Favorites

**Branch**: `001-show-browse-favorites` | **Date**: 2026-03-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-show-browse-favorites/spec.md`

## Summary

Build the first MVP slice of Reprise: a Phish show browser with search, detail
pages with setlists, and authenticated favorites. Data is seeded from the Phish.in
API v2 into PostgreSQL via Prisma. The app uses React Router v7 framework mode with
server-first loaders/actions, Tailwind CSS, and shadcn/ui components. Authentication
follows the ThreadMind username-only pattern with cookie sessions.

## Technical Context

**Language/Version**: TypeScript 5.9, strict mode enabled
**Primary Dependencies**: React Router 7.13 (framework mode), React 19, Prisma ORM, Axios, shadcn/ui, Radix UI, Tailwind CSS v4, Lucide icons
**Storage**: PostgreSQL via Prisma ORM
**Testing**: Vitest (to be added)
**Target Platform**: Node.js server (SSR via react-router-serve), web browsers 375px–1440px+
**Project Type**: Full-stack web application
**Performance Goals**: Page load <2s, navigation <3s, favorite toggle <1s perceived
**Constraints**: ~2,000 shows, 25 per page, case-insensitive substring search
**Scale/Scope**: MVP for solo developer, <100 users initially, 5 routes + 1 API route

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Strong TypeScript Safety | PASS | strict: true already configured; Prisma-generated types will be used |
| II | Server-First React Router | PASS | All data via loaders, search via query params + form submit, favorites via actions |
| III | Clean Prisma/PostgreSQL Data Modeling | PASS | Schema in data-model.md; id/createdAt/updatedAt on domain models; Track and User exempt per join-table/no-mutable-fields exceptions |
| IV | Responsive & Polished UI | PASS | Tailwind + shadcn/ui pre-installed; 375px–1440px+ required |
| V | Small Diffs | PASS | Phased delivery planned; each phase targets <400 LOC |
| VI | Clear Service Boundaries | PASS | Services in app/services/, Phish.in adapter isolated, DB access confined to services |
| VII | Testing Discipline | PASS | Vitest to be added; service unit tests + loader/action integration tests planned |
| VIII | Phased Delivery | PASS | 4 phases: data model → services → routes → UI (see quickstart.md structure) |
| IX | MVP Scope Guard | PASS | No AI/MCP features in scope |
| X | Configuration & Secrets Discipline | PASS | .env.example planned with DATABASE_URL and SESSION_SECRET |

**Post-Phase 1 re-check**: All gates still pass. No violations introduced during design.

## Project Structure

### Documentation (this feature)

```text
specs/001-show-browse-favorites/
├── plan.md              # This file
├── research.md          # Phase 0: API research, technology decisions
├── data-model.md        # Phase 1: Prisma schema design
├── quickstart.md        # Phase 1: Setup and verification guide
├── contracts/
│   └── routes.md        # Phase 1: Route loader/action contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
app/
├── components/
│   └── ui/              # shadcn/ui (pre-installed: button, card, input, badge, separator, sheet)
├── lib/
│   └── utils.ts         # cn() utility (exists)
├── routes/
│   ├── home.tsx         # / → redirect to /shows
│   ├── login.tsx        # Username-only login page
│   ├── shows.tsx        # Show list with search + pagination
│   ├── shows.$showDate.tsx  # Show detail with setlist + favorite toggle
│   ├── favorites.tsx    # Authenticated user's favorited shows
│   └── api.logout.tsx   # Session destroy action
├── services/
│   ├── show.server.ts   # Show queries: list, search, detail, pagination
│   ├── favorite.server.ts  # Favorite CRUD: toggle, list, check
│   └── phishin.server.ts   # Phish.in API adapter (used by seed script only)
├── utils/
│   └── auth.server.ts   # createCookieSessionStorage, requireAuth, findOrCreateUser, createUserSession, logout
├── root.tsx             # (exists) Layout with Inter font
├── routes.ts            # (exists) Route configuration
└── app.css              # (exists) Tailwind theme with OKLCH tokens

prisma/
├── schema.prisma        # Database schema (6 models)
└── seed.ts              # Phish.in API data import script

.env.example             # DATABASE_URL, SESSION_SECRET
```

**Structure Decision**: Single full-stack project using React Router v7 framework
mode. All code lives under `app/` with server-only files using `.server.ts` suffix
(Prisma client, auth, services). This matches the existing project layout and avoids
unnecessary separation into frontend/backend directories.

## Complexity Tracking

No constitution violations to justify. All design decisions align with principles.
