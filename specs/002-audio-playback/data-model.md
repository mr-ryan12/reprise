# Data Model Changes: Audio Playback

**Date**: 2026-03-27
**Feature Branch**: `002-audio-playback`

## Schema Change

### Track Model (modified)

Add one nullable field to the existing Track model:

```prisma
model Track {
  id       String  @id @default(cuid())
  showId   String
  songId   String
  setName  String  // "Set 1", "Set 2", "Set 3", "Encore"
  position Int     // 1-indexed, global across show
  duration Int?    // milliseconds
  mp3Url   String? // NEW: Phish.in audio stream URL

  show Show @relation(fields: [showId], references: [id], onDelete: Cascade)
  song Song @relation(fields: [songId], references: [id])

  @@unique([showId, position])
  @@index([showId])
  @@index([songId])
}
```

### Migration

```sql
ALTER TABLE "Track" ADD COLUMN "mp3Url" TEXT;
```

No index needed on `mp3Url` — it's never queried directly, only selected.

### Seed Script Update

The seed script (`prisma/seed.ts`) currently creates tracks with:
- `showId`, `songId`, `setName`, `position`, `duration`

Add `mp3Url` from the Phish.in track response:

```typescript
// In seed.ts, where tracks are created:
await prisma.track.create({
  data: {
    showId: showRecord.id,
    songId,
    setName: track.set_name,
    position: track.position,
    duration: track.duration,
    mp3Url: track.mp3_url ?? null,  // NEW
  },
});
```

The `PhishinTrack` type in `phishin.server.ts` needs `mp3_url` added:

```typescript
export interface PhishinTrack {
  slug: string;
  title: string;
  set_name: string;
  position: number;
  duration: number | null;
  mp3_url: string | null;  // NEW
  songs: PhishinSong[];
}
```

## Data Volume

- ~38,000 existing tracks will gain `mp3Url` values after re-seed
- Most tracks have audio (Phish.in has `audio_status: "complete"` on most shows)
- Some older/rare tracks may have null mp3_url

## No New Entities

Player state is client-only (React context) and not persisted to the database.
