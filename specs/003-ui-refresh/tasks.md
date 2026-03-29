# Tasks: UI Refresh

**Input**: Design documents from `/specs/003-ui-refresh/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated test tasks — this feature is a visual/styling refresh. Validation is via `yarn typecheck` and manual viewport testing.

**Design Skill**: All visual/styling implementation tasks (Phases 2–11) MUST follow the guidance in `.claude/skills/frontend-design/SKILL.md`. Load this file before beginning any UI work. Key Reprise-specific directives:
- Use Inter as the primary typeface — no novelty display fonts
- Prioritize clarity, readability, and a refined premium aesthetic over experimental expression
- Favor clean list, card, and detail-page patterns optimized for scanning large collections
- Use restrained color intentionally — avoid cliche AI gradients and maximalist styling
- Motion should be subtle, polished, and support usability
- Mobile responsiveness and accessibility take priority over visual flourish

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (React Router)**: `app/` at repository root
- Routes: `app/routes/`
- Components: `app/components/`
- Services: `app/services/`
- Styles: `app/app.css`
- Schema: `prisma/schema.prisma`
- Static assets: `public/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Schema migration, seed update, and service layer changes to support album cover URLs

- [x] T001 Add `albumCoverUrl String?` field to Show model in `prisma/schema.prisma`
- [x] T002 Add `album_cover_url: string | null` to `PhishinShowSummary` interface in `app/services/phishin.server.ts`
- [x] T003 Map `album_cover_url` to `albumCoverUrl` in show upsert (both create and update blocks) in `prisma/seed.ts`
- [x] T004 Run `yarn prisma migrate dev --name add-album-cover-url` to generate and apply migration
- [x] T005 Include `albumCoverUrl` in `select` clauses for `getShows()` and `searchShows()` in `app/services/show.server.ts` (N/A — Prisma includes all scalar fields by default with `include`)
- [x] T006 Include `albumCoverUrl` in the return data from `getShowByDate()` in `app/services/show.server.ts` (N/A — already included by default)
- [x] T007 Re-seed database to populate `albumCoverUrl` values: backfill script (`prisma/backfill-album-covers.ts`) updated 2112 shows
- [x] T008 Run `yarn typecheck` to verify all type changes propagate correctly

**Checkpoint**: Album cover URL data flows from Phish.in API through seed, schema, service, and into loaders. `yarn typecheck` passes.

---

## Phase 2: Foundational (Design Tokens & Shared Components)

**Purpose**: Refine design tokens, create shared components, and establish the refreshed visual foundation that all route pages depend on

**⚠️ CRITICAL**: No route page work can begin until this phase is complete

**🎨 Design Reference**: Read `.claude/skills/frontend-design/SKILL.md` (especially the "Reprise Project-Specific Guidance" section) before starting any task in this phase.

- [x] T009 Refine OKLCH color token values in `app/app.css` — subtle warm hue (60-80 range) added across light/dark tokens for warmth; improved dark mode card/border contrast
- [x] T010 [P] Define typography scale refinements in `app/app.css` — three-tier hierarchy via standard Tailwind utilities (text-base font-semibold / text-sm font-medium / text-sm text-muted-foreground), no custom classes needed
- [x] T011 [P] Create default album cover fallback SVG at `public/images/default-album-cover.svg` — vinyl record motif, square, warm tones, <2KB
- [x] T012 Create `AlbumCover` component in `app/components/album-cover.tsx` — src/alt/size props, fallback to default SVG, lazy loading, aspect-square, rounded-md
- [x] T013 Create `ShowCard` component in `app/components/show-card.tsx` — Link with AlbumCover thumbnail, three-tier typography, optional heart, hover:bg-accent
- [x] T014 Run `yarn typecheck` to verify new components compile

**Checkpoint**: Design tokens refined, AlbumCover and ShowCard components ready. All route pages can now use the shared components.

---

## Phase 3: User Story 1 — Browsing Shows with Improved Visual Hierarchy (Priority: P1) 🎯 MVP

**Goal**: Refresh the shows list page with refined card layout using ShowCard component, improved search form, better pagination, and polished empty state

**Independent Test**: Load `/shows` on 375px and 1440px viewports. Verify show cards display album art thumbnails, dates are prominent, venue info is scannable, search works with visual feedback, pagination is clear, and empty search state is styled.

### Implementation for User Story 1

