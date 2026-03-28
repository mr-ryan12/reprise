# Implementation Plan: Audio Playback

**Branch**: `002-audio-playback` | **Date**: 2026-03-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-audio-playback/spec.md`

## Summary

Add audio playback to Reprise so fans can listen to tracks directly from show
detail pages. A persistent player in the root layout survives navigation,
supports play/pause, progress scrubbing, next/previous, and sequential set
playback. Audio URLs from the Phish.in API v2 are stored on the Track model
and streamed via the native HTML `<audio>` element. Player state lives in
React context (client-only).

## Technical Context

**Language/Version**: TypeScript 5.9, strict mode enabled
**Primary Dependencies**: React Router 7.13, React 19 (context + refs for audio), Prisma ORM, Tailwind CSS v4, shadcn/ui, Lucide icons
**Storage**: PostgreSQL via Prisma ORM (new `mp3Url` column on Track)
**Testing**: Vitest (not yet configured — manual testing for this feature)
**Target Platform**: Node.js server (SSR), web browsers 375px–1440px+
**Project Type**: Full-stack web application (existing)
**Performance Goals**: Playback start <1s, seek resume <2s, track advance <1s
**Constraints**: ~38,000 tracks, native `<audio>` element, no third-party audio libraries
**Scale/Scope**: Incremental feature on existing MVP, 3 new components, 1 context provider, 1 migration

## Constitution Check

*GATE: Must pass before implementation. Re-check after design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Strong TypeScript Safety | PASS | Player context and track types will use strict typing; Prisma types for mp3Url |
| II | Server-First React Router | PASS | Track data (including mp3Url) loaded via existing loader. Player state is client-only — justified exception per Constitution II (audio is explicitly client-only browser behavior) |
| III | Clean Prisma/PostgreSQL Data Modeling | PASS | New nullable `mp3Url` field on Track via migration. Track already exempt from timestamps. |
| IV | Responsive & Polished UI | PASS | Player adapts 375px–1440px+; minimized state for mobile; prefers-reduced-motion respected |
| V | Small Diffs | PASS | 3 user stories map to incremental phases; each deliverable independently |
| VI | Clear Service Boundaries | PASS | No new services needed — mp3Url served via existing show.server.ts loader. Player logic is client-only context, not a service. |
| VII | Testing Discipline | NOTE | Vitest not yet configured. Manual testing for this feature. |
| VIII | Phased Delivery | PASS | 3 phases matching user stories, each independently testable |
| IX | MVP Scope Guard | PASS | No AI/MCP features |
| X | Configuration & Secrets Discipline | PASS | No new env vars — mp3 URLs are public |

**Post-design re-check**: All gates still pass. Client-only audio context is the correct exception to server-first per Constitution II.

## Architecture Decisions

### Client-Side Player Context (Constitution II Exception)

Audio playback is inherently a browser API (`<audio>` element). The player state
(current track, playing/paused, current time, track queue) MUST live in React
context so it persists across route navigations. This is the explicitly allowed
exception in Constitution II: "client-only behavior… window-dependent logic."

**Approach**: A `PlayerProvider` wraps the app in `root.tsx`, managing a single
`<audio>` element ref and exposing playback controls via context. Route components
read context to show now-playing state and dispatch play commands.

**State shape**:
```typescript
interface PlayerState {
  currentTrack: PlayableTrack | null;
  queue: PlayableTrack[];       // All tracks in the current set
  queueIndex: number;           // Index of current track in queue
  isPlaying: boolean;
  currentTime: number;          // seconds
  duration: number;             // seconds
  isMinimized: boolean;
  error: string | null;
}

interface PlayableTrack {
  id: string;
  mp3Url: string;
  songTitle: string;
  showDate: string;             // "YYYY-MM-DD"
  venueName: string;
  setName: string;
  position: number;
}
```

### No New Services

The existing `show.server.ts` already loads tracks with songs in the show detail
loader. Adding `mp3Url` to the Track model means it flows through the existing
data path — no new service module is needed. The player is entirely client-side.

### Overlay Player

The persistent player renders as a fixed-position bar at the bottom of the
viewport, overlaying page content. No body padding adjustment. The player has
three visual states:

1. **Hidden** — default, no player shown
2. **Expanded** — full player with song title, show date, venue, progress bar, time display, play/pause, next/previous, minimize, close
3. **Minimized** — compact bar with play/pause button and track title only, plus expand and close buttons

### Clickable Track Rows

Track rows in the show detail setlist replace the static display with interactive
rows. The track number column is the visual affordance:

- **Default**: Shows track position number
- **Hover**: Shows a play icon (▶)
- **Playing**: Shows an animated equalizer indicator
- **Paused**: Shows a paused indicator
- **No audio**: No hover effect, track number stays static

This is implemented as a `TrackRow` component that reads from the player context
to determine its state.

## Project Structure

### Documentation (this feature)

```text
specs/002-audio-playback/
├── plan.md              # This file
├── spec.md              # Feature specification (clarified)
├── data-model.md        # Schema changes (Track.mp3Url)
├── contracts/
│   └── player.md        # Player context API contract
└── tasks.md             # Task list (/speckit.tasks output)
```

### Source Code (new/modified files)

```text
app/
├── components/
│   ├── player-provider.tsx      # NEW: React context provider + <audio> element
│   ├── audio-player.tsx         # NEW: Persistent player UI (expanded + minimized)
│   └── track-row.tsx            # NEW: Clickable track row with play/pause/hover states
├── routes/
│   ├── shows.$showDate.tsx      # MODIFIED: Use TrackRow, pass player context
│   └── root.tsx                 # MODIFIED: Wrap with PlayerProvider
├── lib/
│   └── player-context.ts        # NEW: Context type definitions and usePlayer hook

prisma/
├── schema.prisma                # MODIFIED: Add mp3Url to Track
├── migrations/YYYYMMDD_add_track_mp3_url/
│   └── migration.sql            # NEW: ALTER TABLE add column
└── seed.ts                      # MODIFIED: Store mp3_url during seeding
```

**Structure Decision**: New player components live in `app/components/` (shared,
not route-specific). Context definition in `app/lib/` (shared utilities). No new
services — player is entirely client-side. This follows the existing project layout.

## Complexity Tracking

No constitution violations to justify. The client-only context is an explicitly
allowed exception per Constitution II.
