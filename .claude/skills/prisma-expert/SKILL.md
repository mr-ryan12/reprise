---
name: prisma-expert
description: Prisma expertise for Reprise — schema, queries, upserts, migrations, and where DB code lives
user-invokable: false
---

# Prisma Expert

Reprise uses **Prisma with PostgreSQL** (no pgvector, no raw SQL). The client is
generated to `generated/prisma/client` and exposed as a singleton in
`app/lib/db.server.ts` via the `@prisma/adapter-pg` driver adapter.

## Importing the client

Always import the singleton — never instantiate `PrismaClient` in app code:

```ts
import { prisma } from "~/lib/db.server";
```

The only place a fresh `PrismaClient` is instantiated is standalone scripts under
`prisma/` (e.g. `seed.ts`, `update.ts`), which build their own adapter because they
run outside the app runtime.

## Schema models (`prisma/schema.prisma` is the single source of truth)

```
Venue         — id, slug (unique), name, city, state, country, timestamps → shows[]
Show          — id, date (unique, @db.Date), duration?, tourName?, notes?,
                albumCoverUrl?, venueId, timestamps → venue, tracks[], favorites[]
Song          — id, slug (unique), title, original, artist?, timestamps → tracks[]
Track         — id, showId, songId, setName, position, duration?, mp3Url?
                @@unique([showId, position])  → show, song, trackFavorites[]
User          — id, username (unique), createdAt (no updatedAt) → favorites[], trackFavorites[]
Favorite      — id, userId, showId, createdAt  @@unique([userId, showId])
TrackFavorite — id, userId, trackId, createdAt @@unique([userId, trackId])
```

Domain models carry `id`, `createdAt`, `updatedAt`. Documented exceptions:
`Track` (no timestamps) and `User` (`createdAt` only) — see data-model.md.

## Query discipline

Use `select` to fetch only needed fields; use `include` only when you genuinely
need the relation. Run independent reads in parallel with `Promise.all` (the
findMany + count pagination pattern in `app/services/show.server.ts` is the
reference):

```ts
const [shows, totalCount] = await Promise.all([
  prisma.show.findMany({
    skip,
    take: PAGE_SIZE,
    orderBy: { date: "desc" },
    include: { venue: { select: { name: true, city: true, state: true } } },
  }),
  prisma.show.count(),
]);
```

Avoid N+1 loops — fetch relations via `include`/`select`, not per-row queries.
Case-insensitive text search uses `mode: "insensitive" as const`.

## Upserts and composite keys

Prefer `upsert` for idempotent writes, keyed on a unique field or composite index:

```ts
// Composite unique — Prisma names it by joining the fields
await prisma.favorite.findUnique({ where: { userId_showId: { userId, showId } } });

// Show by its unique date
await prisma.show.upsert({
  where: { date: new Date(show.date) },
  update: { /* ... */ },
  create: { /* ... */ },
});
```

**Cascade caution.** `TrackFavorite` references `Track` with `onDelete: Cascade`.
Deleting and recreating a show's tracks (as the full seed does) cascade-deletes
users' saved tracks. In any recurring/partial sync, **upsert tracks** on
`@@unique([showId, position])` instead of delete-then-create.

## Error handling

Service functions may let Prisma errors propagate; the calling loader/action wraps
the call in `try/catch`, logs with context, and surfaces a `Response`:

```ts
try {
  const show = await getShowByDate(date);
  // ...
} catch (error) {
  console.error("Failed to load show:", error);
  throw new Response("Failed to load show", { status: 500 });
}
```

Use `console.error` with a contextual prefix — this project has no separate logger.

## Types

Use Prisma-generated types; do not hand-roll types that duplicate the schema
(Constitution I/III). Import model types from the generated client when needed.

## Migrations

- Schema change → create a migration: `yarn migrate:new`
- Apply in deploy/CI: `yarn migrate:latest`
- After any schema change: `yarn prisma:generate`
- `yarn db:push` is for local prototyping only — never against shared/prod data
- No raw SQL unless Prisma genuinely can't express the query, with a comment
  explaining why (Constitution III)

## Where DB code lives (Constitution VI)

All Prisma access belongs in `app/services/*.server.ts`. Route loaders/actions
orchestrate services but MUST NOT call Prisma directly, and services MUST NOT
import from routes or components. External APIs (Phish.in) stay behind
`app/services/phishin.server.ts`.
