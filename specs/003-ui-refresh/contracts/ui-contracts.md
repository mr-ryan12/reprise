# UI Contracts: UI Refresh

**Date**: 2026-03-28
**Feature**: 003-ui-refresh

## Loader Response Contracts

These define the data shapes that route loaders return. The UI refresh adds `albumCoverUrl` to show objects.

### Shows List Loader (`/shows`)

```typescript
type ShowsLoaderData = {
  shows: Array<{
    id: string;
    date: string;           // YYYY-MM-DD
    tourName: string | null;
    venue: {
      name: string;
      city: string;
      state: string;
    };
    albumCoverUrl: string | null;  // ← NEW
    isFavorited: boolean;
  }>;
  totalPages: number;
  currentPage: number;
  query: string;
};
```

### Show Detail Loader (`/shows/:showDate`)

```typescript
type ShowDetailLoaderData = {
  show: {
    id: string;
    date: string;           // YYYY-MM-DD
    tourName: string | null;
    duration: number | null;
    notes: string | null;
    albumCoverUrl: string | null;  // ← NEW
    venue: {
      name: string;
      city: string;
      state: string;
      country: string;
    };
  };
  sets: Array<{
    name: string;
    tracks: Array<{
      id: string;
      position: number;
      duration: number | null;
      mp3Url: string | null;
      song: {
        title: string;
        original: boolean;
        artist: string | null;
      };
    }>;
  }>;
  isFavorited: boolean | null;
};
```

### Favorites Loader (`/favorites`)

```typescript
type FavoritesLoaderData = {
  favorites: Array<{
    id: string;
    date: string;           // YYYY-MM-DD
    tourName: string | null;
    venue: {
      name: string;
      city: string;
      state: string;
    };
    albumCoverUrl: string | null;  // ← NEW
  }>;
};
```

## Component Prop Contracts

### ShowCard (new shared component)

```typescript
type ShowCardProps = {
  show: {
    id: string;
    date: string;
    tourName: string | null;
    venue: { name: string; city: string; state: string };
    albumCoverUrl: string | null;
  };
  isFavorited?: boolean;
  linkTo: string;
};
```

### AlbumCover (new shared component)

```typescript
type AlbumCoverProps = {
  src: string | null;      // albumCoverUrl or null
  alt: string;             // show date or venue for accessibility
  size?: "sm" | "md" | "lg";  // sm=48px, md=80px, lg=160px
  className?: string;
};
```

## Design Token Contract

The CSS custom properties in `app.css` are the styling contract. Changes:

```css
/* No new tokens required — refinements to existing values only */
/* Potential additions if warm accent is introduced: */
--accent: oklch(/* warm accent value */);
--accent-foreground: oklch(/* contrast text */);
```

All existing token names remain stable. Components reference tokens via Tailwind classes (`bg-primary`, `text-muted-foreground`, etc.), so token value changes propagate automatically.
