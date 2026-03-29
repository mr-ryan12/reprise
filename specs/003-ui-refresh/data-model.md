# Data Model: UI Refresh

**Date**: 2026-03-28
**Feature**: 003-ui-refresh

## Schema Changes

This feature requires one additive schema change. No destructive modifications.

### Show Model — Add `albumCoverUrl`

**Field**: `albumCoverUrl String?`
**Source**: Phish.in API `album_cover_url` property on show objects
**Populated**: During seed via `fetchAllShows()` response

```
model Show {
  id            String   @id @default(cuid())
  date          DateTime @unique @db.Date
  duration      Int?
  tourName      String?
  notes         String?
  albumCoverUrl String?      // ← NEW: Phish.in album cover image URL
  venueId       String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  venue     Venue      @relation(fields: [venueId], references: [id])
  tracks    Track[]
  favorites Favorite[]

  @@index([date])
  @@index([venueId])
}
```

### Migration Steps

1. Add `albumCoverUrl String?` to `Show` model in `prisma/schema.prisma`
2. Run `yarn prisma migrate dev --name add-album-cover-url`
3. Update `PhishinShowSummary` interface to include `album_cover_url: string | null`
4. Update seed script to map `album_cover_url` into `albumCoverUrl` during show upsert
5. Re-seed database to populate existing shows: `yarn prisma db seed`

### Data Flow

```
Phish.in API (/shows)          Prisma Schema              UI Components
─────────────────────         ──────────────────         ────────────────
album_cover_url: string  →    albumCoverUrl: String?  →  <img src={show.albumCoverUrl ?? DEFAULT_IMG} />
```

### Service Layer Changes

**show.server.ts**:
- `getShows()`: Add `albumCoverUrl` to the `select` clause
- `searchShows()`: Add `albumCoverUrl` to the `select` clause
- `getShowByDate()`: Add `albumCoverUrl` to the returned fields

### No Other Model Changes

All other models (Venue, Song, Track, User, Favorite) remain unchanged. The UI refresh touches only presentation layer code (routes, components, CSS) beyond this single field addition.

## Default Fallback Image

A static fallback image will be placed at `public/images/default-album-cover.svg` (or similar). This is a local asset, not a database field. It will be referenced in components when `albumCoverUrl` is null.

Requirements:
- Square aspect ratio (matches album cover format)
- Subtle, on-brand design (music-themed, uses app color palette)
- Small file size (<5KB for SVG)
- Works in both light and dark mode
