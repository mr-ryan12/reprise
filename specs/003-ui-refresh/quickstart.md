# Quickstart: UI Refresh

**Date**: 2026-03-28
**Feature**: 003-ui-refresh

## Prerequisites

- Node.js, Yarn 4, PostgreSQL running locally
- `.env` file with `DATABASE_URL` and `SESSION_SECRET`
- Database seeded with show data (`yarn prisma db seed`)

## Setup After Branch Checkout

```bash
# 1. Install dependencies (if any new ones added)
yarn install

# 2. Run migration for albumCoverUrl field
yarn prisma migrate dev

# 3. Re-generate Prisma client
yarn prisma generate

# 4. Re-seed to populate albumCoverUrl from Phish.in API
yarn prisma db seed

# 5. Start dev server
yarn dev
```

## Key Files to Modify

### Data Layer (Phase 1)
- `prisma/schema.prisma` — Add `albumCoverUrl String?` to Show
- `app/services/phishin.server.ts` — Add `album_cover_url` to `PhishinShowSummary`
- `prisma/seed.ts` — Map `album_cover_url` in show upsert
- `app/services/show.server.ts` — Include `albumCoverUrl` in queries

### Design System (Phase 2)
- `app/app.css` — Refine color tokens, add any new utility classes
- `app/components/ui/` — Update shadcn component styles if needed

### Shared Components (Phase 3)
- `app/components/show-card.tsx` — NEW: Extract shared show card component
- `app/components/album-cover.tsx` — NEW: Album cover with fallback
- `public/images/default-album-cover.svg` — NEW: Default fallback image

### Route Pages (Phase 4)
- `app/root.tsx` — Header/nav refinements
- `app/routes/shows.tsx` — Shows list layout refresh
- `app/routes/shows.$showDate.tsx` — Show detail layout refresh
- `app/routes/favorites.tsx` — Favorites page refresh
- `app/routes/login.tsx` — Login page refresh
- `app/components/track-row.tsx` — Track row styling refinements
- `app/components/audio-player.tsx` — Player styling refinements

## Verification

```bash
# Type check must pass
yarn typecheck

# Visual check on key viewports
# - 375px (mobile)
# - 768px (tablet)
# - 1440px (desktop)
# - 2560px (ultrawide)

# Check pages:
# - /shows (list, search, empty search, pagination)
# - /shows/YYYY-MM-DD (detail with art, detail without art, setlist, favorite toggle)
# - /favorites (with items, empty state)
# - /login (form, error state)
# - Error boundary (invalid route)
# - Audio player (expanded, minimized, mobile)
```
