# Tasks: Audio Playback

**Input**: Design documents from `/specs/002-audio-playback/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/player.md

**Tests**: Not included (Vitest not yet configured per plan.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Schema & Data)

**Purpose**: Add mp3Url to the data model and populate audio URLs

- [x] T001 Add `mp3Url` field to Track model in `prisma/schema.prisma`
- [x] T002 Run Prisma migration to add `mp3Url` column to Track table
- [x] T003 Add `mp3_url` to `PhishinTrack` interface in `app/services/phishin.server.ts`
- [x] T004 Update seed script to store `mp3_url` during seeding in `prisma/seed.ts`
- [x] T005 Create backfill script to populate mp3Url on existing tracks in `prisma/backfill-mp3-urls.ts` and add `backfill:mp3urls` script to `package.json`
- [x] T006 Run `yarn backfill:mp3urls` to populate mp3Url values

---

## Phase 2: Foundational (Player Context & Provider)

**Purpose**: Core player infrastructure that all user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create player context types and `usePlayer` hook in `app/lib/player-context.ts`
- [x] T008 Create `PlayerProvider` component with `<audio>` element management in `app/components/player-provider.tsx`
- [x] T009 Create stub `AudioPlayer` component in `app/components/audio-player.tsx`
- [x] T010 Wrap app with `PlayerProvider` and render `AudioPlayer` in `app/root.tsx`

**Checkpoint**: Player context available app-wide, audio element managed, stub player renders

---

## Phase 3: User Story 1 - Play a Track from Show Detail (Priority: P1) MVP

**Goal**: Fans can click a track in a setlist to play it. A persistent player appears with play/pause, minimize, close. Audio continues across navigation.

**Independent Test**: Navigate to a show detail page, click a track, verify audio begins, navigate to `/shows`, confirm audio continues.

### Implementation for User Story 1

- [x] T011 [US1] Create `TrackRow` component with play/pause/hover states in `app/components/track-row.tsx`
- [x] T012 [US1] Update show detail route to use `TrackRow` and pass `setTracks` in `app/routes/shows.$showDate.tsx`
- [x] T013 [US1] Implement expanded player UI (track info, play/pause, minimize, close) in `app/components/audio-player.tsx`
- [x] T014 [US1] Implement minimized player UI (compact bar with play/pause, title, expand, close) in `app/components/audio-player.tsx`
- [x] T015 [US1] Wire `PlayerProvider` play/pause/close/minimize/expand actions in `app/components/player-provider.tsx`
- [x] T016 [US1] Handle tracks with no `mp3Url` (no play affordance, not clickable) in `app/components/track-row.tsx`
- [x] T017 [US1] Implement responsive layout — mobile (375px) uses minimized layout in `app/components/audio-player.tsx`

**Checkpoint**: Single track playback works. Player persists across navigation. Play/pause/close/minimize all functional.

---

## Phase 4: User Story 2 - Progress Scrubbing and Track Info (Priority: P2)

**Goal**: Fans can seek to any position in a track via clickable/draggable progress bar. Elapsed time and total duration displayed. Currently playing track highlighted in setlist.

**Independent Test**: Play a track, click progress bar at various positions, verify audio jumps. Verify time display updates in real time.

### Implementation for User Story 2

- [x] T018 [US2] Add progress bar with click-to-seek in expanded `AudioPlayer` in `app/components/audio-player.tsx`
- [x] T019 [US2] Add drag-to-seek (scrubbing) support on progress bar in `app/components/audio-player.tsx`
- [x] T020 [US2] Display elapsed time and total duration (e.g., "3:42 / 12:05") in `app/components/audio-player.tsx`
- [x] T021 [US2] Wire `seek` action and `timeupdate`/`loadedmetadata` events in `app/components/player-provider.tsx`
- [x] T022 [US2] Highlight currently playing track in setlist via `TrackRow` in `app/components/track-row.tsx`

**Checkpoint**: Seeking works via click and drag. Time display updates live. Active track highlighted in setlist.

---

## Phase 5: User Story 3 - Sequential Set Playback with Next/Previous (Priority: P3)

**Goal**: Tracks auto-advance within a set. Next/previous buttons for manual navigation. Previous restarts if 5+ seconds in. Playback stops at end of set.

**Independent Test**: Play first track in a set, verify subsequent tracks auto-play. Test next/previous buttons. Verify playback stops at end of set.

### Implementation for User Story 3

- [x] T023 [US3] Implement queue management (track list, index, hasNext, hasPrevious) in `app/components/player-provider.tsx`
- [x] T024 [US3] Implement `next` action (advance to next track in set) in `app/components/player-provider.tsx`
- [x] T025 [US3] Implement `previous` action (<5s: previous track, >=5s: restart) in `app/components/player-provider.tsx`
- [x] T026 [US3] Handle `ended` event — auto-advance to next track, stop at end of set in `app/components/player-provider.tsx`
- [x] T027 [US3] Handle `error` event — show error state, auto-advance after 2s in `app/components/player-provider.tsx`
- [x] T028 [US3] Add next/previous buttons to expanded `AudioPlayer` UI in `app/components/audio-player.tsx`
- [x] T029 [US3] Skip tracks with no `mp3Url` during sequential playback in `app/components/player-provider.tsx`

**Checkpoint**: Full sequential set playback. Next/previous work correctly. Error handling and auto-advance functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Responsive refinements, accessibility, animation

- [x] T030 [P] Respect `prefers-reduced-motion` for equalizer animation in `app/components/track-row.tsx`
- [x] T031 [P] Add animated equalizer indicator for currently playing track in `app/components/track-row.tsx`
- [x] T032 [P] Add keyboard accessibility to progress bar and player controls in `app/components/audio-player.tsx`
- [ ] T033 Verify full responsive behavior 375px to 1440px+ across all player states
- [ ] T034 End-to-end manual testing of all acceptance scenarios from spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (needs mp3Url in schema/data)
- **US1 (Phase 3)**: Depends on Phase 2 (needs PlayerProvider + context)
- **US2 (Phase 4)**: Depends on Phase 3 (extends player with seeking)
- **US3 (Phase 5)**: Depends on Phase 3 (extends player with queue/navigation)
- **Polish (Phase 6)**: Depends on Phases 3-5

### User Story Dependencies

- **US1 (P1)**: Foundational prerequisite for US2 and US3 — must complete first
- **US2 (P2)**: Builds on US1 player UI (adds progress bar, seeking)
- **US3 (P3)**: Builds on US1 player infrastructure (adds queue, next/previous)
- **US2 and US3**: Could technically run in parallel after US1, but share files so sequential is safer

### Within Each User Story

- Provider logic before UI components
- Core behavior before edge cases
- Expanded view before minimized/responsive variants

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (migration + seed)
2. Complete Phase 2: Foundational (context + provider)
3. Complete Phase 3: User Story 1 (play a track)
4. **STOP and VALIDATE**: Click a track, verify playback, navigate away, confirm audio persists
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1 → Single track playback works → Demo (MVP!)
3. Add US2 → Seeking and time display → Demo
4. Add US3 → Sequential playback → Demo
5. Polish → Accessibility, animations, responsive polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No test tasks included — Vitest not yet configured (noted in plan.md)
- Player state is client-only React context, no new services needed
- mp3 URLs are public (no API key), streamed via native `<audio>` element
- Total: 34 tasks across 6 phases
