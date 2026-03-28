# Route Contracts: Reprise MVP

**Date**: 2026-03-26
**Feature Branch**: `001-show-browse-favorites`

## Route Map

| Route | File | Auth | Loader | Action |
|-------|------|------|--------|--------|
| `/` | `app/routes/home.tsx` | Public | Redirect to `/shows` | — |
| `/login` | `app/routes/login.tsx` | Public | Redirect if already authenticated | Username submit → create session |
| `/shows` | `app/routes/shows.tsx` | Public | Paginated show list + search | — |
| `/shows/:showDate` | `app/routes/shows.$showDate.tsx` | Public | Show detail with setlist | Toggle favorite (auth required) |
| `/favorites` | `app/routes/favorites.tsx` | Required | User's favorited shows | — |
| `/api/logout` | `app/routes/api.logout.tsx` | Required | — | Destroy session, redirect to `/login` |

## Route Details

### `GET /` → Redirect

**Loader**: Returns `redirect("/shows")`.

No component rendered.

---

### `/login`

**Loader**:
- If user has valid session → `redirect("/shows")`
- Reads optional `redirectTo` search param for post-login redirect

**Action** (POST):
- Body: `{ username: string }`
- Validates username is non-empty and trimmed
- Calls `findOrCreateUser(username)` → upserts User record
- Calls `createUserSession(userId, redirectTo)` → sets cookie, redirects
- Error: Returns `{ error: "Username is required" }` with 400 status

**Component**: Login form with single username input field.

---

### `/shows`

**Loader**:
- Reads search params: `q` (search query), `page` (pagination, default 1)
- If `q` present: filters shows by venue name, date, or city/state (case-insensitive)
- Returns: `{ shows: Show[], totalPages: number, currentPage: number, query: string }`
- Each show includes nested venue data (name, city, state)
- Sorted by date descending
- Page size: 25

**Component**: Shows list with search form and pagination controls.
Optionally renders favorite toggle button if user is authenticated (check session
without requiring auth).

---

### `/shows/:showDate`

**Loader**:
- Params: `showDate` (string, "YYYY-MM-DD" format)
- Returns: `{ show: Show, tracks: Track[], isFavorited: boolean | null }`
- `isFavorited` is `null` if user is not authenticated, `true`/`false` if authenticated
- Tracks include nested song data, grouped by set for display
- 404 if show not found

**Action** (POST — favorite toggle):
- If user not authenticated → `redirect("/login?redirectTo=/shows/{showDate}")`
- Body: `{ intent: "favorite" }`
- Toggles favorite: if exists, delete; if not, create
- Returns redirect to same page (PRG pattern)

**Component**: Show detail page with setlist and favorite button.

---

### `/favorites`

**Loader**:
- Requires auth: `const userId = await requireAuth(request)`
- Returns: `{ favorites: Favorite[] }` with nested show and venue data
- Sorted by date favorited descending

**Component**: List of favorited shows (same card format as shows list).

---

### `/api/logout`

**Action** (POST):
- Destroys session cookie
- Returns `redirect("/login")`

No loader, no component. Action-only route.

## Shared Types

```typescript
// Loader return types (for type-safe route modules)

type ShowListItem = {
  id: string;
  date: string;       // "YYYY-MM-DD"
  tourName: string | null;
  venue: {
    name: string;
    city: string;
    state: string;
  };
};

type ShowDetail = ShowListItem & {
  duration: number | null;
  notes: string | null;
  venue: {
    name: string;
    city: string;
    state: string;
    country: string;
  };
};

type TrackItem = {
  id: string;
  setName: string;
  position: number;
  duration: number | null;
  song: {
    title: string;
    original: boolean;
    artist: string | null;
  };
};

type FavoriteItem = {
  id: string;
  createdAt: string;
  show: ShowListItem;
};
```
