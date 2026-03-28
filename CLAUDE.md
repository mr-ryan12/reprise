# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Canonical Sources

Read these first — they take precedence over anything in this file:

- `.specify/memory/constitution.md` — 10 core principles governing all work

For feature-specific context:

- `.specify/specs/<feature>/spec.md` — requirements and acceptance criteria
- `.specify/specs/<feature>/plan.md` — implementation plan and architecture
- `.specify/specs/<feature>/data-model.md` — Prisma schema design

Follow the SpecKit workflow for non-trivial changes: `specify` → `clarify` → `plan` → `tasks` → `implement`.

## Product Context

Reprise is a Phish show discovery application. Current MVP scope:

- Browse a paginated list of Phish shows
- Search shows by date or venue (submit-based, server-side)
- View show detail pages with full setlists
- Save/remove favorite shows (authenticated)
- Username-only authentication (no password, no email)

**Out of scope for MVP**: AI chat, MCP integrations, recommendation features, advanced search. See Constitution Principle IX.

## Commands

```bash
yarn dev              # Start dev server
yarn build            # Production build
yarn start            # Run production server (react-router-serve)
yarn typecheck        # react-router typegen + tsc (MUST pass before commits)
yarn prisma generate  # Generate Prisma Client types
yarn prisma migrate dev  # Run migrations in development
yarn prisma db seed   # Import show data from Phish.in API
yarn prisma studio    # Open database GUI
```

## Architecture Rules

### Server-First (Constitution II)

- All data fetching MUST use React Router loaders. No `useEffect` fetch patterns for route data.
- All mutations MUST use React Router actions via `<Form>`, `useSubmit`, or `useFetcher`.
- All async operations in loaders and actions MUST be wrapped in `try/catch`. Catch blocks should `console.error` with context and `throw new Response(message, { status })` to surface errors through the error boundary.
- Search uses URL query params (`/shows?q=...`), not client-side state.
- Import from `"react-router"`, NOT `"@remix-run/node"` or `"@remix-run/react"`.

### Service Boundaries (Constitution VI)

- Business logic and database access live in `app/services/*.server.ts`.
- Route loaders/actions orchestrate services but MUST NOT contain Prisma calls directly.
- Services MUST NOT import from route modules or components.
- External APIs (Phish.in) MUST be behind adapter services (`app/services/phishin.server.ts`).

### TypeScript (Constitution I)

- `strict: true` is enabled — do not weaken it.
- Use Prisma-generated types. Do not hand-roll types that duplicate the schema.
- The `any` type is prohibited except with an explanatory comment.
- Path alias: `~/` maps to `app/`.

### Data Layer (Constitution III)

- Schema defined in `prisma/schema.prisma` — single source of truth.
- Domain models MUST have `id`, `createdAt`, `updatedAt` (exceptions: Track, User — documented in data-model.md).
- No raw SQL unless Prisma can't express the query, with a comment explaining why.

### Auth Pattern

- `app/utils/auth.server.ts` — session management, `requireAuth()`, `findOrCreateUser()`.
- Browse, search, and detail pages are public. Only favorites require auth.
- Protected routes call `await requireAuth(request)` at the top of the loader/action.
- Unauthenticated favorite attempts redirect to `/login?redirectTo=<current-page>`.

### UI (Constitution IV)

- Tailwind CSS only. No inline styles or CSS modules.
- Use shadcn/ui and Radix primitives for interactive components.
- All pages MUST work from 375px to 1440px+.
- Animations MUST respect `prefers-reduced-motion`.

### File Conventions

- Server-only code uses `.server.ts` suffix (auto-excluded from client bundles).
- Route files: `app/routes/<name>.tsx` (React Router file-based routing via `routes.ts`).
- Components: `app/components/` (shared), `app/components/ui/` (shadcn).
- Services: `app/services/*.server.ts`.
- Utils: `app/utils/*.server.ts` (server) or `app/lib/*.ts` (shared).

## Project Structure

```text
app/
├── components/ui/       # shadcn/ui components (button, card, input, badge, separator, sheet)
├── lib/utils.ts         # cn() utility
├── routes/              # React Router route modules
├── services/            # Business logic + DB access (.server.ts)
├── utils/               # Auth, session helpers (.server.ts)
├── root.tsx             # Layout, error boundary
├── routes.ts            # Route configuration
└── app.css              # Tailwind theme (OKLCH tokens, dark mode)

prisma/
├── schema.prisma        # Database schema (6 models: Venue, Show, Song, Track, User, Favorite)
└── seed.ts              # Phish.in API data import

.env.example             # DATABASE_URL, SESSION_SECRET
```

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Cookie signing secret | Yes |

Secrets MUST NOT be committed. See `.env.example` for template.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
