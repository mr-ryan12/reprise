# Implementation Plan: UI Refresh

**Branch**: `003-ui-refresh` | **Date**: 2026-03-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-ui-refresh/spec.md`

## Summary

Refresh the visual design, layout, spacing, typography hierarchy, responsive behavior, and interaction polish across all Reprise MVP pages. Add album cover art support via a single Prisma field addition (`albumCoverUrl` on Show). Extract a shared ShowCard component, introduce an AlbumCover component with fallback, refine the design token palette, and update all six routes and the audio player for a cohesive, premium, music-focused interface. No new routes, no framework changes, no feature scope changes.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode
**Primary Dependencies**: React Router v7 (framework mode), Tailwind CSS v4, shadcn/ui, Radix primitives, lucide-react, class-variance-authority
**Storage**: PostgreSQL via Prisma ORM (one additive migration: `albumCoverUrl String?` on Show)
**Testing**: Manual visual testing across viewports (375px, 768px, 1440px, 2560px), `yarn typecheck`
**Target Platform**: Web (SSR via react-router-serve), responsive 375px–1440px+
**Project Type**: Web application (full-stack SSR)
**Performance Goals**: Lighthouse accessibility 90+, CLS < 0.1, interactive feedback < 100ms
**Constraints**: Inter typeface only, monochrome OKLCH palette with optional warm accent, no new runtime dependencies
**Scale/Scope**: 6 routes, ~10 component files, 1 migration, 1 seed update, 1 CSS token refinement

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Strong TypeScript Safety | PASS | All changes in TypeScript strict mode. New `albumCoverUrl` field uses Prisma-generated types. |
| II. Server-First React Router | PASS | No new data fetching patterns. Album cover URL loaded via existing loaders. No useEffect fetch. |
| III. Clean Prisma/PostgreSQL Data Modeling | PASS | Single additive field `albumCoverUrl String?` on Show. Migration via Prisma Migrate. No raw SQL. |
| IV. Responsive & Polished UI | PASS | This feature's primary purpose. Tailwind-only styling. shadcn/ui for interactive components. 375px–1440px+ support. `prefers-reduced-motion` respected. |
| V. Small Diffs | PASS | Decomposed into 5 phases, each independently reviewable. CSS/token changes separated from component work. |
| VI. Clear Service Boundaries | PASS | `albumCoverUrl` added to service queries in `show.server.ts`. No Prisma calls in routes or components. |
| VII. Testing Discipline | PASS | Typecheck required. Visual testing plan defined. No new service logic beyond field inclusion. |
| VIII. Phased Delivery | PASS | 5 phases: (1) data model, (2) design tokens, (3) shared components, (4) route pages, (5) player. Each can be a separate PR. |
| IX. MVP Scope Guard | PASS | No AI/MCP features. Purely visual/UX refinement within existing MVP scope. |
| X. Configuration & Secrets Discipline | PASS | No new env vars or secrets. Static fallback image is a committed asset. |

**Gate result: ALL PASS** — no violations, no justifications needed.

## Project Structure

### Documentation (this feature)

```text
specs/003-ui-refresh/
├── plan.md              # This file
├── research.md          # Phase 0 output — design decisions
├── data-model.md        # Phase 1 output — schema changes
├── quickstart.md        # Phase 1 output — setup guide
├── contracts/
│   └── ui-contracts.md  # Phase 1 output — loader/component contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── app.css                          # Refined design tokens, utility classes
├── root.tsx                         # Updated header/nav, error boundary
├── components/
│   ├── show-card.tsx                # NEW: Shared show card component
│   ├── album-cover.tsx              # NEW: Album cover with fallback
│   ├── track-row.tsx                # Refined styling
│   ├── audio-player.tsx             # Refined styling
│   └── ui/                          # shadcn components (minor tweaks if needed)
├── routes/
│   ├── shows.tsx                    # Refreshed list layout
│   ├── shows.$showDate.tsx          # Refreshed detail layout
│   ├── favorites.tsx                # Refreshed favorites layout
│   └── login.tsx                    # Refreshed login layout
└── services/
    ├── show.server.ts               # Add albumCoverUrl to queries
    └── phishin.server.ts            # Add album_cover_url to type

prisma/
├── schema.prisma                    # Add albumCoverUrl to Show
└── seed.ts                          # Map album_cover_url during import

public/
└── images/
    └── default-album-cover.svg      # NEW: Fallback album cover
