# Research: Reprise MVP: Show Browser & Favorites

**Date**: 2026-03-26
**Feature Branch**: `001-show-browse-favorites`

## Phish.in API v2

### Decision: Use Phish.in API v2 as data source

**Rationale**: Phish.in provides a comprehensive, public REST API with audio-focused
show data including full setlists via track listings. The API is well-structured
with pagination support and stable identifiers (dates for shows, slugs for
venues/songs).

**Alternatives considered**:
- Phish.net API: More community/review focused, requires API key approval process.
  Phish.in is simpler for MVP and provides the setlist data we need.
- Manual data entry: Not feasible for ~2,000 shows.

### API Endpoints Used

| Endpoint | Purpose | Key Fields |
|----------|---------|------------|
| `GET /api/v2/shows?per_page=N&page=N` | Show list with pagination | date, venue_name, venue (nested), tour_name, duration |
| `GET /api/v2/shows/{date}` | Show detail with tracks/setlist | Same as above + tracks[] array |
| `GET /api/v2/venues?per_page=N` | Venue catalog | slug, name, city, state, country |
| `GET /api/v2/songs?per_page=N` | Song catalog | slug, title, original, artist |

### API Response Shape Notes

- **Pagination**: All list endpoints return `total_pages`, `current_page`, `total_entries`.
- **Show identifier**: Date string `"YYYY-MM-DD"` (unique per show).
- **Setlist structure**: No dedicated "set" object. The show detail endpoint returns
  a flat `tracks[]` array. Each track has `set_name` ("Set 1", "Set 2", "Set 3",
  "Encore") and `position` (global 1-indexed across the whole show). Sets are
  derived by grouping tracks by `set_name`.
- **Track-to-Song**: Each track has a `songs[]` array (typically 1 element). The
  song object contains `slug`, `title`, `original` (boolean), and `artist` (non-null
  for covers).
- **Venue**: Fully embedded in each show object. Also available via `/venues` endpoint.
  Identified by `slug`.
- **Duration**: All duration values are in **milliseconds**.

## Authentication Pattern

### Decision: Username-only auth with cookie sessions (ThreadMind pattern)

**Rationale**: Matches the existing ThreadMind project pattern. Minimal friction for
MVP — no password management, no email verification. Accounts auto-created on first
login via Prisma `upsert`.

**Implementation approach**:
- `createCookieSessionStorage` from `react-router` (not `@remix-run/node`)
- `requireAuth(request)` helper throws `redirect("/login")` if no session
- `findOrCreateUser(username)` via Prisma upsert
- Cookie: `__session`, httpOnly, sameSite: lax, 1-year maxAge
- `SESSION_SECRET` env var required

**Alternatives considered**:
- OAuth/SSO: Overkill for MVP, adds external dependency.
- Password-based: Adds complexity (hashing, reset flow) with no MVP benefit.
- Local storage only: No cross-device persistence, no server-side data association.

## Data Seeding Strategy

### Decision: One-time seed script using Axios

**Rationale**: The Phish.in API provides paginated endpoints for all entities. A
seed script can iterate through all pages and bulk-insert into PostgreSQL via Prisma.
No runtime API dependency — the app queries only the local database.

**Implementation approach**:
1. Seed script in `prisma/seed.ts`
2. Fetch all shows (paginated), all venues, all songs from Phish.in API
3. For each show, fetch detail endpoint to get tracks (setlist data)
4. Use Prisma `createMany` with `skipDuplicates` for idempotent re-runs
5. Run via `yarn prisma db seed`

**Constraints**:
- ~2,000 shows means ~2,000 detail API calls for track data
- Should implement rate limiting/delays in seed script to be respectful
- Estimated seed time: 15-30 minutes (with rate limiting)

## Search Implementation

### Decision: Server-side case-insensitive substring matching via Prisma

**Rationale**: With ~2,000 shows in PostgreSQL, simple `contains` queries with
case-insensitive mode are fast enough. No need for full-text search, Elasticsearch,
or client-side filtering for MVP.

**Implementation approach**:
- Search query arrives via URL param: `/shows?q=madison`
- Loader reads `q` param, passes to show service
- Prisma `where` clause with `OR` conditions:
  - Venue name `contains` query (insensitive)
  - Date `contains` query (for year/partial date matching)
  - City/state `contains` query
- Results paginated same as browse

**Alternatives considered**:
- PostgreSQL full-text search (`tsvector`): Overkill for MVP scale.
- Client-side filtering: Violates server-first principle (Constitution II).

## Hosting & Database

### Decision: Railway for PostgreSQL and application hosting

**Rationale**: User-specified. Railway provides managed PostgreSQL and Node.js
hosting with simple deployment from GitHub.

**Implementation approach**:
- PostgreSQL provisioned on Railway
- `DATABASE_URL` env var for Prisma connection
- `react-router-serve` for production (already configured in package.json)
- `SESSION_SECRET` env var for cookie signing

## Testing Framework

### Decision: Vitest (needs to be added)

**Rationale**: Vitest integrates natively with Vite (already the build tool),
supports TypeScript out of the box, and has a familiar Jest-compatible API. The
project does not currently have any test infrastructure.

**Alternatives considered**:
- Jest: Requires additional configuration for ESM/TypeScript/Vite compatibility.
- Playwright: Better suited for E2E; Vitest handles unit/integration needs.