**🎨 Design Reference**: Follow `.claude/skills/frontend-design/SKILL.md` Reprise guidelines for all styling choices — typography hierarchy, spacing, hover states, card composition.

- [x] T015 [US1] Update shows list loader in `app/routes/shows.tsx` to include `albumCoverUrl` in the show data passed to the component
- [x] T016 [US1] Replace inline show card markup with `<ShowCard>` component in `app/routes/shows.tsx` — pass show data and favorite status, link to show detail route
- [x] T017 [US1] Refine search form in `app/routes/shows.tsx` — added result count feedback ("X shows found for ..."), refined alignment
- [x] T018 [US1] Refine pagination controls in `app/routes/shows.tsx` — default size buttons (44px touch targets), clearer "X / Y" page display
- [x] T019 [US1] Improve empty search state in `app/routes/shows.tsx` — SearchX icon, styled message with suggestion, clear search button
- [x] T020 [US1] Verify shows list page — build passes, responsive layout via ShowCard flex/truncate, max-w-3xl constrains at wide viewports
- [x] T021 [US1] Run `yarn typecheck`

**Checkpoint**: Shows list page fully refreshed with album art thumbnails, improved hierarchy, search feedback, and responsive layout.

---

## Phase 4: User Story 2 — Show Detail Page with Polished Setlist Layout (Priority: P1)

**Goal**: Refresh the show detail page with album cover in header, refined metadata layout, improved set sections, and polished track display

**Independent Test**: Navigate to any show detail page. Verify album cover displays (or fallback), date is most prominent, sets are visually distinct, tracks are scannable, favorite button has clear states, back navigation is obvious.

### Implementation for User Story 2

**🎨 Design Reference**: Follow `.claude/skills/frontend-design/SKILL.md` Reprise guidelines — detail page should feel refined and premium with clear metadata hierarchy, not visually loud.

- [x] T022 [US2] Update show detail loader in `app/routes/shows.$showDate.tsx` to include `albumCoverUrl` in the show data
- [x] T023 [US2] Add `AlbumCover` (lg on desktop, md on mobile) to show detail header — responsive via hidden/block classes
- [x] T024 [US2] Refine show metadata layout — date xl/2xl bold, venue base/medium, location + tour/duration as tertiary muted
- [x] T025 [US2] Refine set section headers — `text-xs font-semibold uppercase tracking-widest text-muted-foreground`, gap-8 between sets
- [x] T026 [US2] Refine favorite button — transition-colors on heart, hover:text-foreground on unfilled state
- [x] T027 [US2] Refine back navigation — "Shows" label with font-medium, gap-1.5
- [x] T028 [US2] Refine TrackRow — py-3, gap-3, truncate on title, tabular-nums on position/duration, shrink-0 on badge, bg-accent/40 for current
- [x] T029 [US2] Verify — typecheck + build pass, responsive album cover, overflow-hidden on set cards
- [x] T030 [US2] Run `yarn typecheck`

**Checkpoint**: Show detail page fully refreshed with album art, refined hierarchy, improved setlist layout, and polished interactions.

---

## Phase 5: User Story 3 — App Shell and Header Navigation (Priority: P1)

**Goal**: Refine the header/navigation bar with improved branding, spacing, active state indication, and clear auth state display

**Independent Test**: Navigate between all routes. Verify header is consistent, active page is indicated, auth state is clear, navigation is balanced on mobile and desktop.

### Implementation for User Story 3

**🎨 Design Reference**: Follow `.claude/skills/frontend-design/SKILL.md` Reprise guidelines — header should feel intentional and memorable without being visually loud.

- [ ] T031 [US3] Refine header layout in `app/root.tsx` — improve Reprise brand typography (consider slightly larger or weighted logo text), balance navigation spacing
- [ ] T032 [US3] Add active route indication in `app/root.tsx` — highlight current page link (Shows, Favorites) with visual distinction (underline, weight, or color)
- [ ] T033 [US3] Refine authenticated navigation in `app/root.tsx` — improve favorites link, username display, and logout button spacing and visual weight
- [ ] T034 [US3] Refine unauthenticated navigation in `app/root.tsx` — ensure login link is visible and balanced with brand
- [ ] T035 [US3] Verify header on 375px viewport — all elements visible, no overflow, adequate touch targets
- [ ] T036 [US3] Run `yarn typecheck`

**Checkpoint**: App shell header polished with clear branding, navigation, active states, and auth indication.

---

