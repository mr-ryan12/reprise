---
name: ui-ux-expert
description: UI/UX conventions for Reprise — Tailwind v4, shadcn/ui, semantic tokens, responsive layout, accessibility, and loading states
user-invokable: false
---

# UI/UX Expert

Reprise uses **Tailwind CSS v4** with **shadcn/ui** components built on **Radix
primitives** and **class-variance-authority (CVA)**. Icons come from
**lucide-react**. Class merging uses `cn()` from `~/lib/utils`.

## Use the shadcn components — don't rebuild

Reusable interactive UI lives in `app/components/ui/` (button, card, input, badge,
separator, sheet). Compose these instead of hand-rolling. Buttons expose `variant`
(`default | outline | secondary | ghost | destructive | link`) and `size`
(`default | xs | sm | lg | icon | icon-*`) via CVA, plus `asChild` to render as a
`<Link>`:

```tsx
import { Button } from "~/components/ui/button";

<Button variant="outline" size="sm" asChild>
  <Link to="/shows">Try again</Link>
</Button>
```

Shared app components live in `app/components/` (e.g. `show-card`, `album-cover`).

## Semantic color tokens — not raw colors, not manual dark variants

Colors are defined once as **OKLCH tokens** in `app/app.css` and consumed through
Tailwind semantic utilities. Dark mode is handled by the `.dark` class swapping the
token values, so you **do not** write `dark:` pairs for tokened colors — use the
token and it adapts automatically:

```tsx
// Correct — token adapts to dark mode on its own
className="bg-card text-card-foreground border border-border"
className="text-muted-foreground"
className="bg-primary text-primary-foreground"

// Wrong — hard-coded palette color with a manual dark variant
className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
```

Available token families: `background`/`foreground`, `card`, `popover`, `primary`,
`secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, and the
`sidebar-*` set. Reach for a raw palette color only for a genuine one-off; if you
do, pair it with a `dark:` variant.

## Responsive — 375px to 1440px+

Every page must work from **375px to 1440px+** (Constitution IV). Design mobile-first
and scale up with `md:`/`lg:`. Containers follow the `mx-auto max-w-3xl px-4 py-8`
pattern seen across routes.

```tsx
<div className="p-4 md:p-6">
<h1 className="text-2xl font-bold tracking-tight">
```

Use the `size-*` shorthand for square elements/icons (`size-4`, `size-8`).

## Loading & pending states

Every async operation shows feedback.

- **Form / navigation:** `useNavigation()` — swap a `lucide-react` `Loader2` with
  `animate-spin` for the idle icon while `navigation.state === "loading"` (see the
  debounced search in `app/routes/shows.tsx`).
- **Inline mutations:** `useFetcher()` — drive disabled/pending UI from
  `fetcher.state`.
- Disable the triggering control while a submission is in flight
  (`disabled={isSubmitting}`); Button already dims via `disabled:opacity-50`.

```tsx
{isSearching
  ? <Loader2 className="... size-4 animate-spin text-muted-foreground" />
  : <Search className="... size-4 text-muted-foreground" />}
```

## Error display

Show errors inline near the action in `destructive`/`muted` tones — never raw
stack traces or `alert()`. Route-level failures render through the `ErrorBoundary`
(see `shows.tsx`) using `bg-card` / `text-muted-foreground` and a recovery action.

## Accessibility

- Icon-only buttons **must** have `aria-label`.
- Use semantic elements (`<nav aria-label="Pagination">`, `<header>`, `<main>`,
  headings) — not `<div onClick>`.
- Preserve focus rings — shadcn components ship `focus-visible:ring-*`; don't kill
  them with bare `outline-none`.
- Disabled-looking links use `aria-disabled` + `pointer-events-none opacity-50`
  (see pagination in `shows.tsx`).

## Motion

Animations **must** respect `prefers-reduced-motion` (Constitution IV). Keep
transitions consistent (`transition-colors`, `transition-all`); prefer `transform`
over animating layout properties.

## Component structure

- Define the props `interface`/`type` directly above the component.
- Match the export style of neighboring files (shadcn `ui/` components use named
  function declarations with a `data-slot` attribute and named exports).
- Keep components focused; split when JSX or logic grows large.
