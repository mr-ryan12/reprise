---
name: typescript-expert
description: TypeScript conventions for Reprise — strict mode, verbatimModuleSyntax, types, error handling, imports, and naming
user-invokable: false
---

# TypeScript Expert

Reprise runs TypeScript with `strict: true`, `verbatimModuleSyntax: true`,
`target: ES2022`, `moduleResolution: "bundler"`, and `noEmit: true`. Vite compiles;
`tsc` is type-check only. Verify with `yarn typecheck` (runs `react-router typegen`
then `tsc`).

## Strict mode

`strict: true` enables `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`,
`strictPropertyInitialization`, etc. Never disable strict mode or reach for
`// @ts-ignore` / `// @ts-nocheck` — fix the root cause.

## `any` is prohibited

Do not use `any` except with an explanatory comment justifying why it's
unavoidable (Constitution I). Prefer `unknown` + narrowing, generics, or the real
type. For loosely-shaped locals use `Record<string, unknown>` (see the search
filter array in `show.server.ts`).

## verbatimModuleSyntax — `import type` is mandatory

Type-only imports **must** use `import type`, and you cannot mix a type-only and a
value import in one statement — split them:

```ts
import { data as _ } from "react-router";        // value
import type { Route } from "./+types/shows";     // types
import type { VariantProps } from "class-variance-authority";
```

This is stricter than `isolatedModules`: a plain `import` of something used only as
a type is a compile error.

## Path alias

`~/` resolves to `app/`. Use it for all in-app imports; never relative paths that
cross the `app/` boundary:

```ts
import { prisma } from "~/lib/db.server";
import { cn } from "~/lib/utils";
```

Note the two exceptions to `~/`: `app/routes/*` import their generated types via the
relative `./+types/<name>`, and `prisma/` scripts import the client via a relative
path (they run outside the app).

## Use generated types — don't duplicate the schema

Use Prisma-generated model types and React Router's `Route.*` types. Do not
hand-roll interfaces that mirror the schema (Constitution I/III). Hand-written
interfaces are for shapes the generators don't cover — e.g. the Phish.in API
response types in `phishin.server.ts` (`PhishinVenue`, `PhishinShowDetail`).

## Error handling — caught errors are `unknown`

Narrow before use:

```ts
try {
  await syncShow();
} catch (error) {
  console.error("Sync failed:", error);
  const message = error instanceof Error ? error.message : String(error);
}
```

When re-throwing framework `Response`s (redirects, validation), check first:
`if (error instanceof Response) throw error;`.

## Explicit return types

Add explicit return types to non-trivial exported functions — services, loaders,
actions, utilities (e.g. `Promise<Set<string>>`, `Promise<boolean>`). Omit only for
obvious one-liners.

## `as const` and assertions

Prefer narrowing over `as`. Legitimate uses of assertions here:
- `mode: "insensitive" as const` to satisfy Prisma's literal enum
- `String(formData.get("field") ?? "")` to coerce `FormDataEntryValue`

Avoid `as SomeType` casts of arbitrary values — write a type guard instead.

## Non-null assertion `!`

Reserve `!` for environment-variable boundaries where crashing fast is correct
(`process.env.SESSION_SECRET!`). Elsewhere use `??` or an early return.

## Parameters — destructured options object past two args

A function taking **more than two parameters** must accept a single destructured
options object typed by a named `interface` (no `I` prefix, placed directly above
the function). Two or fewer parameters may stay positional. Route loaders/actions
and component props already follow this.

```ts
interface SyncShowTracksParams {
  prisma: PrismaClient;
  showId: string;
  detail: PhishinShowDetail;
  songSlugToId: Map<string, string>;
}

export async function syncShowTracks({
  prisma,
  showId,
  detail,
  songSlugToId,
}: SyncShowTracksParams): Promise<number> { /* ... */ }
```

## Naming (match existing code)

- Interfaces/types: `PascalCase`, **no** `I`/`T` prefix (e.g. `PhishinTrack`,
  `PlayableTrack`, `Route`).
- Functions: verbs (`getShows`, `toggleFavorite`, `fetchShowDetail`).
- Variables/props: nouns (`showId`, `favoriteShowIds`).
- Booleans: `is`/`has`/`can` (`isFavorited`, `isSearching`).

## ES2022 is available

Top-level `await`, `Array.at()`, `Object.hasOwn()`, optional chaining `?.`,
nullish coalescing `??`, logical assignment `??=`/`&&=`/`||=`. Prefer built-in
utility types (`Partial`, `Pick`, `Omit`, `Record`, `ReturnType<typeof fn>`) over
re-declaring shapes.