## Phase 6: User Story 4 — Login Page (Priority: P2)

**Goal**: Refresh the login page with stronger branding, refined form styling, and polished error display

**Independent Test**: Visit `/login`, submit empty and valid usernames, verify form centering, error display, and redirect.

### Implementation for User Story 4

**🎨 Design Reference**: Follow `.claude/skills/frontend-design/SKILL.md` Reprise guidelines — login should feel polished and branded, not like a developer placeholder.

- [ ] T037 [US4] Refine login page layout in `app/routes/login.tsx` — strengthen brand presence (consider larger heading or subtle visual element), improve form card treatment, refine centering approach
- [ ] T038 [US4] Refine input and button styling in `app/routes/login.tsx` — visible focus ring, clear submit button, consistent with refreshed design tokens
- [ ] T039 [US4] Improve error display in `app/routes/login.tsx` — distinct visual treatment (color + icon or border change), no layout shift on error appearance
- [ ] T040 [US4] Verify login page at 375px with software keyboard open — form remains visible and usable
- [ ] T041 [US4] Run `yarn typecheck`

**Checkpoint**: Login page polished with intentional branding, refined form, and clear error states.

---

## Phase 7: User Story 5 — Favorites Page (Priority: P2)

**Goal**: Refresh the favorites page using shared ShowCard component for consistency, with an improved empty state

**Independent Test**: View `/favorites` with and without saved shows. Verify card consistency with shows list, empty state messaging and visual element.

### Implementation for User Story 5

- [ ] T042 [US5] Update favorites loader in `app/routes/favorites.tsx` to include `albumCoverUrl` in favorite show data
- [ ] T043 [US5] Replace inline show cards with `<ShowCard>` component in `app/routes/favorites.tsx` — same visual treatment as shows list
- [ ] T044 [US5] Improve empty state in `app/routes/favorites.tsx` — warmer messaging, larger/more expressive icon, clear CTA link to browse shows
- [ ] T045 [US5] Verify favorites page consistency with shows list on mobile and desktop viewports
- [ ] T046 [US5] Run `yarn typecheck`

**Checkpoint**: Favorites page visually consistent with shows list, with warm empty state.

---

## Phase 8: User Story 6 — Shared UI Pattern Consistency (Priority: P2)

**Goal**: Ensure all shared patterns (buttons, loading states, error boundaries) are consistent with the refreshed design language

**Independent Test**: Trigger loading states (slow network), error states (invalid routes), interact with all button variants across pages. Verify visual consistency.

### Implementation for User Story 6

- [ ] T047 [US6] Refine error boundary in `app/root.tsx` — friendly layout with icon, clear error message, navigation link back to `/shows`, consistent with refreshed header
- [ ] T048 [US6] Audit and refine loading indicators across routes — ensure search spinner and any navigation loading feedback match design language
- [ ] T049 [US6] Audit button hover/focus/active states across all pages — verify consistent feedback via updated design tokens, adjust shadcn button variants in `app/components/ui/button.tsx` if token changes require it
- [ ] T050 [US6] Verify error boundary by navigating to invalid route — header intact, friendly message, link to shows
- [ ] T051 [US6] Run `yarn typecheck`

**Checkpoint**: All shared UI patterns consistent across the application.

---

## Phase 9: User Story 7 — Album Cover Art Integration (Priority: P3)

**Goal**: Ensure album covers display correctly across all pages, with graceful fallback and no layout shift

**Independent Test**: View show detail pages with and without `albumCoverUrl` values. Verify correct image or fallback renders. Check shows list cards for consistent thumbnail display.

### Implementation for User Story 7

- [ ] T052 [US7] Verify AlbumCover fallback behavior — test with shows that have null `albumCoverUrl`, confirm default image renders at correct size in both ShowCard and show detail header
- [ ] T053 [US7] Verify no Cumulative Layout Shift — album cover images should have fixed dimensions via aspect-ratio, test with throttled network
- [ ] T054 [US7] Verify album cover display on show detail page for shows with real cover art — correct sizing, responsive behavior on mobile
- [ ] T055 [US7] Run `yarn typecheck`

**Checkpoint**: Album covers display correctly everywhere with graceful fallback and no layout shift.

---

## Phase 10: User Story 8 — Audio Player Polish (Priority: P2)

**Goal**: Refine audio player styling (both expanded and minimized) to match refreshed design language

**Independent Test**: Play a track, verify both player states display with consistent typography, spacing, and colors matching the refreshed UI.