```

**Structure Decision**: Existing file-based routing and service architecture preserved. Two new shared components (`show-card.tsx`, `album-cover.tsx`) extracted to reduce duplication between shows list and favorites. One new static asset for the fallback image.

## Implementation Phases

### Phase 1: Data Model & Seed Update

**Goal**: Add `albumCoverUrl` to the Show model, update the Phish.in adapter type, and populate during seed.

**Files**:
- `prisma/schema.prisma` — Add `albumCoverUrl String?` to Show model
- `app/services/phishin.server.ts` — Add `album_cover_url: string | null` to `PhishinShowSummary`
- `prisma/seed.ts` — Map `show.album_cover_url` → `albumCoverUrl` in show upsert (both create and update)
- `app/services/show.server.ts` — Include `albumCoverUrl` in `select` for `getShows()`, `searchShows()`, and return from `getShowByDate()`

**Validation**: `yarn typecheck` passes. `yarn prisma migrate dev` creates migration. Re-seed populates `albumCoverUrl` values.

**Spec coverage**: US7, FR-015 (data layer), Clarification session answer.

---

### Phase 2: Design Tokens & CSS Refinements

**Goal**: Refine the OKLCH color palette, update spacing/typography tokens, and add any new utility classes needed for the refresh.

**Files**:
- `app/app.css` — Refine token values for improved contrast and hierarchy. Potential warm accent for interactive states. Adjust dark mode card/border values for better separation. Add utility classes for album cover sizing if needed.

**Design decisions** (from research.md):
- Typography scale: Three-tier hierarchy (primary dates/titles at `text-xl`–`text-2xl`, secondary venue/songs at `text-base font-medium`, tertiary metadata at `text-sm text-muted-foreground`)
- Color: Maintain monochrome foundation. Consider subtle warm accent for hover/active states. Keep red for favorites.
- Spacing: Consistent vertical rhythm across pages. Cards get slightly more padding for breathing room.

**Validation**: Visual inspection on light and dark mode. No typecheck impact (CSS only).

**Spec coverage**: SC-008 (consistency), FR-012 (interaction states), FR-014 (responsive).

---

### Phase 3: Shared Components

**Goal**: Create reusable ShowCard and AlbumCover components. Create default fallback image asset.

**Files**:
- `app/components/album-cover.tsx` — NEW: Renders `<img>` with `src={albumCoverUrl ?? "/images/default-album-cover.svg"}`. Accepts `size` prop (sm/md/lg). Uses `loading="lazy"`, fixed aspect-ratio to prevent CLS. Rounded corners.
- `app/components/show-card.tsx` — NEW: Extracts the repeated show card pattern from shows.tsx and favorites.tsx. Renders AlbumCover thumbnail, date (prominent), venue name, location, and optional favorite indicator. Wraps in a `<Link>` with hover state.
- `public/images/default-album-cover.svg` — NEW: Subtle, on-brand placeholder. Square, works in light/dark mode, <5KB.

**Validation**: `yarn typecheck` passes. Components render correctly in isolation (used in Phase 4).

**Spec coverage**: FR-002 (card hierarchy), FR-015 (album art with fallback), SC-005 (no layout shift).

---

### Phase 4: Route Page Refreshes

**Goal**: Update all route pages with refined layouts, typography, spacing, and new shared components.

**Subphase 4a — App Shell (root.tsx)**:
- Refine header: Improve brand typography, navigation spacing, active state indication
- Update error boundary styling: Friendly layout with icon, clear message, link to `/shows`
- Ensure consistent layout wrapper across all pages

**Subphase 4b — Shows List (shows.tsx)**:
- Replace inline show cards with `<ShowCard>` component (includes album art thumbnail)
- Refine search form: Improved focus states, result count feedback when searching
- Refine pagination: Clearer page context, better touch targets
- Improve empty state: Icon + message + suggestion
- Apply three-tier typography hierarchy to card content

**Subphase 4c — Show Detail (shows.$showDate.tsx)**:
- Add album cover to header (larger size, alongside date/venue metadata)
- Refine metadata layout: Date prominent, venue/location/tour/duration as supporting info
- Improve set section headers: Distinct labels (tracking-wide uppercase text-xs for set names)
- Refine track row integration with updated TrackRow component
- Improve favorite button: Clearer filled/unfilled states with transition
- Refine back navigation styling

**Subphase 4d — Favorites (favorites.tsx)**:
- Use `<ShowCard>` component for consistency with shows list
- Refine empty state: Warmer messaging, icon, clear CTA to browse shows

**Subphase 4e — Login (login.tsx)**:
- Refine centering and card treatment
- Improve input focus styling
- Refine error display: Color, placement, no layout shift
- Strengthen brand presence on the page

**Files**: `app/root.tsx`, `app/routes/shows.tsx`, `app/routes/shows.$showDate.tsx`, `app/routes/favorites.tsx`, `app/routes/login.tsx`

**Validation**: Visual testing on 375px, 768px, 1440px viewports. `yarn typecheck` passes. All acceptance scenarios from spec verified.

**Spec coverage**: US1–US6, FR-001 through FR-014, FR-016, SC-001 through SC-008.

---

### Phase 5: Audio Player & Track Row Polish

**Goal**: Refine the audio player and track row components to match the updated design language.

**Files**:
- `app/components/track-row.tsx` — Refine spacing, typography hierarchy (title at `font-medium`, position and duration at `text-muted-foreground`), hover/focus states, cover badge styling, playing indicator.
- `app/components/audio-player.tsx` — Refine both expanded and minimized states: Typography consistency, control spacing, progress bar styling, metadata display. Ensure visual cohesion with updated header and page styles.

**Validation**: Play audio and verify player states (expanded, minimized, mobile). Test track interaction states (hover, playing, paused). `yarn typecheck` passes.

**Spec coverage**: FR-007 (track rows), FR-013 (audio player), US2 (setlist polish).

## Complexity Tracking

No constitution violations to justify. All phases are additive styling changes with one minor schema addition. Total estimated scope is well within the small-diff principle when decomposed across 5 phases.

## Post-Phase 1 Constitution Re-Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. TypeScript Safety | PASS | `albumCoverUrl` typed via Prisma generation. All components typed. |
| II. Server-First | PASS | Album cover URL flows through loaders, no client-side fetching. |
| III. Data Modeling | PASS | Single optional field, proper migration. |
| IV. Responsive UI | PASS | AlbumCover component handles responsive sizing. All layouts tested 375px–1440px+. |
| V. Small Diffs | PASS | 5 phases, each < 400 lines of meaningful changes. |
| VI. Service Boundaries | PASS | New components consume loader data only. No direct Prisma access. |
| VII. Testing | PASS | Typecheck + visual test plan. |
| VIII. Phased Delivery | PASS | Each phase independently mergeable. |
| IX. MVP Scope Guard | PASS | No AI/MCP. |
| X. Configuration | PASS | No new secrets or env vars. |

**Post-design gate: ALL PASS.**
