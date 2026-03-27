# Data Model: Reprise MVP: Show Browser & Favorites

**Date**: 2026-03-26
**Feature Branch**: `001-show-browse-favorites`
**Source**: Phish.in API v2

## Entity Relationship Diagram

```
Venue 1──* Show 1──* Track *──1 Song
                  |
User 1──* Favorite *──1 Show
```

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Venue {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  city      String
  state     String
  country   String   @default("USA")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  shows Show[]

  @@index([name])
}

model Show {
  id        String   @id @default(cuid())
  date      DateTime @unique @db.Date
  duration  Int?     // milliseconds
  tourName  String?
  notes     String?  // taper_notes from API
  venueId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  venue     Venue      @relation(fields: [venueId], references: [id])
  tracks    Track[]
  favorites Favorite[]

  @@index([date])
  @@index([venueId])
}

model Song {
  id        String   @id @default(cuid())
  slug      String   @unique
  title     String
  original  Boolean  @default(true)
  artist    String?  // non-null for covers
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tracks Track[]

  @@index([title])
}

model Track {
  id       String @id @default(cuid())
  showId   String
  songId   String
  setName  String // "Set 1", "Set 2", "Set 3", "Encore"
  position Int    // 1-indexed, global across show
  duration Int?   // milliseconds

  show Show @relation(fields: [showId], references: [id], onDelete: Cascade)
  song Song @relation(fields: [songId], references: [id])

  @@unique([showId, position])
  @@index([showId])
  @@index([songId])
}

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  createdAt DateTime @default(now())

  favorites Favorite[]
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  showId    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  show Show @relation(fields: [showId], references: [id], onDelete: Cascade)

  @@unique([userId, showId])
  @@index([userId])
  @@index([showId])
}
```

## Design Decisions

### Venue as Separate Entity
Venues are normalized into their own table rather than embedded as fields on Show.
This enables venue-based search without string matching on denormalized data, and
allows future features like "shows at this venue" pages.

### Track vs SetlistEntry Naming
Named `Track` to match the Phish.in API terminology. Each track represents a single
song performance within a show. Sets are derived by grouping tracks by `setName`.

### Track Has No Timestamps
Track is a narrow join-like table connecting Show and Song with set/position metadata.
Per Constitution Principle III, narrow join tables are exempt from `createdAt`/`updatedAt`.

### User Has No updatedAt
The User model only has `username` and `createdAt`. There are no mutable fields
(username cannot be changed in MVP), so `updatedAt` adds no value. Exempt per
Constitution Principle III.

### Show Date as DateTime with @db.Date
Stored as a PostgreSQL `date` type (no time component). The `@unique` constraint
ensures one show per date, matching the Phish.in API's date-based identification.

### Favorite Unique Constraint
`@@unique([userId, showId])` prevents duplicate favorites and enables efficient
"is this show favorited?" lookups.

## Phish.in API Field Mapping

| Our Field | Phish.in Source | Notes |
|-----------|----------------|-------|
| `Show.date` | `show.date` | Parse "YYYY-MM-DD" string to Date |
| `Show.duration` | `show.duration` | Milliseconds, nullable |
| `Show.tourName` | `show.tour_name` | Nullable |
| `Show.notes` | `show.taper_notes` | Free text, nullable |
| `Venue.slug` | `show.venue.slug` | Stable identifier |
| `Venue.name` | `show.venue.name` | Display name |
| `Venue.city` | `show.venue.city` | |
| `Venue.state` | `show.venue.state` | |
| `Venue.country` | `show.venue.country` | Default "USA" |
| `Song.slug` | `track.songs[0].slug` | First song in track's songs array |
| `Song.title` | `track.songs[0].title` | |
| `Song.original` | `track.songs[0].original` | Boolean |
| `Song.artist` | `track.songs[0].artist` | Non-null for covers |
| `Track.setName` | `track.set_name` | "Set 1", "Set 2", etc. |
| `Track.position` | `track.position` | Global 1-indexed |
| `Track.duration` | `track.duration` | Milliseconds |

## Data Volume Estimates

| Entity | Estimated Count | Growth |
|--------|----------------|--------|
| Venue | ~300 | Slow (few new venues per year) |
| Show | ~2,000 | ~40-60 per year |
| Song | ~1,000 | ~5-10 per year |
| Track | ~25,000 | ~500-750 per year (avg 12-15 tracks/show) |
| User | MVP: <100 | N/A |
| Favorite | MVP: <1,000 | N/A |