### Implementation for User Story 8

- [ ] T056 [US8] Refine expanded player layout in `app/components/audio-player.tsx` — update typography (song title, metadata), control button spacing, progress bar styling to match refreshed tokens
- [ ] T057 [US8] Refine minimized player layout in `app/components/audio-player.tsx` — consistent compact styling, progress bar, control alignment
- [ ] T058 [US8] Verify player on mobile (minimized default) and desktop (expanded default) — controls reachable, text truncation works, progress bar interactive
- [ ] T059 [US8] Run `yarn typecheck`

**Checkpoint**: Audio player visually integrated with refreshed design language in both states.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, edge case handling, and consistency audit

- [ ] T060 [P] Verify long venue name truncation on show cards — test with cards that have very long venue names, ensure graceful truncation without layout breakage
- [ ] T061 [P] Verify audio player overlap with short-content pages — test empty favorites with player open, ensure content is not obscured
- [ ] T062 [P] Verify ultra-wide viewport (2560px+) — content centered and constrained, no full-width stretching
- [ ] T063 Test `prefers-reduced-motion` — disable animations, verify all transitions respect the media query
- [ ] T064 Run full `yarn typecheck` and verify zero errors
- [ ] T065 Run `yarn build` to confirm production build succeeds

**Checkpoint**: All edge cases verified, typecheck and build pass. UI refresh complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion (schema + seed must be done) — BLOCKS all user stories
- **User Stories (Phases 3–10)**: All depend on Foundational phase completion
  - US1 (Shows List), US2 (Show Detail), US3 (App Shell) are P1 and can proceed in parallel
  - US4 (Login), US5 (Favorites), US6 (Shared Patterns), US8 (Audio Player) are P2 and can proceed in parallel
  - US7 (Album Art Verification) is P3 and depends on US1 + US2 being complete (since it verifies their album cover integration)
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Shows List)**: After Foundational — no cross-story dependencies
- **US2 (Show Detail)**: After Foundational — no cross-story dependencies (TrackRow refined here)
- **US3 (App Shell)**: After Foundational — no cross-story dependencies
- **US4 (Login)**: After Foundational — no cross-story dependencies
- **US5 (Favorites)**: After Foundational — uses ShowCard from Phase 2
- **US6 (Shared Patterns)**: After Foundational — audits patterns introduced in other stories, best done after US1/US2/US3
- **US7 (Album Art)**: After US1 + US2 — verification story, confirms integration works
- **US8 (Audio Player)**: After Foundational — no cross-story dependencies

### Parallel Opportunities

- Phase 2: T010, T011 can run in parallel (CSS refinements vs. SVG asset)
- Phase 3–5: US1, US2, US3 can all proceed in parallel (different route files)
- Phase 6–8: US4, US5, US8 can proceed in parallel (different route/component files)
- Phase 11: T060, T061, T062 can run in parallel (independent edge case verifications)

---

## Parallel Example: P1 Stories

```bash
# After Phase 2 completes, launch P1 stories in parallel:
Task: "US1 — Update shows list loader in app/routes/shows.tsx"
Task: "US2 — Update show detail loader in app/routes/shows.$showDate.tsx"
Task: "US3 — Refine header layout in app/root.tsx"
```

## Parallel Example: P2 Stories

```bash
# After P1 stories complete (or in parallel if independent):
Task: "US4 — Refine login page layout in app/routes/login.tsx"
Task: "US5 — Update favorites loader in app/routes/favorites.tsx"
Task: "US8 — Refine expanded player layout in app/components/audio-player.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (schema + seed)
2. Complete Phase 2: Foundational (tokens + shared components)
3. Complete Phase 3: User Story 1 (shows list)
4. **STOP and VALIDATE**: Test shows list independently at all viewports
5. Deploy/demo if ready — shows list alone delivers significant visual improvement

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Shows List) → Test → Deploy (MVP!)
3. US2 (Show Detail) + US3 (App Shell) → Test → Deploy (core pages polished)
4. US4 (Login) + US5 (Favorites) + US8 (Player) → Test → Deploy (all pages polished)
5. US6 (Shared Patterns) + US7 (Album Art) → Test → Deploy (consistency + images)
6. Polish → Final verification → Deploy (complete)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All phases end with `yarn typecheck` to catch regressions early
- Visual testing is manual across 375px, 768px, 1440px, and 2560px viewports
